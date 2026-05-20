const API_URL = 'http://127.0.0.1:8000/api/v1';

document.addEventListener('DOMContentLoaded', () => {
    initFormSwitching();
    initRoleToggle();
    initPasswordToggles();
    initLoginForm();
    initRegisterForm();
    initAuthButton(); // Запускаем при загрузке любой страницы
});

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

function setGuestState(btn) {
    btn.innerHTML = 'Вход';
    btn.classList.remove('is-logged-in');
    btn.onclick = (e) => {
        e.preventDefault();
        window.location.href = 'profile.html'; // Твоя страница с формами
    };
}

// 2. Вход в систему
function initLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('loginInput')?.value;
        const password = document.getElementById('loginPassword')?.value;

        try {
            const response = await fetch(`${API_URL}/users/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('ck_access_token', data.access);
                localStorage.setItem('ck_refresh_token', data.refresh);
                
                // Ждем получения данных профиля перед редиректом
                await fetchUserData();
                
                alert('Вход выполнен!');
                window.location.href = 'index.html';
            } else {
                alert(data.error || 'Неверный логин или пароль');
            }
        } catch (error) {
            console.error('Ошибка входа:', error);
            alert('Сервер недоступен');
        }
    });
}

// 3. Получение данных профиля
async function fetchUserData() {
    const token = localStorage.getItem('ck_access_token');
    if (!token) return;

    try {
        const response = await fetch(`${API_URL}/users/me/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const user = await response.json();
            console.log('Ответ профиля:', response);
            localStorage.setItem('ck_currentUser', JSON.stringify(user));
            initAuthButton();
        }
    } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
        console.log('Ответ профиля:', response);
    }
}

// 4. Выход (window.logout доступен отовсюду)
window.logout = () => {
    localStorage.removeItem('ck_access_token');
    localStorage.removeItem('ck_refresh_token');
    localStorage.removeItem('ck_currentUser');
    localStorage.removeItem('ck_userAvatar');
    window.location.href = 'index.html';
};

// Привязываем выход к кнопке в Dashboard, если она есть
document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.logout();
});

// --- Вспомогательные функции фронтенда ---

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

function initRoleToggle() {
    const userBtn = document.querySelector('[data-role="user"]');
    const orgBtn = document.querySelector('[data-role="org"]');
    const userFields = document.querySelector('.user-fields');
    const orgFields = document.querySelector('.org-fields');
    if (!userBtn || !orgBtn || !userFields || !orgFields) return;
    userBtn.addEventListener('click', () => {
        userBtn.classList.add('active'); orgBtn.classList.remove('active');
        userFields.classList.remove('hidden'); orgFields.classList.add('hidden');
    });
    orgBtn.addEventListener('click', () => {
        orgBtn.classList.add('active'); userBtn.classList.remove('active');
        orgFields.classList.remove('hidden'); userFields.classList.add('hidden');
    });
}

function initPasswordToggles() {
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const wrapper = btn.closest('.password-input-wrapper');
            const input = wrapper?.querySelector('input');
            const eyeOn = btn.querySelector('.eye-icon');
            const eyeOff = btn.querySelector('.eye-off-icon');
            if (!input || !eyeOn || !eyeOff) return;
            if (input.type === 'password') {
                input.type = 'text'; eyeOn.classList.add('hidden'); eyeOff.classList.remove('hidden');
            } else {
                input.type = 'password'; eyeOn.classList.remove('hidden'); eyeOff.classList.add('hidden');
            }
        });
    });
}

async function initRegisterForm() {
    const form = document.getElementById('registerForm');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = form.querySelector('input[name="login"]')?.value;
        const email = form.querySelector('input[name="email"]')?.value;
        const password = form.querySelector('input[name="password"]')?.value;
        const passwordConfirm = form.querySelector('input[name="passwordConfirm"]')?.value;
        if (password !== passwordConfirm) { alert('Пароли не совпадают'); return; }
        try {
            const response = await fetch(`${API_URL}/users/`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            if (response.ok) {
                alert('Регистрация успешна!');
                document.querySelector('.switch-to-login')?.click();
            } else {
                const errorData = await response.json();
                alert('Ошибка: ' + JSON.stringify(errorData));
            }
        } catch (error) { console.error('Ошибка:', error); }
    });
}