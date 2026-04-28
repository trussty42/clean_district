let currentView = 'map';
let allPoints = [
    {
        id: 1,
        coords: [56.837435, 60.597636],
        name: 'Вторплюс',
        address: 'г. Екатеринбург, ул. Куйбышева, 21',
        phone: '+7 (777) 777-77-77',
        email: 'vtorplusekologiyu.ru',
        hours: 'Пн-Пт: 12:00-20:00',
        types: ['Пластик', 'Бумага', 'Электроника'],
        prices: {
            'Пластик': '22 ₽/кг',
            'Бумага': '8 ₽/кг',
            'Электроника': '40 ₽/кг'
        },
        rating: 4.8,
        reviews: 15,
        isOpenNow: true,
        is24hours: false
    },
    {
        id: 2,
        coords: [56.836766, 60.657949],
        name: 'ЭкоПункт',
        address: 'г. Екатеринбург, ул. Коминтерна, 11',
        phone: '+7 (495) 987-65-43',
        email: '',
        hours: 'Пн-Пт: 9:00-18:00',
        types: ['Пластик', 'Бумага', 'Текстиль'],
        prices: {
            'Пластик': '20 ₽/кг',
            'Бумага': '10 ₽/кг',
            'Текстиль': '15 ₽/кг'
        },
        rating: 4.5,
        reviews: 8,
        isOpenNow: true,
        is24hours: false
    }
];
let filteredPoints = [...allPoints];

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

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
    if (typeof ymaps === 'undefined') {
        console.error('Яндекс.Карты API не загружен');
        return;
    }
    
    ymaps.ready(() => {
        initMap();
        initViewToggle();
        initFilters();
        initSearch();
        initSort(); // Инициализируем сортировку
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
        
        timeout = setTimeout(() => {
            const query = e.target.value.toLowerCase().trim();
            
            filteredPoints = allPoints.filter(p => 
                p.name.toLowerCase().includes(query) ||
                p.address.toLowerCase().includes(query)
            );
            
            updateFoundCount();
            
            if (currentView === 'list') {
                renderList();
            } else {
                if (window.yandexMap) {
                    window.yandexMap.geoObjects.removeAll();
                    filteredPoints.forEach(p => {
                        addMarker(window.yandexMap, p.coords, p.name, p.address, p.phone, p.hours, p.types);
                    });
                    if (filteredPoints.length > 1) {
                        window.yandexMap.setBounds(window.yandexMap.geoObjects.getBounds(), {
                            checkZoomRange: true,
                            zoomMargin: 50
                        });
                    }
                }
            }
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

function applyFilters() {
    const checkedTypes = Array.from(document.querySelectorAll('input[name="type"]:checked'))
        .map(i => i.value);
    const minRating = parseFloat(document.getElementById('ratingRange')?.value) || 0;
    const maxRadius = parseFloat(document.getElementById('radiusRange')?.value) || 50;
    
    const userCoords = window.userCoordinates || null;
    
    filteredPoints = allPoints.filter(p => {
        const typeMatch = checkedTypes.length === 0 || 
            checkedTypes.some(t => p.types.some(pt => pt.toLowerCase().includes(t)));
        const ratingMatch = p.rating >= minRating;
        
        let radiusMatch = true;
        if (userCoords && p.coords) {
            const distance = calculateDistance(userCoords, p.coords);
            radiusMatch = distance <= maxRadius;
        }
        
        return typeMatch && ratingMatch && radiusMatch;
    });
    
    updateFoundCount();
    
    if (currentView === 'list') {
        renderList();
    } else {
        if (window.yandexMap) {
            window.yandexMap.geoObjects.removeAll();
            filteredPoints.forEach(p => {
                addMarker(window.yandexMap, p.coords, p.name, p.address, p.phone, p.hours, p.types);
            });
            if (filteredPoints.length > 1) {
                window.yandexMap.setBounds(window.yandexMap.geoObjects.getBounds(), {
                    checkZoomRange: true,
                    zoomMargin: 50
                });
            }
        }
    }
    
    document.getElementById('filtersSidebar')?.classList.remove('open');
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
    
    updateFoundCount();
    
    if (currentView === 'list') {
        renderList();
    } else {
        if (window.yandexMap) {
            window.yandexMap.geoObjects.removeAll();
            filteredPoints.forEach(p => {
                addMarker(window.yandexMap, p.coords, p.name, p.address, p.phone, p.hours, p.types);
            });
        }
    }
    
    document.getElementById('filtersSidebar')?.classList.remove('open');
    console.log('Сброс завершён');
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

window.openSidePanel = function(id) {
    const point = allPoints.find(p => p.id === id);
    if (!point) return;
    
    currentPanelPoint = point;
    const panel = document.getElementById('pointSidePanel');
    const content = document.getElementById('panelContent');
    
    // Формируем цены
    const pricesHtml = point.prices ? Object.entries(point.prices).map(([m, p]) => `
        <div class="panel-price-item"><span class="panel-price-material">${m}</span><span class="panel-price-value">${p}</span></div>
    `).join('') : '';
    
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

        <!-- Цены -->
        ${pricesHtml ? `
            <div class="panel-section">
                <h4 class="panel-section-title">Цены</h4>
                <div class="panel-prices" style="display:flex; flex-direction:column; gap:6px;">
                    ${pricesHtml}
                </div>
            </div>
        ` : ''}

        <!-- Отзывы -->
        <div class="panel-section">
            <h4 class="panel-section-title">Отзывы</h4>
            
            <div class="review-item">
                <div class="review-top">
                    <div class="review-user">
                        <div class="review-avatar">i</div>
                        <div class="review-info">
                            <span class="review-name">ivan229</span>
                            <span class="review-date">15.04.2026</span>
                        </div>
                    </div>
                    <span class="review-stars">★★★★★</span>
                </div>
                <p class="review-text">Отличный пункт! Быстро принимают, персонал вежливый. Цены адекватные.</p>
            </div>

            <div class="review-item">
                <div class="review-top">
                    <div class="review-user">
                        <div class="review-avatar">s</div>
                        <div class="review-info">
                            <span class="review-name">sonixks</span>
                            <span class="review-date">02.04.2026</span>
                        </div>
                    </div>
                    <span class="review-stars">★★★★☆</span>
                </div>
                <p class="review-text">Удобное расположение. Принимают без очередей в обеденное время.</p>
            </div>

            <div class="review-item">
                <div class="review-top">
                    <div class="review-user">
                        <div class="review-avatar">y</div>
                        <div class="review-info">
                            <span class="review-name">yastepan4ik</span>
                            <span class="review-date">03.03.2026</span>
                        </div>
                    </div>
                    <span class="review-stars">★★★★★</span>
                </div>
                <p class="review-text">Вообще супер!!</p>
            </div>
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