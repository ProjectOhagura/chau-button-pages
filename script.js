document.addEventListener('DOMContentLoaded', () => {
    const loadingIndicator = document.createElement('div');
    loadingIndicator.textContent = '読み込み中...';
    loadingIndicator.className = 'loading';
    document.body.appendChild(loadingIndicator);

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
                    const audio = new Audio(item.file);
                    handlePlayAnimation(button, audio);
                    audio.play().catch(e => console.error('再生エラー:', e));
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
                const audio = new Audio(item.file);
                handlePlayAnimation(button, audio);
                audio.play().catch(e => console.error('再生エラー:', e));
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
                { title: 'YouTube（大体朝５時から！）', url: 'https://t.co/hEKcXel53p' },
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
                <h2>オススメ！！（先行抽選 2024/12/31 23:59 まで！）</h2>
                <a href="https://yukitochau-firststep.studio.site/" target="_blank">（特設サイト）個人VTuber雪兎ちゃう1stオフラインイベント「First Step in the CINEMA」</a>
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
            randomSelectButton.textContent = 'ランダムくじ';
            randomSelectButton.id = 'random-select';
            asobiListContainer.appendChild(randomSelectButton);

            // くじボタン2: アタマ、結び、オチから各1つずつ選択
            const attributeSelectButton = document.createElement('button');
            attributeSelectButton.textContent = 'アタマ結びオチくじ';
            attributeSelectButton.id = 'attribute-select';
            asobiListContainer.appendChild(attributeSelectButton);

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

            const playAudioSequence = (audios) => {
                let audioIndex = 0;
                const playNext = () => {
                    if (audioIndex < audios.length) {
                        const audio = new Audio(audios[audioIndex].file);
                        const currentVoiceItem = Array.from(selectedVoicesContainer.children).find(child => child.textContent === audios[audioIndex].name);
                        // 再生中の音源のアニメーションを適用
                        handlePlayAnimation(currentVoiceItem, audio);
                        audio.addEventListener('ended', playNext);
                        audio.play();
                        audioIndex++;
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

            // アタマ、結び、オチから各1つずつ選択する処理
            document.getElementById('attribute-select').addEventListener('click', () => {
                const attributes = ['アタマ', '結び', 'オチ'];
                const selectedVoices = attributes.map(attr => {
                    const voices = voiceData.filter(v => v.attribute === attr);
                    return voices[Math.floor(Math.random() * voices.length)];
                });
                displaySelectedVoices(selectedVoices);
            });

            // 選択した音源を表示する関数
            const displaySelectedVoices = (voices) => {
                selectedVoicesContainer.innerHTML = '';
                voices.forEach((voice, index) => {
                    const voiceItem = document.createElement('div');
                    voiceItem.textContent = voice.name;
                    voiceItem.className = 'voice-item';
                    voiceItem.setAttribute('data-order', index + 1); // 順番を属性に追加
                    voiceItem.addEventListener('click', () => {
                        const audio = new Audio(voice.file);
                        // 個別再生時のアニメーション
                        handlePlayAnimation(voiceItem, audio);
                        audio.play().catch(e => console.error('再生エラー:', e));
                    });
                    selectedVoicesContainer.appendChild(voiceItem);
                });
                playButton.disabled = false; // 音源が選択されたら再生ボタンを有効に
            };

            // 再生ボタンのイベントリスナー
            document.getElementById('play-selected').addEventListener('click', () => {
                const audios = Array.from(selectedVoicesContainer.children).map(child => {
                    return { name: child.textContent, file: voiceData.find(v => v.name === child.textContent).file };
                });
                playAudioSequence(audios);
            });

            // アニメーションを管理する関数
            const handlePlayAnimation = (element, audio) => {
                element.classList.add('playing');
                audio.addEventListener('ended', () => {
                    element.classList.remove('playing');
                });
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