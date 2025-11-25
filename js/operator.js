document.addEventListener('DOMContentLoaded', () => {
    
    // --- ضبط تاريخ المهمة إلى اليوم ---
    const missionDateInput = document.getElementById('mission-date');
    if (missionDateInput) {
        missionDateInput.valueAsDate = new Date();
    }

    // --- كود الإشعارات (Toast) ---
    const toast = document.getElementById('toast-notification');
    const toastMessage = document.getElementById('toast-message');
    const toastCloseBtn = document.getElementById('toast-close');
    let toastTimeout;

    const showToast = (messageAr, messageEn, type = 'success') => {
        if (!toast || !toastMessage) return;
        clearTimeout(toastTimeout);
        
        const currentLang = document.documentElement.getAttribute('lang') || 'ar';
        toastMessage.textContent = currentLang === 'ar' ? messageAr : messageEn;
        
        // تغيير لون الإشعار حسب النوع
        const bgColor = type === 'error' ? 'bg-red-500 dark:bg-red-600' : 'bg-green-500 dark:bg-green-600';
        toast.querySelector('div').className = `max-w-sm w-full ${bgColor} shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden`;
        
        toast.classList.remove('translate-x-full', 'rtl:-translate-x-full');
        toast.classList.add('translate-x-0', 'rtl:translate-x-0');

        toastTimeout = setTimeout(hideToast, 3000);
    };
    
    const hideToast = () => {
        if (!toast) return;
        toast.classList.add('translate-x-full', 'rtl:-translate-x-full');
        toast.classList.remove('translate-x-0', 'rtl:translate-x-0');
    };

    if (toastCloseBtn) {
        toastCloseBtn.addEventListener('click', hideToast);
    }

    // --- كود رفع الملفات (Drag & Drop) ---
    const dropZone = document.getElementById('file-drop-zone');
    const fileInput = document.getElementById('file-upload');
    const fileListContainer = document.getElementById('file-list');
    let selectedFiles = [];

    const updateFileList = () => {
        if (!fileListContainer) return;
        fileListContainer.innerHTML = '';
        
        if (selectedFiles.length === 0) {
            fileListContainer.innerHTML = `<p class="text-xs text-gray-500 italic" data-lang-ar="لم يتم اختيار ملفات" data-lang-en="No files selected"></p>`;
        } else {
            selectedFiles.forEach((file, index) => {
                const fileSize = formatFileSize(file.size);
                const fileItem = document.createElement('div');
                fileItem.className = 'flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded';
                fileItem.innerHTML = `
                    <div class="flex-1 min-w-0">
                        <span class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate block">${file.name}</span>
                        <span class="text-xs text-gray-500 dark:text-gray-400">${fileSize}</span>
                    </div>
                    <button type="button" class="remove-file-btn text-red-500 hover:text-red-700 ml-2" data-index="${index}">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                `;
                fileListContainer.appendChild(fileItem);
            });
            lucide.createIcons(); // إعادة رسم أيقونات الحذف
        }
        
        // استدعاء دالة اللغة العامة لترجمة العناصر الجديدة
        if (typeof setLanguage === 'function') {
            const currentLang = document.documentElement.getAttribute('lang') || 'ar';
            setLanguage(currentLang);
        }
    };

    // دالة لتنسيق حجم الملف
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            if (files.length > 10) {
                showToast('الحد الأقصى للملفات هو 10 ملفات', 'Maximum 10 files allowed', 'error');
                return;
            }
            selectedFiles = files;
            updateFileList();
        });
    }

    if (fileListContainer) {
        fileListContainer.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.remove-file-btn');
            if (removeBtn) {
                const indexToRemove = parseInt(removeBtn.getAttribute('data-index'), 10);
                selectedFiles.splice(indexToRemove, 1);
                
                const dataTransfer = new DataTransfer();
                selectedFiles.forEach(file => dataTransfer.items.add(file));
                fileInput.files = dataTransfer.files;

                updateFileList();
            }
        });
    }

    if (dropZone) {
        dropZone.addEventListener('click', () => fileInput.click());
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.add('file-drop-zone-active'));
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.remove('file-drop-zone-active'));
        });

        dropZone.addEventListener('drop', (e) => {
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 10) {
                showToast('الحد الأقصى للملفات هو 10 ملفات', 'Maximum 10 files allowed', 'error');
                return;
            }
            fileInput.files = e.dataTransfer.files;
            selectedFiles = files;
            updateFileList();
        });
    }
    
    // تحديث قائمة الملفات عند تحميل الصفحة (لإظهار "لم يتم اختيار ملفات")
    if (fileListContainer) {
        updateFileList();
    }

    // --- نظام شريط تقدم الرفع ---
    const uploadProgressContainer = document.getElementById('upload-progress-container');
    const uploadProgressBar = document.getElementById('upload-progress-bar');
    const uploadPercentage = document.getElementById('upload-percentage');
    const uploadStatus = document.getElementById('upload-status');
    const uploadSpeed = document.getElementById('upload-speed');
    const uploadTime = document.getElementById('upload-time');
    const cancelUploadBtn = document.getElementById('cancel-upload-btn');
    const submitBtn = document.getElementById('submit-btn');
    
    let uploadInProgress = false;
    let uploadCanceled = false;
    let uploadInterval = null;

    // دالة لإلغاء الرفع
    function cancelUpload() {
        if (uploadInProgress && !uploadCanceled) {
            uploadCanceled = true;
            if (uploadInterval) {
                clearInterval(uploadInterval);
                uploadInterval = null;
            }
            resetUploadProgress();
            showToast('تم إلغاء عملية الرفع', 'Upload canceled', 'error');
        }
    }

    // محاكاة عملية الرفع مع شريط التقدم
    function simulateUpload() {
        if (uploadInProgress) return;
        
        uploadInProgress = true;
        uploadCanceled = false;
        
        // إظهار شريط التقدم
        uploadProgressContainer.classList.remove('hidden');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i data-lucide="loader" class="w-5 h-5 me-2 rtl:me-0 rtl:ms-2 animate-spin"></i><span data-lang-ar="جاري الرفع..." data-lang-en="Uploading...">جاري الرفع...</span>';
        lucide.createIcons();
        
        let progress = 0;
        const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
        const startTime = Date.now();
        
        uploadInterval = setInterval(() => {
            if (uploadCanceled) {
                clearInterval(uploadInterval);
                uploadInterval = null;
                resetUploadProgress();
                return;
            }
            
            progress += Math.random() * 5; // زيادة عشوائية في التقدم
            if (progress > 100) progress = 100;
            
            // تحديث شريط التقدم
            uploadProgressBar.style.width = `${progress}%`;
            uploadPercentage.textContent = `${Math.round(progress)}%`;
            
            // حساب السرعة والوقت المتبقي
            const elapsedTime = (Date.now() - startTime) / 1000; // بالثواني
            const uploadedSize = (progress / 100) * totalSize;
            const currentSpeed = uploadedSize / elapsedTime; // بايت/ثانية
            
            if (progress < 100) {
                const remainingTime = ((100 - progress) / progress) * elapsedTime;
                uploadSpeed.textContent = `${formatFileSize(currentSpeed)}/s`;
                uploadTime.textContent = `${Math.round(remainingTime)}s ${getLangText('متبقي', 'remaining')}`;
            } else {
                uploadSpeed.textContent = '-';
                uploadTime.textContent = '-';
            }
            
            if (progress === 100) {
                clearInterval(uploadInterval);
                uploadInterval = null;
                setTimeout(() => {
                    resetUploadProgress();
                    completeMissionSubmission();
                }, 500);
            }
        }, 200);
    }
    
    function resetUploadProgress() {
        uploadInProgress = false;
        uploadCanceled = false;
        uploadProgressContainer.classList.add('hidden');
        uploadProgressBar.style.width = '0%';
        uploadPercentage.textContent = '0%';
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span data-lang-ar="إرسال المهمة" data-lang-en="Submit Mission">إرسال المهمة</span>';
        
        // إعادة تعيين النصوص
        uploadStatus.setAttribute('data-lang-ar', 'جاري الرفع...');
        uploadStatus.setAttribute('data-lang-en', 'Uploading...');
        uploadStatus.textContent = getLangText('جاري الرفع...', 'Uploading...');
        
        uploadSpeed.textContent = '-';
        uploadTime.textContent = '-';
        
        // إعادة رسم الأيقونات
        lucide.createIcons();
    }
    
    function completeMissionSubmission() {
        const missionName = document.getElementById('mission-name').value;
        const missionDateRaw = document.getElementById('mission-date').value;
        
        const dateObj = new Date(missionDateRaw + 'T00:00:00');
        const missionDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td class="py-4 whitespace-nowrap">${missionName}</td>
            <td class="py-4 whitespace-nowrap">${missionDate}</td>
            <td class="py-4 whitespace-nowrap">
                <span class="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100" data-lang-ar="قيد المعالجة" data-lang-en="Processing">
                    قيد المعالجة
                </span>
            </td>
            <td class="py-4 whitespace-nowrap">
                <button class="view-report-btn px-2 py-1 text-xs font-medium rounded text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30" data-mission-id="${Date.now()}">
                    <span data-lang-ar="عرض" data-lang-en="View">عرض</span>
                </button>
            </td>
        `;

        const historyTableBody = document.getElementById('history-table-body');
        if (historyTableBody) {
            historyTableBody.prepend(newRow);
        }

        showToast('تم إرسال المهمة بنجاح!', 'Mission submitted successfully!');

        missionForm.reset();
        selectedFiles = [];
        updateFileList();
        document.getElementById('mission-date').valueAsDate = new Date();
        
        // إعادة إرفاض مستمعات الأحداث للأزرار الجديدة
        attachViewReportListeners();
        
        // استدعاء دالة اللغة العامة لترجمة الصف الجديد
        if (typeof setLanguage === 'function') {
            const currentLang = document.documentElement.getAttribute('lang') || 'ar';
            setLanguage(currentLang);
        }
    }

    // --- إضافة مستمع حدث لزر إلغاء الرفع ---
    if (cancelUploadBtn) {
        cancelUploadBtn.addEventListener('click', cancelUpload);
    }

    // --- كود إرسال الفورم ---
    const missionForm = document.getElementById('mission-form');
    if (missionForm) {
        missionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (uploadInProgress) return;
            
            if (missionForm.checkValidity()) {
                if (selectedFiles.length === 0) {
                    showToast('الرجاء اختيار ملفات للمهمة', 'Please select files for the mission', 'error');
                    return;
                }
                
                // بدء عملية الرفع مع شريط التقدم
                simulateUpload();
            } else {
                showToast('الرجاء ملء جميع الحقول المطلوبة', 'Please fill all required fields', 'error');
            }
        });
    }

    // --- نظام عرض التقارير ---
    const reportModal = document.getElementById('report-modal');
    const reportContent = document.getElementById('report-content');
    const closeReportModal = document.getElementById('close-report-modal');
    const closeReportFooterBtn = document.getElementById('close-report-footer-btn');

    function openReportModal(missionId) {
        // محاكاة بيانات التقرير
        const reportData = {
            missionName: 'تفاصيل المهمة ' + missionId,
            date: new Date().toLocaleDateString('ar-SA'),
            status: 'قيد المعالجة',
            filesCount: selectedFiles.length,
            totalSize: formatFileSize(selectedFiles.reduce((sum, file) => sum + file.size, 0)),
            notes: document.getElementById('mission-notes').value || 'لا توجد ملاحظات إضافية'
        };
        
        reportContent.innerHTML = `
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <h4 class="font-medium text-gray-700 dark:text-gray-300" data-lang-ar="اسم المهمة" data-lang-en="Mission Name">اسم المهمة</h4>
                        <p class="text-gray-900 dark:text-white">${reportData.missionName}</p>
                    </div>
                    <div>
                        <h4 class="font-medium text-gray-700 dark:text-gray-300" data-lang-ar="التاريخ" data-lang-en="Date">التاريخ</h4>
                        <p class="text-gray-900 dark:text-white">${reportData.date}</p>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <h4 class="font-medium text-gray-700 dark:text-gray-300" data-lang-ar="الحالة" data-lang-en="Status">الحالة</h4>
                        <p class="text-yellow-600 dark:text-yellow-400">${reportData.status}</p>
                    </div>
                    <div>
                        <h4 class="font-medium text-gray-700 dark:text-gray-300" data-lang-ar="عدد الملفات" data-lang-en="Files Count">عدد الملفات</h4>
                        <p class="text-gray-900 dark:text-white">${reportData.filesCount}</p>
                    </div>
                </div>
                <div>
                    <h4 class="font-medium text-gray-700 dark:text-gray-300" data-lang-ar="الحجم الإجمالي" data-lang-en="Total Size">الحجم الإجمالي</h4>
                    <p class="text-gray-900 dark:text-white">${reportData.totalSize}</p>
                </div>
                <div>
                    <h4 class="font-medium text-gray-700 dark:text-gray-300" data-lang-ar="ملاحظات إضافية" data-lang-en="Additional Notes">ملاحظات إضافية</h4>
                    <p class="text-gray-900 dark:text-white">${reportData.notes}</p>
                </div>
            </div>
        `;
        
        reportModal.classList.remove('hidden');
        setTimeout(() => {
            reportModal.classList.add('opacity-100');
            reportModal.querySelector('.transform').classList.add('scale-100', 'opacity-100');
            reportModal.querySelector('.transform').classList.remove('scale-95', 'opacity-0');
        }, 10);
    }

    function closeReportModalFunc() {
        reportModal.querySelector('.transform').classList.add('scale-95', 'opacity-0');
        reportModal.querySelector('.transform').classList.remove('scale-100', 'opacity-100');
        reportModal.classList.remove('opacity-100');
        setTimeout(() => { reportModal.classList.add('hidden'); }, 300);
    }

    if (closeReportModal) closeReportModal.addEventListener('click', closeReportModalFunc);
    if (closeReportFooterBtn) closeReportFooterBtn.addEventListener('click', closeReportModalFunc);
    if (reportModal) {
        reportModal.addEventListener('click', (e) => {
            if (e.target === reportModal) { closeReportModalFunc(); }
        });
    }

    function attachViewReportListeners() {
        document.querySelectorAll('.view-report-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const missionId = e.currentTarget.getAttribute('data-mission-id');
                openReportModal(missionId);
            });
        });
    }

    // إرفاق مستمعات الأحداث الأولية
    attachViewReportListeners();

    // --- نظام حذف المهمات القديمة ---
    const clearOldMissionsBtn = document.getElementById('clear-old-missions');
    if (clearOldMissionsBtn) {
        clearOldMissionsBtn.addEventListener('click', () => {
            if (confirm(getLangText('هل تريد حذف المهمات المكتملة الأقدم من شهر؟', 'Delete completed missions older than 1 month?'))) {
                showToast('تم حذف المهمات القديمة', 'Old missions deleted successfully');
                // في التطبيق الحقيقي، سيتم إرسال طلب إلى الخادم لحذف المهمات
            }
        });
    }

    // --- دالة مساعدة للحصول على النص باللغة المناسبة ---
    function getLangText(arText, enText) {
        const currentLang = document.documentElement.getAttribute('lang') || 'ar';
        return currentLang === 'ar' ? arText : enText;
    }

    // إعادة رسم الأيقونات عند تحميل الصفحة
    lucide.createIcons();
});