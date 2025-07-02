// js/tags.js

// 汎用関数 (変更なし)
function displayTagResults(articles, title) {
    const resultsGrid = document.getElementById('results-grid');
    const resultsTitle = document.getElementById('results-title');
    
    resultsGrid.innerHTML = '';
    resultsTitle.textContent = title;

    if (!articles || articles.length === 0) {
        resultsGrid.innerHTML = '<p class="no-results">該当する記事が見つかりませんでした。</p>';
        document.getElementById('tags-pagination-container').innerHTML = '';
        return;
    }

    initializePaginatedList(articles, '#results-grid', '#tags-pagination-container');
}

document.addEventListener('DOMContentLoaded', async () => {
    // --- DOM要素の取得 ---
    const keywordInput = document.getElementById('keyword-search-input');
    const openModalBtn = document.getElementById('open-filter-modal-btn');
    const closeModalBtn = document.getElementById('close-filter-modal-btn');
    const modal = document.getElementById('filter-modal');
    const tagListContainer = document.getElementById('tag-list-container');
    const tagSearchInput = document.getElementById('tag-search-input');
    const applyBtn = document.getElementById('apply-tags-btn');
    const resetBtn = document.getElementById('reset-tags-btn');
    const activeTagsDisplay = document.getElementById('active-tags-display');

    if (!modal || !keywordInput) {
        console.error("検索ページの必須UI要素が見つかりません。");
        return;
    }

    // --- 状態管理 ---
    let activeTags = new Set();
    let tempActiveTags = new Set();
    let currentKeyword = '';
    let allFetchedArticles = [];
    let allTagsData = [];

    // --- データソース ---
    const allArticlesInfo = [
        ...explanationArticles.map(item => ({...item, folder: 'explanation', descSource: 'p'})),
        ...contents.map(item => ({...item, folder: 'contents', descSource: 'meta'}))
    ];

    // --- 初期化処理 ---
    allFetchedArticles = await fetchAllArticleDetails(allArticlesInfo);
    initializeTagData(allFetchedArticles);
    createTagListDOM();
    setupEventListeners();
    initializeFromUrl();
    
    // --- 関数定義 ---
    
    // ★★★ ハイライト用ヘルパー関数 ★★★
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function highlightText(text, keyword) {
        if (!keyword || !text) {
            return text;
        }
        const safeKeyword = escapeRegExp(keyword);
        const regex = new RegExp(`(${safeKeyword})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }

    async function fetchAllArticleDetails(articlesInfo) {
        const fetched = await Promise.all(
            articlesInfo.map(item => fetchArticleData(item.file, item.folder, item.descSource)
                .then(data => data ? {...data, tags: item.tags} : null))
        );
        return fetched.filter(Boolean);
    }
    
    function initializeTagData(fetchedArticles) {
        const tagCounts = fetchedArticles.reduce((acc, article) => {
            if (article && article.tags) {
                article.tags.forEach(tag => { acc[tag] = (acc[tag] || 0) + 1; });
            }
            return acc;
        }, {});
        
        allTagsData = Object.entries(tagCounts)
            .filter(([, count]) => count > 0)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
    }

    function createTagListDOM() {
        if (allTagsData.length === 0) {
            tagListContainer.innerHTML = '<p class="no-results">利用可能なタグはありません。</p>';
            return;
        }
        const fragment = document.createDocumentFragment();
        allTagsData.forEach(({ tag, count }) => {
            const item = document.createElement('div');
            item.className = 'tag-list-item';
            item.dataset.tag = tag;
            item.dataset.originalCount = count;
            // タグ名表示部分をspanで囲む
            item.innerHTML = `
                <div class="checkbox"></div>
                <span class="tag-name">${tag}</span>
                <span class="tag-count">${count}</span>`;
            fragment.appendChild(item);
        });
        tagListContainer.innerHTML = '';
        tagListContainer.appendChild(fragment);
    }

    function updateTagListDisplay() {
        const filterText = tagSearchInput.value;
        const tempFilteredArticles = allFetchedArticles.filter(article =>
            Array.from(tempActiveTags).every(tag => article.tags.includes(tag))
        );
        
        const tagElements = Array.from(tagListContainer.children);

        const tagsWithUpdatedInfo = tagElements.map(item => {
            const tag = item.dataset.tag;
            const isSelected = tempActiveTags.has(tag);
            const dynamicCount = isSelected
                ? tempFilteredArticles.length
                : tempFilteredArticles.filter(article => article.tags.includes(tag)).length;

            // ★★★ タグ名のハイライト処理を追加 ★★★
            item.querySelector('.tag-name').innerHTML = highlightText(tag, filterText);
            item.querySelector('.tag-count').textContent = dynamicCount;
            item.classList.toggle('selected', isSelected);
            
            const matchesSearch = filterText ? tag.toLowerCase().includes(filterText.toLowerCase()) : true;
            const shouldBeVisible = matchesSearch && (dynamicCount > 0 || isSelected);
            item.style.display = shouldBeVisible ? 'flex' : 'none';

            return { element: item, isSelected, dynamicCount, originalCount: parseInt(item.dataset.originalCount, 10) };
        });

        tagsWithUpdatedInfo.sort((a, b) => {
            if (a.isSelected !== b.isSelected) return a.isSelected ? -1 : 1;
            if (a.dynamicCount !== b.dynamicCount) return b.dynamicCount - a.dynamicCount;
            if (a.originalCount !== b.originalCount) return b.originalCount - a.originalCount;
            return a.element.dataset.tag.localeCompare(b.element.dataset.tag);
        });

        tagsWithUpdatedInfo.forEach(t => tagListContainer.appendChild(t.element));
    }

    function setupEventListeners() {
        keywordInput.addEventListener('input', () => {
            currentKeyword = keywordInput.value;
            updateMainDisplay();
        });

        openModalBtn.addEventListener('click', openModal);
        closeModalBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

        tagListContainer.addEventListener('click', e => {
            const item = e.target.closest('.tag-list-item');
            if (item) {
                const tag = item.dataset.tag;
                tempActiveTags.has(tag) ? tempActiveTags.delete(tag) : tempActiveTags.add(tag);
                updateTagListDisplay();
            }
        });

        activeTagsDisplay.addEventListener('click', e => {
            const chip = e.target.closest('.tag-chip');
            if (chip) {
                activeTags.delete(chip.dataset.tag);
                updateMainDisplay();
            }
        });

        applyBtn.addEventListener('click', applyFilter);
        resetBtn.addEventListener('click', resetTempFilter);
        tagSearchInput.addEventListener('input', () => updateTagListDisplay());
    }
    
    function updateMainDisplay() {
        // 1. タグで絞り込み
        let filteredByTags = activeTags.size === 0
            ? allFetchedArticles
            : allFetchedArticles.filter(article => Array.from(activeTags).every(tag => article.tags.includes(tag)));

        // 2. キーワードでさらに絞り込み & ハイライト適用
        const lowerCaseKeyword = currentKeyword.toLowerCase();
        let finalFilteredArticles = [];

        if (currentKeyword) {
            finalFilteredArticles = filteredByTags
                .filter(article => 
                    article.title.toLowerCase().includes(lowerCaseKeyword) || 
                    article.description.toLowerCase().includes(lowerCaseKeyword)
                )
                .map(article => ({
                    ...article,
                    title: highlightText(article.title, currentKeyword),
                    description: highlightText(article.description, currentKeyword)
                }));
        } else {
            finalFilteredArticles = filteredByTags;
        }

        // 3. 結果のタイトルを生成
        let title;
        const tagText = activeTags.size > 0 ? `タグ「${Array.from(activeTags).join(' & ')}」` : '';
        const keywordText = currentKeyword ? `キーワード「${currentKeyword}」` : '';
        const articleCount = finalFilteredArticles.length;
        
        if (tagText && keywordText) {
            title = `${tagText} と ${keywordText} の検索結果 (${articleCount}件)`;
        } else if (tagText) {
            title = `タグ: ${tagText} (${articleCount}件)`;
        } else if (keywordText) {
            title = `キーワード: ${keywordText} (${articleCount}件)`;
        } else {
            title = `全ての記事とコンテンツ (${allFetchedArticles.length}件)`;
        }
        
        displayTagResults(finalFilteredArticles, title);
        renderActiveTagChips();
        updateUrl();
    }

    function renderActiveTagChips() {
        if (activeTags.size === 0) {
            activeTagsDisplay.innerHTML = '';
            return;
        }
        activeTagsDisplay.innerHTML = Array.from(activeTags).map(tag => `
            <div class="tag-chip" data-tag="${tag}" title="クリックして解除">
                <span>${tag}</span>
                <button class="remove-chip-btn">×</button>
            </div>
        `).join('');
    }

    function openModal() {
        tempActiveTags = new Set(activeTags);
        tagSearchInput.value = '';
        updateTagListDisplay();
        modal.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('visible');
        document.body.style.overflow = '';
    }
    
    function applyFilter() {
        activeTags = new Set(tempActiveTags);
        updateMainDisplay();
        closeModal();
    }
    
    function resetTempFilter() {
        tempActiveTags.clear();
        updateTagListDisplay();
    }

    function updateUrl() {
        const url = new URL(window.location);
        if (activeTags.size > 0) {
            url.searchParams.set('tags', Array.from(activeTags).join(','));
        } else {
            url.searchParams.delete('tags');
        }
        if (currentKeyword) {
            url.searchParams.set('q', currentKeyword);
        } else {
            url.searchParams.delete('q');
        }
        url.searchParams.delete('tag');
        url.searchParams.delete('page');
        history.pushState({}, '', url);
    }
    
    function initializeFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        
        const tagsFromUrl = urlParams.get('tags') || urlParams.get('tag');
        if (tagsFromUrl) {
            const allTagNames = allTagsData.map(item => item.tag);
            const initialTags = tagsFromUrl.split(',').filter(tag => allTagNames.includes(tag));
            activeTags = new Set(initialTags);
        }

        const keywordFromUrl = urlParams.get('q');
        if (keywordFromUrl) {
            currentKeyword = keywordFromUrl;
            keywordInput.value = currentKeyword;
        }
        
        updateMainDisplay();
    }
});