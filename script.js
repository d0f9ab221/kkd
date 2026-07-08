document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('downloader-form');
    const urlInput = document.getElementById('youtube-url');
    const clearBtn = document.getElementById('clear-btn');
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    const resultsSection = document.getElementById('results-section');
    const mainPreviewImg = document.getElementById('main-preview-img');
    const currentResBadge = document.getElementById('current-resolution-badge');
    const resolutionItems = document.querySelectorAll('.resolution-item');
    const downloadAllBtn = document.getElementById('download-all-btn');
    const zoomBtn = document.getElementById('zoom-btn');
    const demoBtns = document.querySelectorAll('.demo-btn');
    
    // Lightbox Elements
    const lightbox = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeLightbox = document.querySelector('.close-lightbox');

    // History Elements
    const historySection = document.getElementById('history-section');
    const historyGrid = document.getElementById('history-grid');
    const clearHistoryBtn = document.getElementById('clear-history-btn');

    // State Variables
    let currentVideoId = '';
    let selectedQuality = 'maxresdefault';
    let selectedResLabel = '1080p (HD)';
    let downloadHistory = JSON.parse(localStorage.getItem('yt_thumb_history')) || [];

    // Initialize History
    renderHistory();

    // Event Listeners
    form.addEventListener('submit', handleFormSubmit);
    urlInput.addEventListener('input', handleInput);
    clearBtn.addEventListener('click', clearSearchInput);
    zoomBtn.addEventListener('click', openFullscreen);
    closeLightbox.addEventListener('click', closeFullscreen);
    clearHistoryBtn.addEventListener('click', clearHistory);

    // Close lightbox on clicking outside the image
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeFullscreen();
    });

    // Demo Buttons
    demoBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            urlInput.value = btn.getAttribute('data-url');
            handleInput();
            processVideo(urlInput.value);
        });
    });

    // Resolution Selection
    resolutionItems.forEach(item => {
        item.addEventListener('click', () => {
            resolutionItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            selectedQuality = item.getAttribute('data-quality');
            selectedResLabel = item.getAttribute('data-res');
            
            updatePreviewImage();
        });

        // Individual Download Button inside list item
        const singleDownloadBtn = item.querySelector('.download-single-btn');
        singleDownloadBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering parent click
            const quality = singleDownloadBtn.getAttribute('data-quality');
            triggerDownload(quality);
        });
    });

    // Main Download Button
    downloadAllBtn.addEventListener('click', () => {
        triggerDownload(selectedQuality);
    });

    // Input handler to show/hide clear button
    function handleInput() {
        if (urlInput.value.trim() !== '') {
            clearBtn.classList.remove('hidden');
        } else {
            clearBtn.classList.add('hidden');
        }
        hideError();
    }

    function clearSearchInput() {
        urlInput.value = '';
        clearBtn.classList.add('hidden');
        hideError();
        urlInput.focus();
    }

    // Form Submit Handler
    function handleFormSubmit(e) {
        e.preventDefault();
        const url = urlInput.value.trim();
        processVideo(url);
    }

    // Main Processing Logic
    function processVideo(url) {
        const videoId = extractVideoId(url);
        
        if (videoId) {
            currentVideoId = videoId;
            hideError();
            
            // Reset resolution selection to Max Quality by default
            resetResolutionSelection();
            
            // Update UI
            updatePreviewImage();
            resultsSection.classList.remove('hidden');
            
            // Scroll to results smoothly
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            // Add to history
            addToHistory(videoId);
        } else {
            showError('Invalid YouTube URL. Please enter a valid watch link or short URL.');
            resultsSection.classList.add('hidden');
        }
    }

    // Extract YouTube Video ID
    function extractVideoId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    // Update Preview Image Source
    function updatePreviewImage() {
        const imgUrl = `https://img.youtube.com/vi/${currentVideoId}/${selectedQuality}.jpg`;
        mainPreviewImg.src = imgUrl;
        currentResBadge.textContent = selectedResLabel;

        // Fallback mechanism: If maxresdefault fails (doesn't exist for older/low-res videos),
        // we can detect it and fallback gracefully. 
        mainPreviewImg.onerror = function() {
            if (selectedQuality === 'maxresdefault') {
                // Fallback to standard definition
                selectedQuality = 'sddefault';
                selectedResLabel = '720p (SD)';
                updatePreviewImage();
                
                // Update active state in list
                resolutionItems.forEach(item => {
                    if (item.getAttribute('data-quality') === 'sddefault') {
                        resolutionItems.forEach(i => i.classList.remove('active'));
                        item.classList.add('active');
                    }
                });
            } else if (selectedQuality === 'sddefault') {
                // Fallback to HQ
                selectedQuality = 'hqdefault';
                selectedResLabel = 'Medium (HQ)';
                updatePreviewImage();
            }
        };
    }

    function resetResolutionSelection() {
        selectedQuality = 'maxresdefault';
        selectedResLabel = '1080p (HD)';
        resolutionItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-quality') === 'maxresdefault') {
                item.classList.add('active');
            }
        });
    }

    // Trigger Download
    function triggerDownload(quality) {
        const imgUrl = `https://img.youtube.com/vi/${currentVideoId}/${quality}.jpg`;
        
        // Since cross-origin direct downloads can be blocked by browsers, 
        // we fetch the image as a blob and trigger download via object URL.
        fetch(imgUrl)
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `yt-thumbnail-${currentVideoId}-${quality}.jpg`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            })
            .catch(() => {
                // Fallback: Open in new tab if fetch fails due to CORS
                window.open(imgUrl, '_blank');
            });
    }

    // Error Handling
    function showError(message) {
        errorText.textContent = message;
        errorMessage.classList.remove('hidden');
    }

    function hideError() {
        errorMessage.classList.add('hidden');
    }

    // Lightbox / Fullscreen Preview
    function openFullscreen() {
        const imgUrl = `https://img.youtube.com/vi/${currentVideoId}/${selectedQuality}.jpg`;
        lightboxImg.src = imgUrl;
        lightbox.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    function closeFullscreen() {
        lightbox.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    // History Management
    function addToHistory(videoId) {
        // Avoid duplicates
        if (!downloadHistory.includes(videoId)) {
            downloadHistory.unshift(videoId); // Add to beginning
            if (downloadHistory.length > 8) {
                downloadHistory.pop(); // Limit to 8 items
            }
            localStorage.setItem('yt_thumb_history', JSON.stringify(downloadHistory));
            renderHistory();
        }
    }

    function renderHistory() {
        if (downloadHistory.length === 0) {
            historySection.classList.add('hidden');
            return;
        }

        historySection.classList.remove('hidden');
        historyGrid.innerHTML = '';

        downloadHistory.forEach(id => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <img class="history-thumb" src="https://img.youtube.com/vi/${id}/mqdefault.jpg" alt="Thumbnail">
                <div class="history-info">ID: ${id}</div>
            `;
            item.addEventListener('click', () => {
                urlInput.value = `https://www.youtube.com/watch?v=${id}`;
                handleInput();
                processVideo(urlInput.value);
            });
            historyGrid.appendChild(item);
        });
    }

    function clearHistory() {
        downloadHistory = [];
        localStorage.removeItem('yt_thumb_history');
        renderHistory();
    }
});
