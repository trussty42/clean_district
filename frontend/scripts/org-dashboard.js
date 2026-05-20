// ===== ГЛОБАЛЬНЫЕ ДАННЫЕ (объявляем ОДИН раз) =====
let orgData = {}; // Пустой объект, заполнится при загрузке
let pointsData = [];
let newsData = [];

// ===== ЗАГРУЗКА И ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Получаем ID организации из URL
    const urlParams = new URLSearchParams(window.location.search);
    const orgId = urlParams.get('id');
    
    if (!orgId) {
        // ✅ Безопасный вызов через window
        if (window.toasts) {
            window.toasts.warning('ID организации не указан', { duration: 3000 });
        } else {
            alert('ID организации не указан');
        }
        setTimeout(() => window.location.href = 'dashboard.html', 1500);
        return;
    }

    // 2. Загружаем данные создания организации (имя, ИНН, статус)
    const allOrgs = JSON.parse(localStorage.getItem('ck_orgRequests')) || [];
    const createdOrg = allOrgs.find(o => o.id == orgId);
    
    if (!createdOrg) {
        toasts?.error('Организация не найдена') || alert('Организация не найдена');
        setTimeout(() => window.location.href = 'dashboard.html', 2000);
        return;
    }

    // 3. Загружаем сохранённый профиль (контакты, соцсети, аватар)
    const savedProfile = JSON.parse(localStorage.getItem(`ck_orgData_${orgId}`)) || {};

    // 4. Объединяем данные: создание + профиль
    orgData = {
        id: orgId,
        name: createdOrg.name || '',
        inn: createdOrg.inn || '',
        status: createdOrg.status || 'pending',
        phone: savedProfile.phone || '',
        email: savedProfile.email || '',
        website: savedProfile.website || '',
        socials: savedProfile.socials || { vk: '', tg: '', max: '' },
        avatar: savedProfile.avatar || null,
        createdAt: createdOrg.createdAt || new Date().toISOString().split('T')[0]
    };

    // 5. Сохраняем объединённые данные
    localStorage.setItem(`ck_orgData_${orgId}`, JSON.stringify(orgData));

    // 6. Загружаем остальные данные (пункты, новости) с динамическим ID
    pointsData = JSON.parse(localStorage.getItem(`ck_orgPoints_${orgId}`)) || [];
    newsData = JSON.parse(localStorage.getItem(`ck_orgNews_${orgId}`)) || [];

    // 7. Запускаем инициализацию интерфейса
    initOrgHeader();      // Обновляем шапку (название, статус, логотип)
    initOrgProfile();     // Заполняем форму профиля
    initOrgTabs();        // Переключение вкладок
    initPoints(); 
    initEditPointModal();        // Пункты приёма
    initFeedback();       // Отзывы
    initNews();           // Новости
    initAnalytics();      // Аналитика
    initEmployees();      // Сотрудники
    initOrgLogout();      // Выход
});

// ===== ШАПКА ОРГАНИЗАЦИИ =====
function initOrgHeader() {
    const nameEl = document.getElementById('orgNameDisplay');
    const badgeEl = document.getElementById('orgStatusBadge');
    const logoEl = document.getElementById('orgLogoPreview');
    
    if (nameEl) nameEl.textContent = orgData.name || 'Загрузка...';
    
    if (badgeEl) {
        const statusMap = { pending: 'На проверке', verified: 'Проверена', rejected: 'Отклонена' };
        badgeEl.textContent = statusMap[orgData.status] || orgData.status;
        badgeEl.className = `org-status-badge ${orgData.status}`;
    }
    
    if (logoEl && orgData.avatar) {
        logoEl.innerHTML = `<img src="${orgData.avatar}" style="width:100%;height:100%;border-radius:12px;object-fit:cover;" />`;
    }
}

// ===== ВКЛАДКИ =====
function initOrgTabs() {
    document.querySelectorAll('.org-nav-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.org-nav-item').forEach(i => i.classList.remove('active'));
            document.querySelectorAll('.org-tab-content').forEach(t => t.classList.remove('active'));
            item.classList.add('active');
            document.getElementById(`org-${item.dataset.tab}-tab`)?.classList.add('active');
        });
    });
}

