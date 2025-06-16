// js/mathjax-config.js

/**
 * MathJax（数式表示ライブラリ）のサイト全体共通設定
 * この設定は、MathJaxのスクリプト本体が読み込まれる「前」に定義されている必要があります。
 */

// MathJaxグローバルオブジェクトが存在しない場合（エラー防止）に初期化
if (typeof window.MathJax === 'undefined') {
    window.MathJax = {};
}

// MathJaxの設定を構成
window.MathJax = {
    // TeX入力に関する設定
    tex: {
        // インライン数式（文中の数式）のデリミタ（区切り文字）を指定
        // 例: $E=mc^2$ や \(E=mc^2\)
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        
        // ディスプレイ数式（別行立ての数式）のデリミタを指定
        // 例: $$ \int_0^\infty f(x) dx $$ や \[ ... \]
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        
        // TeXのコマンド内のバックスラッシュをエスケープ文字として処理するかどうか
        processEscapes: true,
        
        // 追加で読み込むTeXパッケージを指定
        // '[+]': ['ams'] は、AMSmathパッケージを有効にし、align環境などを使えるようにする
        packages: { '[+]': ['ams'] }
    },
    // SVG出力に関する設定
    svg: {
        // フォントキャッシュをグローバルに設定し、ページをまたいでフォントデータを再利用することで表示を高速化
        fontCache: 'global'
    }
};