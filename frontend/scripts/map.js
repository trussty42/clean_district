let currentView = 'map';
let allPoints = [];
let filteredPoints = [];

function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                window.userCoordinates = [
                    position.coords.latitude,
                    position.coords.longitude
                ];
                console.log('Координаты пользователя:', window.userCoordinates);
            },
            (error) => {
                console.warn('Не удалось получить координаты:', error);
            }
        );
    }
}

async function loadPoints() {

    try {

        const response = await fetch(
            '/api/v1/points/'
        );

        if (!response.ok) {

            throw new Error(
                'Ошибка загрузки точек'
            );
        }

        const data = await response.json();

        allPoints = data.map(point => ({

            id: point.id,

            coords: [
                point.latitude,
                point.longitude
            ],

            name:
                point.organization_name ||
                'Пункт приёма',

            address: point.adress,

            phone:
                point.organization_phone || '',

            email:
                point.organization_email || '',

            types:
                point.waste_types || [],

            reviewsData:
                point.reviews || [],

            hours: point.work_schedule,

            isOpenNow: true,

            is24hours: false,

            prices: Object.fromEntries(

                (point.waste_types || []).map(item => [

                    item.waste_name,

                    `${item.price} ₽/кг`
                ])
            ),
            rating:
                point.average_rating || 0,

            reviews:
                point.reviews_count || 0,
        }));

        filteredPoints = [...allPoints];

        console.log(
            'Точки загружены:',
            allPoints
        );

    } catch (error) {

        console.error(
            'Ошибка загрузки точек:',
            error
        );
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
    if (typeof ymaps === 'undefined') {
        console.error('Яндекс.Карты API не загружен');
        return;
    }
    
    ymaps.ready(async () => {

        await loadPoints();
        initMap();
        initViewToggle();
        initFilters();
        initSearch();
        initSort();
        renderList();
    });
    
    // Вызываем получение геолокации
    getUserLocation();
});

// ===== КАРТА =====
function initMap() {
    try {
        const mapElement = document.getElementById('map');
        if (!mapElement) {
            console.error('Контейнер #map не найден');
            return;
        }
        
        window.yandexMap = new ymaps.Map(mapElement, {
            center: [56.837435, 60.597636],
            zoom: 13,
            controls: ['zoomControl', 'geolocationControl']
        });
        
        filteredPoints.forEach(point => {
            addMarker(
                window.yandexMap, 
                point.coords, 
                point.name, 
                point.address,
                point.phone,
                point.hours,
                point.types,
                point.rating,
                point.reviews,
                point.isOpenNow,
                point.id //Подробнее
            );
        });
        
        if (filteredPoints.length > 1) {
            window.yandexMap.setBounds(window.yandexMap.geoObjects.getBounds(), {
                checkZoomRange: true,
                zoomMargin: 50
            });
        }
        
        console.log('Карта загружена');
        
    } catch (error) {
        console.error('Ошибка карты:', error);
    }
}

