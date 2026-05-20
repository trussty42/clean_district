let historyData = [];
let currentUser = null;

const achievementsData = [
    { 
        id: 1, 
        title: 'Новичок', 
        desc: 'Первая сдача отходов', 
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>', 
        unlocked: true 
    },
    { 
        id: 2, 
        title: 'Эко-герой', 
        desc: 'Сдал 50 кг вторсырья', 
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>', 
        unlocked: true 
    },
    { 
        id: 3, 
        title: 'Год в строю', 
        desc: 'Пользуетесь платформой 1 год', 
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>', 
        unlocked: false 
    },
    { 
        id: 4, 
        title: 'Мега-сборщик', 
        desc: 'Сдал 100 кг вторсырья', 
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/></svg>', 
        unlocked: false 
    },
    { 
        id: 5, 
        title: 'Мастер сортировки', 
        desc: 'Сдал 5 разных типов отходов', 
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>', 
        unlocked: false 
    },
    { 
        id: 6, 
        title: 'Эко-фрилансер', 
        desc: 'Заработал больше 1 тысячи рублей', 
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>', 
        unlocked: false 
    },
    { 
        id: 7, 
        title: 'Критик', 
        desc: 'Оценил 5 разных пунктов приёма', 
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>', 
        unlocked: false 
    },
    { 
        id: 8, 
        title: 'Мусорный магнат', 
        desc: 'Заработал больше 10 тысяч рублей', 
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M3 20h18"/></svg>', 
        unlocked: false 
    },
    { 
        id: 9, 
        title: 'Супер-эколог', 
        desc: 'Сдал 250 кг вторсырья', 
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>', 
        unlocked: false 
    },
    { 
        id: 10, 
        title: 'Главный утилизатор', 
        desc: 'Создал организацию по сбору отходов', 
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>', 
        unlocked: false 
    },
    { 
        id: 11, 
        title: 'Ветеран переработки', 
        desc: 'Пользуетесь платформой 3 года', 
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>', 
        unlocked: false 
    },
    { 
        id: 12, 
        title: 'Легенда переработки', 
        desc: 'Сдал 500 кг вторсырья', 
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>', 
        unlocked: false 
    }
];

const organizationsData = [];

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', async () => {
    await loadProfile();
    loadHistory();
    initProfileForm();
    initOrgModalOnce();
    initTabs();
    initLogout();
    initAvatarUpload();
    loadSavedAvatar();
});

function initTabs() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            
            item.classList.add('active');
            const tabId = item.dataset.tab;
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

async function loadProfile() {
    const token = localStorage.getItem('ck_access_token');

    const response = await fetch(`${API_URL}/users/me/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const user = await response.json();

    currentUser = user;
    localStorage.setItem('ck_currentUser', JSON.stringify(user));

    fillProfile(user);
    initOrganizations();
}

function fillProfile(user) {

    document.getElementById('userName').textContent = user.username || '';

    const joinedEl = document.getElementById('userJoined');
    if (joinedEl) {
        joinedEl.textContent = 'c нами с ' + formatDate(user.created_at);
    }
    document.getElementById('inputLogin').textContent = user.username || '';

    document.getElementById('inputSurname').value = user.last_name || '';
    document.getElementById('inputName').value = user.first_name || '';
    document.getElementById('inputMiddleName').value = user.middle_name || '';

    document.getElementById('inputLogin').value = user.username || '';
    document.getElementById('inputEmail').value = user.email || '';
    document.getElementById('inputCity').value = user.city || '';
}

function initProfileForm() {
    const form = document.getElementById('profileForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('ck_access_token');

        const data = {
            username: document.getElementById('inputLogin').value,
            email: document.getElementById('inputEmail').value,
            first_name: document.getElementById('inputName').value,
            last_name: document.getElementById('inputSurname').value,
            middle_name: document.getElementById('inputMiddleName').value
        };

        try {
            const response = await fetch(`${API_URL}/users/me/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Ошибка обновления');
            }

            const updatedUser = await response.json();
            localStorage.setItem('ck_currentUser', JSON.stringify(updatedUser));

            toasts.success('Профиль обновлён');

        } catch (err) {
            console.error(err);
            toasts.error('Ошибка при обновлении');
        }
    });
}

