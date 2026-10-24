/* =====================================================
   FARES JLAL Portfolio - Supabase database integration
   يحافظ على البطاقات الثابتة إذا فشل الاتصال أو كان الجدول فارغًا.
   ===================================================== */
(function () {
    var addedIds = new Set();
    var loadPromise = null;

    function config() {
        return window.PortfolioConfig || null;
    }

    function reportError(message) {
        var cfg = config();
        if (cfg && typeof cfg.showError === 'function') cfg.showError(message);
        else console.error(message);
    }

    function loadSupabase() {
        return new Promise(function (resolve, reject) {
            if (window.supabase && window.supabase.createClient) {
                resolve(window.supabase);
                return;
            }
            var existing = document.querySelector('script[data-supabase-library]');
            if (existing) {
                existing.addEventListener('load', function () {
                    window.supabase && window.supabase.createClient
                        ? resolve(window.supabase) : reject(new Error('تعذر تجهيز مكتبة Supabase'));
                }, { once: true });
                existing.addEventListener('error', function () {
                    reject(new Error('فشل تحميل مكتبة Supabase'));
                }, { once: true });
                return;
            }
            var script = document.createElement('script');
            script.dataset.supabaseLibrary = 'true';
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.7/dist/umd/supabase.min.js';
            script.onload = function () {
                if (window.supabase && window.supabase.createClient) resolve(window.supabase);
                else reject(new Error('فشل تحميل مكتبة Supabase'));
            };
            script.onerror = function () { reject(new Error('خطأ في تحميل مكتبة Supabase')); };
            document.head.appendChild(script);
        });
    }

    function escapeHtml(value) {
        var div = document.createElement('div');
        div.textContent = value == null ? '' : String(value);
        return div.innerHTML;
    }

    function normalizedCategory(category) {
        var allowed = ['logos', 'branding', 'social-media', 'thumbnails', 'other'];
        return allowed.indexOf(category) !== -1 ? category : 'other';
    }

    function categoryName(category) {
        var names = {
            logos: 'الشعارات',
            branding: 'الهويات البصرية',
            'social-media': 'تصاميم السوشيال ميديا',
            thumbnails: 'صور مصغرات يوتيوب',
            other: 'أعمال أخرى'
        };
        return names[category] || names.other;
    }

    function createCard(item) {
        if (!item || item.id == null) return null;
        var id = String(item.id);
        if (addedIds.has(id) || document.querySelector('.portfolio-item[data-id="' + id.replace(/"/g, '\\"') + '"]')) {
            return null;
        }

        var category = normalizedCategory(item.category);
        var card = document.createElement('div');
        card.className = 'portfolio-item';
        card.setAttribute('data-id', id);
        card.setAttribute('data-category', category);

        var imageContainer = document.createElement('div');
        imageContainer.className = 'portfolio-image-placeholder';

        var image = document.createElement('img');
        image.src = item.image_url || '';
        image.alt = item.title || '';
        image.onerror = function () {
            image.style.display = 'none';
            var fallback = document.createElement('span');
            fallback.textContent = item.title || '';
            if (!imageContainer.querySelector('.portfolio-image-fallback')) {
                fallback.className = 'portfolio-image-fallback';
                imageContainer.appendChild(fallback);
            }
        };
        imageContainer.appendChild(image);

        var imageTitle = document.createElement('span');
        imageTitle.textContent = item.title || '';
        imageContainer.appendChild(imageTitle);

        var overlay = document.createElement('div');
        overlay.className = 'portfolio-overlay';
        var title = document.createElement('h3');
        title.className = 'portfolio-item-title';
        title.textContent = item.title || '';
        var categoryLabel = document.createElement('span');
        categoryLabel.className = 'portfolio-item-category';
        categoryLabel.textContent = categoryName(category);
        overlay.appendChild(title);
        overlay.appendChild(categoryLabel);

        card.appendChild(imageContainer);
        card.appendChild(overlay);
        return card;
    }

    async function initSupabase() {
        var cfg = config();
        if (!cfg || !cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY ||
            cfg.SUPABASE_ANON_KEY === 'YOUR_PUBLISHABLE_KEY_HERE') {
            reportError('أضف Publishable Key الخاص بـ Supabase في js/config.js.');
            return null;
        }
        try {
            var library = await loadSupabase();
            return library.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
        } catch (error) {
            reportError('تعذر تهيئة Supabase: ' + error.message);
            return null;
        }
    }

    async function fetchPortfolioItems() {
        var cfg = config();
        if (cfg && typeof cfg.checkInternetConnection === 'function' && !cfg.checkInternetConnection()) {
            reportError('لا يوجد اتصال بالإنترنت.');
            return null;
        }
        var client = await initSupabase();
        if (!client) return null;
        var result = await client.from('portfolio_items').select('id, title, description, category, image_url, created_at').order('created_at', { ascending: false });
        if (result.error) {
            reportError('خطأ في جلب بيانات الأعمال: ' + result.error.message);
            return null;
        }
        return result.data || [];
    }

    function displayPortfolioItems(items) {
        var grid = document.getElementById('portfolioGrid');
        if (!grid) {
            reportError('لم يتم العثور على العنصر #portfolioGrid في index.html.');
            return false;
        }
        if (!Array.isArray(items) || !items.length) return false;

        var addedCount = 0;
        items.forEach(function (item) {
            var card = createCard(item);
            if (!card) return;
            // سجّل المعرّف فقط بعد نجاح إضافة البطاقة إلى الشبكة.
            grid.appendChild(card);
            addedIds.add(String(item.id));
            addedCount++;
        });

        if (typeof window.updatePortfolioItemsFilter === 'function') {
            window.updatePortfolioItemsFilter();
        }
        return addedCount > 0;
    }

    async function loadPortfolioItems() {
        if (loadPromise) return loadPromise;
        loadPromise = (async function () {
            var items = await fetchPortfolioItems();
            if (Array.isArray(items) && items.length) {
                displayPortfolioItems(items);
                console.info('تم تحميل أعمال Supabase. عدد السجلات:', items.length);
            } else if (Array.isArray(items)) {
                console.info('جدول Supabase فارغ؛ تم الاحتفاظ بالبطاقات الثابتة.');
            }
            return items;
        })();
        try { return await loadPromise; }
        finally { loadPromise = null; }
    }

    window.PortfolioDatabase = {
        fetchPortfolioItems: fetchPortfolioItems,
        displayPortfolioItems: displayPortfolioItems,
        loadPortfolioItems: loadPortfolioItems
    };

    document.addEventListener('DOMContentLoaded', loadPortfolioItems);
})();
