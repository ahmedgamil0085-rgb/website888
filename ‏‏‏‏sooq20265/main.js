// --- Supabase Configuration ---
const SUPABASE_URL = 'https://vjntfjbzjdzdqsdbwprc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqbnRmamJ6amR6ZHFzZGJ3cHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMzQ1NTgsImV4cCI6MjEwMjkxMDU1OH0.6c2f0vRaMEacTSC-e3E1bh_b2r0hhiRQpLImED4yz9I';

window._supabase = null;
try {
    if (typeof supabase !== 'undefined') {
        window._supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
} catch (e) { console.error("Supabase init error:", e); }

// --- Global Site Settings ---
window.siteSettings = {
    site_name_ar: 'ويب ميكرز',
    site_name_en: 'WebMakers',
    currency_ar: 'ر.ي',
    currency_en: 'YER',
    logo_url: 'logo.png',
    whatsapp_number: '967777777777'
};

// --- Toast Notification System ---
window.showToast = (message, type = 'success') => {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `luxury-toast ${type}`;
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
};

// --- Badge Updater ---
window.updateNavBadges = () => {
    const cart = JSON.parse(localStorage.getItem('webm_cart')) || [];
    const wishlist = JSON.parse(localStorage.getItem('webm_wishlist')) || [];

    document.querySelectorAll('.cart-count-badge').forEach(el => {
        el.innerText = cart.length;
        el.classList.toggle('hidden', cart.length === 0);
    });

    document.querySelectorAll('.wishlist-count-badge').forEach(el => {
        el.innerText = wishlist.length;
        el.classList.toggle('hidden', wishlist.length === 0);
    });
};

// --- Wishlist Logic ---
window.toggleWishlist = (itemId, btn) => {
    let wishlist = JSON.parse(localStorage.getItem('webm_wishlist')) || [];
    const index = wishlist.indexOf(itemId);
    const isAr = (localStorage.getItem('preferredLang') || 'ar') === 'ar';

    let msg = '';
    if (index > -1) {
        wishlist.splice(index, 1);
        msg = isAr ? 'تمت الإزالة من المفضلة' : 'Removed from Wishlist';
    } else {
        wishlist.push(itemId);
        msg = isAr ? 'تمت الإضافة للمفضلة' : 'Added to Wishlist';
    }

    localStorage.setItem('webm_wishlist', JSON.stringify(wishlist));

    if (btn && btn.querySelector('i')) {
        const icon = btn.querySelector('i');
        if (index > -1) {
            icon.classList.replace('fas', 'far');
        } else {
            icon.classList.replace('far', 'fas');
        }
    }

    window.updateNavBadges();
    window.showToast(msg, 'success');
};

// --- Cart Logic ---
window.addToCart = (itemId, btn) => {
    const isAr = (localStorage.getItem('preferredLang') || 'ar') === 'ar';
    const safeId = String(itemId);
    const itemIdAttr = `item-${safeId.substring(0, 8)}`;
    const card = (btn && btn.closest && btn.closest('.dish-card')) || document.getElementById(itemIdAttr);

    let itemName = isAr ? 'منتج' : 'Product';
    let itemPrice = 0;
    let itemOldPrice = null;
    let itemVariant = '';
    let itemImage = 'logo.png';

    if (card) {
        // البحث عن العنوان (قد يكون مباشرة أو داخل رابط)
        const titleEl = card.querySelector('.dish-title');
        if (titleEl) itemName = titleEl.innerText;

        // البحث عن السعر الحالي (Current Price)
        const priceEl = card.querySelector('.current-price');
        if (priceEl) {
            const rawPrice = priceEl.innerText.replace(/[^\d.]/g, '');
            itemPrice = parseFloat(rawPrice) || 0;
        }

        // البحث عن السعر القديم (Original Price)
        const oldPriceEl = card.querySelector('.original-price');
        if (oldPriceEl && oldPriceEl.style.display !== 'none' && oldPriceEl.innerText.trim() !== '') {
            const rawOldPrice = oldPriceEl.innerText.replace(/[^\d.]/g, '');
            const oldVal = parseFloat(rawOldPrice);
            if (!isNaN(oldVal) && oldVal > itemPrice) {
                itemOldPrice = oldVal;
            }
        }

        // البحث عن الصورة
        const imgEl = card.querySelector('.main-display-img');
        if (imgEl) itemImage = imgEl.getAttribute('src');

        // البحث عن الحجم النشط
        const activeVariant = card.querySelector('.size-pill.active');
        if (activeVariant) itemVariant = activeVariant.innerText;
    }

    let cart = JSON.parse(localStorage.getItem('webm_cart')) || [];
    const existingIndex = cart.findIndex(i => i.id === itemId && i.variant === itemVariant);

    if (existingIndex > -1) {
        // إذا كان موجوداً، نقوم بحذفه (Toggle)
        cart.splice(existingIndex, 1);
        if (btn) {
            btn.classList.remove('added');
        }
        window.showToast(isAr ? 'تمت الإزالة من السلة' : 'Removed from Cart', 'info');
    } else {
        // إذا لم يكن موجوداً، نقوم بإضافته
        cart.push({
            id: itemId,
            name: itemName,
            price: itemPrice,
            oldPrice: itemOldPrice,
            variant: itemVariant,
            image: itemImage,
            quantity: 1
        });
        if (btn) {
            btn.classList.add('added');
        }
        window.showToast(isAr ? 'تمت الإضافة للسلة' : 'Added to Cart', 'success');
    }

    localStorage.setItem('webm_cart', JSON.stringify(cart));
    window.updateNavBadges();
};

// --- Live Search Specific Cart & Wishlist Helpers ---
window.addToCartFromSearch = (itemId, encodedName, price, imageUrl, btn) => {
    const isAr = (localStorage.getItem('preferredLang') || 'ar') === 'ar';
    const itemName = decodeURIComponent(encodedName);
    let cart = JSON.parse(localStorage.getItem('webm_cart')) || [];
    const existingIndex = cart.findIndex(i => String(i.id) === String(itemId));

    if (existingIndex > -1) {
        cart.splice(existingIndex, 1);
        if (btn) btn.classList.remove('added');
        window.showToast(isAr ? `تمت إزالة "${itemName}" من السلة` : `Removed "${itemName}" from Cart`, 'info');
    } else {
        cart.push({
            id: itemId,
            name: itemName,
            price: price,
            oldPrice: null,
            variant: '',
            image: imageUrl || 'logo.png',
            quantity: 1
        });
        if (btn) btn.classList.add('added');
        window.showToast(isAr ? `✨ تم إضافة "${itemName}" إلى السلة بنجاح!` : `✨ Added "${itemName}" to Cart!`, 'success');
    }

    localStorage.setItem('webm_cart', JSON.stringify(cart));
    window.updateNavBadges();
};

window.toggleWishlistFromSearch = (itemId, encodedName, price, imageUrl, btn) => {
    let wishlist = JSON.parse(localStorage.getItem('webm_wishlist')) || [];
    const safeId = String(itemId);
    const index = wishlist.indexOf(safeId);
    const isAr = (localStorage.getItem('preferredLang') || 'ar') === 'ar';
    const itemName = decodeURIComponent(encodedName);

    let msg = '';
    if (index > -1) {
        wishlist.splice(index, 1);
        msg = isAr ? `تمت إزالة "${itemName}" من المفضلة` : `Removed "${itemName}" from Wishlist`;
        if (btn) {
            btn.classList.remove('active');
            const icon = btn.querySelector('i');
            if (icon) icon.className = 'far fa-heart';
        }
    } else {
        wishlist.push(safeId);
        msg = isAr ? `❤️ تم إضافة "${itemName}" إلى المفضلة!` : `❤️ Added "${itemName}" to Wishlist!`;
        if (btn) {
            btn.classList.add('active');
            const icon = btn.querySelector('i');
            if (icon) icon.className = 'fas fa-heart';
        }
    }

    localStorage.setItem('webm_wishlist', JSON.stringify(wishlist));
    window.updateNavBadges();
    window.showToast(msg, 'success');
};

// --- Update Price UI ---
window.updateDishCardPrice = (cardId, price, salePrice, btn) => {
    const card = document.getElementById(cardId);
    if (!card) return;

    const isAr = (localStorage.getItem('preferredLang') || 'ar') === 'ar';
    const currency = isAr ? (window.siteSettings?.currency_ar || 'ر.ي') : (window.siteSettings?.currency_en && window.siteSettings.currency_en !== 'ر.ي' ? window.siteSettings.currency_en : 'YER');

    // السعر الحالي هو price والقديم هو salePrice
    const displayPrice = price;
    const displayOldPrice = (salePrice && salePrice > price) ? salePrice : null;

    const priceEl = card.querySelector('.current-price');
    if (priceEl) {
        priceEl.innerText = `${displayPrice.toLocaleString()} ${currency}`;
        priceEl.style.transform = 'scale(1.1)';
        setTimeout(() => priceEl.style.transform = 'scale(1)', 200);
    }

    const oldPriceEl = card.querySelector('.original-price');
    if (oldPriceEl) {
        if (displayOldPrice) {
            oldPriceEl.innerText = `${displayOldPrice.toLocaleString()} ${currency}`;
            oldPriceEl.style.display = 'block';
        } else {
            oldPriceEl.style.display = 'none';
        }
    }

    const pills = card.querySelectorAll('.size-pill');
    pills.forEach(pill => pill.classList.remove('active'));
    if (btn) btn.classList.add('active');

    // تحديث حالة زر السلة بناءً على الخيار الجديد
    const cartBtn = card.querySelector('.action-btn-circle.cart');
    if (cartBtn) {
        const cart = JSON.parse(localStorage.getItem('webm_cart')) || [];
        const variantName = btn ? btn.innerText : '';

        // محاولة استخراج المعرف الكامل من الخاصية data-id إذا وجدت، وإلا نستخدم الـ ID التقليدي
        const fullId = card.dataset.id || cardId.replace('item-', '').replace('rel-', '').replace('rnd-', '');

        const isInCart = cart.some(i => i.id === fullId && i.variant === variantName);

        if (isInCart) {
            cartBtn.classList.add('added');
        } else {
            cartBtn.classList.remove('added');
        }
    }
};

// --- Image Gallery Slider ---
window.changeDishImage = (cardId, direction, images) => {
    const card = document.getElementById(cardId);
    if (!card) return;

    const imgEl = card.querySelector('.main-display-img');
    const counterEl = card.querySelector('.image-counter');
    if (!imgEl) return;

    let currentSrc = imgEl.getAttribute('src');
    let currentIndex = images.indexOf(currentSrc);
    if (currentIndex === -1) {
        images.forEach((src, idx) => { if (currentSrc.includes(src)) currentIndex = idx; });
    }

    let nextIndex = currentIndex + direction;
    if (nextIndex >= images.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = images.length - 1;

    imgEl.style.opacity = '0.5';
    setTimeout(() => {
        imgEl.src = images[nextIndex];
        if (counterEl) counterEl.innerText = `${nextIndex + 1} / ${images.length}`;
        imgEl.style.opacity = '1';
    }, 150);
};

// --- Masterpiece Page Preloader Dismiss & Link Transitions ---
const initPagePreloader = () => {
    const preloader = document.getElementById('pagePreloader');
    if (!preloader) return;

    const hidePreloader = () => {
        if (window.location.pathname.includes('product.html') || window.location.href.includes('product.html')) {
            return;
        }
        preloader.classList.add('fade-out');
    };

    if (document.readyState === 'complete') {
        setTimeout(hidePreloader, 350);
    } else {
        window.addEventListener('load', () => setTimeout(hidePreloader, 350));
        setTimeout(hidePreloader, 2200);
    }

    document.querySelectorAll('a[href]:not([target="_blank"]):not([href^="#"]):not([href^="javascript"]):not([href^="tel"]):not([href^="mailto"])').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
                preloader.classList.remove('fade-out');
            }
        });
    });
};

