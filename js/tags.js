// js/tags.js

// 汎用関数を先に定義
/**
 * 記事カードを表示し、ページネーションUIを再描画する
 * @param {Array} articles - 表示する記事データの配列
 * @param {string} title - 結果エリアに表示するタイトル
 */
function displayTagResults(articles, title) {
    const resultsGrid = document.getElementById('results-grid');
    const resultsTitle = document.getElementById('results-title');
    
    resultsGrid.innerHTML = '';
    resultsTitle.textContent = title;

    if (!articles || articles.length === 0) {
        resultsGrid.innerHTML = '<p class="no-results">該当する記事が見つかりませんでした。</p>';
        // ページネーションもクリア
        document.getElementById('tags-pagination-container').innerHTML = '';
        return;
    }

    // initializePaginatedList を呼び出してページネーションを適用
    initializePaginatedList(articles, '#results-grid', '#tags-pagination-container');
}

// メインの処理はDOMの読み込み完了後に行う
document.addEventListener('DOMContentLoaded', async () => {
    // --- 要素の取得 ---
    const tagCloudContainer = document.getElementById('tag-cloud');
    const clearBtn = document.getElementById('clear-selection-btn');
    const tagToggleBtn = document.getElementById('tag-toggle-btn');
    const tagCloudWrapper = document.getElementById('tag-cloud-wrapper');

    if (!tagCloudContainer || !clearBtn || !tagToggleBtn || !tagCloudWrapper) {
        console.error("タグ検索ページの必須UI要素が見つかりません。");
        return;
    }

    // --- 状態管理 ---
    let activeTags = new Set();
    let allFetchedArticles = [];

    // --- データソース ---
    const allArticlesInfo = [
        ...explanationArticles.map(item => ({...item, folder: 'explanation', descSource: 'p'})),
        ...contents.map(item => ({...item, folder: 'contents', descSource: 'meta'}))
    ];

    // --- 初期化処理 ---

    // 1. 全記事の詳細データを最初に一度だけ取得
    allFetchedArticles = await fetchAllArticleDetails(allArticlesInfo);
    
    // 2. タグクラウドを生成
    createTagCloud(allArticlesInfo, allFetchedArticles);

    // 3. イベントリスナーを設定
    setupEventListeners();
    
    // 4. URLパラメータに基づいて初期表示
    initializeFromUrl();
    

    // --- 関数定義 ---

    function createTagCloud(articlesInfo, fetchedArticles) {
        const tagCounts = articlesInfo.flatMap(item => item.tags)
            .reduce((acc, tag) => {
                acc[tag] = (acc[tag] || 0) + 1;
                return acc;
            }, {});
        
        const sortedTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);

        tagCloudContainer.innerHTML = '';
        sortedTags.forEach(tag => {
            const tagButton = document.createElement('span');
            tagButton.className = 'tag-btn';
            tagButton.dataset.tag = tag;
            const count = fetchedArticles.filter(a => a.tags.includes(tag)).length;
            tagButton.innerHTML = `<span>${tag}</span><span class="tag-count">${count}</span>`;
            tagCloudContainer.appendChild(tagButton);
        });
    }

    async function fetchAllArticleDetails(articlesInfo) {
        const fetched = await Promise.all(
            articlesInfo.map(item => 
                fetchArticleData(item.file, item.folder, item.descSource)
                    .then(data => data ? {...data, tags: item.tags} : null)
            )
        );
        return fetched.filter(Boolean);
    }
    
    function setupEventListeners() {
        tagToggleBtn.addEventListener('click', () => {
            tagCloudWrapper.classList.toggle('open');
            tagToggleBtn.textContent = tagCloudWrapper.classList.contains('open') ? 'タグ一覧を隠す' : 'タグ一覧を表示する';
        });

        tagCloudContainer.addEventListener('click', e => {
            const tagButton = e.target.closest('.tag-btn');
            if (tagButton) {
                handleTagClick(tagButton.dataset.tag);
            }
        });

        clearBtn.addEventListener('click', () => {
            activeTags.clear();
            updateAndDisplay();
        });
    }

    function handleTagClick(tag) {
        activeTags.has(tag) ? activeTags.delete(tag) : activeTags.add(tag);
        updateAndDisplay();
    }

    function updateAndDisplay() {
        updateUrl();
        
        let filteredArticles;
        if (activeTags.size === 0) {
            filteredArticles = allFetchedArticles;
        } else {
            filteredArticles = allFetchedArticles.filter(article => 
                Array.from(activeTags).every(activeTag => article.tags.includes(activeTag))
            );
        }
        
        const title = activeTags.size === 0 ? '全ての記事とコンテンツ' : `タグ:「${Array.from(activeTags).join(' & ')}」`;
        
        displayTagResults(filteredArticles, title);
        updateTagButtonsState();
        updateTagCounts(filteredArticles);
        clearBtn.classList.toggle('visible', activeTags.size > 0);
    }
    
    function updateTagButtonsState() {
        document.querySelectorAll('.tag-btn').forEach(btn => {
            btn.classList.toggle('active', activeTags.has(btn.dataset.tag));
        });
    }

    function updateTagCounts(currentArticleSet) {
        document.querySelectorAll('.tag-btn').forEach(btn => {
            const tag = btn.dataset.tag;
            const countSpan = btn.querySelector('.tag-count');
            
            let count;
            if (activeTags.size === 0) {
                count = allFetchedArticles.filter(a => a.tags.includes(tag)).length;
            } else if (activeTags.has(tag)) {
                count = currentArticleSet.length;
            } else {
                count = currentArticleSet.filter(a => a.tags.includes(tag)).length;
            }
            countSpan.textContent = count;
        });
    }

    function updateUrl() {
        const url = new URL(window.location);
        if (activeTags.size > 0) {
            url.searchParams.set('tags', Array.from(activeTags).join(','));
        } else {
            url.searchParams.delete('tags');
        }
        url.searchParams.delete('tag');
        url.searchParams.delete('page');
        history.pushState({}, '', url);
    }
    
    function initializeFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const tagsFromUrl = urlParams.get('tags') || urlParams.get('tag');
        const allTagsList = [...new Set(allArticlesInfo.flatMap(item => item.tags))];
        
        if (tagsFromUrl) {
            const initialTags = tagsFromUrl.split(',').filter(tag => allTagsList.includes(tag));
            activeTags = new Set(initialTags);
        }
        
        updateUrl();
        updateAndDisplay();
    }
});