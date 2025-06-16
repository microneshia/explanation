// js/common.js

/**
 * サイト全体で共通して使用するスクリプト
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- トップへ戻るボタンの機能 ---
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            const scrollThreshold = window.innerHeight / 2;
            if (window.pageYOffset > scrollThreshold) {
                scrollTopBtn.classList.add('show');
            } else {
                scrollTopBtn.classList.remove('show');
            }
        });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // --- 記事ページでタグを動的に表示する機能 ---
    if (document.querySelector('.article-container')) {
        const path = window.location.pathname;
        const fileName = path.substring(path.lastIndexOf('/') + 1);

        const allArticles = [
            ...(typeof explanationArticles !== 'undefined' ? explanationArticles : []),
            ...(typeof contents !== 'undefined' ? contents : [])
        ];
        
        const articleInfo = allArticles.find(item => item.file === fileName);

        if (articleInfo && articleInfo.tags && articleInfo.tags.length > 0) {
            const h1 = document.querySelector('.article-container h1');
            if (h1) {
                const tagsContainer = document.createElement('div');
                tagsContainer.className = 'card-tags';
                tagsContainer.style.justifyContent = 'center';

                articleInfo.tags.forEach(tag => {
                    // span要素の代わりにa要素を生成
                    const tagElement = document.createElement('a');
                    tagElement.className = 'card-tag clickable'; // クリック可能であることを示すクラスを追加
                    
                    // タグ検索ページへのリンクを作成。タグ名はURLエンコードする
                    tagElement.href = `../tags.html?tag=${encodeURIComponent(tag)}`; 
                    
                    tagElement.textContent = tag;
                    tagsContainer.appendChild(tagElement);
                });

                h1.insertAdjacentElement('afterend', tagsContainer);
            }
        }
    }
});