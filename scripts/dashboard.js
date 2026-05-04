// ===== ДАННЫЕ =====
const userData = {
    surname: 'Власова',
    name: 'Софья',
    middlename: 'Анатольевна',
    login: 'sonixks',
    email: 'sonixks@yandex.ru',
    city: 'Екатеринбург',
    totalWeight: 87,
    totalTransactions: 12,
    memberSince: '2025-04-15'
};

let historyData = JSON.parse(localStorage.getItem('ck_historyData')) || [
    { date: '18.04.2026', point: 'Вторплюс', material: 'Пластик', weight: '5.2 кг', sum: '114 ₽', status: 'completed', hasReview: true, createdDate: '2026-04-18T10:00:00' },
    { date: '21.05.2026', point: 'ЭкоПункт', material: 'Бумага', weight: '12 кг', sum: '96 ₽', status: 'completed', hasReview: false, createdDate: '2026-05-21T14:30:00' },
    { date: '01.06.2026', point: 'Вторплюс', material: 'Стекло', weight: '3.1 кг', sum: '31 ₽', status: 'pending', hasReview: false, createdDate: new Date().toISOString() }
];

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
document.addEventListener('DOMContentLoaded', () => {
    initProfile();
    initHistory();
    initHistoryModal();
    initAchievements();
    initOrganizations();
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

function initProfile() {
    document.getElementById('userName').textContent = userData.login;
    document.getElementById('inputSurname').value = userData.surname;    
    document.getElementById('inputName').value = userData.name;
    document.getElementById('inputMiddleName').value = userData.middlename;
    document.getElementById('inputLogin').value = userData.login;
    document.getElementById('inputEmail').value = userData.email;
    document.getElementById('inputCity').value = userData.city;

    document.getElementById('profileForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const status = document.getElementById('formStatus');

        toasts.success('Данные профиля обновлены!', {
            duration: 3000
        });
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

function initHistory() {
    const tbody = document.getElementById('historyTableBody');
    if (!tbody) return;

    checkPendingSubmissions();

    tbody.innerHTML = historyData.map((row, index) => {
        let statusText = 'Проверено';
        let statusClass = 'completed';
        if (row.status === 'pending') {
            statusText = 'На проверке';
            statusClass = 'pending';
        } else if (row.status === 'unconfirmed') {
            statusText = 'Не подтверждено';
            statusClass = 'unconfirmed';
        }

        let feedbackCell = '';
        if (row.status === 'completed') {
            if (row.hasReview) {
                feedbackCell = `<span class="review-badge">Отзыв оставлен</span>`;
            } else {
                feedbackCell = `<button class="btn-write-review" onclick="openReviewForm(${index})">Написать отзыв</button>`;
            }
        } else {
            feedbackCell = `<span class="feedback-disabled">Недоступно</span>`;
        }

        return `
        <tr>
            <td>${row.date}</td>
            <td>${row.point}</td>
            <td>${row.material}</td>
            <td>${row.weight}</td>
            <td>${row.sum || '-'}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>${feedbackCell}</td>
        </tr>
        `;
    }).join('');
}

function checkPendingSubmissions() {
    const now = new Date();
    let changed = false;

    historyData.forEach(row => {
        if (row.status === 'pending' && row.createdDate) {
            const created = new Date(row.createdDate);
            const diffDays = Math.ceil(Math.abs(now - created) / (1000 * 60 * 60 * 24));
            if (diffDays > 7) {
                row.status = 'unconfirmed';
                changed = true;
            }
        }
    });

    if (changed) saveHistoryData();
}

function saveHistoryData() {
    localStorage.setItem('ck_historyData', JSON.stringify(historyData));
    initHistory();
}

function initHistoryModal() {
    const modal = document.getElementById('submissionModal');
    const openBtn = document.getElementById('addSubmissionBtn');
    const closeBtn = document.getElementById('closeSubmissionModal');
    const form = document.getElementById('submissionForm');

    if (!modal || !openBtn) return;

    openBtn.addEventListener('click', () => modal.classList.add('active'));
    
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        form.reset();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            form.reset();
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const point = document.getElementById('inputPoint').value;
        const material = document.getElementById('inputMaterial').value;
        const weight = document.getElementById('inputWeight').value;
        const sum = document.getElementById('inputSum').value;

        const today = new Date();
        const dateStr = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;

        const newSubmission = {
            date: dateStr,
            point: point,
            material: material,
            weight: `${weight} кг`,
            sum: sum ? `${sum} ₽` : null,
            status: 'pending',
            createdDate: new Date().toISOString(),
            hasReview: false
        };

        historyData.unshift(newSubmission);
        saveHistoryData();

        let allRequests = JSON.parse(localStorage.getItem('ck_orgRequests')) || [];
        allRequests.push(newSubmission);
        localStorage.setItem('ck_orgRequests', JSON.stringify(allRequests));

        const sortingTips = {
            'Пластик': 'ПЭТ-бутылки нужно смять.',
            'Бумага': 'Картонные коробки лучше разобрать.',
            'Стекло': 'Крышки от стеклянных банок сдаются отдельно как металл.',
            'Металл': 'Алюминиевые банки желательно промыть перед сдачей.',
            'Электроника': 'Не разбирайте устройства самостоятельно - это опасно.',
            'Батарейки': 'Храните батарейки в пластиковом контейнере до сдачи.',
            'Текстиль': 'Постирайте вещи перед сдачей в переработку.'
        };

        const tip = sortingTips[material] || '';

        modal.classList.remove('active');
        form.reset();

        if (tip) {
            toasts.tip(
                `Заявка в "${point}" создана!`,
                tip,
                {
                    title: 'Сдача зарегистрирована',
                    duration: 6000
                }
            );
        } else {
            toasts.success(
                `Заявка в "${point}" создана! Ожидайте подтверждения.`,
                { duration: 4000 }
            );
        }
    });
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

    historyData[index].hasReview = true;
    saveHistoryData();
    
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

// Сбор статистики пользователя
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
    
    // Анализируем историю сдач
    historyData.forEach(entry => {
        if (entry.status === 'completed' || entry.status === 'pending') {
            stats.totalSubmissions++;
        }
        
        // Считаем вес
        const weight = parseFloat(entry.weight);
        if (!isNaN(weight)) {
            stats.totalWeight += weight;
        }
        
        // Считаем заработок
        const sum = parseFloat(entry.sum);
        if (!isNaN(sum)) {
            stats.totalEarnings += sum;
        }
        
        // Собираем уникальные типы материалов
        if (entry.material) {
            stats.uniqueMaterials.add(entry.material);
        }
        
        // Считаем отзывы
        if (entry.hasReview) {
            stats.totalReviews++;
        }
    });
    
    // Конвертируем Set в количество
    stats.uniqueMaterials = stats.uniqueMaterials.size;
    
    // Считаем дни с регистрации
    const memberSince = new Date(userData.memberSince);
    stats.daysSinceRegistration = Math.floor((Date.now() - memberSince) / (1000 * 60 * 60 * 24));
    
    // Проверяем наличие организации
    stats.hasOrganization = organizationsData.some(org => org.role === 'Владелец' && org.status === 'verified');
    
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
    const savedOrgs = JSON.parse(localStorage.getItem('ck_orgRequests')) || [];
    savedOrgs.forEach(savedOrg => {
        if (!organizationsData.find(o => o.id === savedOrg.id)) {
            organizationsData.push(savedOrg);
        }
    });
    
    const orgCount = document.getElementById('orgCount');
    if (orgCount) orgCount.textContent = organizationsData.length;

    const createBtn = document.getElementById('createOrgBtn');
    if (createBtn) {
        const owned = organizationsData.filter(o => o.role === 'Владелец').length;
        createBtn.style.display = owned >= 1 ? 'none' : 'inline-flex';
    }
    
    const orgList = document.getElementById('orgList');
    if (!orgList) return;

    orgList.innerHTML = organizationsData.map(org => `
        <div class="org-card" data-id="${org.id}" style="cursor: pointer;">
            <div class="org-info">
                <span class="org-name">${org.name}</span>
                <span class="org-role">${org.role}</span>
            </div>
            <div style="display:flex;align-items:center;gap:12px;">
                <span class="org-status ${org.status}">
                    ${org.status === 'verified' ? 'Проверена' : org.status === 'pending' ? 'На проверке' : 'Отклонена'}
                </span>
            </div>
        </div>
    `).join('');

    // Клик по организации → переход в кабинет
    orgList.onclick = (e) => {
        const card = e.target.closest('.org-card');
        if (card) {
            const orgId = card.dataset.id;
            window.location.href = `org-dashboard.html?id=${orgId}`;
        }
    };
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
        createForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('📤 Форма отправлена');
            
            try {
                const formData = new FormData(e.target);
                
                const orgName = formData.get('orgName')?.trim() || '';
                const inn = formData.get('inn')?.trim() || '';
                
                if (!orgName) {
                    toasts?.warning('Введите название организации', { duration: 3000 });
                    return;
                }
                
                if (!inn) {
                    toasts?.warning('Введите ИНН', { duration: 3000 });
                    return;
                }
                
                const newOrg = {
                    id: Date.now(),
                    name: orgName,
                    inn: inn,
                    role: 'Владелец',
                    status: 'pending',
                    createdAt: new Date().toISOString().split('T')[0]
                };
                
                console.log('Создаём организацию:', newOrg);
                
                organizationsData.push(newOrg);
                
                let orgRequests = JSON.parse(localStorage.getItem('ck_orgRequests')) || [];
                orgRequests.push(newOrg);
                localStorage.setItem('ck_orgRequests', JSON.stringify(orgRequests));
                
                // Закрываем и сбрасываем
                if (modal) modal.classList.remove('active');
                createForm.reset();
                
                // Обновляем список
                initOrganizations();
                
                toasts?.info('Ваша заявка отправлена на проверку.', {
                    title: 'Организация создаётся',
                    duration: 5000
                });
                
            } catch (err) {
                console.error('Ошибка при создании организации:', err);
                toasts?.error('Не удалось создать организацию. Попробуйте ещё раз.', { duration: 4000 });
            }
        });
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