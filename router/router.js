var AppRouter = (function () {
    'use strict';

    var ROUTES = { home: 'Home', apply: 'Apply', contact: 'Contact', tracking: 'Track Application' };
    var currentRoute = '';
    var isLoaded = false;

    function base(url) {
        return (window.BASE_PATH || '/sbg/').replace(/\/$/, '') + '/' + url.replace(/^\//, '');
    }

    var SEO = {
        home: {
            title: 'Small Business Expansion Grant - Free Grant Funding',
            desc: 'Access free business grant funding with no repayment required. Apply for startup grants, small business grants, and more. Fast online application with 24-hour review.',
            keywords: 'business grants, free grant money, small business funding, startup grants, grant programs'
        },
        apply: {
            title: 'Apply for a Business Grant - Small Business Expansion Grant',
            desc: 'Apply for free business grant funding online. No repayment required. Get funded within 24 hours. Startup, small business, and innovation grants available.',
            keywords: 'apply for grant, business grant application, free grant money, small business grant apply'
        },
        contact: {
            title: 'Contact Us - Small Business Expansion Grant',
            desc: 'Get in touch with the Small Business Expansion Grant team. Contact us for questions about grant programs, application assistance, and support.',
            keywords: 'contact grant, grant support, business grant help, grant questions'
        },
        tracking: {
            title: 'Track Your Grant Application - Small Business Expansion Grant',
            desc: 'Check the status of your grant application using your Application ID. Track progress, view details, and request updates for your business grant funding.',
            keywords: 'track grant application, grant status, application tracking, business grant progress, check grant application'
        },
    };

    function updateMeta(route) {
        var seo = SEO[route] || SEO.home;
        document.title = seo.title;
        var desc = document.querySelector('meta[name="description"]');
        if (desc) desc.setAttribute('content', seo.desc);
        var kw = document.querySelector('meta[name="keywords"]');
        if (kw) kw.setAttribute('content', seo.keywords);
        var og = document.querySelector('meta[property="og:title"]');
        if (og) og.setAttribute('content', seo.title);
        var ogd = document.querySelector('meta[property="og:description"]');
        if (ogd) ogd.setAttribute('content', seo.desc);
        var canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) canonical.setAttribute('href', window.location.origin + '/' + (route === 'home' ? '' : route));
    }

    function updateNav(route) {
        document.querySelectorAll('[data-route]').forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('data-route') === route);
        });
    }

    function getRouteFromPath() {
        var path = window.location.pathname.replace(/\/$/, '').replace(/\/index\.html$/, '');
        var parts = path.split('/');
        var last = parts[parts.length - 1] || '';
        if (ROUTES[last]) return last;
        return 'home';
    }

    function initPageJS() {
        if (typeof AppUI !== 'undefined') {
            if (AppUI.reinit) {
                AppUI.reinit();
            } else if (AppUI.init) {
                AppUI.init();
            }
        }
    }

    function navigate(route, push) {
        if (route === currentRoute && isLoaded) return;
        currentRoute = route;
        var main = document.getElementById('main-content');
        if (!main) return;

        var url = base('pages/' + route + '/index.html');

        main.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;padding:80px 0;color:var(--text-light);"><i class="fas fa-spinner fa-spin" style="font-size:24px;margin-right:12px;"></i> Loading...</div>';

        fetch(url)
            .then(function (r) {
                if (!r.ok) throw new Error('Not found');
                return r.text();
            })
            .then(function (html) {
                main.innerHTML = html;
                updateNav(route);
                updateMeta(route);
                var href = route === 'home' ? base('') : base(route);
                if (push !== false) {
                    try { history.pushState({ route: route }, '', href); } catch (e) {}
                }
                isLoaded = true;
                initPageJS();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            })
            .catch(function () {
                loadDynamicPage(route, main);
            });
    }

    function loadHeaderFooter(callback) {
        var hp = document.getElementById('header-placeholder');
        var fp = document.getElementById('footer-placeholder');
        var loaded = 0;
        var total = 0;

        function done() {
            loaded++;
            if (loaded >= total && callback) callback();
        }

        if (hp) {
            total++;
            fetch(base('includes/header.html'))
                .then(function (r) { return r.text(); })
                .then(function (h) { hp.innerHTML = h; done(); })
                .catch(done);
        }
        if (fp) {
            total++;
            fetch(base('includes/footer.html'))
                .then(function (r) { return r.text(); })
                .then(function (f) { fp.innerHTML = f; done(); })
                .catch(done);
        }
        if (total === 0 && callback) callback();
    }

    function init() {
        var route = getRouteFromPath();
        loadHeaderFooter(function () {
            navigate(route, false);
            try { history.replaceState({ route: route }, '', route === 'home' ? base('') : base(route)); } catch (e) {}
            if (typeof AppDynamicNav !== 'undefined') { AppDynamicNav.init(); }
        });

        window.addEventListener('popstate', function () {
            navigate(getRouteFromPath(), false);
        });

        document.addEventListener('click', function (e) {
            var link = e.target.closest('[data-route]');
            if (link) {
                e.preventDefault();
                navigate(link.getAttribute('data-route'), true);
            }
        });
    }

    function addRoute(slug, name) {
        ROUTES[slug] = name;
        if (!SEO[slug]) {
            SEO[slug] = {
                title: name + ' - Small Business Expansion Grant',
                desc: 'Learn more about ' + name + ' from Small Business Expansion Grant. Free grant funding for your business.',
                keywords: name.toLowerCase() + ', business grant, grant program, small business funding'
            };
        }
    }

    function loadDynamicPage(route, main) {
        var seo = SEO[route];
        if (!seo) {
            main.innerHTML = '<div style="text-align:center;padding:100px 20px;"><h2 style="font-size:28px;font-weight:800;color:var(--primary);margin-bottom:12px;">Page Not Found</h2><p style="color:var(--text-light);margin-bottom:24px;">The page you are looking for does not exist.</p><a href="#" data-route="home" class="btn btn-primary">Go Home</a></div>';
            updateNav('home');
            try { history.replaceState({ route: 'home' }, '', base('')); } catch (e) {}
            currentRoute = 'home';
            return;
        }
        fetch(base('admin/api/data.php?type=pages'))
            .then(function (r) { return r.json(); })
            .then(function (res) {
                if (!res.success || !res.data) throw new Error();
                var allPages = (res.data.pages || []).concat(res.data.programs || []);
                var pageData = null;
                allPages.forEach(function (p) {
                    if ((p.slug || p.id) === route) pageData = p;
                });
                if (!pageData) throw new Error();
                var title = pageData.name || 'Page';
                var sections = pageData.sections || [];
                var html = '<section class="page-hero"><div class="container"><div class="page-hero-inner" data-anim><div class="label">' + title + '</div><h1>' + title + '</h1></div></div></section><section class="page-content"><div class="container">';
                sections.forEach(function (s) {
                    html += '<div class="page-section" data-anim><h2>' + (s.name || '') + '</h2><div class="page-section-content">' + (s.content || '') + '</div></div>';
                });
                html += '</div></section><style>.page-hero{padding:140px 0 40px;background:var(--primary);position:relative}.page-hero-inner{max-width:700px}.page-hero-inner .label{display:inline-block;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:var(--accent);border:1px solid rgba(201,151,91,.3);padding:6px 16px;margin-bottom:20px}.page-hero-inner h1{font-size:44px;font-weight:900;color:var(--white);letter-spacing:-1.5px}.page-content{padding:80px 0 120px;max-width:860px}.page-section{margin-bottom:40px}.page-section h2{font-size:24px;font-weight:900;color:var(--primary);margin-bottom:16px}.page-section-content{font-size:16px;line-height:1.8;color:var(--text-light)}</style>';
                main.innerHTML = html;
                updateNav(route);
                updateMeta(route);
                var href = base(route);
                try { history.pushState({ route: route }, '', href); } catch (e) {}
                isLoaded = true;
                initPageJS();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            })
            .catch(function () {
                main.innerHTML = '<div style="text-align:center;padding:100px 20px;"><h2 style="font-size:28px;font-weight:800;color:var(--primary);margin-bottom:12px;">Page Not Found</h2><p style="color:var(--text-light);margin-bottom:24px;">The page you are looking for does not exist.</p><a href="#" data-route="home" class="btn btn-primary">Go Home</a></div>';
                updateNav('home');
                try { history.replaceState({ route: 'home' }, '', base('')); } catch (e) {}
                currentRoute = 'home';
            });
    }

    return { init: init, addRoute: addRoute };
})();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', AppRouter.init);
} else {
    AppRouter.init();
}
