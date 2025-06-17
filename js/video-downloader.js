// ========================= 本番用 URL設定 =========================
const API_BASE_URL = 'https://downloader-backend-lw7j.onrender.com'; // ← あなたのRender URLに書き換える
// =================================================================

// --- グローバル変数とDOM要素の初期化 ---
let ws, clientId, videoData;
const urlInput = document.getElementById('video-url'), fetchInfoBtn = document.getElementById('fetch-info-btn'), resultArea = document.getElementById('result-area'), videoThumbnail = document.getElementById('video-thumbnail'), videoTitle = document.getElementById('video-title'), modeSwitch = document.getElementById('mode-switch'), simpleModePanel = document.getElementById('simple-mode'), expertModePanel = document.getElementById('expert-mode'), videoCodecSelect = document.getElementById('video-codec-select'), audioCodecSelect = document.getElementById('audio-codec-select'), audioOnlyCheckbox = document.getElementById('audio-only-checkbox'), mp3QualityGroup = document.getElementById('mp3-quality-group'), mp3QualitySelect = document.getElementById('mp3-quality-select'), expertDownloadBtn = document.getElementById('expert-download-btn'), statusDiv = document.getElementById('status'), statusText = document.getElementById('status-text'), progressBar = document.getElementById('progress-bar').firstElementChild, errorDiv = document.getElementById('error'), downloadLinkContainer = document.getElementById('download-link-container');

// --- WebSocket接続 ---
function connectWebSocket() {
    if (!document.getElementById('video-url')) return;
    const wsUrl = API_BASE_URL.replace(/^http/, 'ws');
    ws = new WebSocket(wsUrl);
    ws.onopen = () => console.log('WebSocket connected');
    ws.onclose = () => { console.log('WebSocket disconnected. Reconnecting...'); setTimeout(connectWebSocket, 3000); };
    ws.onerror = (error) => console.error(`WebSocket Error:`, error);
    ws.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data);
            switch (message.type) {
                case 'connection_ack': clientId = message.clientId; console.log(`Received Client ID: ${clientId}`); break;
                case 'progress': updateProgress(message.progress); break;
                case 'status': updateStatus(message.message); break;
                case 'completed': showDownloadLink(message.data.downloadUrl, message.data.filename); break;
                case 'failed': showError(message.message); setIdle(); break;
            }
        } catch (e) { console.error('Failed to parse message:', event.data); }
    };
}

// --- イベントリスナー ---
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('video-url')) {
        connectWebSocket();
        fetchInfoBtn.addEventListener('click', async () => {
            const url = urlInput.value.trim();
            if (!isValidUrl(url)) { showError('有効なURLを入力してください。'); return; }
            setLoading('動画情報を取得中...');
            try {
                const response = await fetch(`${API_BASE_URL}/get-formats`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);
                videoData = data;
                displayVideoInfo(data);
                setIdle();
            } catch (err) { showError(err.message || '情報の取得に失敗しました。'); setIdle(); }
        });
        modeSwitch.addEventListener('change', () => { simpleModePanel.classList.toggle('active'); expertModePanel.classList.toggle('active'); });
        audioOnlyCheckbox.addEventListener('change', () => { videoCodecSelect.disabled = audioOnlyCheckbox.checked; mp3QualityGroup.classList.toggle('hidden', !audioOnlyCheckbox.checked); });
        document.querySelector('.downloader-container').addEventListener('click', (e) => {
            if (e.target.matches('.simple-download-btn')) {
                e.preventDefault();
                const options = { type: 'simple', ext: e.target.dataset.format };
                startDownload(options);
            }
            else if (e.target.id === 'expert-download-btn') {
                e.preventDefault();
                const vcodec_id = videoCodecSelect.value, acodec_id = audioCodecSelect.value, isAudioOnly = audioOnlyCheckbox.checked;
                if (!acodec_id) { showError('オーディオフォーマットを選択してください。'); return; }
                if (!isAudioOnly && !vcodec_id) { showError('ビデオフォーマットを選択してください。'); return; }
                const options = isAudioOnly
                    ? { type: 'expert_audio', acodec_id, ext: 'mp3', audio_quality: mp3QualitySelect.value }
                    : { type: 'expert_video', vcodec_id, acodec_id, ext: 'mp4' };
                startDownload(options);
            }
        });
    }
});