// ===== ПРОФИЛЬ: ЗАПОЛНЕНИЕ И СОХРАНЕНИЕ =====
function initOrgProfile() {
    // Заполняем поля
    const fields = [
        { id: 'orgInputName', key: 'name' },
        { id: 'orgInputInn', key: 'inn' },
        { id: 'orgInputPhone', key: 'phone' },
        { id: 'orgInputEmail', key: 'email' },
        { id: 'orgInputWebsite', key: 'website' },
        { id: 'orgInputVK', key: 'socials.vk' },
        { id: 'orgInputTG', key: 'socials.tg' },
        { id: 'orgInputMAX', key: 'socials.max' }
    ];

    fields.forEach(field => {
        const el = document.getElementById(field.id);
        if (!el) return;
        
        if (field.key.includes('.')) {
            const [parent, child] = field.key.split('.');
            el.value = orgData[parent]?.[child] || '';
        } else {
            el.value = orgData[field.key] || '';
        }
        
        // ИНН делаем только для чтения (его нельзя менять)
        if (field.key === 'inn') {
            el.setAttribute('readonly', 'readonly');
            el.style.background = '#f8f9fa';
            el.style.cursor = 'not-allowed';
        }
    });

    // Аватар
    if (orgData.avatar) {
        updateOrgAvatarPreview(orgData.avatar);
        document.getElementById('orgRemoveAvatar')?.style.setProperty('display', 'inline-block');
    }

    // Сохранение формы
    const form = document.getElementById('orgProfileForm');
    if (form) {
        // Удаляем старые обработчики клонированием
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        newForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Обновляем orgData из формы
            orgData.name = document.getElementById('orgInputName').value.trim();
            orgData.inn = document.getElementById('orgInputInn').value.trim();
            orgData.phone = document.getElementById('orgInputPhone').value.trim();
            orgData.email = document.getElementById('orgInputEmail').value.trim();
            orgData.website = document.getElementById('orgInputWebsite').value.trim();
            orgData.socials = {
                vk: document.getElementById('orgInputVK').value.trim(),
                tg: document.getElementById('orgInputTG').value.trim(),
                max: document.getElementById('orgInputMAX').value.trim()
            };

            // Сохраняем с динамическим ключом
            localStorage.setItem(`ck_orgData_${orgData.id}`, JSON.stringify(orgData));
            
            // Обновляем шапку
            initOrgHeader();
            
            toasts?.success('Данные организации обновлены!', { duration: 3000 });
            const statusEl = document.getElementById('orgFormStatus');
            if (statusEl) {
                statusEl.textContent = 'Сохранено!';
                setTimeout(() => statusEl.textContent = '', 3000);
            }
        });
    }

    // Инициализация аватара
    initOrgAvatarUpload();
}

// ===== АВАТАР ОРГАНИЗАЦИИ =====
function initOrgAvatarUpload() {
    const avatarInput = document.getElementById('orgAvatarInput');
    const avatarPreview = document.getElementById('orgAvatarPreview');
    const removeBtn = document.getElementById('orgRemoveAvatar');
    
    if (!avatarInput || !avatarPreview) return;

    avatarPreview.addEventListener('click', () => avatarInput.click());

    avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toasts?.warning('Файл слишком большой. Максимум 5MB.', { duration: 3000 });
            return;
        }
        if (!file.type.startsWith('image/')) {
            toasts?.warning('Выберите изображение (JPG, PNG).', { duration: 3000 });
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target.result;
            updateOrgAvatarPreview(base64);
            
            orgData.avatar = base64;
            localStorage.setItem(`ck_orgData_${orgData.id}`, JSON.stringify(orgData));
            
            if (removeBtn) removeBtn.style.display = 'inline-block';
            toasts?.success('Логотип обновлён!', { duration: 2000 });
        };
        reader.readAsDataURL(file);
    });

    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            orgData.avatar = null;
            localStorage.setItem(`ck_orgData_${orgData.id}`, JSON.stringify(orgData));
            
            const img = avatarPreview.querySelector('img');
            if (img) img.remove();
            avatarPreview.classList.remove('has-image');
            removeBtn.style.display = 'none';
            avatarInput.value = '';
            
            toasts?.info('Логотип удалён', { duration: 2000 });
        });
    }
}

function updateOrgAvatarPreview(url) {
    const avatarPreview = document.getElementById('orgAvatarPreview');
    if (!avatarPreview) return;
    
    let img = avatarPreview.querySelector('img');
    if (!img) {
        img = document.createElement('img');
        avatarPreview.appendChild(img);
    }
    
    img.src = url;
    avatarPreview.classList.add('has-image');
}

