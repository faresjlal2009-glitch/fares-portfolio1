/* =====================================================
   FARES JLAL - معرض أعمال مصمم جرافيك
   ملف الوظائف التفاعلية (JavaScript)
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {
    initNavbar();
    initMobileMenu();
    initSmoothScroll();
    initPortfolioFilter();
    initScrollAnimations();
    initActiveNavLink();
    updatePortfolioYear();
});

function initNavbar() {
    var navbar = document.getElementById('navbar');
    if (!navbar) return;
    function updateNavbar() {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    }
    window.addEventListener('scroll', updateNavbar);
    updateNavbar();
}

function initMobileMenu() {
    var menuToggle = document.getElementById('menuToggle');
    var navLinks = document.getElementById('navLinks');
    if (!menuToggle || !navLinks) return;
    var navLinkItems = document.querySelectorAll('.nav-link');

    menuToggle.addEventListener('click', function () {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    navLinkItems.forEach(function (link) {
        link.addEventListener('click', function () {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    window.addEventListener('resize', function () {
        if (window.innerWidth > 768) {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;
            var targetSection;
            try { targetSection = document.querySelector(targetId); } catch (_) { return; }
            if (!targetSection) return;
            e.preventDefault();
            var navbar = document.getElementById('navbar');
            var navbarHeight = navbar ? navbar.offsetHeight : 0;
            window.scrollTo({
                top: targetSection.getBoundingClientRect().top + window.scrollY - navbarHeight,
                behavior: 'smooth'
            });
        });
    });
}

function initPortfolioFilter() {
    var filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
    if (!filterButtons.length) return;

    function getSelectedFilter() {
        var active = document.querySelector('.filter-btn.active');
        return active ? (active.getAttribute('data-filter') || 'all') : 'all';
    }

    function updatePortfolioItems() {
        var selectedFilter = getSelectedFilter();
        document.querySelectorAll('.portfolio-item').forEach(function (item) {
            var matches = selectedFilter === 'all' || item.getAttribute('data-category') === selectedFilter;
            item.style.display = matches ? '' : 'none';
            if (matches) item.style.animation = 'fadeInUp 0.5s ease forwards';
        });
    }

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            filterButtons.forEach(function (btn) { btn.classList.remove('active'); });
            this.classList.add('active');
            updatePortfolioItems();
        });
    });

    // يسمح لقاعدة البيانات بإعادة تطبيق الفلتر بعد إضافة بطاقات جديدة.
    window.updatePortfolioItemsFilter = updatePortfolioItems;
    updatePortfolioItems();
}

function initActiveNavLink() {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav-link');
    if (!sections.length || !navLinks.length) return;

    window.addEventListener('scroll', function () {
        var current = '';
        var navbar = document.getElementById('navbar');
        var navbarHeight = navbar ? navbar.offsetHeight : 0;
        sections.forEach(function (section) {
            var sectionTop = section.offsetTop - navbarHeight - 100;
            var sectionBottom = sectionTop + section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(function (link) {
            link.classList.toggle('active', !!current && link.getAttribute('href') === '#' + current);
        });
    });
}

function initScrollAnimations() {
    var selector = '.about-text, .skills-section, .portfolio-item, .contact-info, .contact-socials';
    var animatedElements = new Set();

    function prepareElement(el) {
        if (!el || animatedElements.has(el)) return;
        animatedElements.add(el);
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    }

    function collectElements(root) {
        if (!root || root.nodeType !== 1) return;
        if (root.matches && root.matches(selector)) prepareElement(root);
        if (root.querySelectorAll) root.querySelectorAll(selector).forEach(prepareElement);
    }

    function checkVisibility() {
        var triggerPoint = window.innerHeight * 0.85;
        animatedElements.forEach(function (el) {
            if (!el.isConnected) {
                animatedElements.delete(el);
                return;
            }
            if (el.getBoundingClientRect().top < triggerPoint) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }
        });
    }

    document.querySelectorAll(selector).forEach(prepareElement);
    checkVisibility();
    window.addEventListener('scroll', checkVisibility, { passive: true });

    if ('MutationObserver' in window && document.body) {
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(collectElements);
            });
            checkVisibility();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
}

function updatePortfolioYear() {
    var currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) currentYearElement.textContent = new Date().getFullYear();
}

var styleSheet = document.createElement('style');
styleSheet.textContent = '@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }';
document.head.appendChild(styleSheet);
