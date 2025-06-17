// js/article-loader.js

const ITEMS_PER_PAGE = 8;
let allItems = [];
let currentPage = 1;
let contentGridElement;
let paginationContainerElement;

async function fetchArticleData(fileName, folder, descriptionSource) {
    const path = `${folder}/${fileName}`;
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status} for ${path}`);
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        let title = doc.querySelector('title')?.textContent.trim() || 'タイトルなし';
        const siteTitleSuffix = " - 総合解説プラットフォーム";
        if (title.endsWith(siteTitleSuffix)) {
            title = title.substring(0, title.length - siteTitleSuffix.length).trim();
        }
        let description;
        if (descriptionSource === 'p') {
            description = doc.querySelector('.article-container p')?.textContent.trim() || '概要がありません。';
        } else {
            const metaDesc = doc.querySelector('meta[name="description"]');
            description = metaDesc ? metaDesc.getAttribute('content') : '概要がありません。';
        }
        const articleNumberMeta = doc.querySelector('meta[name="article-number"]');
        const articleNumber = articleNumberMeta ? parseInt(articleNumberMeta.content, 10) : 0;
        return { title, description, path, articleNumber };
    } catch (error) {
        console.error(`記事データの取得中にエラーが発生しました (${path}):`, error);
        return null;
    }
}

function createArticleCard(article) {
    const card = document.createElement('a');
    card.href = article.path;
    card.classList.add('content-card');
    let tagsHtml = '';
    if (article.tags && article.tags.length > 0) {
        tagsHtml = '<div class="card-tags">';
        article.tags.forEach(tag => {
            const tagLink = `tags.html?tag=${encodeURIComponent(tag)}`;
            tagsHtml += `<a href="${tagLink}" class="card-tag clickable" data-tag-link>${tag}</a>`;
        });
        tagsHtml += '</div>';
    }
    card.innerHTML = `<h3>${article.title}</h3>${tagsHtml}<p>${article.description}</p><span class="learn-more">詳しく読む →</span>`;
    card.querySelectorAll('[data-tag-link]').forEach(tagLink => {
        tagLink.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    });
    return card;
}

function initializePaginatedList(items, gridSelector, paginationSelector) {
    allItems = items;
    contentGridElement = document.querySelector(gridSelector);
    paginationContainerElement = document.querySelector(paginationSelector);

    if (!contentGridElement || !paginationContainerElement) return;

    const urlParams = new URLSearchParams(window.location.search);
    const pageFromUrl = parseInt(urlParams.get('page'), 10);
    currentPage = pageFromUrl > 0 ? pageFromUrl : 1;

    displayCurrentPage();
    renderPagination();
    setupPaginationEventListeners();
}

function displayCurrentPage() {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const paginatedItems = allItems.slice(start, end);
    contentGridElement.innerHTML = '';
    if (paginatedItems.length === 0) {
        contentGridElement.innerHTML = '<p class="no-results">該当する記事が見つかりませんでした。</p>';
    } else {
        paginatedItems.forEach(article => {
            contentGridElement.appendChild(createArticleCard(article));
        });
    }
    if (window.MathJax) window.MathJax.typesetPromise();
}

function renderPagination() {
    const totalPages = Math.ceil(allItems.length / ITEMS_PER_PAGE);
    paginationContainerElement.innerHTML = '';
    if (totalPages <= 1) return;

    let html = '';
    
    if (currentPage > 1) {
        html += `<span class="pagination-first-last" data-page="1">«</span>`;
        html += `<span class="pagination-btn" data-page="${currentPage - 1}">&lt;</span>`;
    }

    const pages = [];
    pages.push(1);
    if (totalPages > 1) pages.push(totalPages);
    for (let i = currentPage - 2; i <= currentPage + 2; i++) {
        if (i > 1 && i < totalPages) {
            pages.push(i);
        }
    }
    const uniquePages = [...new Set(pages)].sort((a, b) => a - b);
    
    let lastPage = 0;
    uniquePages.forEach(p => {
        if (p - lastPage > 1) {
            html += `<span class="pagination-ellipsis">...</span>`;
        }
        html += `<span class="pagination-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</span>`;
        lastPage = p;
    });

    if (currentPage < totalPages) {
        html += `<span class="pagination-btn" data-page="${currentPage + 1}">&gt;</span>`;
        html += `<span class="pagination-first-last" data-page="${totalPages}">»</span>`;
    }

    paginationContainerElement.innerHTML = html;
}

function setupPaginationEventListeners() {
    paginationContainerElement.addEventListener('click', e => {
        const target = e.target;
        if ((target.classList.contains('pagination-btn') || target.classList.contains('pagination-first-last')) 
            && !target.classList.contains('active') && !target.classList.contains('disabled')) {
            const page = parseInt(target.dataset.page, 10);
            if (page) {
                currentPage = page;
                displayCurrentPage();
                renderPagination();
                
                const url = new URL(window.location);
                if (currentPage > 1) {
                    url.searchParams.set('page', currentPage);
                } else {
                    url.searchParams.delete('page');
                }
                history.pushState({}, '', url);

                const targetElement = document.querySelector('.main-container');
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }
    });
}