// ===== ПУНКТЫ ПРИЁМА =====
function initPoints() {
    renderPoints();
    initPricesBlock(); // Инициализируем динамический блок цен
    
    // Кнопка открытия
    document.getElementById('addPointBtn')?.addEventListener('click', () => {
        const modal = document.getElementById('addPointModal');
        const nameInput = document.getElementById('inputPointName');
        
        // ✅ Заполняем и блокируем поле "Название"
        if (nameInput && orgData.name) {
            nameInput.value = orgData.name;              // Заполняем
            nameInput.setAttribute('readonly', 'readonly'); // Блокируем
            nameInput.style.background = '#f8f9fa';      // Серый фон
            nameInput.style.cursor = 'not-allowed';      // Курсор запрета
        }
        
        modal?.classList.add('active');
    });
    
    // Закрытие + сброс формы
    document.getElementById('closePointModal')?.addEventListener('click', () => {
        const modal = document.getElementById('addPointModal');
        const form = document.getElementById('addPointForm');
        modal?.classList.remove('active');
        form?.reset();
        resetPricesList(); // Очищаем динамические строки
    });
    
    // Отправка формы
    document.getElementById('addPointForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        // ✅ Сбор цен из динамических строк
        const prices = {};
        document.querySelectorAll('.price-row').forEach(row => {
            const type = row.querySelector('.price-type-input').value.trim();
            const price = row.querySelector('.price-value-input').value;
            if (type && price > 0) {
                prices[type] = parseFloat(price);
            }
        });

        const newPoint = {
            id: Date.now(),
            name: formData.get('pointName'),
            address: formData.get('address'),
            schedule: formData.get('schedule'),
            phone: formData.get('phone'),
            prices: prices // Сохраняем объект цен
        };
        
        pointsData.push(newPoint);
        localStorage.setItem(`ck_orgPoints_${orgData.id}`, JSON.stringify(pointsData));
        renderPoints();
        
        document.getElementById('addPointModal')?.classList.remove('active');
        e.target.reset();
        resetPricesList();
        toasts?.success('Пункт добавлен!', { duration: 3000 });
    });
}

// Инициализация динамического блока цен
function initPricesBlock() {
    const list = document.getElementById('pricesList');
    const addBtn = document.getElementById('addPriceRow');
    if (!list || !addBtn) return;

    const createRow = () => {
        const row = document.createElement('div');
        row.className = 'price-row';
        row.innerHTML = `
            <div class="price-type-group">
                <input type="text" class="price-type-input" placeholder="Тип отхода" list="wasteTypesOptions" required />
            </div>
            <div class="price-value-group">
                <input type="number" class="price-value-input" placeholder="Цена ₽/кг" step="0.1" min="0" required />
            </div>
            <button type="button" class="btn-remove-price" title="Удалить">&times;</button>
        `;
        return row;
    };

    addBtn.addEventListener('click', () => list.appendChild(createRow()));
    
    list.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remove-price')) {
            e.target.closest('.price-row').remove();
        }
    });

    // Добавляем одну строку по умолчанию
    list.appendChild(createRow());
}

// Сброс списка цен при закрытии модалки
function resetPricesList() {
    const list = document.getElementById('pricesList');
    if (list) list.innerHTML = '';
}

// ===== ОТРИСОВКА СПИСКА (ТОЛЬКО НАЗВАНИЕ + АДРЕС) =====
function renderPoints() {
    const list = document.getElementById('pointsList');
    if (!list) return;
    if (!Array.isArray(pointsData)) pointsData = [];

    if (pointsData.length === 0) {
        list.innerHTML = '<div class="empty-state" style="text-align:center;padding:40px;color:#888;">Нет добавленных пунктов</div>';
        return;
    }

    list.innerHTML = pointsData.map(point => `
        <div class="point-card" onclick="openEditPointModal(${point.id})">
            <div class="point-info">
                <h4>${point.name}</h4>
                <span class="point-address">${point.address}</span>
            </div>
        </div>
    `).join('');
}

