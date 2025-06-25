// js/article-list.js

/**
 * このファイルは、サイトに表示する記事やコンテンツのファイル名を管理します。
 * 新しい記事やコンテンツを追加する際は、このファイルの対応する配列に
 * オブジェクトを追加するだけで、自動的に一覧ページに表示されるようになります。
 */

// 解説記事 (explanation/ フォルダ内) のファイル名とタグ情報を管理
const explanationArticles = [
    { file: 'IC_11.html',       tags: ['解説', '情報通信工学', '信号処理', 'サンプリング定理', 'エイリアシング', '量子化', 'SNR'] },  // 19
    { file: 'IC_10.html',       tags: ['解説', '情報通信工学', '変調', 'FM', 'AM', 'フーリエ級数', '信号処理'] },  // 18
    { file: 'AM1_11.html',      tags: ['解説', '応用数学Ⅰ', 'フーリエ解析', '強制振動', 'RLC回路', '微分方程式'] },  // 17
    { file: 'CE1_09.html',      tags: ['解説', '制御工学Ⅰ', 'ラプラス変換', '微分方程式', '線形代数'] },  // 16
    { file: 'ET_09.html',       tags: ['解説', '電磁界理論', '静電気学', 'ガウスの法則', 'ポアソン方程式'] },  // 15
    { file: 'analogEC_09.html', tags: ['解説', 'アナログ電子回路', '電子回路', '発振回路', 'オペアンプ'] },  // 14
    { file: 'vector.html',      tags: ['解説', '電磁界理論', 'ベクトル解析', '線積分', '応用数学'] },  // 13
    { file: 'apfm.html',        tags: ['解説', '情報通信工学', '変調', 'AM', 'FM', 'PM'] },  // 12
    { file: 'ET_07.html',       tags: ['解説', '電磁界理論', 'ベクトル解析', 'ガウスの定理', 'ストークスの定理'] },  // 11
    { file: 'AM1_10.html',      tags: ['解説', '応用数学Ⅰ', 'フーリエ解析', '複素フーリエ級数'] },  // 10
    { file: 'AM1_09.html',      tags: ['解説', '応用数学Ⅰ', 'フーリエ解析', '半区間展開'] },  // 9
    { file: 'analogEC_e1.html', tags: ['解説', 'アナログ電子回路', '電子回路', 'オペアンプ'] },  // 8
    { file: 'AM1_08.html',      tags: ['解説', '応用数学Ⅰ', 'フーリエ解析', '任意周期'] },  // 7
    { file: 'ES2_07.html',      tags: ['解説', '電機システムⅡ', '誘導電動機', 'モーター'] },  // 6
    { file: 'AM1_07.html',      tags: ['解説', '応用数学Ⅰ', 'フーリエ解析', '周期2π'] },  // 5
    { file: 'CE1_06.html',      tags: ['解説', '制御工学Ⅰ', 'ラプラス変換', '時間推移定理'] },  // 4
    { file: 'ET_06.html',       tags: ['解説', '電磁界理論', '重ね合わせの原理', 'ゲージ変換'] },  // 3
    { file: 'AM1_06.html',      tags: ['解説', '応用数学Ⅰ', 'ラプラス変換', '微分方程式'] },  // 2
    { file: 'SPE.html',         tags: ['解説', '電磁界理論', 'ポテンシャル', 'ベクトル解析'] }  // 1
];

// その他のコンテンツ (contents/ フォルダ内) のファイル名とタグ情報を管理
const contents = [
    { file: 'ball.html',                tags: ['コンテンツ', 'ゲーム', 'ガジェット', 'JavaScript', 'HTML5'] },  // 18
    { file: 'input-leap-guide.html',    tags: ['コンテンツ', 'PCツール', 'Windows', 'macOS', 'Input Leap', 'ソフトウェアKVM'] },  // 17
    { file: 'gitguide.html',            tags: ['コンテンツ', 'Git', 'GitHub', 'VS Code', 'チュートリアル'] },  // 16
    { file: 'bad-ui-showcase.html',     tags: ['コンテンツ', 'ジョーク', 'UI/UX', 'Webデザイン', 'JavaScript'] },  // 15
    { file: 'music.html',               tags: ['コンテンツ', 'ツール', '音楽', 'メディアプレーヤー', 'Web Audio API'] },  // 14
    { file: 'piano.html',               tags: ['コンテンツ', 'ツール', '音楽', 'シンセサイザー', 'Web Audio API'] },  // 13
    { file: 'shabanai-gen.html',        tags: ['コンテンツ', 'AI', 'ジェネレーター', '読み物', 'Gemini'] },  // 12
    { file: 'click.html',               tags: ['コンテンツ', 'ゲーム', 'クリッカーゲーム', 'JavaScript'] },  // 11
    { file: 'CH_ex2.html',              tags: ['コンテンツ', 'コンピュータ科学', 'ハードウェア', '試験対策', 'クイズ'] },  // 10
    { file: 'CH_ex1.html',              tags: ['コンテンツ', 'コンピュータ科学', 'ハードウェア', '試験対策', 'クイズ'] },  // 9
    { file: 'slot.html',                tags: ['コンテンツ', 'ゲーム', 'JavaScript', 'Web開発'] },  // 8
    { file: 'screensaber.html',         tags: ['コンテンツ', 'ツール', 'JavaScript', 'アニメーション'] },  // 7
    { file: 'images.html',              tags: ['コンテンツ', 'ツール', 'JavaScript', 'API'] },  // 6
    { file: 'words.html',               tags: ['コンテンツ', 'ツール', 'JavaScript', 'API'] },  // 5
    { file: 'robocheck.html',           tags: ['コンテンツ', 'ジョーク', 'JavaScript'] },  // 4
    { file: 'reversi 1xCPU.html',       tags: ['コンテンツ', 'ゲーム', 'リバーシ', '思考ゲーム'] },  // 3
    { file: 'reversi 1x1.html',         tags: ['コンテンツ', 'ゲーム', 'リバーシ', '対戦'] },  // 2
    { file: 'reversi auto.html',        tags: ['コンテンツ', 'ゲーム', 'リバーシ', 'シミュレーション'] }  // 1
];
