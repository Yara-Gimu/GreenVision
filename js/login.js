/*
 * ==========================================================
 * ملف login.js - معالجة تسجيل الدخول
 * ==========================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- عناصر DOM ---
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitBtn = document.getElementById('submit-btn');
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    const successMessage = document.getElementById('success-message');
    const successText = document.getElementById('success-text');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const passwordToggle = document.getElementById('password-toggle');

    // --- بيانات المستخدمين التجريبية ---
    const demoUsers = {
        'operator@kau.edu.sa': {
            password: 'password123',
            role: 'operator',
            name: 'مشغّل الدرون',
            redirect: 'operator.html'
        },
        'specialist@kau.edu.sa': {
            password: 'password123',
            role: 'specialist',
            name: 'د. أحمد',
            redirect: 'specialist.html'
        }
    };

    // --- تبديل عرض كلمة المرور ---
    if (passwordToggle) {
        passwordToggle.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            
            // تغيير الأيقونة
            const icon = passwordToggle.querySelector('i');
            if (icon) {
                if (isPassword) {
                    icon.setAttribute('data-lucide', 'eye-off');
                } else {
                    icon.setAttribute('data-lucide', 'eye');
                }
                lucide.createIcons();
            }
        });
    }

    // --- دوال مساعدة ---
    function showError(message) {
        if (errorMessage && errorText) {
            errorText.textContent = message;
            errorMessage.classList.remove('hidden');
            if (successMessage) successMessage.classList.add('hidden');
        }
    }

    function showSuccess(message) {
        if (successMessage && successText) {
            successText.textContent = message;
            successMessage.classList.remove('hidden');
            if (errorMessage) errorMessage.classList.add('hidden');
        }
    }

    function hideMessages() {
        if (errorMessage) errorMessage.classList.add('hidden');
        if (successMessage) successMessage.classList.add('hidden');
        if (emailError) emailError.classList.add('hidden');
        if (passwordError) passwordError.classList.add('hidden');
    }

    function clearInputErrors() {
        if (emailInput) emailInput.classList.remove('input-error', 'shake-animation');
        if (passwordInput) passwordInput.classList.remove('input-error', 'shake-animation');
    }

    function showInputError(input, message) {
        input.classList.add('input-error', 'shake-animation');
        const errorElement = input.id === 'email' ? emailError : passwordError;
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
        
        // إزالة animation بعد انتهائها
        setTimeout(() => {
            input.classList.remove('shake-animation');
        }, 500);
    }

    function setLoadingState(loading) {
        if (submitBtn) {
            if (loading) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `
                    <i data-lucide="loader" class="w-5 h-5 me-2 rtl:me-0 rtl:ms-2 animate-spin"></i>
                    <span data-lang-ar="جاري تسجيل الدخول..." data-lang-en="Signing in...">جاري تسجيل الدخول...</span>
                `;
            } else {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `
                    <span data-lang-ar="تسجيل الدخول" data-lang-en="Sign In">تسجيل الدخول</span>
                `;
            }
            // إعادة إنشاء الأيقونات
            if (typeof lucide !== 'undefined' && lucide.createIcons) {
                lucide.createIcons();
            }
        }
    }

    // --- التحقق من صحة البيانات ---
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const kauRegex = /@kau\.edu\.sa$/i;
        
        if (!email) {
            return { valid: false, message: 'البريد الإلكتروني مطلوب' };
        }
        
        if (!emailRegex.test(email)) {
            return { valid: false, message: 'صيغة البريد الإلكتروني غير صحيحة' };
        }
        
        if (!kauRegex.test(email)) {
            return { valid: false, message: 'يجب استخدام البريد الجامعي @kau.edu.sa' };
        }
        
        return { valid: true };
    }

    function validatePassword(password) {
        if (!password) {
            return { valid: false, message: 'كلمة المرور مطلوبة' };
        }
        
        if (password.length < 6) {
            return { valid: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' };
        }
        
        return { valid: true };
    }

    // --- محاكاة عملية تسجيل الدخول ---
    async function simulateLogin(email, password) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // محاكاة تأخير الشبكة
                const user = demoUsers[email.toLowerCase()];
                
                if (user && user.password === password) {
                    resolve({
                        success: true,
                        user: user
                    });
                } else {
                    resolve({
                        success: false,
                        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
                    });
                }
            }, 1500); // تأخير 1.5 ثانية لمحاكاة الطلب الحقيقي
        });
    }

    // --- معالجة إرسال النموذج ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // إخفاء جميع الرسائل السابقة
            hideMessages();
            clearInputErrors();
            
            // الحصول على القيم
            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value : '';
            
            // التحقق من وجود العناصر الأساسية
            if (!emailInput || !passwordInput) {
                console.error('عناصر الإدخال غير موجودة');
                return;
            }
            
            // التحقق من الصحة
            const emailValidation = validateEmail(email);
            const passwordValidation = validatePassword(password);
            
            if (!emailValidation.valid) {
                showInputError(emailInput, emailValidation.message);
                emailInput.focus();
                return;
            }
            
            if (!passwordValidation.valid) {
                showInputError(passwordInput, passwordValidation.message);
                passwordInput.focus();
                return;
            }
            
            // بدء عملية تسجيل الدخول
            setLoadingState(true);
            
            try {
                const result = await simulateLogin(email, password);
                
                if (result.success) {
                    showSuccess(`مرحباً بعودتك، ${result.user.name}!`);
                    
                    // محاكاة الانتقال للصفحة التالية
                    setTimeout(() => {
                        showSuccess('جاري توجيهك إلى لوحة التحكم...');
                        
                        setTimeout(() => {
                            // في التطبيق الحقيقي، سيتم التوجيه للصفحة المناسبة
                            // window.location.href = result.user.redirect;
                            
                            // لأغراض العرض، سنظهر رسالة نجاح فقط
                            showSuccess('تم تسجيل الدخول بنجاح! (هذا عرض تجريبي)');
                            setLoadingState(false);
                            
                            // إعادة تعيين النموذج بعد نجاح التسجيل
                            loginForm.reset();
                            
                        }, 1000);
                    }, 1000);
                    
                } else {
                    showError(result.message);
                    setLoadingState(false);
                }
                
            } catch (error) {
                console.error('Login error:', error);
                showError('حدث خطأ في الخادم. الرجاء المحاولة مرة أخرى.');
                setLoadingState(false);
            }
        });
    }

    // --- التحقق الفوري أثناء الكتابة ---
    if (emailInput) {
        emailInput.addEventListener('input', () => {
            if (emailError && !emailError.classList.contains('hidden')) {
                const email = emailInput.value.trim();
                const validation = validateEmail(email);
                
                if (validation.valid) {
                    emailInput.classList.remove('input-error');
                    emailError.classList.add('hidden');
                }
            }
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            if (passwordError && !passwordError.classList.contains('hidden')) {
                const password = passwordInput.value;
                const validation = validatePassword(password);
                
                if (validation.valid) {
                    passwordInput.classList.remove('input-error');
                    passwordError.classList.add('hidden');
                }
            }
        });
    }

    // --- إعادة تعيين الأخطاء عند التركيز على الحقول ---
    if (emailInput) {
        emailInput.addEventListener('focus', () => {
            emailInput.classList.remove('input-error');
            if (emailError) emailError.classList.add('hidden');
            hideMessages();
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('focus', () => {
            passwordInput.classList.remove('input-error');
            if (passwordError) passwordError.classList.add('hidden');
            hideMessages();
        });
    }

    // --- إعادة تعيين النموذج عند تحميل الصفحة ---
    if (loginForm) {
        loginForm.reset();
        hideMessages();
        clearInputErrors();
    }

    // --- إعادة رسم الأيقونات ---
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        setTimeout(() => {
            lucide.createIcons();
        }, 100);
    }

    console.log('Login.js loaded successfully');
});