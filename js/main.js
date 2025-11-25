/*
 * ==========================================================
 * ملف main.js - الأكواد المشتركة بين جميع الصفحات
 * ==========================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- تبديل اللغة ---
    const langToggle = document.getElementById('lang-toggle');
    const htmlElement = document.documentElement;
    
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            const currentLang = htmlElement.getAttribute('lang') || 'ar';
            const newLang = currentLang === 'ar' ? 'en' : 'ar';
            
            // تحديث لغة HTML
            htmlElement.setAttribute('lang', newLang);
            htmlElement.setAttribute('dir', newLang === 'ar' ? 'rtl' : 'ltr');
            
            // تحديث نص الزر
            const langText = langToggle.querySelector('span');
            if (langText) {
                langText.textContent = newLang === 'ar' ? 'EN' : 'AR';
            }
            
            // تحديث جميع النصوص متعددة اللغات
            updateLanguageTexts(newLang);
        });
    }
    
    // --- تبديل الوضع الداكن ---
    const themeToggle = document.getElementById('theme-toggle');
    const themeIconSun = document.getElementById('theme-icon-sun');
    const themeIconMoon = document.getElementById('theme-icon-moon');
    
    if (themeToggle) {
        // تحميل الوضع المحفوظ
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
            if (themeIconSun) themeIconSun.classList.remove('hidden');
            if (themeIconMoon) themeIconMoon.classList.add('hidden');
        } else {
            if (themeIconSun) themeIconSun.classList.add('hidden');
            if (themeIconMoon) themeIconMoon.classList.remove('hidden');
        }
        
        themeToggle.addEventListener('click', () => {
            const isDark = document.documentElement.classList.contains('dark');
            
            if (isDark) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
                if (themeIconSun) themeIconSun.classList.add('hidden');
                if (themeIconMoon) themeIconMoon.classList.remove('hidden');
            } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
                if (themeIconSun) themeIconSun.classList.remove('hidden');
                if (themeIconMoon) themeIconMoon.classList.add('hidden');
            }
        });
    }
    
    // --- إعدادات إمكانية الوصول ---
    const a11yToggle = document.getElementById('a11y-toggle');
    const a11yMenu = document.getElementById('a11y-menu');
    const a11yIncrease = document.getElementById('a11y-increase');
    const a11yDecrease = document.getElementById('a11y-decrease');
    const a11yReset = document.getElementById('a11y-reset');
    
    if (a11yToggle && a11yMenu) {
        a11yToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            a11yMenu.classList.toggle('hidden');
        });
        
        // إغلاق القائمة عند الضغط خارجها
        document.addEventListener('click', (e) => {
            if (!a11yToggle.contains(e.target) && !a11yMenu.contains(e.target)) {
                a11yMenu.classList.add('hidden');
            }
        });
    }
    
    // تكبير الخط
    if (a11yIncrease) {
        a11yIncrease.addEventListener('click', () => {
            changeFontSize(1);
        });
    }
    
    // تصغير الخط
    if (a11yDecrease) {
        a11yDecrease.addEventListener('click', () => {
            changeFontSize(-1);
        });
    }
    
    // إعادة تعيين الخط
    if (a11yReset) {
        a11yReset.addEventListener('click', () => {
            resetFontSize();
        });
    }
    
    // --- دوال مساعدة ---
    
    // تحديث النصوص حسب اللغة
    function updateLanguageTexts(lang) {
        const elements = document.querySelectorAll('[data-lang-ar], [data-lang-en]');
        
        elements.forEach(element => {
            const arText = element.getAttribute('data-lang-ar');
            const enText = element.getAttribute('data-lang-en');
            const placeholderAr = element.getAttribute('data-lang-placeholder-ar');
            const placeholderEn = element.getAttribute('data-lang-placeholder-en');
            
            if (arText && enText) {
                element.textContent = lang === 'ar' ? arText : enText;
            }
            
            if (placeholderAr && placeholderEn && element.placeholder !== undefined) {
                element.placeholder = lang === 'ar' ? placeholderAr : placeholderEn;
            }
        });
        
        // إعادة رسم الأيقونات
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            setTimeout(() => {
                lucide.createIcons();
            }, 100);
        }
    }
    
    // تغيير حجم الخط
    function changeFontSize(direction) {
        const html = document.documentElement;
        const currentSize = parseFloat(getComputedStyle(html).fontSize) || 16;
        const newSize = currentSize + (direction * 2);
        const minSize = 12;
        const maxSize = 24;
        
        if (newSize >= minSize && newSize <= maxSize) {
            html.style.fontSize = newSize + 'px';
            localStorage.setItem('fontSize', newSize);
        }
    }
    
    // إعادة تعيين حجم الخط
    function resetFontSize() {
        document.documentElement.style.fontSize = '';
        localStorage.removeItem('fontSize');
    }
    
    // تحميل حجم الخط المحفوظ
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
        document.documentElement.style.fontSize = savedFontSize + 'px';
    }
    
    // --- تهيئة أولية ---
    
    // تحديث النصوص باللغة الحالية
    const currentLang = htmlElement.getAttribute('lang') || 'ar';
    updateLanguageTexts(currentLang);
    
    // إعادة رسم الأيقونات
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        setTimeout(() => {
            lucide.createIcons();
        }, 100);
    }
    
    console.log('Main.js loaded successfully');
});