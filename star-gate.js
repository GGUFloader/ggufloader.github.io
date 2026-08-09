/**
 * Star Gate — ask users to star GGUF Loader on GitHub before downloading.
 * Intercepts clicks on the download buttons in the #download section and shows
 * a modal with a "Star on GitHub" link. The download only starts once the
 * user continues, and is remembered in localStorage so returning visitors
 * are not blocked again.
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'gguf_loader_star_gate_done';

    var modal = null;
    var pendingUrl = null;

    function openModal() {
        if (!modal) return;
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('star-gate-open');
        var continueBtn = modal.querySelector('[data-star-gate-continue]');
        if (continueBtn) continueBtn.focus();
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('star-gate-open');
        pendingUrl = null;
    }

    function isAlreadySupported() {
        try {
            return localStorage.getItem(STORAGE_KEY) === '1';
        } catch (e) {
            return false;
        }
    }

    function markSupported() {
        try {
            localStorage.setItem(STORAGE_KEY, '1');
        } catch (e) {
            /* localStorage unavailable — ignore */
        }
    }

    function onDownloadClick(event) {
        if (isAlreadySupported()) return; // Let the download proceed normally

        var link = event.currentTarget;
        if (!link || !link.href) return;

        event.preventDefault();
        pendingUrl = link.href;
        openModal();
    }

    function onContinue() {
        var url = pendingUrl;
        closeModal();
        if (!url) return;
        markSupported();
        // Same behaviour as the original link: navigate to the release asset.
        window.location.href = url;
    }

    document.addEventListener('DOMContentLoaded', function () {
        modal = document.getElementById('star-gate-modal');
        if (!modal) return;

        // Gate every direct download button inside the Download section.
        var buttons = document.querySelectorAll('#download .download-button');
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener('click', onDownloadClick);
        }

        // Close controls: the ✕ button and the overlay backdrop.
        var closeTriggers = modal.querySelectorAll('[data-star-gate-close]');
        for (var j = 0; j < closeTriggers.length; j++) {
            closeTriggers[j].addEventListener('click', closeModal);
        }

        var continueBtn = modal.querySelector('[data-star-gate-continue]');
        if (continueBtn) {
            continueBtn.addEventListener('click', onContinue);
        }

        // Close on Escape.
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
    });
})();
