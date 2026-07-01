var AppDynamicNav = (function () {
    'use strict';

    function base(url) {
        return (window.BASE_PATH || '/').replace(/\/$/, '') + '/' + url.replace(/^\//, '');
    }

    function init() {
        fetch(base('admin/api/data.php?type=pages'))
            .then(function (r) { return r.json(); })
            .then(function (res) {
                if (res.success && res.data) {
                    var data = res.data;
                    var pages = data.pages || [];
                    var programs = data.programs || [];

                    addToFooterPrograms(programs);
                    addRoutes(pages);
                }
            })
            .catch(function () {});
        loadContactInfo();
        loadSettings();
    }

    function loadContactInfo() {
        fetch(base('admin/api/data.php?type=settings'))
            .then(function (r) { return r.json(); })
            .then(function (res) {
                if (!res.success || !res.data || !res.data.contact) return;
                var c = res.data.contact;

                var addr = document.getElementById('ciAddress');
                if (addr) addr.textContent = c.address || '123 Grant Ave, New York, NY 10001';
                var ph = document.getElementById('ciPhone');
                if (ph) ph.textContent = c.phone || '1-800-555-1234';
                var em = document.getElementById('ciEmail');
                if (em) em.textContent = c.email || 'info@sbgrant.com';

                var socialContainer = document.querySelector('.contact-social .cs-links');
                if (socialContainer && c.social && c.social.length) {
                    socialContainer.innerHTML = c.social.map(function (s) {
                        return '<a href="' + (s.url || '#') + '" aria-label="' + s.platform + '"><i class="fab fa-' + s.icon + '"></i></a>';
                    }).join('');
                }

                var footerContact = document.querySelector('.grant-footer .footer-col:last-child');
                if (footerContact && c) {
                    var addrEl = footerContact.querySelector('.contact-item:nth-child(1) span');
                    if (addrEl) addrEl.textContent = c.address || '123 Grant Ave, NY 10001';
                    var emailEl = footerContact.querySelector('.contact-item:nth-child(2) a');
                    if (emailEl) { emailEl.textContent = c.email || 'info@sbgrant.com'; emailEl.href = 'mailto:' + (c.email || 'info@sbgrant.com'); }
                    var phoneEl = footerContact.querySelector('.contact-item:nth-child(3) a');
                    if (phoneEl) { phoneEl.textContent = c.phone || '1-800-555-1234'; phoneEl.href = 'tel:' + (c.phone || '1-800-555-1234'); }
                }

                var footerSocial = document.querySelector('.footer-social');
                if (footerSocial && c.social && c.social.length) {
                    footerSocial.innerHTML = c.social.map(function (s) {
                        return '<a href="' + (s.url || '#') + '" aria-label="' + s.platform + '"><i class="fab fa-' + s.icon + '"></i></a>';
                    }).join('');
                }
            })
            .catch(function () {});
    }

    function loadSettings() {
        fetch(base('admin/api/data.php?type=settings'))
            .then(function (r) { return r.json(); })
            .then(function (res) {
                if (!res.success || !res.data) return;
                var g = res.data.general;
                if (g) {
                    var titleEls = document.querySelectorAll('title');
                    if (titleEls.length) {
                        var currentPath = window.location.pathname;
                        if (currentPath === base('') || currentPath === base('').replace(/\/$/,'')) {
                            document.title = g.site_name + ' - ' + (g.tagline || 'Free Grant Funding');
                        }
                    }
                }
                var s = res.data.support;
                if (s) {
                    var hoursEl = document.getElementById('ciHours');
                    if (hoursEl) hoursEl.textContent = s.hours || 'Mon-Fri 9AM-6PM EST';
                }
            })
            .catch(function () {});
    }

    function addToFooterPrograms(programs) {
        var container = document.querySelector('.grant-footer .footer-col:nth-child(3)');
        if (!container) return;
        programs.forEach(function (p) {
            var link = document.createElement('a');
            link.href = '#';
            link.setAttribute('data-route', p.slug || p.id);
            link.textContent = p.name;
            container.appendChild(link);
        });
    }

    function addRoutes(pages) {
        pages.forEach(function (p) {
            var slug = p.slug || p.id;
            if (window.AppRouter && window.AppRouter.addRoute) {
                window.AppRouter.addRoute(slug, p.name);
            } else if (typeof AppRouter !== 'undefined') {
                setTimeout(function () {
                    if (window.AppRouter && window.AppRouter.addRoute) {
                        window.AppRouter.addRoute(slug, p.name);
                    }
                }, 100);
            }
        });
    }

    return { init: init, loadContactInfo: loadContactInfo, loadSettings: loadSettings };
})();
