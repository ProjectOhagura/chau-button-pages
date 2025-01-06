document.addEventListener('DOMContentLoaded', () => {
    const loadingIndicator = document.createElement('div');
    loadingIndicator.textContent = '読み込み中...';
    loadingIndicator.className = 'loading';
    document.body.appendChild(loadingIndicator);

    // 音量スイッチの設定
    let globalVolume = 0.3; // 初期音量は小（30%）
    const volumeSlider = document.getElementById('volume-slider');
    const volumeRadios = document.querySelectorAll('.volume-switch input[type="radio"]');

    document.querySelectorAll('.volume-switch input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function() {
            globalVolume = parseFloat(this.value);
            volumeSlider.value = globalVolume; // スライダーの値をラジオボタンの値に設定
            updateAllAudioVolumes(globalVolume);
        });
    });

    // 全ての音源の音量を更新する関数
    const updateAllAudioVolumes = (volume) => {
        document.querySelectorAll('audio').forEach(audio => {
            audio.volume = volume;
        });
    };

    // スライダーの初期値を設定
    volumeSlider.value = globalVolume;
    volumeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            globalVolume = parseFloat(this.value);
            volumeSlider.value = globalVolume; // スライダーの値をラジオボタンの値に設定
            updateAllAudioVolumes(globalVolume);
            updateVisualFeedback(); // ラジオボタンの視覚フィードバックを更新
        });

        // ラジオボタンのラベルをクリック可能に
        const label = document.querySelector(`label[for="${radio.id}"]`);
        label.addEventListener('touchend', function(e) {
            if (radio.checked) {
                e.preventDefault();
                globalVolume = parseFloat(radio.value);
                updateAllAudioVolumes(globalVolume);
            } else {
                radio.dispatchEvent(new Event('change')); // 選択されていない場合はchangeイベントをトリガー
            }
        });
    });

    document.querySelectorAll('.volume-switch input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function() {
            globalVolume = parseFloat(this.value);
            volumeSlider.value = globalVolume; // スライダーの値をラジオボタンの値に設定
            updateAllAudioVolumes(globalVolume);
            updateVisualFeedback(); // ラジオボタンの視覚フィードバックを更新
        });
    });
     
    volumeSlider.addEventListener('input', (e) => {
        globalVolume = parseFloat(e.target.value);
        updateAllAudioVolumes(globalVolume);
        updateVisualFeedback(); // スライダーの値が変わったら視覚フィードバックを更新
    });

    // 初期設定
    updateAllAudioVolumes(globalVolume);
    updateVisualFeedback();

    function updateVisualFeedback() {
        if (globalVolume <= 0.4) { // 小までの範囲
            document.getElementById('volume-low').checked = true;
        } else if (globalVolume <= 0.7) { // 中までの範囲
            document.getElementById('volume-medium').checked = true;
        } else { // 大の範囲
            document.getElementById('volume-high').checked = true;
        }
        
    }




    fetch('voice-data.json')
        .then(response => {
            if (!response.ok) throw new Error('データの読み込みに失敗しました');
            return response.json();
        })
        .then(voiceData => {
            loadingIndicator.remove();
            
            const createButton = (item, container) => {
                const button = document.createElement('button');
                button.textContent = item.name;
                button.className = 'button';
                button.onclick = () => { 
                    playAudio(item, button);  // 再生関数を呼び出す
                };
                container.appendChild(button);
            };
        

            const sortBy五十音 = (a, b) => a.kana.localeCompare(b.kana, 'ja-JP');

            // ボイス一覧タブの内容をセットアップ
            const voiceListContainer = document.getElementById('voice-list-buttons');
            let sortedVoices = [...voiceData].sort(sortBy五十音);
            sortedVoices.forEach(item => createButton(item, voiceListContainer));

            // ジャンル別タブの内容をセットアップ
            const genreListContainer = document.getElementById('genre-list');
            const genreButtonsContainer = document.querySelector('.genre-buttons');
            const genreContent = document.querySelector('.genre-content');

            const genres = [...new Set(voiceData.map(item => item.genre))];
            
            // ジャンルボタンを追加
            genres.forEach(genre => {
                const button = document.createElement('button');
                button.textContent = genre;
                button.className = 'genre-button';
                button.addEventListener('click', function() {
                    showGenreContent(genre);
                    // 他のジャンルボタンのactiveクラスを削除
                    document.querySelectorAll('.genre-button.active').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    // クリックしたジャンルボタンにactiveクラスを追加
                    this.classList.add('active');
                });
                genreButtonsContainer.appendChild(button);
            });

            // 最初のジャンルをデフォルトで表示
            if (genres.length > 0) {
                showGenreContent(genres[0]);
                document.querySelector('.genre-button').classList.add('active');
            }

            function showGenreContent(selectedGenre) {
                genreContent.innerHTML = '';
                voiceData.filter(item => item.genre === selectedGenre).sort(sortBy五十音).forEach(item => {
                    const button = document.createElement('button');
                    button.textContent = item.name;
                    button.className = 'button';
                    button.onclick = () => { 
                        playAudio(item, button);
                    };
                    genreContent.appendChild(button);
                });
            }

            // 切り抜き元一覧タブの内容をセットアップ
            const kirinukiListContainer = document.getElementById('kirinuki-list');
            const uniqueUrls = [...new Set(voiceData.map(item => item.url.split('&t=')[0]))];
            uniqueUrls.forEach(url => {
                const urlItem = document.createElement('div');
                urlItem.className = 'url-item';
                
                // 対応するsitetitleを見つける
                const matchingItem = voiceData.find(item => item.url.split('&t=')[0] === url);
                if (matchingItem) {
                    urlItem.innerHTML = `<a href="${url}" target="_blank">${matchingItem.sitetitle}</a>`;
                } else {
                    urlItem.innerHTML = `<a href="${url}" target="_blank">不明なタイトル</a>`;
                }
                
                kirinukiListContainer.appendChild(urlItem);
            });

            // 各リンクタブの内容をセットアップ
            const linkListContainer = document.getElementById('link-list');
            const links = [
                { title: '規約（lit link）', url: 'http://lit.link/yukitochau' },
                { title: 'YouTube（朝５時から！）', url: 'https://t.co/hEKcXel53p' },
                { title: 'Twitch', url: 'https://www.twitch.tv/yukitochau' },
                { title: 'X（旧Twitter）', url: 'https://x.com/YUKITOCHAU' }
            ];
            const hashtags = [
                { title: 'FA', tag: '#ゆきと描いちゃう' },
                { title: '配信', tag: '#ぺちゃくちゃう' },
                { title: '飯テロ', tag: '#雪兎食べちゃう' }
            ];

            // 新しいオススメセクションを追加
            const recommendedSection = document.getElementById('recommended-section');
            const recommendedElement = document.createElement('div');
            recommendedElement.className = 'highlighted-recommendation';
            recommendedElement.innerHTML = `
                <h2>オススメ！！　池袋HUMAXシネマズ 2025/2/15（土） 開催！　A席先着順販売中(S席完売済)</h2>
                <a href="https://yukitochau-firststep.studio.site/" target="_blank">（特設サイト）個人VTuber雪兎ちゃう1stオフラインイベント「First Step in the CINEMA」</a>
                <a href="https://x.com/hashtag/%E5%8A%87%E5%A0%B4%E7%89%88%E9%9B%AA%E5%85%8E%E3%81%A1%E3%82%83%E3%81%86" target="_blank">ハッシュタグ『#劇場版雪兎ちゃう』</a>
            `;
            recommendedSection.appendChild(recommendedElement);

            links.forEach(link => {
                const linkItem = document.createElement('div');
                linkItem.className = 'link-item';
                linkItem.innerHTML = `<a href="${link.url}" target="_blank">${link.title}</a>`;
                linkListContainer.appendChild(linkItem);
            });

            const hashtagSection = document.createElement('div');
            hashtagSection.className = 'hashtags';
            hashtagSection.innerHTML = '<h2>Xの各ハッシュタグ</h2>';
            hashtags.forEach(hashtag => {
                const hashtagItem = document.createElement('div');
                hashtagItem.className = 'hashtag-item';
                hashtagItem.innerHTML = `<a href="https://x.com/hashtag/${hashtag.tag.slice(1)}" target="_blank">${hashtag.title}: ${hashtag.tag}</a>`;
                hashtagSection.appendChild(hashtagItem);
            });
            linkListContainer.appendChild(hashtagSection);

            // ちゃうメーカータブの内容をセットアップ
            const asobiListContainer = document.getElementById('asobi-list');
            asobiListContainer.innerHTML = '<h1>ちゃうメーカー</h1>';
 
            // くじボタン1: ランダムに3つの音源を選択
            const randomSelectButton = document.createElement('button');
            randomSelectButton.textContent = '3種ランダム';
            randomSelectButton.id = 'random-select';
            asobiListContainer.appendChild(randomSelectButton);

            /* // くじボタン2: アタマ、結び、オチから各1つずつ選択
            const attributeSelectButton = document.createElement('button');
            attributeSelectButton.textContent = 'アタマ結びオチくじ';
            attributeSelectButton.id = 'attribute-select';
            asobiListContainer.appendChild(attributeSelectButton); */

            // 再生ボタン
            const playButton = document.createElement('button');
            playButton.textContent = '再生';
            playButton.id = 'play-selected';
            playButton.disabled = true; // 初期状態では無効
            asobiListContainer.appendChild(playButton);

            // 選択された音源を表示するエリア
            const selectedVoicesContainer = document.createElement('div');
            selectedVoicesContainer.id = 'selected-voices';
            asobiListContainer.appendChild(selectedVoicesContainer);

            let isPlayingSequence = false; // 連続再生中かどうかを追跡するフラグ
            const playAudioSequence = (audios) => {
                isPlayingSequence = true; // 連続再生が始まったことを示す
                disableButtons(true); // 他のボタンを無効化
                
                let audioIndex = 0;
                const playNext = () => {
                    if (audioIndex < audios.length) {
                        const audioFile = audios[audioIndex].file;
                        const currentVoiceItem = Array.from(selectedVoicesContainer.children).find(child => child.textContent === audios[audioIndex].name);
                        
                        // 既存の再生が同じ音源で、再び同じ音源を再生しようとする場合
                        if (currentVoiceItem.audio && currentVoiceItem.audio.src === new URL(audioFile, window.location.origin).href) {
                            currentVoiceItem.audio.pause();
                            currentVoiceItem.audio.currentTime = 0;
                            currentVoiceItem.audio.play().catch(e => console.error('再生エラー:', e));
                        } else {
                            if (currentVoiceItem.audio) {
                                currentVoiceItem.audio.pause(); // 異なる音源の場合は停止
                            }
                            const audio = new Audio(audioFile);
                            audio.volume = globalVolume; // ここで音量を設定
                            audio.play().catch(e => console.error('再生エラー:', e));
                            currentVoiceItem.audio = audio;
                            
                            audio.addEventListener('ended', () => {
                                delete currentVoiceItem.audio;
                                if (currentVoiceItem.hasAttribute('data-playing')) {
                                    currentVoiceItem.removeAttribute('data-playing');
                                    currentVoiceItem.classList.remove('playing');
                                }
                                audioIndex++;
                                playNext(); // 次の音源を再生
                            });
                        }
        
                        currentVoiceItem.setAttribute('data-playing', 'true');
                        currentVoiceItem.classList.add('playing');
                    } else {
                        isPlayingSequence = false; // 連続再生が終了したことを示す
                        disableButtons(false); // 他のボタンを再び有効化
                    }
                };
                playNext();
            };
            


            // ランダム選択の処理
            document.getElementById('random-select').addEventListener('click', () => {
                const selectedVoices = [];
                while (selectedVoices.length < 3) {
                    const randomVoice = voiceData[Math.floor(Math.random() * voiceData.length)];
                    if (!selectedVoices.some(v => v.file === randomVoice.file)) {
                        selectedVoices.push(randomVoice);
                    }
                }
                displaySelectedVoices(selectedVoices);
            });

           /*  // アタマ、結び、オチから各1つずつ選択する処理
            document.getElementById('attribute-select').addEventListener('click', () => {
                const attributes = ['アタマ', '結び', 'オチ'];
                const selectedVoices = attributes.map(attr => {
                    const voices = voiceData.filter(v => v.attribute === attr);
                    return voices[Math.floor(Math.random() * voices.length)];
                });
                displaySelectedVoices(selectedVoices);
            }); */

    // ボタンの有効/無効を制御する関数を更新
    const disableButtons = (disable) => {
        document.querySelectorAll('.voice-item, .button, #random-select, #attribute-select, #play-selected').forEach(button => {
            button.disabled = disable;
            if (disable) {
                button.style.pointerEvents = 'none';
               /* button.style.opacity = '0.5'; // 無効化されたボタンの透明度を下げる  */
            } else {
                button.style.pointerEvents = 'auto';
               /* button.style.opacity = '1'; */
            }
        });
    };
        
    // 選択した音源を表示する関数
    const displaySelectedVoices = (voices) => {
        selectedVoicesContainer.innerHTML = '';
        voices.forEach((voice, index) => {
            const voiceItem = document.createElement('div');
            voiceItem.textContent = voice.name;
            voiceItem.className = 'voice-item';
            voiceItem.setAttribute('data-order', index + 1);
            voiceItem.addEventListener('click', () => {
                if (!isPlayingSequence) { // 連続再生中でない場合のみ再生を許可
                    const audio = new Audio(voice.file);
                    if (voiceItem.audio && voiceItem.audio.src === new URL(voice.file, window.location.origin).href) {
                        voiceItem.audio.pause();
                        voiceItem.audio.currentTime = 0;
                        voiceItem.audio.play().catch(e => console.error('再生エラー:', e));
                    } else {
                        if (voiceItem.audio) {
                            voiceItem.audio.pause(); // 異なる音源の場合は停止
                        }
                        handlePlayAnimation(voiceItem, audio);
                        audio.play().catch(e => console.error('再生エラー:', e));
                        voiceItem.audio = audio;
                    }
                }
            });
            selectedVoicesContainer.appendChild(voiceItem);
        });
        playButton.disabled = false;
    };

    // 再生ボタンのイベントリスナー
    document.getElementById('play-selected').addEventListener('click', () => {
        if (!isPlayingSequence) { // 連続再生中でなければ新しい再生を開始
            const audios = Array.from(selectedVoicesContainer.children).map(child => {
                return { name: child.textContent, file: voiceData.find(v => v.name === child.textContent).file };
            });
            playAudioSequence(audios);
        }
    });

            // ボタンの再生機能を更新
            const playAudio = (item, button) => {
                const currentUrl = new URL(item.file, window.location.origin).href;
                
                // 既に再生中の音源がある場合、同じ音源かどうかをチェック
                if (button.audio && button.audio.src === currentUrl) {
                    // 同じ音源なら停止して再度再生
                    button.audio.pause();
                    button.audio.currentTime = 0;
                    button.audio.play().catch(e => console.error('再生エラー:', e));
                } else {
                    // 異なる音源または再生中の音源がない場合、新しい再生を開始
                    if (button.audio) {
                        button.audio.pause(); // 既存の再生を停止
                    }
                    const audio = new Audio(item.file);
                    audio.volume = globalVolume; // ここで音量を設定
                    audio.play().catch(e => console.error('再生エラー:', e));
                    
                    // 再生中の音源をボタンに関連付け
                    button.audio = audio;
                    
                    // 再生が終了したら関連付けを解除
                    audio.addEventListener('ended', () => {
                        delete button.audio; // 再生が終わったら関連付けを解除
                        if (button.hasAttribute('data-playing')) {
                            button.removeAttribute('data-playing');
                            button.classList.remove('playing');
                        }
                    });
        
                    button.setAttribute('data-playing', 'true'); // 再生中であることを示す属性を追加
                    button.classList.add('playing'); // アニメーションスタート
                }
            };
        

            // アニメーションを管理する関数
            const handlePlayAnimation = (element, audio) => {
                const currentUrl = new URL(audio.src, window.location.origin).href;
                
                if (element.audio && element.audio.src === currentUrl) {
                    // 同じ音源なら停止して再度再生
                    element.audio.pause();
                    element.audio.currentTime = 0;
                    audio.volume = globalVolume; // ここで音量を設定
                    element.audio.play().catch(e => console.error('再生エラー:', e));
                } else {
                    // 異なる音源または再生中の音源がない場合、新しい再生を開始
                    if (element.audio) {
                        element.audio.pause(); // 既存の再生を停止
                    }
                    audio.volume = globalVolume; // ここで音量を設定
                    audio.play().catch(e => console.error('再生エラー:', e));
                    
                    element.audio = audio;
                    
                    audio.addEventListener('ended', () => {
                        delete element.audio;
                        if (element.hasAttribute('data-playing')) {
                            element.removeAttribute('data-playing');
                            element.classList.remove('playing');
                        }
                    });
        
                    element.setAttribute('data-playing', 'true');
                    element.classList.add('playing');
                    audio.addEventListener('ended', () => {
                        element.removeAttribute('data-playing');
                        element.classList.remove('playing');
                    });
                }
            };

            // タブ切り替えの処理
            document.querySelectorAll('.tab-button').forEach(tab => {
                tab.addEventListener('click', (e) => {
                    e.preventDefault();
                    const tabId = tab.getAttribute('data-tab');
                    const tabContent = document.getElementById(tabId);

                    document.querySelector('.tab-content.active')?.classList.remove('active');
                    document.querySelector('.tab-button.active')?.classList.remove('active');

                    tab.classList.add('active');
                    tabContent.classList.add('active');

                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            });

            // デフォルトでボイス一覧を表示
            document.getElementById('voice-list').classList.add('active');
            document.querySelector('.tab-button[data-tab="voice-list"]').classList.add('active');
        })
        .catch(error => {
            loadingIndicator.textContent = 'エラー: ' + error.message;
            console.error('エラー:', error);
        });
});