// ===== ОТКРЫТИЕ МОДАЛЬНОГО ОКНА РЕДАКТИРОВАНИЯ =====
window.openEditPointModal = function(id) {
    const point = pointsData.find(p => p.id === id);
    if (!point) return;

    document.getElementById('editPointId').value = point.id;
    document.getElementById('editPointName').value = point.name;
    document.getElementById('editPointAddress').value = point.address;
    document.getElementById('editPointSchedule').value = point.schedule || '';
    document.getElementById('editPointPhone').value = point.phone || '';

    // Заполняем цены
    const pricesList = document.getElementById('editPricesList');
    pricesList.innerHTML = '';
    if (point.prices && Object.keys(point.prices).length > 0) {
        for (const [type, price] of Object.entries(point.prices)) {
            addPriceRowToEditList(type, price);
        }
    } else {
        addPriceRowToEditList('', '');
    }

    document.getElementById('editPointModal').classList.add('active');
};

// ===== ВСПОМОГАТЕЛЬНАЯ: ДОБАВЛЕНИЕ СТРОКИ ЦЕН В МОДАЛКУ РЕДАКТИРОВАНИЯ =====
function addPriceRowToEditList(type = '', price = '') {
    const list = document.getElementById('editPricesList');
    const row = document.createElement('div');
    row.className = 'price-row';
    row.innerHTML = `
        <div class="price-type-group">
            <input type="text" class="price-type-input" value="${type}" placeholder="Тип отхода" list="wasteTypesOptions" required />
        </div>
        <div class="price-value-group">
            <input type="number" class="price-value-input" value="${price}" placeholder="₽/кг" step="0.1" min="0" required />
        </div>
        <button type="button" class="btn-remove-price" title="Удалить">&times;</button>
    `;
    list.appendChild(row);
}

// ===== ИНИЦИАЛИЗАЦИЯ МОДАЛКИ РЕДАКТИРОВАНИЯ =====
function initEditPointModal() {
    // Закрытие
    document.getElementById('closeEditPointModal')?.addEventListener('click', () => {
        document.getElementById('editPointModal').classList.remove('active');
    });

    // Добавление строки цены
    document.getElementById('addEditPriceRow')?.addEventListener('click', () => {
        addPriceRowToEditList();
    });

    // Удаление строки цены
    document.getElementById('editPricesList')?.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remove-price')) {
            e.target.closest('.price-row').remove();
        }
    });

    // Удаление всего пункта
    document.getElementById('deletePointFromModal')?.addEventListener('click', () => {
        const id = parseInt(document.getElementById('editPointId').value);
        if (confirm('Удалить этот пункт?')) {
            deletePoint(id);
            document.getElementById('editPointModal').classList.remove('active');
        }
    });

    // Сохранение изменений
    document.getElementById('editPointForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('editPointId').value);
        const idx = pointsData.findIndex(p => p.id === id);
        if (idx === -1) return;

        // Собираем цены из модалки
        const prices = {};
        document.querySelectorAll('#editPricesList .price-row').forEach(row => {
            const type = row.querySelector('.price-type-input').value.trim();
            const price = row.querySelector('.price-value-input').value;
            if (type && price && parseFloat(price) > 0) {
                prices[type] = parseFloat(price);
            }
        });

        // Обновляем данные
        pointsData[idx] = {
            ...pointsData[idx],
            address: document.getElementById('editPointAddress').value.trim(),
            schedule: document.getElementById('editPointSchedule').value.trim(),
            phone: document.getElementById('editPointPhone').value.trim(),
            prices: prices
        };

        localStorage.setItem(`ck_orgPoints_${orgData.id}`, JSON.stringify(pointsData));
        renderPoints();
        document.getElementById('editPointModal').classList.remove('active');
        window.toasts?.success('Пункт обновлён!', { duration: 3000 });
    });
}

window.deletePoint = function(id) {
    if (confirm('Удалить этот пункт?')) {
        const idx = pointsData.findIndex(p => p.id === id);
        if (idx > -1) {
            pointsData.splice(idx, 1);
            localStorage.setItem(`ck_orgPoints_${orgData.id}`, JSON.stringify(pointsData));
            renderPoints();
            toasts?.info('Пункт удалён', { duration: 2000 });
        }
    }
};

// ===== ОТЗЫВЫ =====
const feedbackData = [
    { id: 1, userName: 'annakir', rating: 5, text: 'Очень удобный пункт!', date: '20.04.2026', reply: null },
    { id: 2, userName: 'pupupu', rating: 4, text: 'Хорошо, но очередь.', date: '08.04.2026', reply: null }
];

function initFeedback() { renderFeedback(); }