// --- UI更新関数 ---
function setLoading(message) { hideAllMessages(); statusDiv.classList.remove('hidden'); statusText.textContent = message; updateProgress(0); document.querySelectorAll('.downloader-container button').forEach(b => b.disabled = true); }
function setIdle() { statusDiv.classList.add('hidden'); document.querySelectorAll('.downloader-container button').forEach(b => b.disabled = false); if (videoData) audioOnlyCheckbox.dispatchEvent(new Event('change')); }
function updateStatus(message) { statusText.textContent = escapeHtml(message); }
function updateProgress(progress) { const parent = progressBar.parentElement; parent.style.width = `${progress}%`; progressBar.textContent = `${Math.round(progress)}%`; }
function displayVideoInfo(data) {
    videoTitle.textContent = data.title;
    videoThumbnail.src = data.thumbnail;
    resultArea.classList.remove('hidden');
    const videoFormats = data.formats.filter(f => f.vcodec !== 'none' && f.acodec === 'none' && f.filesize);
    const audioFormats = data.formats.filter(f => f.acodec !== 'none' && f.vcodec === 'none' && f.filesize);
    populateSelect(videoCodecSelect, videoFormats, f => `[${f.format_id}] ${f.resolution} (${f.ext}, ${f.vcodec}) - ${formatBytes(f.filesize || f.filesize_approx)}`);
    populateSelect(audioCodecSelect, audioFormats, f => `[${f.format_id}] ${f.acodec} (${f.ext}, ${f.abr || 0}kbps) - ${formatBytes(f.filesize || f.filesize_approx)}`);
}
function populateSelect(select, formats, formatter) {
    select.innerHTML = '<option value="">-- 選択してください --</option>';
    formats.sort((a, b) => (b.filesize || b.filesize_approx || 0) - (a.filesize || a.filesize_approx || 0));
    formats.forEach(f => {
        const option = document.createElement('option');
        option.value = f.format_id;
        option.textContent = formatter(f);
        select.appendChild(option);
    });
}
function showDownloadLink(url, filename) { setIdle(); statusDiv.classList.add('hidden'); downloadLinkContainer.classList.remove('hidden'); downloadLinkContainer.innerHTML = `<a href="${API_BASE_URL}${url}" download="${filename}"><i class="fa-solid fa-check-circle"></i> ダウンロード準備完了！ クリックして保存</a>`; }
function showError(message) { hideAllMessages(); setIdle(); errorDiv.classList.remove('hidden'); errorDiv.textContent = escapeHtml(message); }
function hideAllMessages() { statusDiv.classList.add('hidden'); errorDiv.classList.add('hidden'); downloadLinkContainer.classList.add('hidden'); }

// --- ヘルパー関数 ---
function formatBytes(bytes, decimals = 2) { if (!+bytes) return 'N/A'; const k = 1024; const dm = decimals < 0 ? 0 : decimals; const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']; const i = Math.floor(Math.log(bytes) / Math.log(k)); return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`; }
function isValidUrl(string) { try { const newUrl = new URL(string); return newUrl.protocol === 'http:' || newUrl.protocol === 'https:'; } catch (_) { return false; } }
function escapeHtml(unsafe) { return unsafe.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/"/g, "&quot;").replace(/'/g, "'"); }

// --- ダウンロード開始処理 ---
async function startDownload(options) {
    if (!clientId) { showError('サーバーとの接続が確立されていません。'); return; }
    if (!videoData || !videoData.title) { showError('先に「動画情報を取得」ボタンを押してください。'); return; }
    setLoading('ダウンロードをサーバーにリクエスト中...');
    const requestBody = { clientId, url: urlInput.value.trim(), title: videoData.title, options };
    try {
        const response = await fetch(`${API_BASE_URL}/download`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) });
        if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || `リクエストに失敗 (Status: ${response.status})`); }
    } catch (err) { showError(err.message); setIdle(); }
}