function initAvatarUpload() {
    const avatarInput = document.getElementById('avatarInput');
    const avatarPreview = document.getElementById('avatarPreview');
    const removeAvatarBtn = document.getElementById('removeAvatar');
    
    if (!avatarInput || !avatarPreview) return;

    avatarPreview.addEventListener('click', () => {
        avatarInput.click();
    });

    avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('Файл слишком большой. Максимум 5MB.');
            return;
        }

        if (!file.type.startsWith('image/')) {
            alert('Пожалуйста, выберите изображение (JPG, PNG)');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target.result;
            updateFormAvatar(base64);
            localStorage.setItem('ck_userAvatar', base64);
            updateAvatarEverywhere(base64);
            
            if (removeAvatarBtn) {
                removeAvatarBtn.style.display = 'inline-block';
            }
        };
        reader.readAsDataURL(file);
    });

    if (removeAvatarBtn) {
        removeAvatarBtn.addEventListener('click', () => {
            localStorage.removeItem('ck_userAvatar');
            updateAvatarEverywhere(null);
            removeAvatarBtn.style.display = 'none';
            avatarInput.value = '';
        });
    }
}

function updateFormAvatar(url) {
    const avatarPreview = document.getElementById('avatarPreview');
    if (!avatarPreview) return;
    
    let img = avatarPreview.querySelector('img');
    if (!img) {
        img = document.createElement('img');
        avatarPreview.appendChild(img);
    }
    
    img.src = url;
    avatarPreview.classList.add('has-image');
}

function updateAvatarEverywhere(url) {
    const sidebarAvatar = document.getElementById('sidebarAvatar');
    const sidebarPhoto = document.getElementById('sidebarAvatarPhoto');

    if (sidebarAvatar) {
        if (sidebarPhoto) {
            let img = sidebarAvatar.querySelector('.avatar-img');
            if (!img) {
                img = document.createElement('img');
                img.className = 'avatar-img';
                sidebarAvatar.appendChild(img);
            }
        
            if (url) {
                img.src = url;
                sidebarPhoto.style.display = 'block';
                sidebarAvatar.classList.add('has-image');
            } else {
                img.src = '';
                sidebarPhoto.style.display = 'none';
                sidebarAvatar.classList.remove('has-image');
            }
        } else {
            let img = sidebarAvatar.querySelector('.avatar-img');
            if (!img) {
                img = document.createElement('img');
                img.className = 'avatar-img';
                sidebarAvatar.appendChild(img);
            }
            if (url) {
                img.src = url;
                sidebarAvatar.classList.add('has-image');
            } else {
                img.src = '';
                sidebarAvatar.classList.remove('has-image');
            }
        }
    }
    
    const headerAvatar = document.getElementById('authButton');
    if (headerAvatar) {
        let img = headerAvatar.querySelector('img');
        if (!img) {
            img = document.createElement('img');
            headerAvatar.appendChild(img);
        }
        
        if (url) {
            img.src = url;
            headerAvatar.classList.add('has-image');
        } else {
            img.src = '';
            headerAvatar.classList.remove('has-image');
        }
    }
}

function loadSavedAvatar() {
    const saved = localStorage.getItem('ck_userAvatar');
    if (saved) {
        updateAvatarEverywhere(saved);
        
        const removeBtn = document.getElementById('removeAvatar');
        if (removeBtn) {
            removeBtn.style.display = 'inline-block';
        }
    }
}

async function loadHistory() {
    const token = localStorage.getItem('ck_access_token');
    if (!token) return;

    try {
        const response = await fetch('http://127.0.0.1:8000/api/v1/history/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Ошибка загрузки истории');
        }

        const data = await response.json();

        historyData = data; // 🔥 КЛЮЧЕВОЕ

        renderHistory(historyData);

        initAchievements(); // 🔥 теперь можно безопасно

    } catch (err) {
        console.error('Ошибка истории:', err);
    }
}

function renderHistory(historyData) {
    const tbody = document.getElementById('historyTableBody');
    if (!tbody) return;

    tbody.innerHTML = historyData.map(row => `
        <tr>
            <td>${formatDate(row.created_at)}</td>
            <td>${row.point || '-'}</td>
            <td>${row.waste_type || '-'}</td>
            <td>${row.weight} кг</td>
            <td>${row.total_price} ₽</td>
            <td><span class="status-badge completed">Проверено</span></td>
            <td>-</td>
        </tr>
    `).join('');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}