function renderFeedback() {
    const list = document.getElementById('feedbackList');
    if (!list) return;
    
    list.innerHTML = feedbackData.map(fb => `
        <div class="feedback-card">
            <div class="feedback-header">
                <div>
                    <span class="feedback-user">${fb.userName}</span>
                    <div class="feedback-rating">${'★'.repeat(fb.rating)}${'☆'.repeat(5-fb.rating)}</div>
                </div>
                <span class="feedback-date">${fb.date}</span>
            </div>
            <p class="feedback-text">${fb.text}</p>
            <div class="feedback-reply">
                ${fb.reply 
                    ? `<p><strong>Ваш ответ:</strong> ${fb.reply}</p>` 
                    : `<textarea placeholder="Напишите ответ..."></textarea>
                       <div class="feedback-reply-actions">
                           <button class="btn-small edit" onclick="sendReply(${fb.id}, this)">Отправить</button>
                       </div>`
                }
            </div>
        </div>
    `).join('');
}

window.sendReply = function(feedbackId, btn) {
    const textarea = btn.closest('.feedback-reply')?.querySelector('textarea');
    const reply = textarea?.value.trim();
    if (!reply) {
        toasts?.warning('Напишите текст ответа', { duration: 2000 });
        return;
    }
    
    const fb = feedbackData.find(f => f.id === feedbackId);
    if (fb) {
        fb.reply = reply;
        renderFeedback();
        toasts?.success('Ответ отправлен', { duration: 2000 });
    }
};

// ===== НОВОСТИ =====
function initNews() {
    renderNews();
    
    document.getElementById('addNewsBtn')?.addEventListener('click', () => {
        document.getElementById('addNewsModal')?.classList.add('active');
    });
    
    document.getElementById('closeNewsModal')?.addEventListener('click', () => {
        document.getElementById('addNewsModal')?.classList.remove('active');
    });
    
    document.getElementById('addNewsForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const newNews = {
            id: Date.now(),
            title: formData.get('newsTitle'),
            text: formData.get('newsText'),
            type: formData.get('newsType'),
            status: 'pending',
            date: new Date().toISOString().split('T')[0]
        };
        
        newsData.unshift(newNews);
        localStorage.setItem(`ck_orgNews_${orgData.id}`, JSON.stringify(newsData));
        renderNews();
        
        document.getElementById('addNewsModal')?.classList.remove('active');
        e.target.reset();
        toasts?.success('Новость отправлена на модерацию!', { duration: 4000 });
    });
}

function renderNews() {
    const list = document.getElementById('newsList');
    if (!list) return;
    
    const typeMap = { news: 'Новость', promotion: 'Акция', announcement: 'Объявление' };
    const statusMap = { pending: 'На проверке', published: 'Опубликовано', rejected: 'Отклонена' };
    
    list.innerHTML = newsData.map(item => `
        <div class="news-card">
            <div class="news-header">
                <h4 class="news-title">${item.title}</h4>
                <span class="news-type ${item.type}">${typeMap[item.type] || item.type}</span>
            </div>
            <p class="news-text">${item.text}</p>
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <span class="news-date" style="font-size:13px;color:#888;">${item.date}</span>
                <span class="news-status ${item.status}">${statusMap[item.status] || item.status}</span>
            </div>
        </div>
    `).join('');
}

