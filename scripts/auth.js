document.addEventListener('DOMContentLoaded', () => {
    initFormSwitching();
    initRoleToggle();
    initPasswordToggles();
    initLoginForm();
    initRegisterForm();
    initAuthButton();
});

// вход и регистрация 
function initFormSwitching() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    document.querySelector('.switch-to-register')?.addEventListener('click', e => {
        e.preventDefault();
        loginForm?.classList.remove('active');
        registerForm?.classList.add('active');
    });
    document.querySelector('.switch-to-login')?.addEventListener('click', e => {
        e.preventDefault();
        registerForm?.classList.remove('active');
        loginForm?.classList.add('active');
    });
}

// пользователь и организация
function initRoleToggle() {
    const userBtn = document.querySelector('[data-role="user"]');
    const orgBtn = document.querySelector('[data-role="org"]');
    const userFields = document.querySelector('.user-fields');
    const orgFields = document.querySelector('.org-fields');
    const orgInnInput = document.querySelector('input[name="orgInn"]');

    if (!userBtn || !orgBtn || !userFields || !orgFields) return;

    userBtn.addEventListener('click', () => {
        userBtn.classList.add('active');
        orgBtn.classList.remove('active');
        userFields.classList.remove('hidden');
        orgFields.classList.add('hidden');
    });

    orgBtn.addEventListener('click', () => {
        orgBtn.classList.add('active');
        userBtn.classList.remove('active');
        orgFields.classList.remove('hidden');
        userFields.classList.add('hidden');
    });

    if (orgInnInput) {
        orgInnInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').slice(0, 12);
        });
    }
}

// глаз в пароле
function initPasswordToggles() {
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const wrapper = btn.closest('.password-input-wrapper');
            const input = wrapper?.querySelector('input');
            const eyeOn = btn.querySelector('.eye-icon');
            const eyeOff = btn.querySelector('.eye-off-icon');

            if (!input || !eyeOn || !eyeOff) return;

            if (input.type === 'password') {
                input.type = 'text';
                eyeOn.classList.add('hidden');
                eyeOff.classList.remove('hidden');
            } else {
                input.type = 'password';
                eyeOn.classList.remove('hidden');
                eyeOff.classList.add('hidden');
            }
        });
    });
}

// вход (временно)
function initLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    
    form.addEventListener('submit', e => {
        e.preventDefault();
        
        const email = form.querySelector('#loginInput')?.value || 'demo@user.ru';
        const user = {
            type: 'user',
            email: email,
            name: 'Пользователь',
            id: Date.now()
        };
        
        localStorage.setItem('ck_currentUser', JSON.stringify(user));
        
        alert('Вход выполнен!');
        window.location.href = 'index.html';
    });
}

// регистрация (времено)
function initRegisterForm() {
    const form = document.getElementById('registerForm');
    if (!form) return;
    
    form.addEventListener('submit', e => {
        e.preventDefault();
        
        const pass = form.querySelector('input[name="password"]')?.value;
        const passConf = form.querySelector('input[name="passwordConfirm"]')?.value;

        if (pass !== passConf) {
            alert('Пароли не совпадают');
            return;
        }
        
        alert('Регистрация успешна! Теперь можно войти.');
        form.reset();
        document.querySelector('.switch-to-login')?.click();
    });
}

// ===== ИНИЦИАЛИЗАЦИЯ КНОПКИ В ШАПКЕ =====
function initAuthButton() {
    const btn = document.getElementById('authButton');
    if (!btn) {
        console.warn('⚠️ Кнопка #authButton не найдена на этой странице');
        return;
    }

    const rawUser = localStorage.getItem('ck_currentUser');
    const savedAvatar = localStorage.getItem('ck_userAvatar');

    console.log('initAuthButton вызван. User:', rawUser, 'Avatar:', savedAvatar);

    if (rawUser) {
        try {
            const user = JSON.parse(rawUser);
            
            // Всегда показываем иконку человечка
            btn.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            `;
            
            // Если есть аватар — добавляем его
            if (savedAvatar) {
                const img = document.createElement('img');
                img.src = savedAvatar;
                img.alt = 'Аватар';
                btn.appendChild(img);
                btn.classList.add('is-logged-in');
                console.log('✅ Показываем аватар');
            } else {
                btn.classList.remove('is-logged-in');
                console.log('👤 Показываем иконку (нет аватара)');
            }
            
            btn.onclick = () => window.location.href = 'dashboard.html';
            
        } catch (e) {
            console.error('Ошибка:', e);
            btn.innerHTML = 'Вход';
            btn.classList.remove('is-logged-in');
            btn.onclick = () => window.location.href = 'profile.html';
        }
    } else {
        btn.innerHTML = 'Вход';
        btn.classList.remove('is-logged-in');
        btn.onclick = () => window.location.href = 'profile.html';
        console.log('🔘 Показываем "Вход"');
    }
}

// Убедитесь что эта функция в конце auth.js вызывается:
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthButton);
} else {
    initAuthButton();
}

// ===== ЗАГРУЗКА АВАТАРА =====
function loadAvatarToButton() {
    const btn = document.getElementById('authButton');
    if (!btn) return;
    
    const saved = localStorage.getItem('ck_userAvatar');
    const currentUser = localStorage.getItem('ck_currentUser');
    
    if (saved && currentUser) {
        btn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <img src="${saved}" alt="Аватар" />
        `;
        btn.classList.add('is-logged-in');
        console.log('✅ Аватар загружен');
    }
}

// Вызываем после initAuthButton
document.addEventListener('DOMContentLoaded', () => {
    initAuthButton();
    setTimeout(loadAvatarToButton, 100); // Небольшая задержка, чтобы auth.js успел отработать
});

// Надёжный запуск
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthButton);
} else {
    initAuthButton();
}

// для доступа
window.isAuthenticated = () => !!localStorage.getItem('ck_currentUser');
window.getCurrentUser = () => {
    const user = localStorage.getItem('ck_currentUser');
    return user ? JSON.parse(user) : null;
};
window.logout = () => {
    localStorage.removeItem('ck_currentUser');
    window.location.href = 'index.html';
};