// --- DOM Loaded Handlers ---
document.addEventListener('DOMContentLoaded', () => {
    // 0. Initialize Preloader
    initPagePreloader();

    // 0.1 Language Initialization (Immediate sync)
    const currentLang = localStorage.getItem('preferredLang') || 'ar';
    document.documentElement.setAttribute('lang', currentLang);
    document.documentElement.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
    document.body.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
    document.body.classList.toggle('en-mode', currentLang === 'en');

    // 0.1 Initial Sync
    window.updateNavBadges();

    // 1. Fetch Settings from Supabase
    const fetchSettings = async () => {
        if (!window._supabase) return;
        try {
            const { data } = await window._supabase.from('site_settings').select('*').eq('id', 1).single();
            if (data) {
                window.siteSettings = data;
                applySettings();
            }
        } catch (e) { console.log("Settings load error"); }
    };

    const applySettings = () => {
        const lang = localStorage.getItem('preferredLang') || 'ar';
        const isAr = (lang === 'ar');

        // Ensure attributes and classes are correctly set
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.setAttribute('dir', isAr ? 'rtl' : 'ltr');
        document.body.setAttribute('dir', isAr ? 'rtl' : 'ltr');
        document.body.classList.toggle('en-mode', !isAr);

        // Update all elements with data-ar/data-en
        document.querySelectorAll('[data-ar]').forEach(el => {
            const text = isAr ? el.getAttribute('data-ar') : el.getAttribute('data-en');
            if (text) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = text;
                } else {
                    // الحفاظ على الأيقونة إذا كانت موجودة
                    const icon = el.querySelector('i');
                    if (icon) {
                        el.innerHTML = `${icon.outerHTML} ${text}`;
                    } else if (text.includes('<') || text.includes('&')) {
                        el.innerHTML = text;
                    } else {
                        el.innerText = text;
                    }
                }
            }
        });

        if (window.siteSettings) {
            document.querySelectorAll('.logo-text').forEach(el => {
                el.innerText = isAr ? window.siteSettings.site_name_ar : window.siteSettings.site_name_en;
            });
            if (window.siteSettings.logo_url) {
                document.querySelectorAll('.logo-img').forEach(el => el.src = window.siteSettings.logo_url);
            }
            document.title = isAr ? `${window.siteSettings.site_name_ar} | الرئيسية` : `${window.siteSettings.site_name_en} | Home`;
        }
    };

    // Initial application of language strings from HTML data attributes
    applySettings();
    fetchSettings();

    // 2. Reveal Logic (High-performance IntersectionObserver)
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });

        document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
    } else {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
    }

    // 2.1 Stats Counter Animation
    const statsSection = document.querySelector('.stats-premium-v3');
    const statNumbers = document.querySelectorAll('.stat-number');

    if (statsSection && statNumbers.length > 0) {
        const startCounter = (el) => {
            const target = parseInt(el.getAttribute('data-target'));
            const duration = 2000;
            const stepTime = Math.abs(Math.floor(duration / target));
            let current = 0;

            const timer = setInterval(() => {
                current += 1;
                el.innerText = current;
                if (current >= target) {
                    el.innerText = target;
                    clearInterval(timer);
                }
            }, stepTime);
        };

        const observerOptions = { threshold: 0.5 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    statNumbers.forEach(num => startCounter(num));
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        observer.observe(statsSection);
    }

    // 4. Smooth Scrolling Utility
    const luxuryScrollTo = (targetY, duration = 1000) => {
        const startPosition = window.pageYOffset;
        const distance = targetY - startPosition;
        let start = null;
        const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const run = ease(progress, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (progress < duration) requestAnimationFrame(step);
        };
        const ease = (t, b, c, d) => {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t * t + b;
            t -= 2; return c / 2 * (t * t * t + 2) + b;
        };
        requestAnimationFrame(step);
    };

    // 5. Custom Luxury Language Switcher & Smooth Transition
    // 5. Custom Luxury Language Switcher & Event Delegation
    const updateLanguage = (lang) => {
        localStorage.setItem('preferredLang', lang);
        document.body.style.transition = 'opacity 0.4s ease';
        document.body.style.opacity = '0.3';
        if (window.showToast) {
            window.showToast(lang === 'ar' ? '✨ جاري التحويل للغة العربية...' : '✨ Switching to English...', 'info');
        }
        setTimeout(() => {
            location.reload();
        }, 350);
    };

    // Global Event Delegation for all Luxury Language Dropdowns (Static & Dynamic)
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.lld-trigger');
        const item = e.target.closest('.lld-item');
        const dropdown = e.target.closest('.luxury-lang-dropdown');

        if (trigger && dropdown) {
            e.stopPropagation();
            // Close all other language dropdowns
            document.querySelectorAll('.luxury-lang-dropdown').forEach(d => {
                if (d !== dropdown) d.classList.remove('open');
            });
            dropdown.classList.toggle('open');
            return;
        }

        if (item) {
            e.stopPropagation();
            const itemLang = item.getAttribute('data-lang');
            const parentDropdown = item.closest('.luxury-lang-dropdown');
            if (parentDropdown) parentDropdown.classList.remove('open');
            const currentLang = localStorage.getItem('preferredLang') || 'ar';
            if (itemLang && itemLang !== currentLang) {
                updateLanguage(itemLang);
            }
            return;
        }

        // Click outside closes all language dropdowns
        document.querySelectorAll('.luxury-lang-dropdown').forEach(d => d.classList.remove('open'));
    });

    // Update active state and current language text for all language dropdowns
    window.syncLangDropdownsState = () => {
        const lang = localStorage.getItem('preferredLang') || 'ar';
        document.querySelectorAll('.luxury-lang-dropdown').forEach(dropdown => {
            const currentSpan = dropdown.querySelector('.lld-current-lang');
            if (currentSpan) {
                currentSpan.innerText = lang === 'ar' ? 'العربية' : 'English';
            }
            dropdown.querySelectorAll('.lld-item').forEach(item => {
                const itemLang = item.getAttribute('data-lang');
                if (itemLang === lang) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        });
    };

    // Bind legacy lang buttons if any
    document.querySelectorAll('#langBtn, .lang-btn, .lang-switcher button, .footer-lang-pill').forEach(btn => {
        if (!btn.closest('.luxury-lang-dropdown')) {
            btn.onclick = (e) => {
                e.preventDefault();
                const current = localStorage.getItem('preferredLang') || 'ar';
                updateLanguage(current === 'ar' ? 'en' : 'ar');
            };
        }
    });

    window.syncLangDropdownsState();

    // --- 5.1 Dynamic Announcements Ticker from Supabase ---
    const initTickerAds = async () => {
        const tickerBars = document.querySelectorAll('.ticker-bar');
        if (tickerBars.length === 0) return;

        const isAr = (localStorage.getItem('preferredLang') || 'ar') === 'ar';

        // دالة عرض عناصر الشريط
        const renderTickerItems = (ads) => {
            if (!ads || ads.length === 0) return;

            tickerBars.forEach(bar => {
                let contentEl = bar.querySelector('.ticker-content');
                if (!contentEl) {
                    contentEl = document.createElement('div');
                    contentEl.className = 'ticker-content';
                    bar.appendChild(contentEl);
                }

                // بناء كود HTML للمجموعة الواحدة
                let groupHTML = '<div class="ticker-group">';
                ads.forEach(ad => {
                    const textAr = ad.text_ar || '';
                    const textEn = ad.text_en || ad.text_ar || '';
                    const displayText = isAr ? textAr : textEn;
                    groupHTML += `<div class="ticker-item" data-ar="${textAr}" data-en="${textEn}">${displayText}</div>`;
                });
                groupHTML += '</div>';

                // نكرر المجموعة مرتين لضمان استمرارية الحركة اللا نهائية بدون انقطاع
                contentEl.innerHTML = groupHTML + groupHTML;
            });
        };

        if (window._supabase) {
            try {
                const { data: ads, error } = await window._supabase
                    .from('announcements')
                    .select('*')
                    .eq('is_active', true)
                    .order('display_order', { ascending: true });

                if (!error && ads && ads.length > 0) {
                    renderTickerItems(ads);
                }
            } catch (err) {
                console.warn('Announcements fetch error:', err);
            }
        }
    };
    initTickerAds();

// --- Reusable Dish Card Renderer ---
window.createSkeletonCardHTML = () => {
    return `
        <div class="skeleton-card">
            <div class="skeleton-shimmer"></div>
            <div class="skeleton-img"></div>
            <div style="flex: 1; padding: 0 10px;">
                <div class="skeleton-text" style="width: 80%;"></div>
                <div class="skeleton-text" style="width: 50%;"></div>
            </div>
        </div>
    `;
};

window.createDishCardHTML = (item, variants, isAr, ratingData = { avg: 0, count: 0 }, isSearch = false) => {
    const itemVariants = (variants || []).filter(v => v.item_id === item.id);
    const itemIdAttr = `item-${String(item.id).substring(0, 8)}`;
    const wishlist = JSON.parse(localStorage.getItem('webm_wishlist')) || [];
    const isInWishlist = wishlist.includes(item.id);

    let initialPrice = item.price;
    let initialOldPrice = item.sale_price;

    if (itemVariants.length > 0) {
        initialPrice = itemVariants[0].price;
        initialOldPrice = itemVariants[0].sale_price;
    }

    const cart = JSON.parse(localStorage.getItem('webm_cart')) || [];
    let firstVariantName = '';
    if (itemVariants.length > 0) {
        firstVariantName = isAr ? itemVariants[0].name_ar : itemVariants[0].name_en;
    }
    const isInCart = cart.some(i => i.id === item.id && i.variant === firstVariantName);

    // حساب النجوم الحقيقية فقط إذا كان هناك تقييمات (أكبر من صفر)
    const avg = parseFloat(ratingData?.avg) || 0;
    const count = parseInt(ratingData?.count) || 0;
    let ratingHtml = '';
    if (count > 0 && avg > 0) {
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(avg)) starsHtml += '<i class="fas fa-star"></i>';
            else if (i === Math.ceil(avg) && avg % 1 !== 0) starsHtml += '<i class="fas fa-star-half-alt"></i>';
            else starsHtml += '<i class="far fa-star"></i>';
        }
        ratingHtml = `
            <div class="dish-card-rating">
                ${starsHtml}
                <span>(${avg.toFixed(1)})</span>
            </div>
        `;
    }

    const currency = isAr ? (window.siteSettings?.currency_ar || 'ر.ي') : (window.siteSettings?.currency_en && window.siteSettings.currency_en !== 'ر.ي' ? window.siteSettings.currency_en : 'YER');

    const numPrice = parseFloat(initialPrice);
    const displayPriceVal = !isNaN(numPrice) ? numPrice : 0;
    const priceText = `${displayPriceVal.toLocaleString()} ${currency}`;
    const parsedOldPrice = parseFloat(initialOldPrice);
    const hasValidOldPrice = !isNaN(parsedOldPrice) && parsedOldPrice > displayPriceVal;

    return `
        <div class="dish-card reveal active" id="${itemIdAttr}" data-id="${item.id}">
            <div class="dish-image-wrapper">
                <a href="product.html?id=${item.id}">
                    <img src="${item.image_url}" class="main-display-img" loading="lazy" decoding="async" alt="" onerror="this.onerror=null; this.alt=''; this.src='logo.png'; this.classList.add('img-fallback');">
                </a>
                ${item.is_special ? `
                    <div class="dish-card-special-badge" title="${isAr ? 'منتج مميز' : 'Featured Product'}">
                        <i class="fas fa-star"></i>
                        <span>${isAr ? 'مميز' : 'Featured'}</span>
                    </div>
                ` : ''}
                <div class="card-actions-top">
                    <button class="action-btn-circle wishlist" onclick="toggleWishlist('${item.id}', this)" title="${isAr ? 'المفضلة' : 'Wishlist'}">
                        <i class="${isInWishlist ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                </div>
            </div>
            <div class="dish-content">
                ${ratingHtml}
                <div class="dish-header">
                    <a href="product.html?id=${item.id}" style="text-decoration:none;">
                        <h3 class="dish-title">${isAr ? item.name_ar : item.name_en}</h3>
                    </a>
                    <div class="dish-price-wrapper">
                        <div class="price-container">
                            <span class="current-price">${priceText}</span>
                            <span class="original-price" style="${hasValidOldPrice ? '' : 'display:none'}">${hasValidOldPrice ? (parsedOldPrice.toLocaleString() + ' ' + currency) : ''}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 6px;">
                            ${isSearch ? `
                                <button class="action-btn-circle wishlist ${isInWishlist ? 'active' : ''}" onclick="toggleWishlist('${item.id}', this)" title="${isAr ? 'المفضلة' : 'Wishlist'}">
                                    <i class="${isInWishlist ? 'fas' : 'far'} fa-heart"></i>
                                </button>
                            ` : ''}
                            <button class="action-btn-circle cart ${isInCart ? 'added' : ''}" onclick="addToCart('${item.id}', this)" title="${isAr ? 'السلة' : 'Cart'}">
                                <i class="fas fa-shopping-cart"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

    // 6. Menu Logic (Specific to menu.html) - Optimized Parallel Fetching & Hierarchical Multi-Level Navigation
    const initMenu = async () => {
        const menuFilterContainer = document.querySelector('.menu-filter-v3');
        if (!menuFilterContainer || !window._supabase) return;

        const isAr = (localStorage.getItem('preferredLang') || 'ar') === 'ar';
        const breadcrumbContainer = document.getElementById('menuBreadcrumbsNav');

        // جلب الفئات والمنتجات والتقييمات بالتوازي دفعة واحدة
        const [categoriesRes, itemsRes, reviewsRes] = await Promise.all([
            window._supabase.from('categories').select('*').eq('is_active', true).order('created_at', { ascending: true }),
            window._supabase.from('menu_items').select('*').eq('is_available', true),
            window._supabase.from('product_reviews').select('product_id, rating').eq('is_approved', true)
        ]);

        const allCategories = categoriesRes.data || [];
        const allItems = itemsRes.data || [];
        const allReviews = reviewsRes.data || [];

        if (!allCategories || !allItems) return;

        // حساب متوسط التقييم المسبق لكل صنف
        const ratingsMap = {};
        allReviews.forEach(r => {
            if (!ratingsMap[r.product_id]) ratingsMap[r.product_id] = { sum: 0, count: 0 };
            ratingsMap[r.product_id].sum += r.rating;
            ratingsMap[r.product_id].count++;
        });

        // جلب المتغيرات (Variants) لكل المنتجات المتاحة بالتوازي
        const allItemIds = allItems.map(i => i.id);
        const { data: allVariants } = await window._supabase.from('item_variants').select('*').in('item_id', allItemIds);

        // -- دالة مساعدة لجلب كل المعرفات الفرعية التابعة للقسم (Descendant Category IDs) --
        const getDescendantCatIds = (catId) => {
            let ids = [String(catId)];
            const children = allCategories.filter(c => String(c.parent_id) === String(catId));
            children.forEach(child => {
                ids = ids.concat(getDescendantCatIds(child.id));
            });
            return ids;
        };

        const getCategoryItemsCount = (catId) => {
            const descendantIds = getDescendantCatIds(catId);
            return allItems.filter(item => item.category_id && descendantIds.includes(String(item.category_id))).length;
        };

        // -- دالة مساعدة لجلب مسار الآباء للقسم (Ancestors Path) --
        const getCategoryAncestors = (cat) => {
            if (!cat) return [];
            if (cat.id === 'all') return [cat];
            const path = [cat];
            let current = cat;
            while (current && current.parent_id) {
                const parent = allCategories.find(c => String(c.id) === String(current.parent_id));
                if (parent) {
                    path.unshift(parent);
                    current = parent;
                } else {
                    break;
                }
            }
            return path;
        };

        let visibleItemsLimit = 24;
        const ITEMS_PER_LOAD = 24;

        // رندر شريط المسار التسلسلي (Breadcrumb Navigation)
        const renderBreadcrumbs = (selectedCat) => {
            if (!breadcrumbContainer) return;

            if (!selectedCat) {
                breadcrumbContainer.style.display = 'none';
                breadcrumbContainer.innerHTML = '';
                return;
            }

            breadcrumbContainer.style.display = 'flex';

            const ancestors = getCategoryAncestors(selectedCat);

            let html = `
                <ul class="menu-breadcrumbs-list">
                    <li class="menu-breadcrumb-item" data-action="reset">
                        <i class="fas fa-home"></i>
                        <span>${isAr ? 'جميع الأقسام' : 'All Categories'}</span>
                    </li>
            `;

            ancestors.forEach((cat, index) => {
                const isLast = index === ancestors.length - 1;
                const catName = isAr ? cat.name_ar : cat.name_en;

                html += `<li class="menu-breadcrumb-separator"><i class="fas ${isAr ? 'fa-chevron-left' : 'fa-chevron-right'}"></i></li>`;

                if (isLast) {
                    html += `
                        <li class="menu-breadcrumb-item active">
                            <span>${catName}</span>
                        </li>
                    `;
                } else {
                    html += `
                        <li class="menu-breadcrumb-item" data-cat-id="${cat.id}">
                            <span>${catName}</span>
                        </li>
                    `;
                }
            });

            html += `</ul>`;

            const parentCatId = selectedCat.parent_id;
            html += `
                <button type="button" class="menu-breadcrumb-back-btn" data-back-id="${parentCatId || 'root'}">
                    <i class="fas ${isAr ? 'fa-arrow-right' : 'fa-arrow-left'}"></i>
                    <span>${isAr ? 'رجوع' : 'Back'}</span>
                </button>
            `;

            breadcrumbContainer.innerHTML = html;

            setTimeout(() => {
                const listEl = breadcrumbContainer.querySelector('.menu-breadcrumbs-list');
                if (listEl) {
                    listEl.scrollLeft = isAr ? -listEl.scrollWidth : listEl.scrollWidth;
                }
            }, 50);

            breadcrumbContainer.querySelectorAll('.menu-breadcrumb-item[data-action="reset"]').forEach(btn => {
                btn.onclick = () => selectCategory(null);
            });

            breadcrumbContainer.querySelectorAll('.menu-breadcrumb-item[data-cat-id]').forEach(btn => {
                btn.onclick = () => selectCategory(btn.dataset.catId);
            });

            const backBtn = breadcrumbContainer.querySelector('.menu-breadcrumb-back-btn');
            if (backBtn) {
                backBtn.onclick = () => {
                    const backId = backBtn.dataset.backId;
                    selectCategory(backId === 'root' ? null : backId);
                };
            }
        };

        // رندر بطاقات الأقسام والأقسام الفرعية بشكل ديناميكي ومتسلسل مع خيار "جميع الأصناف"
        const renderCategoryFilterCards = (selectedCat = null) => {
            let filterHtml = '';
            const isAllActive = selectedCat && String(selectedCat.id) === 'all';

            if (!selectedCat || isAllActive) {
                // الكرت الأول الرئيسي: خيار "جميع الأصناف"
                filterHtml += `
                    <button class="filter-card ${isAllActive ? 'active' : ''}" data-filter="all" data-cat-id="all">
                        <img src="logo.png" alt="${isAr ? 'جميع الأصناف' : 'All Dishes'}">
                        <span class="cat-name">${isAr ? 'جميع الأصناف' : 'All Dishes'}</span>
                    </button>
                `;

                // المستوى الرئيسي: عرض الأقسام الرئيسية المتاحة فقط (التي تملك أصنافاً > 0)
                const rootCategories = allCategories.filter(c => (!c.parent_id || !allCategories.some(p => String(p.id) === String(c.parent_id))) && getCategoryItemsCount(c.id) > 0).slice(0, 12);
                rootCategories.forEach(cat => {
                    filterHtml += `
                        <button class="filter-card" data-filter="${cat.slug}" data-cat-id="${cat.id}">
                            <img src="${cat.image_url || 'logo.png'}" alt="${cat.name_en}">
                            <span class="cat-name">${isAr ? cat.name_ar : cat.name_en}</span>
                        </button>
                    `;
                });
            } else {
                // إضافة خيار "جميع الأصناف" كخيار تفاعلي للعودة إلى العرض الشامل
                filterHtml += `
                    <button class="filter-card" data-filter="all" data-cat-id="all">
                        <img src="logo.png" alt="${isAr ? 'جميع الأصناف' : 'All Dishes'}">
                        <span class="cat-name">${isAr ? 'جميع الأصناف' : 'All Dishes'}</span>
                    </button>
                `;

                const directSubCategories = allCategories.filter(c => String(c.parent_id) === String(selectedCat.id) && getCategoryItemsCount(c.id) > 0);

                if (directSubCategories.length > 0) {
                    directSubCategories.forEach(sub => {
                        filterHtml += `
                            <button class="filter-card" data-filter="${sub.slug}" data-cat-id="${sub.id}">
                                <img src="${sub.image_url || 'logo.png'}" alt="${sub.name_en}">
                                <span class="cat-name">${isAr ? sub.name_ar : sub.name_en}</span>
                            </button>
                        `;
                    });
                } else {
                    const siblings = selectedCat.parent_id
                        ? allCategories.filter(c => String(c.parent_id) === String(selectedCat.parent_id) && getCategoryItemsCount(c.id) > 0)
                        : allCategories.filter(c => (!c.parent_id || !allCategories.some(p => String(p.id) === String(c.parent_id))) && getCategoryItemsCount(c.id) > 0);

                    siblings.forEach(sib => {
                        const isActive = String(sib.id) === String(selectedCat.id);
                        filterHtml += `
                            <button class="filter-card ${isActive ? 'active' : ''}" data-filter="${sib.slug}" data-cat-id="${sib.id}">
                                <img src="${sib.image_url || 'logo.png'}" alt="${sib.name_en}">
                                <span class="cat-name">${isAr ? sib.name_ar : sib.name_en}</span>
                            </button>
                        `;
                    });
                }
            }

            menuFilterContainer.innerHTML = filterHtml;
        };

        // رندر قائمة الأصناف المفلترة
        const renderMenu = (selectedCat = null) => {
            const container = document.querySelector('.menu-categories-luxury .container');

            // إذا لم يتم اختيار قسم، نعرض رسالة الترحيب الأولي ونخفي الأصناف
            if (!selectedCat) {
                container.querySelectorAll('.menu-grid, .load-more-wrapper, .subcategory-prompt-box').forEach(g => g.remove());
                const initialMsg = document.getElementById('initialMenuMessage');
                if (initialMsg) initialMsg.style.display = 'block';
                return;
            }

            const isAllMode = String(selectedCat.id) === 'all';

            if (!isAllMode) {
                const directSubCategories = allCategories.filter(c => String(c.parent_id) === String(selectedCat.id));
                if (directSubCategories.length > 0) {
                    container.querySelectorAll('.menu-grid, .load-more-wrapper, .subcategory-prompt-box').forEach(g => g.remove());
                    const initialMsg = document.getElementById('initialMenuMessage');
                    if (initialMsg) initialMsg.style.display = 'none';

                    const promptHtml = `
                        <div class="subcategory-prompt-box reveal active" style="text-align: center; padding: 50px 20px; color: var(--text-muted, #aaa);">
                            <i class="fas fa-layer-group" style="font-size: 2.8rem; color: var(--primary-color, #d4af37); margin-bottom: 15px;"></i>
                            <h3 style="font-size: 1.25rem; font-family: 'El Messiri', sans-serif; color: var(--text-main, #fff);">${isAr ? `تفضل باختيار أحد الفروع التابعة لـ (${selectedCat.name_ar}) لعرض الأصناف` : `Please select a subcategory under (${selectedCat.name_en}) to view dishes`}</h3>
                        </div>
                    `;
                    container.insertAdjacentHTML('beforeend', promptHtml);
                    return;
                }
            }

            const initialMsg = document.getElementById('initialMenuMessage');
            if (initialMsg) initialMsg.style.display = 'none';
            container.querySelectorAll('.subcategory-prompt-box').forEach(g => g.remove());

            let itemsToRender = [];
            if (isAllMode) {
                itemsToRender = allItems;
            } else {
                const validCatIds = getDescendantCatIds(selectedCat.id);
                itemsToRender = allItems.filter(i => validCatIds.includes(String(i.category_id)));
            }

            // ترتيب الأصناف: الأعلى تقييماً أولاً
            itemsToRender.sort((a, b) => {
                const ratingA = ratingsMap[a.id] ? (ratingsMap[a.id].sum / ratingsMap[a.id].count) : 0;
                const ratingB = ratingsMap[b.id] ? (ratingsMap[b.id].sum / ratingsMap[b.id].count) : 0;
                if (ratingB !== ratingA) return ratingB - ratingA;
                return 0.5 - Math.random();
            });

            const itemsToShow = itemsToRender.slice(0, visibleItemsLimit);

            let html = '<div class="menu-grid reveal active">';
            if (itemsToShow.length === 0) {
                html += `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted, #aaa);">
                        <i class="fas fa-utensils" style="font-size: 3rem; color: var(--primary-color, #d4af37); margin-bottom: 15px;"></i>
                        <h3>${isAr ? 'لا توجد أصناف في هذا القسم حالياً' : 'No items found in this category'}</h3>
                    </div>
                `;
            } else {
                itemsToShow.forEach(item => {
                    const avgRating = ratingsMap[item.id] ? (ratingsMap[item.id].sum / ratingsMap[item.id].count) : 0;
                    const count = ratingsMap[item.id] ? ratingsMap[item.id].count : 0;

                    html += createDishCardHTML(item, allVariants || [], isAr, { avg: avgRating, count: count });
                });
            }
            html += '</div>';

            const hasMore = itemsToRender.length > visibleItemsLimit;
            if (hasMore) {
                html += `
                    <div class="load-more-wrapper">
                        <button type="button" class="btn-load-more-menu" id="btnLoadMoreMenuItems">
                            <i class="fas fa-spinner fa-spin load-more-spinner" style="display:none;"></i>
                            <span>${isAr ? 'إظهار المزيد من الأصناف' : 'Load More Items'}</span>
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <div class="load-more-count">
                            ${isAr ? `عرض <strong>${itemsToShow.length}</strong> من أصل <strong>${itemsToRender.length}</strong> صنف` : `Showing <strong>${itemsToShow.length}</strong> of <strong>${itemsToRender.length}</strong> items`}
                        </div>
                    </div>
                `;
            } else if (itemsToRender.length > ITEMS_PER_LOAD) {
                html += `
                    <div class="load-more-wrapper">
                        <div class="load-more-count" style="font-weight:700; color:var(--primary-color, #d4af37);">
                            <i class="fas fa-check-circle" style="margin-left:5px;"></i>
                            ${isAr ? `تم عرض جميع الأصناف (${itemsToRender.length} صنف)` : `All ${itemsToRender.length} items loaded`}
                        </div>
                    </div>
                `;
            }

            // Clean old grids and load-more wrappers
            container.querySelectorAll('.menu-grid, .load-more-wrapper').forEach(g => g.remove());
            container.insertAdjacentHTML('beforeend', html);

            setTimeout(() => {
                const newGrid = container.querySelector('.menu-grid');
                if (newGrid) newGrid.classList.add('active');
                container.querySelectorAll('.dish-card').forEach(card => card.classList.add('active'));
            }, 10);

            // Bind Load More button click
            const loadMoreBtn = container.querySelector('#btnLoadMoreMenuItems');
            if (loadMoreBtn) {
                loadMoreBtn.onclick = () => {
                    const spinner = loadMoreBtn.querySelector('.load-more-spinner');
                    const chevron = loadMoreBtn.querySelector('.fa-chevron-down');
                    if (spinner) spinner.style.display = 'inline-block';
                    if (chevron) chevron.style.display = 'none';

                    setTimeout(() => {
                        visibleItemsLimit += ITEMS_PER_LOAD;
                        renderMenu(selectedCat);
                    }, 200);
                };
            }
        };

        // دالة التنقل الهرمي الموحدة
        const selectCategory = (catIdentifier) => {
            visibleItemsLimit = ITEMS_PER_LOAD;

            let targetCat = null;
            if (catIdentifier === 'all') {
                targetCat = {
                    id: 'all',
                    slug: 'all',
                    name_ar: 'جميع الأصناف',
                    name_en: 'All Dishes',
                    parent_id: null
                };
            } else if (catIdentifier) {
                targetCat = allCategories.find(c => String(c.id) === String(catIdentifier) || c.slug === catIdentifier);
            }

            const initialMsg = document.getElementById('initialMenuMessage');
            if (initialMsg) {
                if (targetCat) {
                    initialMsg.style.display = 'none';
                }
            }

            renderCategoryFilterCards(targetCat);
            renderBreadcrumbs(targetCat);
            renderMenu(targetCat);
        };

        // أحداث اختيار كروت الأقسام
        menuFilterContainer.onclick = (e) => {
            const btn = e.target.closest('.filter-card');
            if (!btn) return;

            btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

            const initialMsg = document.getElementById('initialMenuMessage');
            if (initialMsg) initialMsg.style.display = 'none';

            const filterVal = btn.dataset.filter;
            const catId = btn.dataset.catId;

            if (filterVal === 'all' || catId === 'all') {
                selectCategory('all');
            } else if (catId) {
                selectCategory(catId);
            } else {
                selectCategory(filterVal);
            }
        };

        // دعم التصفح المباشر من رابط الصفحة
        const urlParams = new URLSearchParams(window.location.search);
        const catFilter = urlParams.get('category');
        if (catFilter) {
            selectCategory(catFilter);
        } else {
            selectCategory(null);
        }
    };
    initMenu();

    // 6.0 Hero Slider Logic (Linked to public.announcements in Supabase)
    const initHeroSlider = async () => {
        const defaultImages = [
            'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1920&q=80',
            'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1920&q=80',
            'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1920&q=80',
            'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1920&q=80'
        ];

        let announcements = [];
        if (window._supabase) {
            try {
                const { data, error } = await window._supabase
                    .from('announcements')
                    .select('*')
                    .eq('is_active', true)
                    .order('display_order', { ascending: true });
                if (!error && data && data.length > 0) {
                    announcements = data;
                }
            } catch (err) {
                console.warn('Announcements fetch error:', err);
            }
        }

        if (announcements.length === 0) {
            announcements = [{
                text_ar: 'خصم خاص 20% على جميع وجبات العشاء الفاخرة هذا الأسبوع!',
                text_en: 'Special 20% discount on all luxury dinner meals this week!',
                badge_text_ar: '🔥 عرض خاص',
                badge_text_en: '🔥 Special Offer',
                subtitle_ar: 'اكتشف أفضل المنتجات والعروض الحصرية بأفضل الأسعار مع ضمان الجودة وتوصيل فوري لباب منزلك.',
                subtitle_en: 'Discover top products and exclusive deals at the best prices with guaranteed quality and fast delivery.',
                code: 'ROYAL20',
                image_url: defaultImages[0]
            }];
        }

        const setupSingleSlider = (sliderId, wrapperId, dotsId, prevId, nextId) => {
            const sliderSection = document.getElementById(sliderId);
            const sliderWrapper = document.getElementById(wrapperId);
            if (!sliderWrapper) return;

            const isAr = (localStorage.getItem('preferredLang') || 'ar') === 'ar';

            let slidesHtml = '';
            announcements.forEach((item, index) => {
                const bgImage = item.image_url && item.image_url.trim() !== '' ? item.image_url : defaultImages[index % defaultImages.length];
                const title = isAr ? (item.text_ar || item.text_en) : (item.text_en || item.text_ar);
                const badge = isAr ? (item.badge_text_ar || item.badge_text || '🔥 عرض خاص') : (item.badge_text_en || item.badge_text || '🔥 Special Offer');
                const subtitle = isAr ? (item.subtitle_ar || 'اكتشف أفضل المنتجات والعروض الحصرية بأفضل الأسعار مع ضمان الجودة وتوصيل فوري لباب منزلك.') : (item.subtitle_en || 'Discover top products and exclusive deals at the best prices with guaranteed quality and fast delivery.');
                const activeClass = index === 0 ? 'active' : '';

                slidesHtml += `
                    <div class="hero-slide ${activeClass}" style="background-image: url('${bgImage}');" data-index="${index}">
                        <div class="hero-overlay"></div>
                        <div class="hero-content">
                            <div class="hero-badge-pill">
                                <i class="fas fa-sparkles"></i> ${badge}
                            </div>
                            <h1 class="hero-title hero-title-compact">
                                ${title}
                            </h1>
                            <p class="hero-description">
                                ${subtitle}
                            </p>
                        </div>
                    </div>
                `;
            });

            sliderWrapper.innerHTML = slidesHtml;

            const dotsContainer = document.getElementById(dotsId);
            if (dotsContainer) {
                if (announcements.length > 1) {
                    dotsContainer.innerHTML = announcements.map((_, i) => `<button class="hero-slider-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Slide ${i + 1}"></button>`).join('');
                } else {
                    dotsContainer.style.display = 'none';
                }
            }

            const prevBtn = document.getElementById(prevId);
            const nextBtn = document.getElementById(nextId);
            if (announcements.length <= 1) {
                if (prevBtn) prevBtn.style.display = 'none';
                if (nextBtn) nextBtn.style.display = 'none';
                return;
            } else {
                if (prevBtn) prevBtn.style.display = 'flex';
                if (nextBtn) nextBtn.style.display = 'flex';
            }

            let currentIndex = 0;
            const totalSlides = announcements.length;
            let autoplayTimer = null;

            const showSlide = (newIndex) => {
                const slides = sliderWrapper.querySelectorAll('.hero-slide');
                const dots = dotsContainer ? dotsContainer.querySelectorAll('.hero-slider-dot') : [];

                slides.forEach((s, idx) => {
                    if (idx === newIndex) s.classList.add('active');
                    else s.classList.remove('active');
                });

                dots.forEach((d, idx) => {
                    if (idx === newIndex) d.classList.add('active');
                    else d.classList.remove('active');
                });

                currentIndex = newIndex;
            };

            const nextSlide = () => {
                showSlide((currentIndex + 1) % totalSlides);
            };

            const prevSlide = () => {
                showSlide((currentIndex - 1 + totalSlides) % totalSlides);
            };

            const startAutoplay = () => {
                stopAutoplay();
                autoplayTimer = setInterval(nextSlide, 5500);
            };

            const stopAutoplay = () => {
                if (autoplayTimer) {
                    clearInterval(autoplayTimer);
                    autoplayTimer = null;
                }
            };

            if (nextBtn) {
                nextBtn.onclick = (e) => {
                    e.preventDefault();
                    nextSlide();
                    startAutoplay();
                };
            }

            if (prevBtn) {
                prevBtn.onclick = (e) => {
                    e.preventDefault();
                    prevSlide();
                    startAutoplay();
                };
            }

            if (dotsContainer) {
                dotsContainer.onclick = (e) => {
                    const dot = e.target.closest('.hero-slider-dot');
                    if (dot) {
                        const idx = parseInt(dot.getAttribute('data-index'), 10);
                        showSlide(idx);
                        startAutoplay();
                    }
                };
            }

            if (sliderSection) {
                sliderSection.onmouseenter = stopAutoplay;
                sliderSection.onmouseleave = startAutoplay;

                let touchStartX = 0;
                sliderSection.addEventListener('touchstart', (e) => {
                    touchStartX = e.changedTouches[0].screenX;
                }, { passive: true });

                sliderSection.addEventListener('touchend', (e) => {
                    const touchEndX = e.changedTouches[0].screenX;
                    const diff = touchEndX - touchStartX;
                    if (Math.abs(diff) > 40) {
                        if (diff < 0) {
                            if (isAr) prevSlide(); else nextSlide();
                        } else {
                            if (isAr) nextSlide(); else prevSlide();
                        }
                        startAutoplay();
                    }
                }, { passive: true });
            }

            startAutoplay();
        };

        setupSingleSlider('heroSliderSection', 'heroSliderWrapper', 'heroSliderDots', 'heroSliderPrev', 'heroSliderNext');
        setupSingleSlider('promoSliderSection', 'promoSliderWrapper', 'promoSliderDots', 'promoSliderPrev', 'promoSliderNext');
    };

    window.copyPromoCode = (code, el) => {
        if (!code) return;
        navigator.clipboard.writeText(code).then(() => {
            const origHtml = el.innerHTML;
            const isAr = (localStorage.getItem('preferredLang') || 'ar') === 'ar';
            el.innerHTML = `<i class="fas fa-check" style="color:#00ff88;"></i> <span>${isAr ? 'تم نسخ الكود!' : 'Code Copied!'} <b>${code}</b></span>`;
            setTimeout(() => {
                el.innerHTML = origHtml;
            }, 2000);
        }).catch(() => {});
    };

    const initHeaderScroll = () => {
        const header = document.querySelector('header');
        if (!header) return;
        const handleScroll = () => {
            if (window.scrollY > 40) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
    };

    initHeroSlider();
    initHeaderScroll();

    // 6.1 Home Page Special Dishes - Optimized Parallel Fetching
    const initSpecialDishes = async () => {
        const specialContainer = document.getElementById('specialDishesGrid');
        if (!specialContainer || !window._supabase) return;

        const isAr = (localStorage.getItem('preferredLang') || 'ar') === 'ar';

        // جلب جميع الأصناف المتاحة والتقييمات بالتوازي
        const [itemsRes, reviewsRes] = await Promise.all([
            window._supabase.from('menu_items').select('*').eq('is_available', true),
            window._supabase.from('product_reviews').select('product_id, rating').eq('is_approved', true)
        ]);

        const allItems = itemsRes.data;
        const allReviews = reviewsRes.data || [];

        if (!allItems || allItems.length === 0) {
            specialContainer.style.display = 'none';
            return;
        }

        const ratingsMap = {};
        allReviews.forEach(r => {
            if (!ratingsMap[r.product_id]) ratingsMap[r.product_id] = { sum: 0, count: 0 };
            ratingsMap[r.product_id].sum += r.rating;
            ratingsMap[r.product_id].count++;
        });

        allItems.sort((a, b) => {
            const ratingA = ratingsMap[a.id] ? (ratingsMap[a.id].sum / ratingsMap[a.id].count) : 0;
            const ratingB = ratingsMap[b.id] ? (ratingsMap[b.id].sum / ratingsMap[b.id].count) : 0;
            if (ratingB !== ratingA) return ratingB - ratingA;
            return 0.5 - Math.random();
        });

        const selectedItems = allItems.slice(0, 24);
        const ids = selectedItems.map(i => i.id);
        const { data: variants } = await window._supabase.from('item_variants').select('*').in('item_id', ids);

        let html = '';
        selectedItems.forEach(item => {
            const avgRating = ratingsMap[item.id] ? (ratingsMap[item.id].sum / ratingsMap[item.id].count) : 0;
            const count = ratingsMap[item.id] ? ratingsMap[item.id].count : 0;
            html += createDishCardHTML(item, variants, isAr, { avg: avgRating, count: count });
        });
        specialContainer.innerHTML = html;

        setTimeout(() => {
            specialContainer.querySelectorAll('.dish-card').forEach(card => card.classList.add('active'));
        }, 100);
    };
    initSpecialDishes();

    // 6.1.1 Home Page Dynamic Categories
    const initHomeCategories = async () => {
        const container = document.getElementById('dynamicHomeCategories');
        const dotsContainer = document.getElementById('categoriesDots');
        if (!container || !window._supabase) return;

        const isAr = (localStorage.getItem('preferredLang') || 'ar') === 'ar';

        try {
            const { data: categories, error } = await window._supabase
                .from('categories')
                .select('*')
                .eq('is_active', true)
                .is('parent_id', null)
                .order('created_at', { ascending: true })
                .limit(20);

            if (error || !categories || categories.length === 0) {
                container.style.display = 'none';
                if (dotsContainer) dotsContainer.style.display = 'none';
                return;
            }

            container.innerHTML = categories.map(cat => `
                <a href="menu.html?category=${cat.id}" class="category-capsule">
                    <div class="capsule-glass-effect"></div>
                    <div class="capsule-image">
                        <img src="${cat.image_url || 'logo.png'}" alt="${isAr ? cat.name_ar : cat.name_en}" onerror="this.src='logo.png'">
                    </div>
                    <span class="capsule-name">${isAr ? cat.name_ar : cat.name_en}</span>
                </a>
            `).join('');

            // Sequential entry animation
            container.querySelectorAll('.category-capsule').forEach((el, idx) => {
                setTimeout(() => {
                    el.classList.add('visible');
                }, idx * 60);
            });

            // Dynamic Pagination Dots Setup
            const setupDots = () => {
                if (!dotsContainer) return;

                const screenWidth = window.innerWidth;
                const itemsPerPage = screenWidth <= 640 ? 5 : (screenWidth <= 1024 ? 7 : 10);
                const totalItems = categories.length;
                const numDots = Math.max(1, Math.ceil(totalItems / itemsPerPage));

                if (numDots <= 1) {
                    dotsContainer.innerHTML = '';
                    dotsContainer.style.display = 'none';
                    return;
                }

                dotsContainer.style.display = 'flex';
                let dotsHTML = '';
                for (let i = 0; i < numDots; i++) {
                    dotsHTML += `<span class="category-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`;
                }
                dotsContainer.innerHTML = dotsHTML;

                // Click event on dots to navigate
                dotsContainer.querySelectorAll('.category-dot').forEach((dot) => {
                    dot.addEventListener('click', () => {
                        const idx = parseInt(dot.getAttribute('data-index'), 10);
                        const targetChildIndex = Math.min(idx * itemsPerPage, totalItems - 1);
                        const targetChild = container.children[targetChildIndex];
                        if (targetChild) {
                            targetChild.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
                        }
                    });
                });
            };

            const updateActiveDot = () => {
                if (!dotsContainer) return;
                const dots = dotsContainer.querySelectorAll('.category-dot');
                if (dots.length <= 1) return;

                const scrollPos = Math.abs(container.scrollLeft);
                const maxScroll = container.scrollWidth - container.clientWidth;
                if (maxScroll <= 5) {
                    dots.forEach((dot, idx) => dot.classList.toggle('active', idx === 0));
                    return;
                }

                const pageRatio = Math.min(1, Math.max(0, scrollPos / maxScroll));
                const activeIndex = Math.min(dots.length - 1, Math.round(pageRatio * (dots.length - 1)));

                dots.forEach((dot, idx) => {
                    dot.classList.toggle('active', idx === activeIndex);
                });
            };

            setupDots();
            window.addEventListener('resize', () => {
                setupDots();
                updateActiveDot();
            });

            container.addEventListener('scroll', updateActiveDot, { passive: true });
            updateActiveDot();

            // Drag-to-Scroll Slider Feature
            let isDown = false;
            let startX;
            let scrollLeft;

            container.addEventListener('mousedown', (e) => {
                isDown = true;
                container.classList.add('active');
                startX = e.pageX - container.offsetLeft;
                scrollLeft = container.scrollLeft;
            });
            container.addEventListener('mouseleave', () => { isDown = false; });
            container.addEventListener('mouseup', () => { isDown = false; });
            container.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - container.offsetLeft;
                const walk = (x - startX) * 1.8;
                container.scrollLeft = scrollLeft - walk;
            });

        } catch (e) {
            console.error("Home Categories Load Error:", e);
            container.style.display = 'none';
            if (dotsContainer) dotsContainer.style.display = 'none';
        }
    };
    initHomeCategories();

    // 6.2 Testimonials Logic (Real Data from Supabase)
    const initTestimonials = async () => {
        const container = document.getElementById('dynamicTestimonials');
        const viewMoreWrapper = document.getElementById('testimonialsViewMoreWrapper');
        const viewMoreBtn = document.getElementById('viewMoreTestimonials');
        if (!container || !window._supabase) return;

        const isAr = (localStorage.getItem('preferredLang') || 'ar') === 'ar';
        let currentIndex = 0;
        const itemsPerPage = 2;
        let allReviews = [];

        // وظيفة لجلب البيانات
        const fetchReviews = async () => {
            const { data } = await window._supabase
                .from('site_guestbook')
                .select('*')
                .eq('is_approved', true)
                .order('created_at', { ascending: false });
            return data || [];
        };

        // وظيفة لعرض مجموعة من التعليقات مع حركة سلسة
        const appendReviews = (reviewsList) => {
            reviewsList.forEach((rev, idx) => {
                const card = document.createElement('div');
                card.className = 'testimonial-card reveal';
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'all 0.6s ease';

                card.innerHTML = `
                    <i class="fas fa-quote-left quote-icon"></i>
                    <div class="stars">
                        ${'<i class="fas fa-star"></i>'.repeat(rev.rating)}
                        ${'<i class="far fa-star"></i>'.repeat(5 - rev.rating)}
                    </div>
                    <p>"${rev.comment}"</p>
                    <div class="user-info">
                        <div style="width:50px; height:50px; border-radius:50%; background:rgba(212,175,55,0.1); display:flex; align-items:center; justify-content:center; border:1px solid var(--primary-color);">
                            <i class="fas fa-user" style="color:var(--primary-color)"></i>
                        </div>
                        <div class="user-details">
                            <h4>${rev.user_name}</h4>
                            <span>${isAr ? 'عميل مطعمنا' : 'Restaurant Guest'}</span>
                        </div>
                    </div>
                `;
                container.appendChild(card);

                // تفعيل الحركة بعد مهلة قصيرة لخلق تأثير متتابع
                setTimeout(() => {
                    card.classList.add('active');
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, idx * 200);
            });
        };

        // التحميل الأولي
        allReviews = await fetchReviews();

        if (allReviews.length === 0) {
            container.innerHTML = `<p style="text-align:center; color:#666; width:100%; grid-column: 1/-1;">${isAr ? 'لا توجد تعليقات معتمدة حالياً.' : 'No approved reviews yet.'}</p>`;
            if (viewMoreWrapper) viewMoreWrapper.style.display = 'none';
            return;
        }

        const initialSet = allReviews.slice(0, itemsPerPage);
        appendReviews(initialSet);
        currentIndex = itemsPerPage;

        // إدارة زر "المزيد" و "الإخفاء"
        if (allReviews.length > itemsPerPage) {
            viewMoreWrapper.style.display = 'block';

            viewMoreBtn.onclick = async () => {
                const isExpanded = currentIndex >= allReviews.length;

                if (!isExpanded) {
                    // وضع التحميل (قراءة المزيد)
                    const originalText = viewMoreBtn.innerHTML;
                    viewMoreBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${isAr ? 'جاري التحميل...' : 'Loading...'}`;
                    viewMoreBtn.disabled = true;

                    await new Promise(resolve => setTimeout(resolve, 600));

                    const nextSet = allReviews.slice(currentIndex, currentIndex + itemsPerPage);
                    appendReviews(nextSet);
                    currentIndex += itemsPerPage;

                    viewMoreBtn.disabled = false;

                    if (currentIndex >= allReviews.length) {
                        viewMoreBtn.innerHTML = `${isAr ? 'إخفاء التعليقات الإضافية' : 'Show Less'} <i class="fas fa-chevron-up"></i>`;
                    } else {
                        viewMoreBtn.innerHTML = originalText;
                    }
                } else {
                    // وضع الإخفاء (العودة للأصل)
                    container.innerHTML = '';
                    currentIndex = 0;
                    appendReviews(allReviews.slice(0, itemsPerPage));
                    currentIndex = itemsPerPage;

                    viewMoreBtn.innerHTML = `${isAr ? 'قراءة المزيد من الآراء' : 'Read More Testimonials'} <i class="fas fa-chevron-down"></i>`;

                    // التمرير للأعلى لبداية القسم بسلاسة
                    const section = document.querySelector('.testimonials-premium');
                    if (section) {
                        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            };
        } else {
            if (viewMoreWrapper) viewMoreWrapper.style.display = 'none';
        }
    };
    initTestimonials();

    // 6.3 Guestbook Logic
    const initGuestbook = async () => {
        const commentForm = document.getElementById('commentForm');
        if (!commentForm || !window._supabase) return;

        const isAr = (localStorage.getItem('preferredLang') || 'ar') === 'ar';

        // التحقق من الحد اليومي والاسم عند تحميل الصفحة
        const checkLimitOnLoad = () => {
            const today = new Date().toDateString();
            let limitData = JSON.parse(localStorage.getItem('guestbook_daily_limit') || '{}');

            const nameInput = document.getElementById('reviewerName');
            if (limitData.date === today && limitData.userName && nameInput) {
                nameInput.value = limitData.userName;
                nameInput.readOnly = true;
                nameInput.style.background = 'rgba(255,255,255,0.05)';
                nameInput.style.cursor = 'not-allowed';
            }

            if (limitData.date === today && limitData.count >= 3) {
                if (commentForm) commentForm.style.display = 'none';
                document.getElementById('commentSuccess').style.display = 'block';
                const successMsg = document.getElementById('commentSuccess');
                successMsg.querySelector('h4').innerText = isAr ? 'وصلت للحد الأقصى اليوم' : 'Daily limit reached';
                successMsg.querySelector('p').innerText = isAr ? 'شكراً لك! يمكنك إضافة المزيد من التعليقات غداً.' : 'Thank you! You can add more comments tomorrow.';
            }
        };
        checkLimitOnLoad();

        // 6.3.1 Star Rating Interactivity
        const stars = document.querySelectorAll('#starRating i');
        const ratingInput = document.getElementById('selectedRating');

        stars.forEach(star => {
            star.addEventListener('click', () => {
                const r = star.getAttribute('data-rating');
                ratingInput.value = r;
                stars.forEach((s, idx) => {
                    if (idx < r) {
                        s.classList.replace('far', 'fas');
                        s.style.color = 'var(--primary-color)';
                    } else {
                        s.classList.replace('fas', 'far');
                        s.style.color = '#444';
                    }
                });
            });
        });

        // 6.3.3 Handle Form Submission
        if (commentForm) {
            commentForm.onsubmit = async (e) => {
                e.preventDefault();
                const btn = commentForm.querySelector('button');
                btn.disabled = true;
                btn.innerText = isAr ? 'جاري النشر...' : 'Posting...';

                // Check daily limit (3 comments per day)
                const today = new Date().toDateString();
                let limitData = JSON.parse(localStorage.getItem('guestbook_daily_limit') || '{}');

                if (limitData.date !== today) {
                    limitData = { date: today, count: 0 };
                }

                if (limitData.count >= 3) {
                    window.showToast(isAr ? 'عذراً، لقد وصلت للحد الأقصى للتعليقات اليوم (3 تعليقات).' : 'Sorry, you have reached the daily limit of 3 comments.', 'error');
                    btn.disabled = false;
                    btn.innerText = isAr ? 'نشر التعليق' : 'Post Comment';
                    return;
                }

                const name = document.getElementById('reviewerName').value;
                const msg = document.getElementById('reviewerMessage').value;
                const rating = parseInt(ratingInput.value);

                // خوارزمية فلتر الكلمات المسيئة (مثال توضيحي - يمكنك إضافة الكلمات الحقيقية هنا)
                const badWords = ['badword1', 'badword2', 'كلمة_مسيئة1', 'كلمة_مسيئة2'];
                const hasBadWords = badWords.some(word => msg.toLowerCase().includes(word.toLowerCase()) || name.toLowerCase().includes(word.toLowerCase()));

                if (hasBadWords) {
                    window.showToast(isAr ? 'عذراً، تعليقك يحتوي على كلمات غير لائقة. يرجى الالتزام بالأدب.' : 'Sorry, your comment contains inappropriate language. Please be respectful.', 'error');
                    btn.disabled = false;
                    btn.innerText = isAr ? 'نشر التعليق' : 'Post Comment';
                    return;
                }

                const { error } = await window._supabase.from('site_guestbook').insert({
                    user_name: name,
                    comment: msg,
                    rating: rating,
                    is_approved: false // عودة للمراجعة اليدوية من قبل الإدارة
                });

                if (!error) {
                    // Update limit counter and save user name
                    limitData.count++;
                    limitData.userName = name;
                    localStorage.setItem('guestbook_daily_limit', JSON.stringify(limitData));

                    window.showToast(isAr ? 'شكراً لك! سيتم مراجعة تعليقك ونشره قريباً.' : 'Thank you! Your comment will be reviewed and posted soon.', 'success');

                    commentForm.style.display = 'none';
                    document.getElementById('commentSuccess').style.display = 'block';
                } else {
                    window.showToast(isAr ? 'عذراً، حدث خطأ ما' : 'Sorry, something went wrong', 'error');
                    btn.disabled = false;
                    btn.innerText = isAr ? 'نشر التعليق' : 'Post Comment';
                }
            };
        }
    };
    initGuestbook();

    // 7. Form Handlers
    const setupForm = (id) => {
        const form = document.getElementById(id);
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const btn = form.querySelector('button');
                btn.disabled = true;
                const isAr = (localStorage.getItem('preferredLang') || 'ar') === 'ar';
                const originalHtml = btn.innerHTML;
                btn.innerHTML = isAr ? '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...' : '<i class="fas fa-spinner fa-spin"></i> Sending...';

                // Simulate request (simplified for brevity)
                await new Promise(r => setTimeout(r, 1000));

                window.showToast(isAr ? 'تم الإرسال بنجاح' : 'Sent successfully');
                form.reset();
                btn.disabled = false;
                btn.innerHTML = originalHtml;
            };
        }
    };
    // --- Global Form Security & Honeypot Checker ---
    window.checkFormSecurity = (form, formKey = 'global_form') => {
        const isAr = (localStorage.getItem('preferredLang') || 'ar') === 'ar';

        // 1. Honeypot Trap Check: If hidden input is filled, it's a bot!
        const hpInput = form.querySelector('.hp-security-check, input[name="website_hp_check"]');
        if (hpInput && hpInput.value.trim() !== '') {
            console.warn('Bot detected via Honeypot trap!');
            window.showToast(isAr ? '✨ تم استقبال طلبك بنجاح' : '✨ Request received successfully', 'success');
            form.reset();
            return false;
        }

        // 2. Cooldown Rate-Limiting Check (15 seconds per form type)
        const lastSubmit = localStorage.getItem(`webm_cooldown_${formKey}`);
        const now = Date.now();
        if (lastSubmit && (now - parseInt(lastSubmit)) < 15000) {
            const remaining = Math.ceil((15000 - (now - parseInt(lastSubmit))) / 1000);
            window.showToast(isAr ? `⏳ يرجى الانتظار ${remaining} ثوانٍ قبل الإرسال مرة أخرى` : `⏳ Please wait ${remaining}s before sending again`, 'warning');
            return false;
        }

        localStorage.setItem(`webm_cooldown_${formKey}`, now.toString());
        return true;
    };

    window.validatePhoneInput = function(input) {
        if (!input) return;
        const isAr = (localStorage.getItem('preferredLang') || 'ar') === 'ar';
        const originalVal = input.value;
        const cleanVal = originalVal.replace(/[^0-9+\s-]/g, '');

        if (originalVal !== cleanVal) {
            input.value = cleanVal;
            const now = Date.now();
            if (!input.dataset.lastToastTime || (now - parseInt(input.dataset.lastToastTime, 10)) > 1500) {
                input.dataset.lastToastTime = now.toString();
                if (typeof window.showToast === 'function') {
                    window.showToast(isAr ? '⚠️ يُسمح بأرقام الهاتف فقط (0-9 / +)' : '⚠️ Phone numbers only permitted (0-9 / +)', 'warning');
                }
            }
        }
    };

    // Dedicated Contact Form Handler
    const initContactForm = () => {
        const contactForm = document.getElementById('contactForm');
        const contactSuccess = document.getElementById('contactSuccess');
        if (contactForm) {
            contactForm.onsubmit = async (e) => {
                e.preventDefault();
                const isAr = (localStorage.getItem('preferredLang') || 'ar') === 'ar';

                // Security Check
                if (!window.checkFormSecurity(contactForm, 'contact')) return;
                const btn = contactForm.querySelector('button[type="submit"]');

                const nameVal = (document.getElementById('contact-name') ? document.getElementById('contact-name').value : '').trim();
                if (!nameVal) {
                    window.showToast(isAr ? '⚠️ يرجى إدخال اسمك الكريم' : '⚠️ Please enter your name', 'error');
                    document.getElementById('contact-name')?.focus();
                    return;
                }

                const phoneVal = (document.getElementById('contact-phone') ? document.getElementById('contact-phone').value : '').trim();
                if (!phoneVal) {
                    window.showToast(isAr ? '⚠️ يرجى إدخال رقم الهاتف / الواتساب' : '⚠️ Please enter your phone number', 'error');
                    document.getElementById('contact-phone')?.focus();
                    return;
                }

                const emailVal = (document.getElementById('contact-email') ? document.getElementById('contact-email').value : '').trim();
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailVal || !emailRegex.test(emailVal)) {
                    window.showToast(isAr ? '⚠️ يرجى إدخال عنوان بريد إلكتروني صحيح' : '⚠️ Please enter a valid email address', 'error');
                    document.getElementById('contact-email')?.focus();
                    return;
                }

                const subjectVal = (document.getElementById('contact-subject') ? document.getElementById('contact-subject').value : '').trim();
                if (!subjectVal) {
                    window.showToast(isAr ? '⚠️ يرجى كتابة عنوان الموضوع' : '⚠️ Please enter subject title', 'error');
                    document.getElementById('contact-subject')?.focus();
                    return;
                }

                const messageVal = (document.getElementById('contact-message') ? document.getElementById('contact-message').value : '').trim();
                if (!messageVal) {
                    window.showToast(isAr ? '⚠️ يرجى كتابة تفاصيل رسالتك' : '⚠️ Please enter message details', 'error');
                    document.getElementById('contact-message')?.focus();
                    return;
                }

                if (btn) {
                    btn.disabled = true;
                    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${isAr ? 'جاري الإرسال...' : 'Sending...'}`;
                }

                const contactData = {
                    tenant_id: 'webmakers_luxury_001',
                    name: nameVal,
                    customer_name: nameVal,
                    email: emailVal,
                    phone: phoneVal,
                    customer_phone: phoneVal,
                    subject: subjectVal,
                    message: messageVal,
                    status: 'unread'
                };

                try {
                    if (window._supabase && typeof window._supabase.from === 'function') {
                        const { error } = await window._supabase.from('contact_messages').insert(contactData);
                        if (error) {
                            // Fallback if table rejects secondary column name
                            await window._supabase.from('contact_messages').insert({
                                tenant_id: 'webmakers_luxury_001',
                                name: nameVal,
                                email: emailVal,
                                phone: phoneVal,
                                subject: subjectVal,
                                message: messageVal,
                                status: 'unread'
                            });
                        }
                    }
                } catch (err) {
                    console.warn('Contact message Supabase insert error:', err);
                }

                window.showToast(isAr ? '✨ تم إرسال رسالتك بنجاح! سيقوم فريقنا بالرد عليك قريباً.' : '✨ Message sent successfully!', 'success');
                contactForm.style.display = 'none';
                if (contactSuccess) {
                    contactSuccess.style.display = 'block';
                    contactSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            };
        }
    };
    initContactForm();

    const initNewsletterForm = () => {
        const newsletterForms = document.querySelectorAll('.newsletter-form, #newsletterForm');
        newsletterForms.forEach(form => {
            form.onsubmit = async (e) => {
                e.preventDefault();
                if (!window.checkFormSecurity(form, 'newsletter')) return;
                const emailInput = form.querySelector('input[type="email"]');
                if (!emailInput) return;
                const emailVal = emailInput.value.trim();
                const isAr = (localStorage.getItem('preferredLang') || 'ar') === 'ar';

                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailVal || !emailRegex.test(emailVal)) {
                    window.showToast(isAr ? '⚠️ يرجى إدخال عنوان بريد إلكتروني صحيح' : '⚠️ Please enter a valid email address', 'error');
                    emailInput.focus();
                    return;
                }

                const btn = form.querySelector('button[type="submit"]');
                const origHtml = btn ? btn.innerHTML : '';
                if (btn) {
                    btn.disabled = true;
                    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
                }

                try {
                    if (window._supabase) {
                        const tenantId = window.CURRENT_TENANT_ID || 'webmakers_luxury_001';
                        let { error } = await window._supabase.from('newsletter_subs').insert({ email: emailVal, tenant_id: tenantId });
                        if (error && (error.code === '42P01' || error.message?.includes('not exist'))) {
                            await window._supabase.from('newsletter_subscribers').insert({ email: emailVal, tenant_id: tenantId });
                        }
                    }
                } catch (err) {
                    console.warn('Newsletter insert error:', err);
                }

                window.showToast(isAr ? 'شكراً لانضمامك لقائمة الـ VIP!' : 'Thank you for joining our VIP list!', 'success');
                form.reset();
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = origHtml;
                }
            };
        });
    };
    initNewsletterForm();

    setupForm('reservationForm');

    // 7.1 Reservation Page Specific Logic
    const initReservation = () => {
        const guestsDropdown = document.getElementById('guestsLuxuryDropdown');
        if (guestsDropdown) {
            const trigger = guestsDropdown.querySelector('.lgd-trigger');
            const options = guestsDropdown.querySelectorAll('.lgd-option');
            const hiddenInput = document.getElementById('guests') || document.getElementById('guestsHiddenInput');
            const selectedVal = guestsDropdown.querySelector('.lgd-selected-val');

            trigger.onclick = () => guestsDropdown.classList.toggle('open');

            options.forEach(opt => {
                opt.onclick = () => {
                    const val = opt.dataset.value;
                    const textAr = opt.getAttribute('data-ar');
                    const textEn = opt.getAttribute('data-en');
                    const icon = opt.querySelector('i').className;
                    const isAr = (localStorage.getItem('preferredLang') || 'ar') === 'ar';

                    hiddenInput.value = val;
                    selectedVal.innerHTML = `<i class="${icon}"></i> <span>${isAr ? textAr : textEn}</span>`;

                    options.forEach(o => o.classList.remove('selected'));
                    opt.classList.add('selected');
                    guestsDropdown.classList.remove('open');
                };
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!guestsDropdown.contains(e.target)) guestsDropdown.classList.remove('open');
            });
        }

        // Initialize Flatpickr for Date and Time
        const isAr = (localStorage.getItem('preferredLang') || 'ar') === 'ar';
        const arabicMonths = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
        const englishMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        if (typeof flatpickr !== 'undefined') {
            flatpickr("#date", {
                locale: isAr ? "ar" : "en",
                minDate: "today",
                dateFormat: "Y-m-d",
                disableMobile: "true",
                onReady: function(selectedDates, dateStr, instance) {
                    const monthsContainer = instance.calendarContainer.querySelector('.flatpickr-months');
                    if (!monthsContainer) return;

                    const today = new Date();
                    const currentYear = today.getFullYear();
                    const currentMonth = today.getMonth();

                    // مسح الهيدر القديم بالكامل لبناء التصميم الذهبي من جديد
                    monthsContainer.innerHTML = '';

                    // زر جهة اليمين (ينقل للشهر القادم)
                    const rightBtn = document.createElement('span');
                    rightBtn.className = 'flatpickr-next-month';
                    rightBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
                    rightBtn.onclick = () => instance.changeMonth(1);
                    monthsContainer.appendChild(rightBtn);

                    const customUI = document.createElement('div');
                    customUI.className = 'custom-month-dropdown';

                    const updateMonthGrid = () => {
                        const isCurrentYear = instance.currentYear === currentYear;
                        const isPastYear = instance.currentYear < currentYear;

                        return (isAr ? arabicMonths : englishMonths).map((m, i) => {
                            const isPastMonth = isPastYear || (isCurrentYear && i < currentMonth);
                            const activeClass = i === instance.currentMonth ? 'active' : '';
                            const disabledClass = isPastMonth ? 'disabled' : '';
                            return `<div class="month-item ${activeClass} ${disabledClass}" data-month="${i}">${m}</div>`;
                        }).join('');
                    };

                    const renderStructure = () => {
                        customUI.innerHTML = `
                            <div class="month-trigger">
                                <span class="month-name-display">${isAr ? arabicMonths[instance.currentMonth] : englishMonths[instance.currentMonth]}</span>
                                <i class="fas fa-chevron-down" style="font-size:0.75rem;opacity:0.8"></i>
                            </div>
                            <div class="month-list">
                                <div class="year-selector-mini">
                                    <i class="fas fa-chevron-right year-btn next-year"></i>
                                    <span class="year-val">${instance.currentYear}</span>
                                    <i class="fas fa-chevron-left year-btn prev-year"></i>
                                </div>
                                <div class="months-grid">
                                    ${updateMonthGrid()}
                                </div>
                            </div>
                        `;
                    };

                    renderStructure();
                    monthsContainer.appendChild(customUI);

                    // زر جهة اليسار (ينقل للشهر السابق)
                    const leftBtn = document.createElement('span');
                    leftBtn.className = 'flatpickr-prev-month';
                    leftBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
                    leftBtn.onclick = () => instance.changeMonth(-1);
                    monthsContainer.appendChild(leftBtn);

                    const initEvents = () => {
                        const prevYear = customUI.querySelector('.prev-year');
                        const nextYear = customUI.querySelector('.next-year');
                        const yearDisplay = customUI.querySelector('.year-val');
                        const monthDisplay = customUI.querySelector('.month-name-display');
                        const grid = customUI.querySelector('.months-grid');

                        customUI.onclick = (e) => {
                            if (e.target.closest('.month-list')) return;
                            e.stopPropagation();
                            customUI.classList.toggle('open');
                        };

                        prevYear.onclick = (e) => {
                            e.stopPropagation();
                            if (instance.currentYear <= currentYear) return;
                            const targetYear = instance.currentYear - 1;
                            instance.changeYear(targetYear, true);
                            yearDisplay.innerText = targetYear;
                            grid.innerHTML = updateMonthGrid();
                            attachMonthEvents();
                        };

                        nextYear.onclick = (e) => {
                            e.stopPropagation();
                            const targetYear = instance.currentYear + 1;
                            instance.changeYear(targetYear, true);
                            yearDisplay.innerText = targetYear;
                            grid.innerHTML = updateMonthGrid();
                            attachMonthEvents();
                        };

                        const attachMonthEvents = () => {
                            customUI.querySelectorAll('.month-item:not(.disabled)').forEach(item => {
                                item.onclick = (e) => {
                                    e.stopPropagation();
                                    const m = parseInt(item.dataset.month);
                                    instance.changeMonth(m, true);
                                    monthDisplay.innerText = isAr ? arabicMonths[m] : englishMonths[m];
                                    customUI.classList.remove('open');
                                };
                            });
                        };
                        attachMonthEvents();
                    };

                    initEvents();
                    document.addEventListener('click', (e) => {
                        if (!customUI.contains(e.target)) {
                            customUI.classList.remove('open');
                        }
                    });
                },
                onMonthChange: function(selectedDates, dateStr, instance) {
                    const monthDisplay = instance.calendarContainer.querySelector('.month-name-display');
                    if (monthDisplay) monthDisplay.innerText = isAr ? arabicMonths[instance.currentMonth] : englishMonths[instance.currentMonth];
                    const grid = instance.calendarContainer.querySelector('.months-grid');
                    if (grid) {
                        grid.querySelectorAll('.month-item').forEach((item, i) => {
                            item.classList.toggle('active', i === instance.currentMonth);
                        });
                    }
                },
                onYearChange: function(selectedDates, dateStr, instance) {
                    const yearDisplay = instance.calendarContainer.querySelector('.year-val');
                    if (yearDisplay) yearDisplay.innerText = instance.currentYear;
                }
            });

            flatpickr("#time", {
                enableTime: true,
                noCalendar: true,
                dateFormat: "h:i K",
                time_24hr: false,
                minuteIncrement: 15,
                locale: isAr ? "ar" : "en",
                disableMobile: "true",
                onReady: function(selectedDates, dateStr, instance) {
                    const cal = instance.calendarContainer;
                    if (cal && !cal.querySelector('.time-header-title')) {
                        const header = document.createElement('div');
                        header.className = 'time-header-title';
                        header.innerHTML = `<i class="fas fa-clock"></i> <span>${isAr ? 'تحديد وقت الحجز' : 'Select Preferred Time'}</span>`;
                        cal.prepend(header);
                    }
                }
            });
        }

        // Live Phone Input Validation (Allow numbers only and show hint alert)
        const phoneInput = document.getElementById('phone');
        const phoneHint = document.getElementById('phoneErrorHint');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                const isAr = (localStorage.getItem('preferredLang') || 'ar') === 'ar';
                const originalVal = e.target.value;
                // Allow digits 0-9, leading +, space, dash
                const cleanVal = originalVal.replace(/[^\d+ -]/g, '');

                if (originalVal !== cleanVal) {
                    e.target.value = cleanVal;
                    if (phoneHint) phoneHint.classList.add('active');
                    phoneInput.classList.add('input-error');
                    window.showToast(isAr ? '⚠️ يرجى إدخال أرقام فقط في خانة رقم الهاتف' : '⚠️ Numbers only in phone field', 'warning');
                } else {
                    if (phoneHint) phoneHint.classList.remove('active');
                    phoneInput.classList.remove('input-error');
                }
            });

            phoneInput.addEventListener('blur', () => {
                const isAr = (localStorage.getItem('preferredLang') || 'ar') === 'ar';
                const val = phoneInput.value.trim();
                const digits = val.replace(/\D/g, '');
                if (val.length > 0 && digits.length < 7) {
                    if (phoneHint) phoneHint.classList.add('active');
                    phoneInput.classList.add('input-error');
                    window.showToast(isAr ? '⚠️ رقم الهاتف غير كافٍ (يجب أن يتكون من 7 أرقام على الأقل)' : '⚠️ Phone number too short', 'warning');
                } else {
                    if (phoneHint) phoneHint.classList.remove('active');
                    phoneInput.classList.remove('input-error');
                }
            });
        }

        // Handle Reservation Form Submission
        const resForm = document.getElementById('reservationForm');
        if (resForm) {
            resForm.onsubmit = async (e) => {
                e.preventDefault();
                const isAr = (localStorage.getItem('preferredLang') || 'ar') === 'ar';

                // Security Check
                if (!window.checkFormSecurity(resForm, 'reservation')) return;
                const btn = resForm.querySelector('button[type="submit"]');

                const nameVal = (document.getElementById('name') ? document.getElementById('name').value : '').trim();
                if (!nameVal) {
                    window.showToast(isAr ? '⚠️ يرجى إدخال اسمك الكلي' : '⚠️ Please enter your name', 'error');
                    document.getElementById('name')?.focus();
                    return;
                }

                const emailVal = (document.getElementById('email') ? document.getElementById('email').value : '').trim();
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailVal || !emailRegex.test(emailVal)) {
                    window.showToast(isAr ? '⚠️ يرجى إدخال عنوان بريد إلكتروني صحيح' : '⚠️ Please enter a valid email address', 'error');
                    document.getElementById('email')?.focus();
                    return;
                }

                const phoneVal = (document.getElementById('phone') ? document.getElementById('phone').value : '').trim();
                const digitsOnly = phoneVal.replace(/\D/g, '');

                if (digitsOnly.length < 7) {
                    window.showToast(isAr ? '⚠️ يرجى إدخال رقم هاتف صحيح يتكون من أرقام فقط' : '⚠️ Please enter a valid phone number', 'error');
                    if (phoneInput) {
                        phoneInput.focus();
                        phoneInput.classList.add('input-error');
                    }
                    return;
                }

                const dateVal = (document.getElementById('date') ? document.getElementById('date').value : '').trim();
                if (!dateVal) {
                    window.showToast(isAr ? '⚠️ يرجى اختيار تاريخ الحجز' : '⚠️ Please select reservation date', 'error');
                    document.getElementById('date')?.focus();
                    return;
                }

                const timeVal = (document.getElementById('time') ? document.getElementById('time').value : '').trim();
                if (!timeVal) {
                    window.showToast(isAr ? '⚠️ يرجى تحديد وقت الحجز' : '⚠️ Please select reservation time', 'error');
                    document.getElementById('time')?.focus();
                    return;
                }

                const notesVal = (document.getElementById('message') ? document.getElementById('message').value : '').trim();
                if (!notesVal) {
                    window.showToast(isAr ? '⚠️ يرجى كتابة ملاحظات الحجز والطلبات الخاصة' : '⚠️ Please enter reservation notes or special requests', 'error');
                    document.getElementById('message')?.focus();
                    return;
                }

                if (btn) {
                    btn.disabled = true;
                    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${isAr ? 'جاري تأكيد الحجز...' : 'Confirming...'}`;
                }

                const guestsInput = document.getElementById('guests') || document.getElementById('guestsHiddenInput');
                const selectedOpt = document.querySelector('#guestsLuxuryDropdown .lgd-option.selected');
                const guestsText = selectedOpt ? selectedOpt.getAttribute('data-ar') : (guestsInput && guestsInput.value ? guestsInput.value : 'شخص واحد');

                const resObject = {
                    id: 'res_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                    tenant_id: 'webmakers_luxury_001',
                    customer_name: nameVal,
                    customer_phone: phoneVal,
                    phone: phoneVal,
                    email: emailVal,
                    guests_count: guestsText,
                    reservation_date: dateVal,
                    reservation_time: timeVal,
                    table_number: 'طاولة - صالة رئيسية',
                    notes: notesVal,
                    status: 'pending',
                    created_at: new Date().toISOString()
                };

                // Save to local storage for immediate offline & admin dashboard sync
                try {
                    const localRes = JSON.parse(localStorage.getItem('local_reservations_data') || '[]');
                    localRes.unshift(resObject);
                    localStorage.setItem('local_reservations_data', JSON.stringify(localRes));
                } catch (e) {
                    console.warn('Failed to save reservation locally:', e);
                }

                // Helper to normalize time string (e.g. "03:00 ص" or "3:00 PM") to PostgreSQL time format "HH:MM:SS"
                const normalizeTimeTo24h = (timeStr) => {
                    if (!timeStr) return '12:00:00';
                    let s = timeStr.trim().toLowerCase();
                    let isPM = s.includes('pm') || s.includes('م');
                    let isAM = s.includes('am') || s.includes('ص');
                    let parts = s.match(/(\d{1,2})[:\s]+(\d{1,2})/);
                    if (!parts) return '12:00:00';
                    let hours = parseInt(parts[1], 10);
                    let minutes = parseInt(parts[2], 10);

                    if (isPM && hours < 12) hours += 12;
                    if (isAM && hours === 12) hours = 0;

                    let hh = hours < 10 ? '0' + hours : '' + hours;
                    let mm = minutes < 10 ? '0' + minutes : '' + minutes;
                    return `${hh}:${mm}:00`;
                };

                const parseGuestsToInt = (str) => {
                    if (!str) return 1;
                    if (typeof str === 'number') return str;
                    const s = String(str).trim();
                    if (s.includes('واحد')) return 1;
                    if (s.includes('شخصين') || s.includes('2')) return 2;
                    if (s.includes('3')) return 3;
                    if (s.includes('5')) return 5;
                    const num = parseInt(s.replace(/\D/g, ''), 10);
                    return !isNaN(num) && num > 0 ? num : 1;
                };

                const guestsNum = parseGuestsToInt(guestsText);
                const localResList = JSON.parse(localStorage.getItem('local_reservations_data') || '[]');
                const nextResNum = `#${1001 + (localResList.length || 0)}`;

                // Exact 1-to-1 payload matching Supabase table schema columns (Supabase Sequence auto-generates reservation_number)
                const dbPayload = {
                    tenant_id: 'webmakers_luxury_001',
                    customer_name: nameVal,
                    phone: phoneVal,
                    email: emailVal,
                    reservation_date: dateVal,
                    reservation_time: normalizeTimeTo24h(timeVal),
                    guests_count: guestsNum,
                    table_number: 'طاولة - صالة رئيسية',
                    notes: notesVal,
                    status: 'pending'
                };

                try {
                    if (window._supabase && typeof window._supabase.from === 'function') {
                        const { data, error } = await window._supabase.from('reservations').insert([dbPayload]).select();
                        if (error) {
                            console.error('Supabase reservation insert error:', error.message || error, error);
                            if (error.message && (error.message.includes('row-level security') || error.message.includes('policy'))) {
                                window.showToast(isAr ? '⚠️ يرجى تفعيل صلاحية RLS في Supabase للجدول' : '⚠️ RLS Policy error in Supabase', 'warning');
                            }
                        } else {
                            console.log('Successfully inserted reservation into Supabase DB!', data);
                        }
                    }
                } catch (err) {
                    console.error('Supabase reservation catch error:', err);
                }

                // Show success toast and notification
                window.showToast(isAr ? '✨ تم إرسال طلب الحجز بنجاح! سنتواصل معك قريباً لتأكيد الحجز.' : '✨ Reservation request sent successfully!', 'success');
                const successMsg = document.getElementById('successMessage');
                if (successMsg) {
                    const storeWhatsapp = (window.siteSettings && window.siteSettings.whatsapp_number) ? window.siteSettings.whatsapp_number : '967777777777';
                    const cleanWa = storeWhatsapp.replace(/[^0-9]/g, '');

                    const waMsg = encodeURIComponent(
                        isAr
                            ? `مرحباً، أقوم بتأكيد طلب حجز طاولة جديد عبر الموقع:\n👤 الاسم: ${nameVal}\n👥 عدد الأفراد: ${guestsText}\n📅 التاريخ والوقت: ${dateVal} | ${timeVal}\n📞 الهاتف: ${phoneVal}${notesVal ? `\n📝 ملاحظات: ${notesVal}` : ''}`
                            : `Hello, confirming my table reservation:\nName: ${nameVal}\nGuests: ${guestsText}\nDate/Time: ${dateVal} | ${timeVal}\nPhone: ${phoneVal}${notesVal ? `\nNotes: ${notesVal}` : ''}`
                    );

                    const waUrl = `https://wa.me/${cleanWa}?text=${waMsg}`;

                    successMsg.style.display = 'block';
                    successMsg.innerHTML = `
                        <div style="text-align: center; padding: 25px 20px; background: rgba(255, 255, 255, 0.03); border-radius: 20px; border: 1px solid rgba(16, 185, 129, 0.4); box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                            <div style="width: 60px; height: 60px; border-radius: 50%; background: rgba(16, 185, 129, 0.15); border: 2px solid #10b981; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; color: #10b981; font-size: 1.8rem; box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);">
                                <i class="fas fa-check"></i>
                            </div>

                            <h3 style="color: #ffffff; font-size: 1.25rem; font-weight: 900; margin-bottom: 12px; letter-spacing: -0.3px;">
                                ${isAr ? `أهلاً بك يا ${nameVal}! تم استلام طلب الحجز بنجاح.` : `Welcome ${nameVal}! Reservation received successfully.`}
                            </h3>

                            <div style="color: #f8fafc; font-size: 0.98rem; font-weight: 600; line-height: 1.7; max-width: 580px; margin: 0 auto 18px; padding: 12px 16px; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);">
                                ${isAr ?
                                    `حجزك لعدد <span style="color:#d4af37; font-weight:800; background:rgba(212,175,55,0.15); padding:2px 8px; border-radius:6px;">${guestsText}</span> بتاريخ <span style="color:#d4af37; font-weight:800; background:rgba(212,175,55,0.15); padding:2px 8px; border-radius:6px;" dir="ltr">${dateVal}</span> بوقت <span style="color:#d4af37; font-weight:800; background:rgba(212,175,55,0.15); padding:2px 8px; border-radius:6px;" dir="ltr">${timeVal}</span> قيد المراجعة والتأكيد.` :
                                    `Your reservation for <span style="color:#d4af37; font-weight:800; background:rgba(212,175,55,0.15); padding:2px 8px; border-radius:6px;">${guestsText}</span> on <span style="color:#d4af37; font-weight:800; background:rgba(212,175,55,0.15); padding:2px 8px; border-radius:6px;">${dateVal}</span> at <span style="color:#d4af37; font-weight:800; background:rgba(212,175,55,0.15); padding:2px 8px; border-radius:6px;">${timeVal}</span> is being processed.`
                                }
                            </div>

                            <div style="margin-top: 18px;">
                                <a href="${waUrl}" target="_blank" class="btn-whatsapp-confirm" style="display: inline-flex; align-items: center; justify-content: center; gap: 10px; padding: 14px 28px; border-radius: 50px; background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); color: #ffffff; font-weight: 800; font-size: 1rem; text-decoration: none; box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4); transition: all 0.25s ease; border: 1px solid rgba(255,255,255,0.2);">
                                    <i class="fab fa-whatsapp" style="font-size: 1.4rem;"></i>
                                    <span>${isAr ? 'تأكيد وتوثيق الحجز عبر الواتساب' : 'Confirm via WhatsApp'}</span>
                                </a>
                            </div>
                        </div>
                    `;
                    successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }

                resForm.reset();

                const selectedVal = document.querySelector('.lgd-selected-val');
                if (selectedVal) {
                    selectedVal.innerHTML = `<i class="fas fa-user"></i> <span>${isAr ? 'شخص واحد' : '1 Person'}</span>`;
                }

                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = isAr ? 'تأكيد الحجز <i class="fas fa-calendar-check" style="margin-right: 8px;"></i>' : 'Confirm Reservation <i class="fas fa-calendar-check" style="margin-left: 8px;"></i>';
                }
            };
        }
    };
    initReservation();

    // 8. WhatsApp Widget & Back to Top Logic
    const initGlobalWidgets = () => {
        const whatsappToggle = document.getElementById('whatsappToggle');
        const whatsappWidget = document.getElementById('whatsappWidget');
        const closeWhatsapp = document.getElementById('closeWhatsapp');
        const backToTop = document.getElementById('backToTop');
        const scrollDownBtn = document.getElementById('scrollDownBtn');

        // Scroll Down Button Logic
        if (scrollDownBtn) {
            scrollDownBtn.onclick = () => {
                const nextSection = document.querySelector('.our-story-editorial');
                if (nextSection) {
                    const offset = nextSection.offsetTop;
                    luxuryScrollTo(offset, 1200); // تمرير فاخر مدته 1.2 ثانية
                }
            };
        }

        // WhatsApp Toggle
        if (whatsappToggle && whatsappWidget) {
            whatsappToggle.onclick = (e) => {
                e.stopPropagation();
                whatsappWidget.classList.toggle('active');
            };

            if (closeWhatsapp) {
                closeWhatsapp.onclick = () => {
                    whatsappWidget.classList.remove('active');
                };
            }

            // Click outside to close
            document.addEventListener('click', (e) => {
                if (whatsappWidget.classList.contains('active') && !whatsappWidget.contains(e.target) && e.target !== whatsappToggle) {
                    whatsappWidget.classList.remove('active');
                }
            });
        }

        // Back to Top Scroll Logic
        if (backToTop) {
            window.onscroll = () => {
                if (window.scrollY > 1500) {
                    backToTop.classList.add('show');
                } else {
                    backToTop.classList.remove('show');
                }
            };

            backToTop.onclick = () => {
                luxuryScrollTo(0, 1500); // العودة للأعلى بتأثير انسيابي
            };
        }
    };
    initGlobalWidgets();

    // 9. Master World-Class Header Manager (Live Search Modal & Mobile Offcanvas Drawer)
    const initMasterHeader = () => {
        const isAr = (localStorage.getItem('preferredLang') || 'ar') === 'ar';

        // 1. Create Live Search Modal if not present
        if (!document.getElementById('liveSearchModal')) {
            const modal = document.createElement('div');
            modal.id = 'liveSearchModal';
            modal.className = 'live-search-modal';
            modal.innerHTML = `
                <div class="search-modal-container">
                    <div class="search-modal-header">
                        <span class="search-modal-heading">
                            <span>${isAr ? 'البحث الذكي' : 'Smart Search'}</span>
                            <span class="search-ai-chip"><i class="fas fa-wand-magic-sparkles"></i> AI</span>
                        </span>
                        <button class="close-search-modal" id="closeSearchModal" title="${isAr ? 'إغلاق' : 'Close'}" aria-label="إغلاق">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="search-input-wrapper">
                        <svg class="ai-search-icon search-icon-input" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width: 1.25em; height: 1.25em; position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: var(--primary-glow, #00c8ff); pointer-events: none; z-index: 3;">
                            <circle cx="10" cy="10" r="5.8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M14.5 14.5L19.5 19.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
                            <path d="M16.5 1.5C16.5 3.8 15.2 4.8 13.5 5C15.2 5.2 16.5 6.2 16.5 8.5C16.5 6.2 17.8 5.2 19.5 5C17.8 4.8 16.5 3.8 16.5 1.5Z" fill="currentColor"/>
                        </svg>
                        <input type="text" class="search-main-input" id="searchMainInput"
                               placeholder="${isAr ? 'ابحث عن منتجات، ماركات، والمزيد...' : 'Search products, brands, and more...'}"
                               autocomplete="off" autofocus>
                        <button type="button" class="clear-search-input-btn" id="clearSearchInputBtn" title="${isAr ? 'مسح النص' : 'Clear text'}" style="display: none;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="search-results-grid" id="searchResultsGrid">
                        <div class="search-empty-state">
                            <div class="search-empty-icon-box">
                                <svg class="ai-search-icon search-empty-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width: 52px; height: 52px; color: var(--primary-glow, #00c8ff); filter: drop-shadow(0 0 16px rgba(0, 200, 255, 0.7));">
                                    <circle cx="10" cy="10" r="5.8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M14.5 14.5L19.5 19.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
                                    <path d="M16.5 1.5C16.5 3.8 15.2 4.8 13.5 5C15.2 5.2 16.5 6.2 16.5 8.5C16.5 6.2 17.8 5.2 19.5 5C17.8 4.8 16.5 3.8 16.5 1.5Z" fill="currentColor"/>
                                </svg>
                            </div>
                            <p class="search-empty-text">${isAr ? 'ابدأ بالكتابة للبحث الفوري الذكي عن أي منتج...' : 'Start typing for instant smart search...'}</p>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        // 2. Create Mobile Offcanvas Drawer if not present
        if (!document.getElementById('mobileNavDrawer')) {
            const drawer = document.createElement('div');
            drawer.id = 'mobileNavDrawer';
            drawer.className = 'mobile-nav-drawer';
            drawer.innerHTML = `
                <div class="drawer-header">
                    <a href="index.html" class="logo">
                        <img src="${window.siteSettings?.logo_url || 'logo.png'}" alt="Logo" class="logo-img">
                        <span class="logo-text" data-ar="ويب ميكرز" data-en="WebMakers">${isAr ? (window.siteSettings?.site_name_ar || 'ويب ميكرز') : (window.siteSettings?.site_name_en || 'WebMakers')}</span>
                        <span class="yt-saas-badge">SA</span>
                    </a>
                    <button class="drawer-close-btn" id="closeMobileNav" title="${isAr ? 'إغلاق القائمة' : 'Close'}" aria-label="إغلاق"><i class="fas fa-times fa-xmark"></i></button>
                </div>
                <ul class="drawer-links-list">
                    <li><a href="menu.html"><i class="fas fa-boxes-stacked"></i> <span data-ar="جميع المنتجات" data-en="All Products">${isAr ? 'جميع المنتجات' : 'All Products'}</span></a></li>
                    <li class="drawer-categories-item"><a href="index.html#categoriesSection"><i class="fas fa-layer-group"></i> <span data-ar="جميع الأقسام" data-en="All Categories">${isAr ? 'جميع الأقسام' : 'All Categories'}</span></a></li>
                    <li><a href="about.html"><i class="fas fa-circle-info"></i> <span data-ar="عن المتجر" data-en="About Us">${isAr ? 'عن المتجر' : 'About Us'}</span></a></li>
                    <li><a href="contact.html"><i class="fas fa-headset"></i> <span data-ar="خدمة العملاء" data-en="Customer Service">${isAr ? 'خدمة العملاء' : 'Customer Service'}</span></a></li>
                    <li><a href="careers.html"><i class="fas fa-briefcase"></i> <span data-ar="الوظائف والانضمام" data-en="Careers">${isAr ? 'الوظائف والانضمام' : 'Careers'}</span></a></li>
                    <li><a href="faq.html"><i class="fas fa-circle-question"></i> <span data-ar="الأسئلة الشائعة" data-en="FAQ">${isAr ? 'الأسئلة الشائعة' : 'FAQ'}</span></a></li>
                    <li><a href="privacy-policy.html"><i class="fas fa-shield-halved"></i> <span data-ar="سياسة الخصوصية" data-en="Privacy Policy">${isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}</span></a></li>
                </ul>
                <div class="drawer-social-icons">
                    <a href="#" class="social-icon" title="Facebook"><i class="fab fa-facebook-f"></i></a>
                    <a href="#" class="social-icon" title="Instagram"><i class="fab fa-instagram"></i></a>
                    <a href="#" class="social-icon" title="TikTok"><i class="fab fa-tiktok"></i></a>
                    <a href="#" class="social-icon" title="Snapchat"><i class="fab fa-snapchat-ghost"></i></a>
                    <a href="#" class="social-icon" title="WhatsApp"><i class="fab fa-whatsapp"></i></a>
                    <a href="#" class="social-icon" title="Email"><i class="fas fa-envelope"></i></a>
                </div>
                <div class="drawer-actions">
                    <div class="drawer-copyright">
                        ${isAr ? 'جميع الحقوق محفوظة &copy; ٢٠٢٦ ويب ميكرز' : 'All Rights Reserved &copy; 2026 WebMakers'}
                    </div>
                    <div class="drawer-actions-divider"></div>
                    <div class="drawer-bottom-master-capsule">
                        <div class="drawer-bottom-row">
                            <!-- Right Half (50%): Symmetrical Language Toggle Capsule (Direct Toggle) -->
                            <button class="drawer-capsule-item language-capsule drawer-lang-toggle" type="button" aria-label="تبديل لغة الموقع" title="${isAr ? 'تحويل للغة الإنجليزية' : 'Switch to Arabic'}">
                                <span class="theme-switch-label">${isAr ? 'اللغة' : 'Language'}</span>
                                <span class="lang-switch-track">
                                    <span class="lang-switch-badge">${isAr ? 'EN' : 'AR'}</span>
                                </span>
                            </button>
                            
                            <!-- Left Half (50%): Symmetrical Theme Selector Capsule Switch -->
                            <button class="drawer-capsule-item theme-capsule site-theme-toggle" type="button" aria-label="تبديل مظهر الموقع" title="${isAr ? 'تبديل المظهر' : 'Toggle Theme'}">
                                <span class="theme-switch-label">${isAr ? 'المظهر' : 'Theme'}</span>
                                <span class="theme-switch-track-luxury">
                                    <span class="switch-luxury-slider">
                                        <i class="fas ${document.documentElement.getAttribute('data-theme') === 'light' ? 'fa-sun' : 'fa-moon'} switch-slider-icon"></i>
                                    </span>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(drawer);

            const overlay = document.createElement('div');
            overlay.className = 'mobile-drawer-overlay';
            document.body.appendChild(overlay);

            if (window.syncLangDropdownsState) window.syncLangDropdownsState();
        }

        // 3. Create Floating Curved Mobile Bottom Nav (شريط القوائم السفلي المنحني العائم للجوال فقط)
        if (!document.getElementById('mobileBottomNav')) {
            const bottomNav = document.createElement('nav');
            bottomNav.id = 'mobileBottomNav';
            bottomNav.className = 'mobile-bottom-nav';
            bottomNav.setAttribute('aria-label', isAr ? 'شريط التنقل السفلي' : 'Mobile Bottom Navigation');

            const currentPath = window.location.pathname.split('/').pop() || 'index.html';
            const isHome = currentPath === 'index.html' || currentPath === '' || currentPath === '/';
            const isMenu = currentPath === 'menu.html';
            const isCart = currentPath === 'cart.html';

            bottomNav.innerHTML = `
                <div class="mobile-bottom-nav-inner">
                    <!-- 1. Home -->
                    <a href="index.html" class="mb-nav-item ${isHome ? 'active' : ''}" title="${isAr ? 'الصفحة الرئيسية' : 'Home'}">
                        <div class="mb-nav-icon"><i class="fas fa-house"></i></div>
                        <span class="mb-nav-label" data-ar="الرئيسية" data-en="Home">${isAr ? 'الرئيسية' : 'Home'}</span>
                    </a>

                    <!-- 2. Categories -->
                    <a href="${isHome ? '#categoriesSection' : 'menu.html'}" class="mb-nav-item ${isMenu ? 'active' : ''}" id="mbNavCategories" title="${isAr ? 'الأقسام' : 'Categories'}">
                        <div class="mb-nav-icon"><i class="fas fa-layer-group"></i></div>
                        <span class="mb-nav-label" data-ar="الأقسام" data-en="Categories">${isAr ? 'الأقسام' : 'Categories'}</span>
                    </a>

                    <!-- 3. AI Chat / Search Button (Center Highlighted) -->
                    <button type="button" class="mb-nav-item mb-nav-ai-center nav-search-trigger" id="mbNavAiChat" title="${isAr ? 'مساعد AI الذكي' : 'AI Chat Assistant'}" aria-label="${isAr ? 'مساعد الذكاء الاصطناعي' : 'AI Assistant'}">
                        <div class="mb-ai-glow-circle">
                            <i class="fas fa-wand-magic-sparkles mb-ai-icon"></i>
                            <span class="mb-ai-pulse"></span>
                        </div>
                        <span class="mb-nav-label mb-ai-label" data-ar="AI شات" data-en="AI Chat">${isAr ? 'AI شات' : 'AI Chat'}</span>
                    </button>

                    <!-- 4. Cart -->
                    <a href="cart.html" class="mb-nav-item ${isCart ? 'active' : ''}" title="${isAr ? 'السلة' : 'Cart'}">
                        <div class="mb-nav-icon">
                            <i class="fas fa-bag-shopping"></i>
                            <span class="mb-cart-badge cart-count-badge">0</span>
                        </div>
                        <span class="mb-nav-label" data-ar="السلة" data-en="Cart">${isAr ? 'السلة' : 'Cart'}</span>
                    </a>

                    <!-- 5. Menu / Drawer Toggle -->
                    <button type="button" class="mb-nav-item" id="mbNavMenuToggle" title="${isAr ? 'القوائم' : 'Menu'}" aria-label="${isAr ? 'فتح القائمة' : 'Open Menu'}">
                        <div class="mb-nav-icon"><i class="fas fa-bars-staggered"></i></div>
                        <span class="mb-nav-label" data-ar="القوائم" data-en="Menu">${isAr ? 'القوائم' : 'Menu'}</span>
                    </button>
                </div>
            `;
            document.body.appendChild(bottomNav);

            // Bind smooth scroll if on index.html for categories
            const mbCategoriesBtn = document.getElementById('mbNavCategories');
            if (mbCategoriesBtn && isHome) {
                mbCategoriesBtn.onclick = (e) => {
                    const targetSec = document.getElementById('categoriesSection') || document.getElementById('specialProductsSection');
                    if (targetSec) {
                        e.preventDefault();
                        targetSec.scrollIntoView({ behavior: 'smooth' });
                    }
                };
            }

            // Bind Menu Toggle from bottom nav
            const mbMenuBtn = document.getElementById('mbNavMenuToggle');
            if (mbMenuBtn) {
                mbMenuBtn.onclick = (e) => {
                    e.preventDefault();
                    const mobileDrawer = document.getElementById('mobileNavDrawer');
                    const drawerOverlay = document.querySelector('.mobile-drawer-overlay');
                    if (mobileDrawer && drawerOverlay) {
                        mobileDrawer.classList.toggle('active');
                        drawerOverlay.classList.toggle('active');
                    }
                };
            }

            // Sync badges immediately
            if (window.updateNavBadges) window.updateNavBadges();
        }

        // 4. Event Bindings
        const searchModal = document.getElementById('liveSearchModal');
        const closeSearch = document.getElementById('closeSearchModal');
        const searchInput = document.getElementById('searchMainInput');
        const searchResultsGrid = document.getElementById('searchResultsGrid');

        const mobileDrawer = document.getElementById('mobileNavDrawer');
        const closeMobileNav = document.getElementById('closeMobileNav');
        const drawerOverlay = document.querySelector('.mobile-drawer-overlay');

        // Search Modal Triggers
        document.querySelectorAll('.nav-search-trigger, .drawer-search-btn').forEach(trigger => {
            trigger.onclick = (e) => {
                e.preventDefault();
                if (mobileDrawer && drawerOverlay) {
                    mobileDrawer.classList.remove('active');
                    drawerOverlay.classList.remove('active');
                }
                if (searchModal) {
                    searchModal.classList.add('active');
                    if (searchInput) {
                        const curIsAr = (localStorage.getItem('preferredLang') || 'ar') === 'ar';
                        searchInput.placeholder = curIsAr
                            ? 'ابحث عن منتجات، ماركات، والمزيد...'
                            : 'Search products, brands, and more...';
                        searchInput.value = '';
                        const clearBtn = document.getElementById('clearSearchInputBtn');
                        if (clearBtn) clearBtn.style.display = 'none';
                        searchInput.focus();
                    }
                    if (typeof renderDefaultSearchView === 'function') {
                        renderDefaultSearchView();
                    }
                }
            };
        });

        if (closeSearch) {
            closeSearch.onclick = () => {
                if (searchModal) searchModal.classList.remove('active');
            };
        }

        // Click outside on search modal backdrop to close it
        if (searchModal) {
            searchModal.onclick = (e) => {
                if (e.target === searchModal) {
                    searchModal.classList.remove('active');
                }
            };
        }

        // Mobile Nav Drawer Triggers
        document.querySelectorAll('.mobile-nav-toggle').forEach(toggle => {
            toggle.onclick = (e) => {
                e.preventDefault();
                if (mobileDrawer && drawerOverlay) {
                    const currentPath = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
                    mobileDrawer.querySelectorAll('.drawer-links-list a').forEach(a => {
                        const href = (a.getAttribute('href') || '').toLowerCase();
                        if (href === currentPath || (currentPath === '' && href === 'index.html')) {
                            a.classList.add('active');
                        } else {
                            a.classList.remove('active');
                        }
                    });
                    mobileDrawer.classList.add('active');
                    drawerOverlay.classList.add('active');
                }
            };
        });

        const closeDrawer = () => {
            if (mobileDrawer && drawerOverlay) {
                mobileDrawer.classList.remove('active');
                drawerOverlay.classList.remove('active');
            }
        };

        if (closeMobileNav) closeMobileNav.onclick = closeDrawer;
        if (drawerOverlay) drawerOverlay.onclick = closeDrawer;

        if (mobileDrawer) {
            mobileDrawer.querySelectorAll('.drawer-links-list a').forEach(a => {
                a.addEventListener('click', (e) => {
                    const href = a.getAttribute('href') || '';
                    if (href.includes('#categoriesSection')) {
                        const currentPath = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
                        if (currentPath === 'index.html' || currentPath === '' || currentPath === '/') {
                            e.preventDefault();
                            closeDrawer();
                            const targetSec = document.getElementById('categoriesSection');
                            if (targetSec) {
                                targetSec.scrollIntoView({ behavior: 'smooth' });
                            }
                        } else {
                            closeDrawer();
                        }
                    } else {
                        closeDrawer();
                    }
                });
            });
        }

        // --- 4. High-Performance Instant In-Memory AI Search Engine (سريع طلقة) & Search History Manager ---
        const SEARCH_HISTORY_KEY = 'webm_search_history';
        const MAX_SEARCH_HISTORY = 8; // الحد الأقصى لعدد عمليات البحث المحفوظة

        const getSearchHistory = () => {
            try {
                const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
                return raw ? JSON.parse(raw) : [];
            } catch (e) {
                return [];
            }
        };

        const saveSearchHistory = (term) => {
            if (!term) return;
            const clean = term.trim();
            if (clean.length < 2) return;
            try {
                let history = getSearchHistory();
                history = [clean, ...history.filter(t => t.toLowerCase() !== clean.toLowerCase())].slice(0, MAX_SEARCH_HISTORY);
                localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
            } catch (e) {
                console.warn('Error saving search history:', e);
            }
        };

        const removeSearchHistoryItem = (term) => {
            try {
                let history = getSearchHistory();
                history = history.filter(t => t !== term && t.toLowerCase() !== term.toLowerCase());
                localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
            } catch (e) {
                console.warn('Error removing search history item:', e);
            }
        };

        const clearSearchHistory = () => {
            try {
                localStorage.removeItem(SEARCH_HISTORY_KEY);
            } catch (e) {
                console.warn('Error clearing search history:', e);
            }
        };

        // Arabic text normalizer for high-speed indexing & token matching
        const normalizeSearchText = (text) => {
            if (!text) return '';
            return String(text)
                .toLowerCase()
                .replace(/[\u064B-\u065F\u0670]/g, '') // remove tashkeel (diacritics)
                .replace(/[إأآا]/g, 'ا')
                .replace(/[ىي]/g, 'ي')
                .replace(/[ةه]/g, 'ه')
                .replace(/[\u0640]/g, '') // tatweel
                .replace(/[^\w\u0600-\u06FF\s]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        };

        // In-memory data store for 0ms ultra-fast search
        let searchStore = {
            isReady: false,
            items: [],
            variants: [],
            ratingsMap: {},
            indexed: []
        };

        const initSearchStore = async () => {
            if (searchStore.isReady) return searchStore;
            try {
                if (window._supabase) {
                    const [itemsRes, variantsRes, reviewsRes] = await Promise.all([
                        window._supabase.from('menu_items').select('*').eq('is_available', true),
                        window._supabase.from('item_variants').select('*'),
                        window._supabase.from('product_reviews').select('product_id, rating').eq('is_approved', true)
                    ]);

                    const items = itemsRes?.data || [];
                    const variants = variantsRes?.data || [];
                    const reviews = reviewsRes?.data || [];

                    const ratingsMap = {};
                    reviews.forEach(r => {
                        if (!ratingsMap[r.product_id]) ratingsMap[r.product_id] = { sum: 0, count: 0 };
                        ratingsMap[r.product_id].sum += r.rating;
                        ratingsMap[r.product_id].count++;
                    });

                    const indexed = items.map(item => {
                        const str = `${item.name_ar || ''} ${item.name_en || ''} ${item.description_ar || ''} ${item.description_en || ''}`;
                        return {
                            item,
                            norm: normalizeSearchText(str),
                            ratingData: {
                                avg: ratingsMap[item.id] ? (ratingsMap[item.id].sum / ratingsMap[item.id].count) : 0,
                                count: ratingsMap[item.id] ? ratingsMap[item.id].count : 0
                            }
                        };
                    });

                    searchStore = {
                        isReady: true,
                        items,
                        variants,
                        ratingsMap,
                        indexed
                    };
                }
            } catch (err) {
                console.warn('Search store init error:', err);
            }
            return searchStore;
        };

        // Preload immediately in background
        initSearchStore();

        // Render default state: Previous Search History or Empty State
        const renderDefaultSearchView = () => {
            if (!searchResultsGrid) return;
            const history = getSearchHistory();
            const curIsAr = (localStorage.getItem('preferredLang') || 'ar') === 'ar';

            if (history.length > 0) {
                searchResultsGrid.innerHTML = `
                    <div class="search-history-container">
                        <div class="search-history-header">
                            <div class="search-history-title">
                                <i class="fas fa-clock-rotate-left"></i>
                                <span>${curIsAr ? 'عمليات البحث السابقة' : 'Recent Searches'}</span>
                                <span style="font-size: 0.78rem; opacity: 0.75; font-weight: 700; margin-inline-start: 4px;">(${history.length}/${MAX_SEARCH_HISTORY})</span>
                            </div>
                            <button class="search-history-clear-btn" type="button" id="clearAllSearchHistory" title="${curIsAr ? 'مسح سجل البحث' : 'Clear All'}">
                                <i class="fas fa-trash-alt"></i>
                                <span>${curIsAr ? 'مسح الكل' : 'Clear All'}</span>
                            </button>
                        </div>
                        <div class="search-history-tags">
                            ${history.map(term => `
                                <div class="search-history-tag">
                                    <button type="button" class="history-tag-name" data-term="${term}" title="${curIsAr ? 'بحث عن' : 'Search for'} ${term}">
                                        <i class="fas fa-magnifying-glass"></i>
                                        <span>${term}</span>
                                    </button>
                                    <button type="button" class="history-tag-remove" data-term="${term}" title="${curIsAr ? 'حذف من السجل' : 'Remove'}" aria-label="${curIsAr ? 'حذف' : 'Remove'}">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            } else {
                searchResultsGrid.innerHTML = `
                    <div class="search-empty-state">
                        <div class="search-empty-icon-box">
                            <svg class="ai-search-icon search-empty-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width: 52px; height: 52px; color: var(--primary-glow, #00c8ff); filter: drop-shadow(0 0 16px rgba(0, 200, 255, 0.7));">
                                <circle cx="10" cy="10" r="5.8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M14.5 14.5L19.5 19.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
                                <path d="M16.5 1.5C16.5 3.8 15.2 4.8 13.5 5C15.2 5.2 16.5 6.2 16.5 8.5C16.5 6.2 17.8 5.2 19.5 5C17.8 4.8 16.5 3.8 16.5 1.5Z" fill="currentColor"/>
                            </svg>
                        </div>
                        <p class="search-empty-text">${curIsAr ? 'ابدأ بالكتابة للبحث الفوري الذكي عن أي منتج...' : 'Start typing for instant smart search...'}</p>
                    </div>
                `;
            }
        };

        // Initial default view
        renderDefaultSearchView();

        // Perform instant in-memory search (سريع طلقة - 0ms response)
        let currentSearchPage = 1;
        let currentMatchedItems = [];

        const getLimit = () => {
            const width = window.innerWidth;
            if (width <= 640) return 20; // Mobile
            if (width <= 1024) return 24; // Tablet
            return 36; // Desktop
        };

        const renderSearchShimmer = (count = 12) => {
            if (!searchResultsGrid) return;
            let html = '';
            for (let i = 0; i < count; i++) {
                html += `
                    <div class="search-skeleton-card">
                        <div class="skeleton-img-box shimmer-wave"></div>
                        <div class="skeleton-info-box">
                            <div class="skeleton-text-line title shimmer-wave"></div>
                            <div class="skeleton-text-line sub shimmer-wave"></div>
                            <div class="skeleton-row-bottom">
                                <div class="skeleton-text-line price shimmer-wave"></div>
                                <div class="skeleton-circle-btn shimmer-wave"></div>
                            </div>
                        </div>
                    </div>
                `;
            }
            searchResultsGrid.innerHTML = html;
        };

        const renderResults = (items, isLoadMore = false) => {
            const curIsAr = (localStorage.getItem('preferredLang') || 'ar') === 'ar';
            const limit = getLimit();
            const startIndex = 0;
            const endIndex = currentSearchPage * limit;
            const pageItems = items.slice(startIndex, endIndex);

            const html = pageItems.map(entry => {
                return window.createDishCardHTML(entry.item, searchStore.variants, curIsAr, entry.ratingData, true);
            }).join('');

            let footerHTML = '';
            if (endIndex < items.length) {
                footerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; margin-top: 20px;">
                        <button id="loadMoreSearchBtn" class="btn-load-more">
                            <i class="fas fa-layer-group"></i>
                            <span>${curIsAr ? 'إظهار المزيد' : 'Load More'}</span>
                        </button>
                    </div>
                `;
            } else if (items.length > 0) {
                footerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; margin-top: 20px; color: var(--text-muted, #64748b); font-size: 0.85rem;">
                        <p>${curIsAr ? 'لقد وصلت إلى نهاية النتائج' : 'You have reached the end of results'}</p>
                    </div>
                `;
            }

            searchResultsGrid.innerHTML = html + footerHTML;

            // Apply Staggered / Hierarchical Cascade Animation to cards
            const cards = searchResultsGrid.querySelectorAll('.dish-card');
            cards.forEach((card, idx) => {
                card.classList.add('active');
                const staggerDelay = (idx % limit) * 0.035;
                card.style.animation = `staggerCascadeFade 0.38s cubic-bezier(0.16, 1, 0.3, 1) ${staggerDelay}s forwards`;
            });

            const btn = document.getElementById('loadMoreSearchBtn');
            if (btn) {
                btn.onclick = () => {
                    const originalBtnContent = btn.innerHTML;
                    // شيمر أنيق عند الضغط على إظهار المزيد أو التمرير
                    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>${curIsAr ? 'جاري التحميل...' : 'Loading...'}</span>`;

                    const existingCardsCount = searchResultsGrid.querySelectorAll('.dish-card').length;
                    const nextLimit = getLimit();

                    // إدراج شيمر مؤقت في أسفل النتائج بسلاسة
                    const shimmerHolder = document.createElement('div');
                    shimmerHolder.id = 'tempSearchShimmer';
                    shimmerHolder.style.display = 'contents';
                    let shimmerHTML = '';
                    for (let s = 0; s < Math.min(6, nextLimit); s++) {
                        shimmerHTML += `
                            <div class="search-skeleton-card">
                                <div class="skeleton-img-box shimmer-wave"></div>
                                <div class="skeleton-info-box">
                                    <div class="skeleton-text-line title shimmer-wave"></div>
                                    <div class="skeleton-text-line sub shimmer-wave"></div>
                                    <div class="skeleton-row-bottom">
                                        <div class="skeleton-text-line price shimmer-wave"></div>
                                        <div class="skeleton-circle-btn shimmer-wave"></div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }
                    shimmerHolder.innerHTML = shimmerHTML;
                    btn.parentElement.before(shimmerHolder);

                    setTimeout(() => {
                        const tempEl = document.getElementById('tempSearchShimmer');
                        if (tempEl) tempEl.remove();
                        currentSearchPage++;
                        renderResults(items, true);
                    }, 350);
                };
            }
        };

        const executeSearch = async (queryText) => {
            const curIsAr = (localStorage.getItem('preferredLang') || 'ar') === 'ar';
            const cleanQuery = queryText ? queryText.trim() : '';

            if (!cleanQuery) {
                renderDefaultSearchView();
                return;
            }

            if (!searchStore.isReady) {
                renderSearchShimmer(12);
                await initSearchStore();
            }

            const qNorm = normalizeSearchText(cleanQuery);
            const tokens = qNorm.split(' ').filter(Boolean);

            currentMatchedItems = searchStore.indexed.filter(entry => {
                return tokens.every(token => {
                    if (entry.norm.includes(token)) return true;
                    if (token.startsWith('ال') && token.length > 2 && entry.norm.includes(token.substring(2))) return true;
                    if (entry.norm.includes('ال' + token)) return true;
                    return false;
                });
            });

            currentSearchPage = 1;

            if (currentMatchedItems.length > 0) {
                renderResults(currentMatchedItems);
            } else {
                searchResultsGrid.innerHTML = `
                    <div class="search-empty-state" style="grid-column: 1 / -1;">
                        <div class="search-empty-icon-box">
                            <i class="fas fa-search-minus search-empty-icon" style="font-size: 26px;"></i>
                        </div>
                        <p class="search-empty-text">${curIsAr ? 'لم نجد أي منتج يطابق بحثك.' : 'No products matched your search.'}</p>
                    </div>
                `;
            }
        };

        // Event delegation on searchResultsGrid for Search History interactions & card clicks
        if (searchResultsGrid) {
            searchResultsGrid.addEventListener('click', (e) => {
                const clearSearchInputBtn = document.getElementById('clearSearchInputBtn');

                // 1. Click on search history text chip -> run search
                const nameBtn = e.target.closest('.history-tag-name');
                if (nameBtn) {
                    const term = nameBtn.getAttribute('data-term');
                    if (term && searchInput) {
                        searchInput.value = term;
                        if (clearSearchInputBtn) clearSearchInputBtn.style.display = 'inline-flex';
                        saveSearchHistory(term);
                        executeSearch(term);
                        searchInput.focus();
                    }
                    return;
                }

                // 2. Click on "X" button -> remove item from search history
                const removeBtn = e.target.closest('.history-tag-remove');
                if (removeBtn) {
                    e.stopPropagation();
                    const term = removeBtn.getAttribute('data-term');
                    if (term) {
                        removeSearchHistoryItem(term);
                        renderDefaultSearchView();
                    }
                    return;
                }

                // 3. Click on "Clear All" history button
                const clearAllBtn = e.target.closest('#clearAllSearchHistory');
                if (clearAllBtn) {
                    e.stopPropagation();
                    clearSearchHistory();
                    renderDefaultSearchView();
                    return;
                }

                // 4. Click on any product card -> save the current query to search history
                const dishCard = e.target.closest('.dish-card');
                if (dishCard && searchInput && searchInput.value.trim().length >= 2) {
                    saveSearchHistory(searchInput.value.trim());
                }
            });
        }

        // Live input handling: Instant 0ms filtering + auto-saving history + Clear X button
        if (searchInput) {
            let historySaveTimer = null;
            const clearSearchInputBtn = document.getElementById('clearSearchInputBtn');

            const updateClearBtn = () => {
                if (clearSearchInputBtn) {
                    clearSearchInputBtn.style.display = searchInput.value.trim().length > 0 ? 'inline-flex' : 'none';
                }
            };

            updateClearBtn();

            searchInput.addEventListener('input', () => {
                const query = searchInput.value;
                updateClearBtn();

                if (!query || query.trim().length === 0) {
                    clearTimeout(historySaveTimer);
                    renderDefaultSearchView();
                    return;
                }

                executeSearch(query);

                clearTimeout(historySaveTimer);
                if (query.trim().length >= 2) {
                    historySaveTimer = setTimeout(() => {
                        saveSearchHistory(query.trim());
                    }, 500);
                }
            });

            if (clearSearchInputBtn) {
                clearSearchInputBtn.onclick = (e) => {
                    e.preventDefault();
                    searchInput.value = '';
                    updateClearBtn();
                    renderDefaultSearchView();
                    searchInput.focus();
                };
            }

            // Save history immediately on Enter
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const query = searchInput.value.trim();
                    if (query.length >= 2) {
                        saveSearchHistory(query);
                        executeSearch(query);
                    }
                }
            });
        }
    };
    initMasterHeader();

    // 10. Master Site Theme Controller (Dark / Light Mode Toggle)
    const initSiteTheme = () => {
        const applySiteTheme = (theme) => {
            document.documentElement.setAttribute('data-theme', theme);
            if (theme === 'light') {
                document.body.classList.add('light-mode');
            } else {
                document.body.classList.remove('light-mode');
            }
            localStorage.setItem('userSiteTheme', theme);

            document.querySelectorAll('.site-theme-toggle').forEach(btn => {
                const sliderIcon = btn.querySelector('.switch-slider-icon');
                if (sliderIcon) {
                    sliderIcon.className = theme === 'light' ? 'fas fa-sun switch-slider-icon' : 'fas fa-moon switch-slider-icon';
                }
                
                const standardIcon = btn.querySelector('i:not(.switch-slider-icon)');
                if (standardIcon) {
                    standardIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
                }
            });
        };

        const savedTheme = localStorage.getItem('userSiteTheme') || 'dark';
        applySiteTheme(savedTheme);

        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.site-theme-toggle');
            if (btn) {
                e.preventDefault();
                const current = document.documentElement.getAttribute('data-theme') || 'dark';
                applySiteTheme(current === 'dark' ? 'light' : 'dark');
                return;
            }

            const langBtn = e.target.closest('.drawer-lang-toggle');
            if (langBtn) {
                e.preventDefault();
                const currentLang = localStorage.getItem('preferredLang') || 'ar';
                updateLanguage(currentLang === 'ar' ? 'en' : 'ar');
                return;
            }
        });
    };
    initSiteTheme();

    // 11. Smart Brands Slider Controller (Halts animation & hides duplicates if all unique brands fit on screen)
    const initBrandsSliderVisibility = () => {
        const checkBrandsOverflow = () => {
            const brandsSlider = document.getElementById('brandsSlider');
            if (!brandsSlider) return;
            const track = brandsSlider.querySelector('.brands-track');
            if (!track) return;

            const items = track.querySelectorAll('.brand-item');
            if (items.length === 0) return;

            // First 10 items are the unique set of brands
            const uniqueCount = 10;
            const gap = 16;
            let totalUniqueWidth = 0;

            const wasAllVisible = brandsSlider.classList.contains('brands-all-visible');
            if (wasAllVisible) {
                brandsSlider.classList.remove('brands-all-visible');
            }

            for (let i = 0; i < Math.min(uniqueCount, items.length); i++) {
                totalUniqueWidth += items[i].getBoundingClientRect().width;
            }
            if (uniqueCount > 1) {
                totalUniqueWidth += (uniqueCount - 1) * gap;
            }

            const container = brandsSlider.querySelector('.container') || brandsSlider;
            const availableWidth = container.clientWidth - 20;

            if (totalUniqueWidth > 0 && totalUniqueWidth <= availableWidth) {
                brandsSlider.classList.add('brands-all-visible');
            } else {
                brandsSlider.classList.remove('brands-all-visible');
            }
        };

        checkBrandsOverflow();
        window.addEventListener('resize', checkBrandsOverflow);
        window.addEventListener('load', checkBrandsOverflow);
        setTimeout(checkBrandsOverflow, 200);
        setTimeout(checkBrandsOverflow, 1000);

        if (window.ResizeObserver) {
            const brandsSlider = document.getElementById('brandsSlider');
            if (brandsSlider) {
                const ro = new ResizeObserver(() => checkBrandsOverflow());
                ro.observe(brandsSlider);
            }
        }
    };
    initBrandsSliderVisibility();
});