function initAnalytics() {
    // 🔹 Заглушка данных (замени на fetch к API)
    const data = {
        views: 1247,
        submissions: 89,
        avgRating: 4.7,
        // Твой точный список типов отходов
        weightByType: {
            'Пластик': 342,
            'Стекло': 89,
            'Электроника': 45,
            'Металл': 203,
            'Бумага и картон': 156,
            'Мебель и крупногабарит': 34,
            'Текстиль': 28,
            'Батарейки': 12,
            'Строительный мусор': 56,
            'Дерево': 41,
            'Автошины': 18,
            'Лампочки': 9
        },
        ratingDistribution: { 5: 52, 4: 23, 3: 8, 2: 4, 1: 2 }
    };

    // Основные метрики
    document.getElementById('totalViews').textContent = data.views.toLocaleString('ru-RU');
    document.getElementById('totalSubmissions').textContent = data.submissions.toLocaleString('ru-RU');
    document.getElementById('avgRating').textContent = data.avgRating.toFixed(1);

    // Сданный вес (сортировка по убыванию + расчёт процентов для баров)
    const weightChart = document.getElementById('weightChart');
    const sortedWeight = Object.entries(data.weightByType).sort((a, b) => b[1] - a[1]);
    const maxWeight = sortedWeight.length > 0 ? sortedWeight[0][1] : 1;

    weightChart.innerHTML = sortedWeight.map(([type, weight]) => {
        const percent = (weight / maxWeight) * 100;
        return `
            <div class="weight-row">
                <span class="weight-label">${type}</span>
                <div class="weight-bar-wrapper">
                    <div class="weight-bar" style="width: ${percent}%"></div>
                </div>
                <span class="weight-value">${weight} кг</span>
            </div>
        `;
    }).join('');

    // 3️Распределение оценок (от 5 до 1)
    const ratingDist = document.getElementById('ratingDistribution');
    const ratingLabels = { 
        5: '<span style="color:#FFD700">★★★★★</span>', 
        4: '<span style="color:#FFD700">★★★★</span>', 
        3: '<span style="color:#FFD700">★★★</span>',
        2: '<span style="color:#FFD700">★★</span>',
        1: '<span style="color:#FFD700">★</span>'
    };
    const totalRatings = Object.values(data.ratingDistribution).reduce((a, b) => a + b, 0) || 1;

    ratingDist.innerHTML = [5, 4, 3, 2, 1].map(star => {
        const count = data.ratingDistribution[star] || 0;
        const percent = (count / totalRatings) * 100;
        return `
            <div class="rating-row">
                <span class="rating-label">${ratingLabels[star]}</span>
                <div class="rating-bar-wrapper">
                    <div class="rating-bar" style="width: ${percent}%"></div>
                </div>
                <span class="rating-count">${count}</span>
            </div>
        `;
    }).join('');

}

// ===== СОТРУДНИКИ =====
const employeesData = [
    { id: 1, name: 'Иван Петров', email: 'ivan@eco-ural.ru', role: 'owner' },
    { id: 2, name: 'Мария Сидорова', email: 'maria@eco-ural.ru', role: 'manager' },
    { id: 3, name: 'Алексей Козлов', email: 'alex@eco-ural.ru', role: 'member' }
];
const currentUser = { email: 'ivan@eco-ural.ru', role: 'owner' };

function initEmployees() {
    renderEmployees();
    
    if (currentUser.role === 'owner') {
        document.getElementById('inviteEmployeeBtn')?.style.setProperty('display', 'inline-flex');
    }
    
    document.getElementById('inviteEmployeeBtn')?.addEventListener('click', () => {
        document.getElementById('inviteModal')?.classList.add('active');
    });
    
    document.getElementById('closeInviteModal')?.addEventListener('click', () => {
        document.getElementById('inviteModal')?.classList.remove('active');
    });
    
    document.getElementById('inviteForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        toasts?.success(`Приглашение отправлено на ${email}`, { duration: 4000 });
        document.getElementById('inviteModal')?.classList.remove('active');
        e.target.reset();
    });
}

function renderEmployees() {
    const list = document.getElementById('employeesList');
    if (!list) return;
    
    const roleMap = { owner: 'Владелец', manager: 'Менеджер', member: 'Участник' };
    const isOwner = currentUser.role === 'owner';
    
    list.innerHTML = employeesData.map(emp => `
        <div class="employee-card">
            <div class="employee-info">
                <div class="employee-avatar">${emp.name.charAt(0)}</div>
                <div>
                    <div class="employee-name">${emp.name}</div>
                    <div class="employee-email">${emp.email}</div>
                </div>
            </div>
            <div style="display:flex;align-items:center;gap:12px;">
                <span class="employee-role">${roleMap[emp.role] || emp.role}</span>
                ${isOwner && emp.role !== 'owner' ? `
                    <button class="btn-small delete" onclick="removeEmployee(${emp.id})">Удалить</button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

window.removeEmployee = function(id) {
    if (confirm('Удалить сотрудника?')) {
        const idx = employeesData.findIndex(e => e.id === id);
        if (idx > -1) {
            employeesData.splice(idx, 1);
            renderEmployees();
            toasts?.info('Сотрудник удалён', { duration: 2000 });
        }
    }
};

// ===== ВЫХОД =====
function initOrgLogout() {
    document.getElementById('orgLogoutBtn')?.addEventListener('click', () => {
        if (confirm('Выйти из кабинета организации?')) {
            window.location.href = 'dashboard.html';
        }
    });
}