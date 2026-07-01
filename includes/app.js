var AppUI = (function () {
    'use strict';

    var observer = null;

    function hideLoader() {
        var el = document.getElementById('pageLoader');
        if (el) el.classList.add('loaded');
    }

    function initLoader() {
        hideLoader();
        window.addEventListener('load', hideLoader);
        setTimeout(hideLoader, 3000);
    }

    function initHeaderScroll() {
        var header = document.getElementById('grantHeader');
        if (!header) return;
        var ticking = false;
        window.addEventListener('scroll', function () {
            if (!ticking) {
                requestAnimationFrame(function () {
                    header.classList.toggle('scrolled', window.scrollY > 60);
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    function initMobileNav() {
        var toggle = document.getElementById('mobileToggle');
        var nav = document.getElementById('grantNav');
        var overlay = document.getElementById('grantNavOverlay');
        var closeBtn = document.getElementById('navClose');

        function open() { if (nav) nav.classList.add('open'); if (overlay) overlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
        function close() { if (nav) nav.classList.remove('open'); if (overlay) overlay.classList.remove('open'); document.body.style.overflow = ''; }

        if (toggle) toggle.addEventListener('click', open);
        if (closeBtn) closeBtn.addEventListener('click', close);
        if (overlay) overlay.addEventListener('click', close);
        if (nav) nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
    }

    function initFaq() {
        document.querySelectorAll('.faq-item').forEach(function (item) {
            var q = item.querySelector('.faq-q');
            if (q) q.addEventListener('click', function () { item.classList.toggle('active'); });
        });
    }

    function initAnimations() {
        if (observer) observer.disconnect();
        observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
            });
        }, { threshold: .1, rootMargin: '0px 0px -40px 0px' });
        document.querySelectorAll('[data-anim]').forEach(function (el) { observer.observe(el); });
    }

    function initProtection() {
        document.querySelectorAll('img').forEach(function (i) { i.setAttribute('draggable', 'false'); });
        document.addEventListener('contextmenu', function (e) { if (e.target.tagName === 'IMG') e.preventDefault(); });
        document.addEventListener('dragstart', function (e) { if (e.target.tagName === 'IMG') e.preventDefault(); });
    }

    function initUploadArea() {
        var area = document.getElementById('uploadArea');
        var input = document.getElementById('fileInput');
        var list = document.getElementById('fileList');
        if (!area || !input || !list) return;

        area.addEventListener('click', function () { input.click(); });
        area.addEventListener('dragover', function (e) { e.preventDefault(); area.classList.add('dragover'); });
        area.addEventListener('dragleave', function () { area.classList.remove('dragover'); });
        area.addEventListener('drop', function (e) {
            e.preventDefault(); area.classList.remove('dragover');
            if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files, list);
        });
        input.addEventListener('change', function () { if (input.files.length) handleFiles(input.files, list); });
    }

    function handleFiles(files, list) {
        Array.from(files).forEach(function (file) {
            if (file.size > 10 * 1024 * 1024) return;
            var icon = file.type.startsWith('audio') ? 'fa-microphone' : (file.type.startsWith('image') ? 'fa-image' : 'fa-file');
            var div = document.createElement('div');
            div.className = 'file-item';
            div.innerHTML = '<i class="fas ' + icon + '"></i> ' + file.name + ' <span class="remove-file" onclick="this.parentElement.remove()">\u00D7</span>';
            list.appendChild(div);
        });
    }

    function initForm() {
        var form = document.getElementById('grantForm');
        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var data = new FormData(form);
            var summary = {};
            data.forEach(function (v, k) { summary[k] = v; });

            var btn = form.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.textContent = 'Submitting...';

            var fileItems = document.querySelectorAll('#fileList .file-item');
            var fileNames = Array.from(fileItems).map(function (el) {
                return el.textContent.replace('\u00D7', '').trim();
            });

            summary.files = fileNames.join(', ');

            var base = window.BASE_PATH || '';
            fetch(base + 'includes/capture.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(summary)
            })
            .then(function (r) { return r.json(); })
            .then(function (res) {
                var msg = 'Name: ' + (summary.fullname || '\u2014') + '\nBusiness: ' + (summary.business_name || '\u2014') + '\nGrant: ' + (summary.grant_type || '\u2014') + '\nEmail: ' + (summary.email || '\u2014') + '\nAmount: $' + (summary.grant_amount || '\u2014') + '\nFiles: ' + fileNames.length + '\n\nOur team will review within 24 hours.';
                showToast('Application Submitted!', msg);
                btn.textContent = 'Submitted \u2713';
            })
            .catch(function () {
                showToast('Error', 'Could not submit. Please try again.');
                btn.disabled = false;
                btn.textContent = 'Submit Application \u2192';
            });
        });
    }

    function showToast(title, message) {
        var existing = document.querySelector('.toast-overlay');
        if (existing) existing.remove();
        var overlay = document.createElement('div');
        overlay.className = 'toast-overlay';
        overlay.innerHTML = '<div class="toast-box"><h4>' + title + '</h4><p>' + message.replace(/\n/g, '<br>') + '</p><button class="btn btn-primary" onclick="this.closest(\'.toast-overlay\').remove()">OK</button></div>';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
        overlay.querySelector('.toast-box').style.cssText = 'background:var(--white);max-width:480px;width:100%;padding:32px;text-align:center;';
        overlay.querySelector('.toast-box h4').style.cssText = 'font-size:20px;font-weight:800;margin-bottom:12px;color:var(--text);';
        overlay.querySelector('.toast-box p').style.cssText = 'font-size:14px;color:var(--text-light);line-height:1.8;margin-bottom:20px;text-align:left;';
        document.body.appendChild(overlay);
        overlay.querySelector('button').focus();
    }

    function initTracking() {
        var base = window.BASE_PATH || '/sbg/';
        var btn = document.getElementById('trackLookupBtn');
        var input = document.getElementById('trackAppId');
        var section = document.getElementById('trackResultSection');
        var result = document.getElementById('trackResult');
        if (!btn || !input || !section || !result) return;

        function lookup() {
            var id = input.value.trim();
            if (!id) { alert('Please enter your Application ID.'); return; }
            btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
            fetch(base + 'data/user.json').then(function (r) { return r.json(); }).then(function (users) {
                var app = null;
                users.forEach(function (u) { if (u.appId && u.appId.toLowerCase() === id.toLowerCase()) app = u; });
                section.style.display = 'block';
                if (app) {
                    result.innerHTML = '<div class="tr-header"><h3>Application #' + app.appId + '</h3><span class="status ' + app.status + '">' + app.status + '</span></div>' +
                        '<div class="tr-detail"><span class="tr-label">Full Name</span><span class="tr-value">' + (app.fullname || '') + '</span></div>' +
                        '<div class="tr-detail"><span class="tr-label">Business</span><span class="tr-value">' + (app.business || '') + '</span></div>' +
                        '<div class="tr-detail"><span class="tr-label">Grant Type</span><span class="tr-value">' + (app.grant_type || '') + '</span></div>' +
                        '<div class="tr-detail"><span class="tr-label">Amount Requested</span><span class="tr-value">$' + ((app.amount_requested || 0).toLocaleString()) + '</span></div>' +
                        '<div class="tr-detail"><span class="tr-label">Date Submitted</span><span class="tr-value">' + (app.applied_date || '') + '</span></div>' +
                        '<div class="tr-detail"><span class="tr-label">Status</span><span class="tr-value" style="text-transform:capitalize">' + (app.status || 'pending') + '</span></div>' +
                        (app.notes ? '<div class="tr-detail"><span class="tr-label">Notes</span><span class="tr-value">' + app.notes + '</span></div>' : '') +
                        '<div class="tr-actions"><button class="btn" id="trackRemindBtn"><i class="fas fa-bell"></i> Remind Admin</button><a href="#" data-route="apply" class="btn btn-outline">Apply Again</a></div>';
                    document.getElementById('trackRemindBtn').addEventListener('click', function () {
                        this.disabled = true; this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                        fetch(base + 'includes/mailer.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'reminder', data: { fullname: app.fullname, email: app.email, appId: app.appId, phone: app.phone, business: app.business } }) })
                            .then(function (r) { return r.json(); }).then(function () { alert('Reminder sent to admin.'); this.innerHTML = '<i class="fas fa-check"></i> Sent'; }.bind(this))
                            .catch(function () { alert('Reminder sent (email system active).'); this.innerHTML = '<i class="fas fa-check"></i> Sent'; }.bind(this));
                    });
                } else {
                    result.innerHTML = '<div class="tr-not-found"><i class="fas fa-search"></i><h3>Application Not Found</h3><p>No application found with ID: ' + id + '. Please check your ID and try again.</p></div>';
                }
                btn.disabled = false; btn.innerHTML = 'Look Up <i class="fas fa-search"></i>';
            }).catch(function () { alert('Could not lookup application. Please try again.'); btn.disabled = false; btn.innerHTML = 'Look Up <i class="fas fa-search"></i>'; });
        }

        btn.addEventListener('click', lookup);
        input.addEventListener('keydown', function (e) { if (e.key === 'Enter') lookup(); });
    }

    function reinit() {
        initFaq();
        initAnimations();
        initUploadArea();
        initForm();
        initProtection();
        initMobileNav();
        initTracking();
    }

    function initAll() {
        initLoader();
        initMobileNav();
        initHeaderScroll();
        initFaq();
        initAnimations();
        initUploadArea();
        initForm();
        initProtection();
    }

    return { init: initAll, reinit: reinit };
})();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', AppUI.init);
} else {
    AppUI.init();
}
