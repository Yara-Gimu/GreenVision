/*
 * ==========================================================
 * ملف specialist.js (الإصدار 7 - مع نظام التابات في المودال)
 * ==========================================================
 * الجديد:
 * - إضافة نظام التابات في النافذة المنبثقة
 * - تاب "ملخص التحليل" يحتوي على:
 *   - اقتراحات الذكاء الاصطناعي النصية
 *   - معرض صور (Carousel) لأهم 5 صور
 * - تاب "الخريطة الشاملة" يحتوي على صورة الخريطة
 * - تحسينات حجم النافذة المنبثقة لتكون أصغر حجماً
 * ==========================================================
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- عناصر التنقل (SPA) ---
    const navLinks = document.querySelectorAll('.nav-link');
    const views = {
        'nav-dashboard': document.getElementById('dashboard-view'),
        'nav-reports': document.getElementById('reports-view'),
        'nav-settings': document.getElementById('settings-view')
    };
    
    // --- عناصر المودال (Modal) ---
    const modal = document.getElementById('ai-modal');
    const modalContent = document.getElementById('modal-content');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const closeModalFooterBtn = document.getElementById('close-modal-footer-btn');

    // --- عناصر التابات ---
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // --- عناصر معرض الصور ---
    let currentSlide = 0;
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.carousel-indicator');
    const prevButton = document.querySelector('.carousel-nav.prev');
    const nextButton = document.querySelector('.carousel-nav.next');

    // --- عناصر قائمة الحالة (Status) ---
    const statusSelects = document.querySelectorAll('.status-select');

    // --- عناصر الإشعارات ---
    const notificationsToggle = document.getElementById('notifications-toggle');
    const notificationsMenu = document.getElementById('notifications-menu');
    const notificationDot = document.getElementById('notification-dot');

    // --- متغيرات الخريطة والرسم البياني ---
    let map = null;
    let speciesChart = null;

    // --- متغيرات نظام الفلاتر والبحث ---
    let allReports = [];
    let filteredReports = [];
    let currentFilters = {
        status: 'all',
        species: 'all',
        date: 'all',
        search: '',
        sort: 'date-desc'
    };

    // --- كود التنقل (SPA) ---
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const clickedLink = e.currentTarget;
            const viewId = clickedLink.id;

            // التأكد أن العرض (view) موجود
            if (!views[viewId]) {
                return;
            }

            // تحديث الأزرار
            navLinks.forEach(l => l.classList.remove('nav-link-active'));
            clickedLink.classList.add('nav-link-active');

            // تحديث العرض
            Object.values(views).forEach(view => {
                if (view) view.classList.add('hidden');
            });
            views[viewId].classList.remove('hidden');
            
            // إذا كان العرض هو لوحة التحكم، نقوم بإعادة رسم الخريطة والرسم البياني
            if (viewId === 'nav-dashboard') {
                setTimeout(() => {
                    initMap();
                    initSpeciesChart();
                }, 100);
            }
            
            // إذا كان العرض هو إدارة التقارير، نقوم بتهيئة نظام الفلاتر
            if (viewId === 'nav-reports') {
                setTimeout(() => {
                    initFilters();
                    lucide.createIcons();
                }, 100);
            }
            
            // إعادة رسم الأيقونات عند التنقل بين الصفحات
            lucide.createIcons();
        });
    });
    
    // --- كود المودال (Modal) ---
    const openModal = () => {
        if (!modal || !modalContent) return;
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.add('opacity-100');
            modalContent.classList.add('scale-100', 'opacity-100');
            modalContent.classList.remove('scale-95', 'opacity-0');
        }, 10);
        
        // إعادة تعيين التاب النشط إلى "ملخص التحليل"
        switchTab('summary');
        
        // إعادة تعيين معرض الصور إلى الشريحة الأولى
        currentSlide = 0;
        updateCarousel();
        
        // إعادة رسم الأيقونات داخل المودال
        lucide.createIcons();
    };
    
    const closeModal = () => {
        if (!modal || !modalContent) return;
        modalContent.classList.add('scale-95', 'opacity-0');
        modalContent.classList.remove('scale-100', 'opacity-100');
        modal.classList.remove('opacity-100');
        setTimeout(() => { modal.classList.add('hidden'); }, 300);
    };
    
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('.open-modal-btn')) {
            openModal();
        }
    });
    
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (closeModalFooterBtn) closeModalFooterBtn.addEventListener('click', closeModal);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) { closeModal(); }
        });
    }

    // --- كود التابات ---
    function switchTab(tabName) {
        // تحديد الأزرار النشطة
        tabButtons.forEach(btn => {
            if (btn.dataset.tab === tabName) {
                btn.classList.add('tab-active', 'bg-brand-green', 'text-white');
            } else {
                btn.classList.remove('tab-active', 'bg-brand-green', 'text-white');
                btn.classList.add('bg-white', 'text-gray-700', 'dark:bg-gray-800', 'dark:text-gray-300');
            }
        });
        
        // تحديد المحتوى النشط
        tabContents.forEach(content => {
            if (content.id === `tab-content-${tabName}`) {
                content.classList.remove('hidden');
            } else {
                content.classList.add('hidden');
            }
        });
    }
    
    // إضافة مستمعات الأحداث لأزرار التابات
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });

    // --- كود معرض الصور ---
    function updateCarousel() {
        // تحديث الشرائح
        slides.forEach((slide, index) => {
            if (index === currentSlide) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
        
        // تحديث المؤشرات
        indicators.forEach((indicator, index) => {
            if (index === currentSlide) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        updateCarousel();
    }
    
    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        updateCarousel();
    }
    
    function goToSlide(index) {
        currentSlide = index;
        updateCarousel();
    }
    
    // إضافة مستمعات الأحداث لمعرض الصور
    if (prevButton) {
        prevButton.addEventListener('click', prevSlide);
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', nextSlide);
    }
    
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            goToSlide(index);
        });
    });

    // --- كود ألوان قائمة الحالة (Status) ---
    const updateSelectColor = (selectEl) => {
        const selectedValue = selectEl.value;
        selectEl.classList.remove('status-pending', 'status-in-progress', 'status-completed');
        if (selectedValue === 'pending') { selectEl.classList.add('status-pending'); }
        else if (selectedValue === 'in-progress') { selectEl.classList.add('status-in-progress'); }
        else if (selectedValue === 'completed') { selectEl.classList.add('status-completed'); }
    };
    
    statusSelects.forEach(select => {
        updateSelectColor(select);
        select.addEventListener('change', (e) => {
            updateSelectColor(e.target);
        });
    });

    // --- كود قائمة الإشعارات ---
    if (notificationsToggle && notificationsMenu) {
        notificationsToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationsMenu.classList.toggle('hidden');
            
            // إعادة رسم الأيقونات داخل القائمة المنسدلة
            if (!notificationsMenu.classList.contains('hidden')) {
                lucide.createIcons();
                // إخفاء النقطة الحمراء عند الفتح
                if (notificationDot) notificationDot.classList.add('hidden');
            }
        });
    }

    // --- إغلاق قائمة الإشعارات عند الضغط خارجها ---
    window.addEventListener('click', (e) => {
        // إغلاق قائمة الإشعارات
        if (notificationsMenu && !notificationsMenu.classList.contains('hidden')) {
            if (!notificationsMenu.contains(e.target) && !notificationsToggle.contains(e.target)) {
                notificationsMenu.classList.add('hidden');
            }
        }
    });

    // --- ربط زر "عرض كل الإشعارات" ---
    const viewAllReportsLink = document.getElementById('view-all-reports-link');
    if (viewAllReportsLink) {
        viewAllReportsLink.addEventListener('click', (e) => {
            e.preventDefault();

            // 1. إغلاق قائمة الإشعارات
            if (notificationsMenu) notificationsMenu.classList.add('hidden');
            
            // 2. تفعيل رابط "إدارة التقارير" في الشريط الجانبي
            const reportsNavLink = document.getElementById('nav-reports');
            if (reportsNavLink) reportsNavLink.click();
        });
    }

    // --- تهيئة الخريطة التفاعلية ---
    function initMap() {
        // إذا كانت الخريطة موجودة بالفعل، نقوم بإزالتها أولاً
        if (map) {
            map.remove();
        }
        
        // إنشاء الخريطة
        map = L.map('map').setView([24.7136, 46.6753], 6); // مركز الخريطة على الرياض
        
        // إضافة طبقة الخريطة الأساسية
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        // بيانات النقاط (نقاط عشوائية في المملكة العربية السعودية)
        const riskPoints = [
            { lat: 24.7136, lng: 46.6753, risk: 'high', title: 'الرياض - خطر عالي' },
            { lat: 21.4858, lng: 39.1925, risk: 'medium', title: 'مكة المكرمة - خطر متوسط' },
            { lat: 24.4709, lng: 39.6122, risk: 'low', title: 'المدينة المنورة - خطر منخفض' },
            { lat: 26.4207, lng: 50.0888, risk: 'high', title: 'الدمام - خطر عالي' },
            { lat: 26.2124, lng: 50.5821, risk: 'medium', title: 'الخبر - خطر متوسط' },
            { lat: 24.4539, lng: 54.3773, risk: 'low', title: 'أبو ظبي - خطر منخفض' },
            { lat: 27.5142, lng: 41.7341, risk: 'high', title: 'حائل - خطر عالي' },
            { lat: 18.2206, lng: 42.5056, risk: 'medium', title: 'أبها - خطر متوسط' },
            { lat: 17.4919, lng: 44.1312, risk: 'low', title: 'نجران - خطر منخفض' },
            { lat: 28.3972, lng: 36.5789, risk: 'high', title: 'تبوك - خطر عالي' }
        ];
        
        // إضافة النقاط إلى الخريطة
        riskPoints.forEach(point => {
            let markerColor;
            let iconSize = [12, 12];
            
            // تحديد لون النقطة بناءً على مستوى الخطورة
            switch(point.risk) {
                case 'high':
                    markerColor = 'red';
                    iconSize = [15, 15];
                    break;
                case 'medium':
                    markerColor = 'orange';
                    iconSize = [12, 12];
                    break;
                case 'low':
                    markerColor = 'green';
                    iconSize = [10, 10];
                    break;
            }
            
            // إنشاء أيقونة دائرية ملونة
            const circleIcon = L.divIcon({
                className: 'custom-circle-marker',
                html: `<div style="background-color: ${markerColor}; width: ${iconSize[0]}px; height: ${iconSize[1]}px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
                iconSize: iconSize,
                iconAnchor: [iconSize[0]/2, iconSize[1]/2]
            });
            
            // إضافة النقطة إلى الخريطة
            L.marker([point.lat, point.lng], { icon: circleIcon })
                .addTo(map)
                .bindPopup(`<b>${point.title}</b><br>تم اكتشاف نوع نباتي غازي في هذه المنطقة.`);
        });
    }

    // --- تهيئة الرسم البياني التفاعلي ---
    function initSpeciesChart() {
        const ctx = document.getElementById('species-chart');
        
        // إذا كان الرسم البياني موجوداً بالفعل، نقوم بتدميره أولاً
        if (speciesChart) {
            speciesChart.destroy();
        }
        
        // إنشاء الرسم البياني الجديد
        speciesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Prosopis juliflora', 'Opuntia ficus-indica', 'Nicotiana glauca', 'Tamarix aphylla', 'Cenchrus ciliaris'],
                datasets: [{
                    label: 'عدد الاكتشافات',
                    data: [420, 380, 290, 250, 180],
                    backgroundColor: [
                        'rgba(239, 68, 68, 0.7)',   // أحمر
                        'rgba(249, 115, 22, 0.7)',  // برتقالي
                        'rgba(234, 179, 8, 0.7)',   // أصفر
                        'rgba(34, 197, 94, 0.7)',   // أخضر
                        'rgba(59, 130, 246, 0.7)'   // أزرق
                    ],
                    borderColor: [
                        'rgb(239, 68, 68)',
                        'rgb(249, 115, 22)',
                        'rgb(234, 179, 8)',
                        'rgb(34, 197, 94)',
                        'rgb(59, 130, 246)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `عدد الاكتشافات: ${context.parsed.y}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'عدد الاكتشافات'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'أنواع النباتات الغازية'
                        }
                    }
                }
            }
        });
    }

    // --- وظيفة تحميل ملف ZIP للصور المُعالجة ---
    function handleImageDownload(e) {
        e.preventDefault();
        
        // محاكاة عملية تحميل ملف ZIP
        const button = e.target.closest('.download-images-btn');
        const originalText = button.innerHTML;
        
        // تغيير النص أثناء التحميل
        button.innerHTML = '<i data-lucide="loader" class="w-4 h-4 me-1 rtl:me-0 rtl:ms-1 animate-spin"></i><span data-lang-ar="جاري التحميل..." data-lang-en="Downloading...">جاري التحميل...</span>';
        lucide.createIcons();
        
        // محاكاة تأخير التحميل
        setTimeout(() => {
            // إنشاء ملف ZIP وهمي للتحميل
            const zipFileName = 'processed_images.zip';
            
            // محاكاة عملية تحميل الملف
            const link = document.createElement('a');
            link.href = '#'; // في التطبيق الحقيقي، سيكون هذا رابط الملف الفعلي
            link.download = zipFileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // إرجاع النص الأصلي للزر
            button.innerHTML = originalText;
            lucide.createIcons();
            
            // إظهار رسالة نجاح
            alert('تم بدء تحميل ملف ZIP بنجاح! يحتوي الملف على الصور الأصلية بعد معالجتها بواسطة الذكاء الاصطناعي.');
        }, 1500);
    }

    // --- إضافة مستمع حدث لأزرار تحميل الصور ---
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('.download-images-btn')) {
            handleImageDownload(e);
        }
    });

    // --- نظام الفلاتر والبحث ---
    function initFilters() {
        // تهيئة البيانات الوهمية للتقارير
        allReports = [
            {
                id: 1,
                mission: 'Wadi Hanifa - Nov 2025',
                species: 'Prosopis juliflora',
                date: '05 Nov 2025',
                status: 'pending',
                coordinates: { lat: 24.7136, lng: 46.6753 }
            },
            {
                id: 2,
                mission: 'North Riyadh Scan',
                species: 'Opuntia ficus-indica',
                date: '03 Nov 2025',
                status: 'in-progress',
                coordinates: { lat: 24.8136, lng: 46.7753 }
            },
            {
                id: 3,
                mission: 'Southern Region Survey',
                species: 'Nicotiana glauca',
                date: '01 Nov 2025',
                status: 'completed',
                coordinates: { lat: 18.2206, lng: 42.5056 }
            },
            {
                id: 4,
                mission: 'Eastern Province Scan',
                species: 'Tamarix aphylla',
                date: '29 Oct 2025',
                status: 'pending',
                coordinates: { lat: 26.4207, lng: 50.0888 }
            },
            {
                id: 5,
                mission: 'Central Region Analysis',
                species: 'Prosopis juliflora',
                date: '27 Oct 2025',
                status: 'completed',
                coordinates: { lat: 24.7136, lng: 46.6753 }
            },
            {
                id: 6,
                mission: 'Western Coast Survey',
                species: 'Opuntia ficus-indica',
                date: '25 Oct 2025',
                status: 'in-progress',
                coordinates: { lat: 21.4858, lng: 39.1925 }
            },
            {
                id: 7,
                mission: 'Northern Borders Inspection',
                species: 'Nicotiana glauca',
                date: '23 Oct 2025',
                status: 'pending',
                coordinates: { lat: 28.3972, lng: 36.5789 }
            },
            {
                id: 8,
                mission: 'Central Desert Scan',
                species: 'Tamarix aphylla',
                date: '21 Oct 2025',
                status: 'completed',
                coordinates: { lat: 24.7136, lng: 46.6753 }
            }
        ];

        // إضافة مستمعات الأحداث للفلاتر
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.currentTarget.dataset.filter;
                currentFilters.status = filter;
                updateActiveFilterButtons();
                applyFilters();
            });
        });

        document.getElementById('species-filter').addEventListener('change', (e) => {
            currentFilters.species = e.target.value;
            applyFilters();
        });

        document.getElementById('date-filter').addEventListener('change', (e) => {
            currentFilters.date = e.target.value;
            applyFilters();
        });

        document.getElementById('search-input').addEventListener('input', (e) => {
            currentFilters.search = e.target.value.toLowerCase();
            applyFilters();
        });

        document.getElementById('sort-by').addEventListener('change', (e) => {
            currentFilters.sort = e.target.value;
            applyFilters();
        });

        document.getElementById('reset-filters').addEventListener('click', (e) => {
            resetFilters();
        });

        // تطبيق الفلاتر الأولية
        applyFilters();
    }

    function updateActiveFilterButtons() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            if (btn.dataset.filter === currentFilters.status) {
                btn.classList.add('filter-active', 'bg-brand-green', 'text-white');
                btn.classList.remove('bg-white', 'text-gray-700', 'dark:bg-gray-800', 'dark:text-gray-300');
            } else {
                btn.classList.remove('filter-active', 'bg-brand-green', 'text-white');
                btn.classList.add('bg-white', 'text-gray-700', 'dark:bg-gray-800', 'dark:text-gray-300');
            }
        });
    }

    function applyFilters() {
        filteredReports = allReports.filter(report => {
            // فلترة حسب الحالة
            if (currentFilters.status !== 'all' && report.status !== currentFilters.status) {
                return false;
            }

            // فلترة حسب النوع النباتي
            if (currentFilters.species !== 'all' && report.species !== currentFilters.species) {
                return false;
            }

            // فلترة حسب البحث النصي
            if (currentFilters.search && !report.mission.toLowerCase().includes(currentFilters.search) && 
                !report.species.toLowerCase().includes(currentFilters.search)) {
                return false;
            }

            // فلترة حسب التاريخ (تنفيذ مبسط)
            if (currentFilters.date !== 'all') {
                // في التطبيق الحقيقي، سيتم تنفيذ فلترة التاريخ بشكل دقيق
                // هذا تنفيذ مبسط لأغراض العرض
                const reportDate = new Date(report.date);
                const today = new Date();
                
                if (currentFilters.date === 'today') {
                    if (reportDate.toDateString() !== today.toDateString()) return false;
                } else if (currentFilters.date === 'week') {
                    const weekAgo = new Date(today);
                    weekAgo.setDate(today.getDate() - 7);
                    if (reportDate < weekAgo) return false;
                } else if (currentFilters.date === 'month') {
                    const monthAgo = new Date(today);
                    monthAgo.setMonth(today.getMonth() - 1);
                    if (reportDate < monthAgo) return false;
                }
            }

            return true;
        });

        // ترتيب النتائج
        sortReports();

        // تحديث واجهة المستخدم
        updateReportsTable();
        updateResultsCount();
        updateFilterCounts();
    }

    function sortReports() {
        filteredReports.sort((a, b) => {
            switch (currentFilters.sort) {
                case 'date-desc':
                    return new Date(b.date) - new Date(a.date);
                case 'date-asc':
                    return new Date(a.date) - new Date(b.date);
                case 'name':
                    return a.mission.localeCompare(b.mission);
                default:
                    return 0;
            }
        });
    }

    function updateReportsTable() {
        const tableBody = document.getElementById('reports-table-body');
        const noResults = document.getElementById('no-results');

        if (filteredReports.length === 0) {
            tableBody.innerHTML = '';
            noResults.classList.remove('hidden');
            return;
        }

        noResults.classList.add('hidden');

        tableBody.innerHTML = filteredReports.map(report => `
            <tr>
                <td class="py-4 whitespace-nowrap">${report.mission}</td>
                <td class="py-4 whitespace-nowrap">${report.species}</td>
                <td class="py-4 whitespace-nowrap">${report.date}</td>
                <td class="py-4 whitespace-nowrap">
                    <button class="open-modal-btn px-3 py-1 text-sm font-medium rounded-md text-white bg-brand-green-light hover:bg-brand-green" data-lang-ar="عرض" data-lang-en="View">
                        عرض
                    </button>
                </td>
                <td class="py-4 whitespace-nowrap">
                    <button class="download-images-btn px-3 py-1 text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 flex items-center">
                        <i data-lucide="file-zip" class="w-4 h-4 me-1 rtl:me-0 rtl:ms-1"></i>
                        <span data-lang-ar="تحميل" data-lang-en="Download">تحميل</span>
                    </button>
                </td>
                <td class="py-4 whitespace-nowrap">
                    <select class="status-select ${getStatusClass(report.status)}" data-report-id="${report.id}">
                        <option value="pending" ${report.status === 'pending' ? 'selected' : ''} data-lang-ar="قيد المراجعة" data-lang-en="Pending">قيد المراجعة</option>
                        <option value="in-progress" ${report.status === 'in-progress' ? 'selected' : ''} data-lang-ar="تحت المعالجة" data-lang-en="In Progress">تحت المعالجة</option>
                        <option value="completed" ${report.status === 'completed' ? 'selected' : ''} data-lang-ar="تم الانتهاء" data-lang-en="Completed">تم الانتهاء</option>
                    </select>
                </td>
            </tr>
        `).join('');

        // إعادة إرفاق مستمعات الأحداث للأزرار الجديدة
        document.querySelectorAll('.status-select').forEach(select => {
            updateSelectColor(select);
            select.addEventListener('change', (e) => {
                updateSelectColor(e.target);
                // تحديث حالة التقرير في البيانات
                const reportId = parseInt(e.target.dataset.reportId);
                const newStatus = e.target.value;
                const report = allReports.find(r => r.id === reportId);
                if (report) {
                    report.status = newStatus;
                    updateFilterCounts();
                }
            });
        });

        // إعادة رسم الأيقونات
        lucide.createIcons();
    }

    function getStatusClass(status) {
        switch (status) {
            case 'pending': return 'status-pending';
            case 'in-progress': return 'status-in-progress';
            case 'completed': return 'status-completed';
            default: return '';
        }
    }

    function updateResultsCount() {
        const resultsCount = document.getElementById('results-count');
        const total = allReports.length;
        const showing = filteredReports.length;
        
        if (showing === total) {
            resultsCount.textContent = `عرض ${showing} من ${total} تقرير`;
            resultsCount.setAttribute('data-lang-ar', `عرض ${showing} من ${total} تقرير`);
            resultsCount.setAttribute('data-lang-en', `Showing ${showing} of ${total} reports`);
        } else {
            resultsCount.textContent = `عرض ${showing} من ${total} تقرير (تمت الفلترة)`;
            resultsCount.setAttribute('data-lang-ar', `عرض ${showing} من ${total} تقرير (تمت الفلترة)`);
            resultsCount.setAttribute('data-lang-en', `Showing ${showing} of ${total} reports (filtered)`);
        }
    }

    function updateFilterCounts() {
        // حساب عدد التقارير لكل حالة
        const counts = {
            all: allReports.length,
            pending: allReports.filter(r => r.status === 'pending').length,
            'in-progress': allReports.filter(r => r.status === 'in-progress').length,
            completed: allReports.filter(r => r.status === 'completed').length
        };

        // تحديث الأرقام على أزرار الفلاتر
        document.querySelectorAll('.filter-btn').forEach(btn => {
            const filter = btn.dataset.filter;
            const countElement = btn.querySelector('.filter-count');
            if (countElement) {
                countElement.textContent = counts[filter];
            }
        });
    }

    function resetFilters() {
        currentFilters = {
            status: 'all',
            species: 'all',
            date: 'all',
            search: '',
            sort: 'date-desc'
        };

        // إعادة تعيين واجهة المستخدم
        document.getElementById('search-input').value = '';
        document.getElementById('species-filter').value = 'all';
        document.getElementById('date-filter').value = 'all';
        document.getElementById('sort-by').value = 'date-desc';
        
        updateActiveFilterButtons();
        applyFilters();
    }

    // --- تهيئة الخريطة والرسم البياني عند تحميل الصفحة ---
    setTimeout(() => {
        initMap();
        initSpeciesChart();
        // إعادة رسم الأيقونات للتأكد من ظهور أيقونة file-zip
        lucide.createIcons();
    }, 500);
});