function addMarker(map, coords, name, address, phone, hours, types, rating, reviews, isOpenNow, id) {
    const placemark = new ymaps.Placemark(coords, {
        balloonContent: `
            <div class="map-balloon">
                <button class="balloon-close" onclick="closeBalloon()" aria-label="Закрыть">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                <div class="balloon-header">
                    <h3 class="balloon-title">${name}</h3>
                    ${rating ? `
                        <div class="balloon-rating">
                            <span class="star">★</span>
                            <span class="rating-value">${rating}</span>
                            <span class="rating-count">${reviews} оценок</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="balloon-body">
                    <p class="balloon-address">${address}</p>
                    
                    ${hours ? `<p class="balloon-hours">${hours}</p>` : ''}
                </div>
                
                <div class="balloon-footer">
                    <span class="status-badge ${isOpenNow ? 'status-open' : 'status-closed'}">
                        ${isOpenNow ? 'открыто' : 'закрыто'}
                    </span>
                    <button class="balloon-btn" onclick="openSidePanel(${id})">
                        <img src="./images/arrow.svg" alt="Подробнее" onerror="this.style.display='none'"/>
                    </button>
                </div>
            </div>
        `,
        hintContent: `${name} — ${address}`
    }, {
        preset: 'islands#greenRecyclingIcon',
        iconColor: '#609432',
        balloonMaxWidth: 300, // Ограничиваем максимальную ширину
        balloonMinWidth: 300, // Фиксируем ширину
        balloonCloseButton: false,
        balloonPanelMaxMapArea: 0 // Отключаем панель
    });
    
    map.geoObjects.add(placemark);
}

function initViewToggle() {
    const viewRadios = document.querySelectorAll('.view-switcher input[type="radio"]');
    const mapView = document.getElementById('mapView');
    const listView = document.getElementById('listView');
    
    viewRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const view = radio.value;
            currentView = view;
            
            if (view === 'map') {
                mapView?.classList.add('active');
                listView?.classList.remove('active');
            } else {
                mapView?.classList.remove('active');
                listView?.classList.add('active');
                renderList();
            }
        });
    });
}

// ===== ОТРИСОВКА СПИСКА =====
function renderList() {
    const listContent = document.getElementById('listContent');
    const foundCount = document.querySelector('.found-count strong');
    
    if (!listContent) return;
    if (foundCount) foundCount.textContent = filteredPoints.length;
    
    if (filteredPoints.length === 0) {
        listContent.innerHTML = '<p style="text-align:center;padding:40px;color:#888">Ничего не найдено</p>';
        return;
    }
    
    listContent.innerHTML = filteredPoints.map(point => `
        <div class="collection-point-card" onclick="window.openSidePanel(${point.id})">
            <div class="card-header">
                <h3 class="card-title">${point.name}</h3>
                ${point.rating ? `
                    <div class="card-rating">
                        <span class="star">★</span>
                        <span class="rating-value">${point.rating}</span>
                        <span class="rating-count">${point.reviews} оценок</span>
                    </div>
                ` : ''}
            </div>
            
            <div class="card-body">
                <div class="card-info-item">
                    <span class="info-text">${point.address}</span>
                </div>
                
                ${point.hours ? `
                    <div class="card-info-item">
                        <span class="info-text">${point.hours}</span>
                    </div>
                ` : ''}
                
            </div>
            
            <div class="card-footer">
                <span class="status-badge ${point.isOpenNow ? 'status-open' : 'status-closed'}">
                    ${point.isOpenNow ? 'открыто' : 'закрыто'}
                </span>
                <button class="card-btn" onclick="event.stopPropagation(); window.openSidePanel(${point.id})">Подробнее</button>
            </div>
        </div>
    `).join('');
}

function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    let timeout;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        
        setTimeout(() => {

            applyFilters();

        }, 300);
    });
}

function initSort() {
    const sortSelect = document.getElementById('sortSelect');
    if (!sortSelect) return;
    
    sortSelect.addEventListener('change', (e) => {
        sortPoints(e.target.value);
    });
}

async function applyFilters() {

    const checkedTypes = [

        ...document.querySelectorAll(
            'input[name="type"]:checked'
        )

    ].map(cb => cb.value);

    const search = document
        .getElementById('searchInput')
        ?.value
        ?.trim();

    const rating = document
        .getElementById('ratingRange')
        ?.value;

    const radius = document
        .getElementById('radiusRange')
        ?.value;

    const params = new URLSearchParams();

    // Типы отходов
    if (checkedTypes.length) {

        params.append(
            'waste_type',
            checkedTypes.join(',')
        );
    }

    // Поиск
    if (search) {

        params.append(
            'search',
            search
        );
    }

    // Рейтинг
    if (rating > 0) {

        params.append(
            'rating_from',
            rating
        );
    }

    // Радиус
    if (
        radius > 0 &&
        window.userCoordinates
    ) {

        params.append(
            'radius',
            radius
        );

        params.append(
            'lat',
            window.userCoordinates[0]
        );

        params.append(
            'lon',
            window.userCoordinates[1]
        );
    }

    try {

        const response = await fetch(

            `/api/v1/points/?${params}`
        );

        const data = await response.json();
        console.log(data);
        allPoints = data.map(point => ({

            id: point.id,

            coords: [
                point.latitude,
                point.longitude
            ],

            name:
                point.organization_name,

            address:
                point.adress,

            phone:
                point.organization_phone,

            email:
                point.organization_email,

            hours:
                point.work_schedule,

            rating:
                point.average_rating || 0,

            reviews:
                point.reviews_count || 0,

            types:
                point.waste_types || [],

            reviewsData:
                point.reviews || [],

            isOpenNow: true
        }));

        filteredPoints = [...allPoints];

        renderList();

        refreshMapMarkers();

        updateFoundCount();

        document
            .getElementById(
                'filtersSidebar'
            )
            ?.classList.remove('open');

    } catch (error) {

        console.error(
            'Ошибка фильтрации:',
            error
        );
    }
}

function refreshMapMarkers() {

    if (!window.yandexMap) return;

    window.yandexMap.geoObjects.removeAll();

    filteredPoints.forEach(point => {

        addMarker(
            window.yandexMap,
            point.coords,
            point.name,
            point.address,
            point.phone,
            point.hours,
            point.types,
            point.rating,
            point.reviews,
            true,
            point.id
        );
    });
}

function sortPoints(type) {
    filteredPoints.sort((a, b) => {
        switch (type) {
            case 'name-asc':
                return a.name.localeCompare(b.name, 'ru');
            case 'name-desc':
                return b.name.localeCompare(a.name, 'ru');
            case 'rating':
                return b.rating - a.rating;
            case 'distance':
                if (window.userCoordinates && a.coords && b.coords) {
                    const distA = calculateDistance(window.userCoordinates, a.coords);
                    const distB = calculateDistance(window.userCoordinates, b.coords);
                    return distA - distB;
                }
                return 0;
            default:
                return a.id - b.id;
        }
    });
    
    if (currentView === 'list') {
        renderList();
    }
    // На карте сортировка не влияет на отображение, но массив обновляется
}

// ===== ФОРМУЛА РАССТОЯНИЯ (Haversine) =====
function calculateDistance(coords1, coords2) {
    if (!coords1 || !coords2) return Infinity;
    const R = 6371;
    const lat1 = coords1[0] * Math.PI / 180;
    const lat2 = coords2[0] * Math.PI / 180;
    const deltaLat = (coords2[0] - coords1[0]) * Math.PI / 180;
    const deltaLon = (coords2[1] - coords1[1]) * Math.PI / 180;
    
    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c;
}

// ===== ПОДСВЕТКА СЛАЙДЕРА =====
function updateSliderBackground(slider) {
    const min = slider.min ? parseFloat(slider.min) : 0;
    const max = slider.max ? parseFloat(slider.max) : 100;
    const val = slider.value;
    const percentage = ((val - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(to right, #609432 ${percentage}%, #e0e0e0 ${percentage}%)`;
}

// ===== ФИЛЬТРЫ =====
function initFilters() {
    const applyBtn = document.getElementById('applyFilters');
    const resetBtn = document.getElementById('resetFilters');
    
    // Слайдер рейтинга
    const ratingRange = document.getElementById('ratingRange');
    const ratingValue = document.getElementById('ratingValue');
    if (ratingRange && ratingValue) {
        ratingRange.addEventListener('input', () => {
            ratingValue.textContent = ratingRange.value;
            updateSliderBackground(ratingRange);
        });
        updateSliderBackground(ratingRange);
    }
    
    // Слайдер радиуса
    const radiusRange = document.getElementById('radiusRange');
    const radiusValue = document.getElementById('radiusValue');
    if (radiusRange && radiusValue) {
        radiusRange.addEventListener('input', () => {
            radiusValue.textContent = radiusRange.value;
            updateSliderBackground(radiusRange);
        });
        updateSliderBackground(radiusRange);
    }
    
    if (applyBtn) applyBtn.addEventListener('click', applyFilters);
    if (resetBtn) resetBtn.addEventListener('click', resetFilters);
    
    // ===== ВЫБОР ВРЕМЕНИ =====
    const customTimeRadio = document.getElementById('customTimeRadio');
    const customTimePicker = document.getElementById('customTimePicker');
    const customDate = document.getElementById('customDate');
    const timeFrom = document.getElementById('timeFrom');
    const timeTo = document.getElementById('timeTo');
    
    if (customDate) {
        const today = new Date().toISOString().split('T')[0];
        customDate.value = today;
        customDate.min = today;
    }
    
    if (customTimeRadio && customTimePicker) {
        customTimeRadio.addEventListener('change', () => {
            if (customTimeRadio.checked) {
                customTimePicker.style.display = 'block';
                setTimeout(() => customDate?.focus(), 100);
            } else {
                customTimePicker.style.display = 'none';
            }
        });
    }
    
    document.querySelectorAll('input[name="hours"]').forEach(radio => {
        if (radio !== customTimeRadio) {
            radio.addEventListener('change', () => {
                if (customTimePicker) customTimePicker.style.display = 'none';
            });
        }
    });
    
    if (timeFrom && timeTo) {
        timeFrom.addEventListener('change', () => {
            if (timeTo.value && timeFrom.value > timeTo.value) {
                timeTo.value = timeFrom.value;
                alert('Время окончания не может быть раньше времени начала!');
            }
        });
        timeTo.addEventListener('change', () => {
            if (timeFrom.value && timeTo.value < timeFrom.value) {
                timeFrom.value = timeTo.value;
                alert('Время начала не может быть позже времени окончания!');
            }
        });
    }
    
    // ===== МОБИЛЬНОЕ МЕНЮ =====
    const filtersToggle = document.getElementById('filtersToggle');
    const filtersClose = document.getElementById('filtersClose');
    const filtersSidebar = document.getElementById('filtersSidebar');
    
    if (filtersToggle && filtersSidebar) {
        filtersToggle.addEventListener('click', () => filtersSidebar.classList.add('open'));
    }
    if (filtersClose && filtersSidebar) {
        filtersClose.addEventListener('click', () => filtersSidebar.classList.remove('open'));
    }
    if (filtersSidebar) {
        filtersSidebar.addEventListener('click', (e) => {
            if (e.target === filtersSidebar) filtersSidebar.classList.remove('open');
        });
    }
}

function resetFilters() {
    // Сбрасываем чекбоксы
    document.querySelectorAll('input[name="type"]').forEach(cb => cb.checked = false);
    
    // Сбрасываем рейтинг
    const ratingRange = document.getElementById('ratingRange');
    const ratingValue = document.getElementById('ratingValue');
    if (ratingRange) { ratingRange.value = 0; }
    if (ratingValue) { ratingValue.textContent = '0'; updateSliderBackground(ratingRange); }
    
    // Отмечаем "открыто сейчас"
    document.querySelectorAll('input[name="hours"]').forEach(radio => {
        radio.checked = (radio.value === 'now');
    });
    
    // Скрываем кастомное время
    const customTimePicker = document.getElementById('customTimePicker');
    if (customTimePicker) customTimePicker.style.display = 'none';
    
    // Сбрасываем радиус
    const radiusRange = document.getElementById('radiusRange');
    const radiusValue = document.getElementById('radiusValue');
    if (radiusRange) { radiusRange.value = 0; }
    if (radiusValue) { radiusValue.textContent = '0'; updateSliderBackground(radiusRange); }
    
    // Возвращаем все пункты
    filteredPoints = [...allPoints];
    
    loadPoints().then(() => {

        renderList();

        refreshMapMarkers();

        updateFoundCount();

        document
            .getElementById('filtersSidebar')
            ?.classList.remove('open');

        console.log('Сброс завершён');
    });
}

function updateFoundCount() {
    const foundCountEl = document.querySelector('.found-count strong');
    if (foundCountEl) foundCountEl.textContent = filteredPoints.length;
}

// для закрытия любого открытого баллона
window.closeBalloon = function() {
    if (window.yandexMap) {
        window.yandexMap.geoObjects.each(function (obj) {
            if (obj.balloon && obj.balloon.isOpen()) {
                obj.balloon.close();
            }
        });
    }
};

let currentPanelPoint = null; //Глобальная переменная для хранения открытого пункта

window.openSidePanel = async function(id) {
    const viewed =
        JSON.parse(
            sessionStorage.getItem(
                'viewedPoints'
            ) || '[]'
        );

    if (!viewed.includes(id)) {

        try {

            await fetch(
                `/api/v1/points/${id}/view/`,
                {
                    method: 'POST'
                }
            );

            viewed.push(id);

            sessionStorage.setItem(
                'viewedPoints',
                JSON.stringify(viewed)
            );

        } catch (error) {

            console.error(error);
        }
    }

    const point = allPoints.find(p => p.id === id);
    if (!point) return;
    
    currentPanelPoint = point;
    const panel = document.getElementById('pointSidePanel');
    const content = document.getElementById('panelContent');
    
    content.innerHTML = `
        <h2>${point.name}</h2>
        <div class="panel-rating" style="display:flex; gap:8px; align-items:center; margin-bottom:24px; font-size:15px;">
            <span style="color:#FFD700;">★</span>
            <strong>${point.rating}</strong>
            <span style="color:#888;">(${point.reviews} оценок)</span>
        </div>
        
        <!-- Время работы -->
        <div class="panel-section">
            <h4 class="panel-section-title">Время работы</h4>
            <div class="panel-time">
                <span class="panel-text">${point.hours}</span>
                <span class="panel-status ${point.isOpenNow ? '' : 'status-closed'}">
                    ${point.isOpenNow ? 'открыто' : 'закрыто'}
                </span>
            </div>
        </div>

        <!-- Адрес -->
        <div class="panel-section">
            <h4 class="panel-section-title">Адрес</h4>
            <p class="panel-text">${point.address}</p>
        </div>

        <!-- Контакты -->
        <div class="panel-section">
            <h4 class="panel-section-title">Контакты</h4>
            <a href="tel:${point.phone.replace(/\D/g, '')}" class="panel-link" style="color:#609432; text-decoration:none;">${point.phone}</a>
            ${point.email ? `<a href="mailto:${point.email}" class="panel-link" style="color:#609432; text-decoration:none; display:block; margin-top:4px;">${point.email}</a>` : ''}
        </div>
        
        <!-- Принимаемые отходы -->
        ${point.types?.length ? `

            <div class="panel-section">

                <h4 class="panel-section-title">
                    Принимаемые отходы
                </h4>

                <div class="panel-types">

                    ${point.types.map(type => `

                        <div class="panel-type-item">

                            <div class="panel-type-header">

                                <span class="panel-type-name">

                                    ${type.waste_name}

                                </span>

                                ${type.price ? `

                                    <span class="panel-type-price">

                                        ${type.price} ₽/кг

                                    </span>

                                ` : ''}

                            </div>

                            <div class="panel-type-category">

                                ${type.waste_type_display}

                            </div>

                        </div>

                    `).join('')}

                </div>

            </div>

        ` : ''}

        <!-- Отзывы -->
        <div class="panel-section">
            <h4 class="panel-section-title">Отзывы</h4>
            
            ${point.reviewsData.map(review => `

                <div class="review-item">

                    <div class="review-top">

                        <div class="review-user">

                            <div class="review-avatar">

                                ${review.user[0]}

                            </div>

                            <div class="review-info">

                                <span class="review-name">

                                    ${review.user}

                                </span>

                                <span class="review-date">

                                    ${new Date(
                                        review.created_at
                                    ).toLocaleDateString('ru-RU')}

                                </span>

                            </div>

                        </div>

                        <span class="review-stars">

                            ${'★'.repeat(review.rating)}

                        </span>

                    </div>

                    <p class="review-text">

                        ${review.text}

                    </p>

                </div>

            `).join('')}
        </div>
    `;

    panel.classList.add('active');

    // Затемнение фона
    const overlay = document.createElement('div');
    overlay.className = 'point-side-overlay active';
    overlay.id = 'pointSideOverlay';
    overlay.onclick = closeSidePanel;
    document.body.appendChild(overlay);
};

window.openReviewForm = function() {
    if (!currentPanelPoint) return;
    
    const review = prompt(`Ваш отзыв для "${currentPanelPoint.name}":`);
    if (review && review.trim() !== "") {
        alert("Спасибо! Отзыв отправлен.");
        // Здесь позже можно добавить fetch-запрос на сервер
    }
};

window.closeSidePanel = function() {
    const panel = document.getElementById('pointSidePanel');
    const overlay = document.getElementById('pointSideOverlay');
    
    panel.classList.remove('active');
    if (overlay) overlay.remove();
};

// Вспомогательные функции
window.buildRoute = function(lat, lon) {
    window.open(`https://yandex.ru/maps/?rtext=~${lat},${lon}&rtt=auto`, '_blank');
};

window.callPoint = function(phone) {
    window.location.href = `tel:${phone.replace(/\D/g, '')}`;
};

window.openReviewForm = function(pointName) {
    const review = prompt(`Напишите отзыв для "${pointName}":`);
    if (review && review.trim() !== "") {
        // Здесь можно добавить отправку на сервер
        alert("Спасибо за ваш отзыв!");
    }
};