window.openReviewForm = function(index) {
    const row = historyData[index];
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal-content review-modal">
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3 style="margin: 0 0 8px 0; font-weight: 600;">Отзыв для "${row.point}"</h3>
            <p style="color:#666;font-size:14px;margin-bottom:20px;">Сдача от ${row.date}</p>
            
            <div class="review-stars" id="reviewStars">
                <span data-value="1">&#9733;</span>
                <span data-value="2">&#9733;</span>
                <span data-value="3">&#9733;</span>
                <span data-value="4">&#9733;</span>
                <span data-value="5">&#9733;</span>
            </div>
            <textarea id="reviewText" placeholder="Расскажите о пункте приёма..." rows="4" style="width:100%;margin:16px 0;padding:12px;border:1px solid #ddd;border-radius:12px;font-family:inherit;font-size:14px;"></textarea>
            <button class="btn-primary" onclick="submitReview(${index})">Отправить отзыв</button>
        </div>
    `;
    document.body.appendChild(modal);

    let selectedRating = 0;
    modal.querySelectorAll('#reviewStars span').forEach(star => {
        star.style.cursor = 'pointer';
        star.style.fontSize = '28px';
        star.style.color = '#ddd';
        star.style.margin = '0 2px';
        
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.value);
            modal.querySelectorAll('#reviewStars span').forEach(s => {
                s.style.color = parseInt(s.dataset.value) <= selectedRating ? '#FFD700' : '#ddd';
            });
        });
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
};

window.submitReview = function(index) {
    const text = document.getElementById('reviewText')?.value.trim();
    if (!text) {
        toasts.warning('Пожалуйста, напишите текст отзыва.', {
            title: 'Пустой отзыв',
            duration: 3000
        });
        return;
    }
    
    document.querySelector('.modal-overlay')?.remove();

    toasts.success('Спасибо! Ваш отзыв помогает другим пользователям.', {
        title: 'Отзыв отправлен',
        duration: 4000
    });
};

function initAchievements() {
    const grid = document.getElementById('achievementsGrid');
    if (!grid) return;
    
    // Проверяем и обновляем статус достижений
    updateAchievements();
    
    // Сохраняем обновлённый статус
    saveAchievements();
    
    // Отрисовываем
    grid.innerHTML = achievementsData.map(ach => `
        <div class="achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}">
            <div class="achievement-icon">${ach.icon}</div>
            <h4 class="achievement-title">${ach.title}</h4>
            <p class="achievement-desc">${ach.desc}</p>
        </div>
    `).join('');
}

// Проверка условий для разблокировки достижений
function updateAchievements() {
    // Загружаем сохранённые достижения
    const saved = localStorage.getItem('ck_achievements');
    if (saved) {
        try {
            const savedData = JSON.parse(saved);
            // Проверяем, что savedData — это массив
            if (Array.isArray(savedData)) {
                achievementsData.forEach(ach => {
                    const savedAch = savedData.find(s => s.id === ach.id);
                    if (savedAch) {
                        ach.unlocked = savedAch.unlocked;
                    }
                });
            } else {
                // Если старый формат — очищаем localStorage
                console.warn('Старый формат достижений, сбрасываем');
                localStorage.removeItem('ck_achievements');
            }
        } catch (e) {
            console.error('Ошибка чтения достижений:', e);
            localStorage.removeItem('ck_achievements');
        }
    }
    
    // Собираем статистику пользователя
    const stats = getUserStats();
    
    // Проверяем каждое достижение
    achievementsData.forEach(ach => {
        if (ach.unlocked) return; // Уже разблокировано
        
        let shouldUnlock = false;
        
        switch(ach.id) {
            case 1: // Новичок - первая сдача
                shouldUnlock = stats.totalSubmissions >= 1;
                break;
                
            case 2: // Эко-герой - 50 кг
                shouldUnlock = stats.totalWeight >= 50;
                break;
                
            case 3: // Год в строю
                shouldUnlock = stats.daysSinceRegistration >= 365;
                break;
                
            case 4: // Мега-сборщик - 100 кг
                shouldUnlock = stats.totalWeight >= 100;
                break;
                
            case 5: // Мастер сортировки - 5 разных типов
                shouldUnlock = stats.uniqueMaterials >= 5;
                break;
                
            case 6: // Эко-фрилансер - 1000 руб
                shouldUnlock = stats.totalEarnings >= 1000;
                break;
                
            case 7: // Критик - 5 отзывов
                shouldUnlock = stats.totalReviews >= 5;
                break;
                
            case 8: // Мусорный магнат - 10000 руб
                shouldUnlock = stats.totalEarnings >= 10000;
                break;
                
            case 9: // Супер-эколог - 250 кг
                shouldUnlock = stats.totalWeight >= 250;
                break;
                
            case 10: // Главный утилизатор - создал организацию
                shouldUnlock = stats.hasOrganization;
                break;
                
            case 11: // Ветеран переработки - 3 года
                shouldUnlock = stats.daysSinceRegistration >= 1095;
                break;
                
            case 12: // Легенда переработки - 500 кг
                shouldUnlock = stats.totalWeight >= 500;
                break;
        }
        
        if (shouldUnlock) {
            ach.unlocked = true;
            // Показываем уведомление о новом достижении
            toasts.achievement(
                `Получено достижение "${ach.title}"!`,
                { 
                    title: 'Достижение разблокировано',
                    duration: 6000 
                }
            );
        }
    });
}

function getUserStats() {
    const stats = {
        totalSubmissions: 0,
        totalWeight: 0,
        totalEarnings: 0,
        uniqueMaterials: new Set(),
        totalReviews: 0,
        daysSinceRegistration: 0,
        hasOrganization: false
    };

    // 🔥 история теперь из API
    historyData.forEach(entry => {
        stats.totalSubmissions++;

        const weight = parseFloat(entry.weight);
        if (!isNaN(weight)) {
            stats.totalWeight += weight;
        }

        const sum = parseFloat(entry.total_price);
        if (!isNaN(sum)) {
            stats.totalEarnings += sum;
        }

        if (entry.waste_type) {
            stats.uniqueMaterials.add(entry.waste_type);
        }
    });

    stats.uniqueMaterials = stats.uniqueMaterials.size;

    // 🔥 регистрация (если появится поле — используем)
    if (currentUser && currentUser.date_joined) {
        const created = new Date(currentUser.date_joined);
        stats.daysSinceRegistration = Math.floor(
            (Date.now() - created) / (1000 * 60 * 60 * 24)
        );
    }

    return stats;
}

// Сохранение достижений в localStorage
function saveAchievements() {
    const dataToSave = achievementsData.map(ach => ({
        id: ach.id,
        unlocked: ach.unlocked
    }));
    localStorage.setItem('ck_achievements', JSON.stringify(dataToSave));
}

function initOrganizations() {
    const orgList = document.getElementById('orgList');
    if (!orgList) return;

    const user = JSON.parse(localStorage.getItem('ck_currentUser')) || {};
    const organizations = user.organizations || [];

    if (orgCount) {
        orgCount.textContent = organizations.length;
    }

    if (organizations.length === 0) {
        orgList.innerHTML = `<p>У вас пока нет организаций</p>`;
        return;
    }

    orgList.innerHTML = organizations.map(org => `
        <div class="org-card" data-id="${org.id}">
            <div class="org-info">
                <span class="org-name">${org.name}</span>
                <span class="org-role">${org.role}</span>
            </div>
        </div>
    `).join('');
}

function initOrgModalOnce() {
    const createBtn = document.getElementById('createOrgBtn');
    const modal = document.getElementById('createOrgModal');
    const closeBtn = document.getElementById('closeOrgModal');
    const createForm = document.getElementById('createOrgForm');

    console.log('🔍 initOrgModalOnce:', { createBtn, modal, closeBtn, createForm });

    if (createBtn) {
        createBtn.addEventListener('click', () => {
            const owned = organizationsData.filter(o => o.role === 'Владелец').length;
            if (owned >= 1) {
                toasts?.warning('Вы уже владеете одной организацией.', { duration: 3000 });
                return;
            }
            if (modal) modal.classList.add('active');
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (modal) {
                modal.classList.remove('active');
                createForm?.reset();
            }
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                createForm?.reset();
            }
        });
    }

    if (createForm) {
        createForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(e.target);

            await createOrganization(formData); // 🔥 API

            modal.classList.remove('active');
            createForm.reset();
        });
    }
}

async function createOrganization(formData) {
    const token = localStorage.getItem('ck_access_token');
    if (!token) return;

    try {
        const response = await fetch('http://127.0.0.1:8000/api/v1/organizations/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: formData.get('orgName'),
                inn: formData.get('inn')
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(JSON.stringify(err));
        }

        await loadProfile();
        initOrganizations();

        toasts.success('Организация создана!');

    } catch (err) {
        console.error(err);
        toasts.error('Ошибка создания организации');
    }
}

window.openOrgDashboard = function(orgId) {
    window.location.href = `org-dashboard.html?id=${orgId}`;
};

function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Выйти из аккаунта?')) {
                localStorage.removeItem('ck_currentUser');
                localStorage.removeItem('ck_userAvatar');

                toasts.info('До скорых встреч!', {
                    duration: 1500
                });
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 800);
            }
        });
    }
}