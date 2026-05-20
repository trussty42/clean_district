// Данные каталога
const catalogData = [
    { 
        id: 1, 
        name: "Книга", 
        category: "Бумага и картон", 
        type: "paper", 
        price: 34, 
        image: "book.svg",
        preparation: [
            "Удалить скрепки и скобы",
            "Снять пластиковую обложку",
            "Сложить в стопку"
        ],
        notAccepted: [
            "Книги с плесенью",
            "Мокрые и грязные книги",
            "Книги с восковыми страницами"
        ]
    },
    { 
        id: 2, 
        name: "Пластиковые стаканы", 
        category: "Пластик", 
        type: "plastic", 
        price: 5, 
        image: "noimg.svg",
        preparation: [
            "Сполоснуть от остатков напитка",
            "Снять крышку и трубочку",
            "Максимально сжать"
        ],
        notAccepted: [
            "Стаканы с пищевыми отходами",
            "Стаканы из-под молочных продуктов (не промытые)",
            "Стаканы с металлическим напылением"
        ]
    },
    { 
        id: 7, 
        name: "Пластиковая бутылка", 
        category: "Пластик", 
        type: "plastic", 
        price: 22, 
        image: "bottle.jpg",
        preparation: [
            "Сполоснуть",
            "Максимально сжать",
            "Крышку можно сдать отдельно"
        ],
        notAccepted: [
            "Бутылки из-под масла и бытовой химии",
            "Бутылки с остатками жидкости",
            "Бутылки с этикетками из плёнки ПВХ"
        ]
    },
    { 
        id: 10, 
        name: "Стеклянная бутылка", 
        category: "Стекло", 
        type: "glass", 
        price: 15, 
        image: "noimg.svg",
        preparation: [
            "Сполоснуть",
            "Снять этикетку (по возможности)",
            "Не разбивать"
        ],
        notAccepted: [
            "Битое стекло",
            "Зеркала",
            "Хрусталь",
            "Керамику и фаянс"
        ]
    },
    { 
        id: 11, 
        name: "Алюминиевая банка", 
        category: "Металл", 
        type: "metal", 
        price: 45, 
        image: "noimg.svg",
        preparation: [
            "Сполоснуть",
            "Максимально сжать",
            "Удалить пластиковую крышку"
        ],
        notAccepted: [
            "Банки из-под краски и химии",
            "Аэрозольные баллончики",
            "Банки с острыми краями"
        ]
    }
];

let filteredData = [...catalogData];
let currentPage = 1;
const itemsPerPage = 12;

document.addEventListener('DOMContentLoaded', () => {
    renderCatalog();
    initFilters();
    initSearch();
    initSort();
    initPagination();
    initModal();
});

function renderCatalog() {
    const grid = document.getElementById('catalogGrid');
    if (!grid) return;
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const items = filteredData.slice(start, end);
    
    if (items.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #888;">Ничего не найдено</div>';
    } else {
        grid.innerHTML = items.map(item => `
            <div class="catalog-item" onclick="window.showItemDetails(${item.id})">
                <div class="item-image">
                    <img src="./images/catalog/${item.image}" 
                        alt="${item.name}" 
                        onerror="this.src='./images/noimg.svg'">
                </div>
                <h3 class="item-name">${item.name}</h3>
                <p class="item-category">${item.category}</p>
                <div class="item-price">${item.price} руб/кг</div>
                <div class="item-arrow">
                    <img src="./images/arrow.svg" alt="Подробнее" onerror="this.style.display='none'"/>
                </div>
            </div>
        `).join('');
    }
    
    const countEl = document.querySelector('.found-count strong');
    if (countEl) countEl.textContent = filteredData.length;
}

function initFilters() {
    const applyBtn = document.getElementById('applyFilters');
    const resetBtn = document.getElementById('resetFilters');
    if (applyBtn) applyBtn.addEventListener('click', applyFilters);
    if (resetBtn) resetBtn.addEventListener('click', resetFilters);
}

function applyFilters() {
    const checkedTypes = Array.from(document.querySelectorAll('.checkbox-item input:checked'))
        .map(input => {
            const label = input.closest('.checkbox-item');
            if (!label) return null;
            const text = label.textContent;
            if (text.includes('Пластик')) return 'plastic';
            if (text.includes('Стекло')) return 'glass';
            if (text.includes('Электроника')) return 'electronic';
            if (text.includes('Металл')) return 'metal';
            if (text.includes('Бумага')) return 'paper';
            if (text.includes('Мебель')) return 'furniture';
            if (text.includes('Текстиль')) return 'textile';
            if (text.includes('Батарейки')) return 'battery';
            if (text.includes('Строительный')) return 'construction';
            if (text.includes('Дерево')) return 'tree';
            if (text.includes('Автошины')) return 'tire';
            if (text.includes('Лампочки')) return 'bulb';
            return null;
        })
        .filter(Boolean);
    
    const priceInputs = document.querySelectorAll('.price-input');
    const priceFrom = Math.max(0, parseFloat(priceInputs[0]?.value) || 0);
    let priceTo = parseFloat(priceInputs[1]?.value);
    if (isNaN(priceTo) || priceTo < 0) priceTo = Infinity;
    
    filteredData = catalogData.filter(item => {
        const typeMatch = checkedTypes.length === 0 || checkedTypes.includes(item.type);
        const priceMatch = item.price >= priceFrom && item.price <= priceTo;
        return typeMatch && priceMatch;
    });
    
    currentPage = 1;
    renderCatalog();
    initPagination();
}

function resetFilters() {
    document.querySelectorAll('.checkbox-item input').forEach(input => input.checked = false);
    document.querySelectorAll('.price-input').forEach(input => input.value = '');
    filteredData = [...catalogData];
    currentPage = 1;
    renderCatalog();
    initPagination();
}

function initSearch() {
    const searchInput = document.querySelector('.search-input-wrapper input');
    if (!searchInput) return;
    let timeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            const query = e.target.value.toLowerCase().trim();
            filteredData = catalogData.filter(item => 
                item.name.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query)
            );
            currentPage = 1;
            renderCatalog();
            initPagination();
        }, 300);
    });
}

function initSort() {
    const sortSelect = document.querySelector('.catalog-header-info .sort-select');
    if (!sortSelect) return;
    sortSelect.addEventListener('change', (e) => {
        const sort = e.target.value;
        switch(sort) {
            case 'name-asc': filteredData.sort((a, b) => a.name.localeCompare(b.name)); break;
            case 'name-desc': filteredData.sort((a, b) => b.name.localeCompare(a.name)); break;
            case 'price-asc': filteredData.sort((a, b) => a.price - b.price); break;
            case 'price-desc': filteredData.sort((a, b) => b.price - a.price); break;
            default: filteredData.sort((a, b) => a.id - b.id);
        }
        renderCatalog();
    });
}

function initPagination() {
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    if (totalPages <= 1) { pagination.innerHTML = ''; return; }
    
    pagination.innerHTML = `
        <button class="page-btn" onclick="window.changePage(-1)" ${currentPage === 1 ? 'disabled' : ''}>
            <img src="./images/left.svg" alt="<" style="width:16px;height:16px" onerror="this.style.display='none'">
        </button>
        <span style="color:#666;font-size:14px">Страница ${currentPage} из ${totalPages}</span>
        <button class="page-btn" onclick="window.changePage(1)" ${currentPage === totalPages ? 'disabled' : ''}>
            <img src="./images/right.svg" alt=">" style="width:16px;height:16px" onerror="this.style.display='none'">
        </button>
    `;
}

window.changePage = function(delta) {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const newPage = currentPage + delta;
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderCatalog();
        initPagination();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

function initModal() {
    const modal = document.getElementById('productModal');
    
    if (!modal) {
        console.error('Модальное окно #productModal не найдено в HTML!');
        return;
    }
    
    const modalClose = document.querySelector('.modal-close');
    const modalCloseBtn = document.querySelector('.modal-close-btn');
    
    window.showItemDetails = function(id) {
        console.log('Открытие товара с id:', id);
        const item = catalogData.find(i => i.id === id);
        if (!item) {
            console.warn('Товар с id=' + id + ' не найден');
            return;
        }
        openModal(item, modal);
    };

    function openModal(item, modalEl) {
        console.log('Открытие модалки для:', item.name);
        
        const img = document.getElementById('modalImg');
        if (img) {
            img.src = `./images/catalog/${item.image}`;
            img.alt = item.name;
        }
        
        const elements = {
            'modalTitle': item.name,
            'modalCategory': `${item.category}`,
            'modalType': `Тип: ${item.type}`,
            'modalPrice': `${item.price} руб/кг`
        };
        
        Object.keys(elements).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = elements[id];
        });
        
        const prepList = document.getElementById('modalPreparation');
        if (prepList) {
            if (item.preparation?.length) {
                prepList.innerHTML = item.preparation.map(step => `<li>${step}</li>`).join('');
            } else {
                prepList.innerHTML = '<li>Информация уточняется</li>';
            }
        }
        
        const notAccList = document.getElementById('modalNotAccepted');
        if (notAccList) {
            if (item.notAccepted?.length) {
                notAccList.innerHTML = item.notAccepted.map(txt => `<li>${txt}</li>`).join('');
            } else {
                notAccList.innerHTML = '<li>Информация уточняется</li>';
            }
        }
        
        const recycledText = document.getElementById('modalRecycled');
        if (recycledText) {
            recycledText.textContent = getRecycledItems(item.type);
        }

        modalEl.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modalEl) {
        modalEl.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (modalClose) modalClose.addEventListener('click', () => closeModal(modal));
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', () => closeModal(modal));
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal(modal);
        }
    });
}

function getRecycledItems(type) {
    const recycledMap = {
        'plastic': 'Новые бутылки, одежда из флиса, упаковка, стройматериалы, ковры, пакеты, канцелярия',
        'paper': 'Новая бумага и картон, туалетная бумага, салфетки, яичные лотки, упаковка',
        'glass': 'Новые бутылки и банки, стекловата, стройматериалы, декоративная плитка',
        'metal': 'Новые банки, автодетали, велосипеды, сантехника, стройматериалы, оконные рамы',
        'electronic': 'Драгоценные металлы, стекло для мониторов, материалы для кабелей',
        'furniture': 'ДСП, наполнитель для мебели, топливные брикеты',
        'textile': 'Наполнитель для игрушек и мебели, новая пряжа, утеплитель для одежды и стройматериалов',
        'battery': 'Новые батарейки, новые аккумуляторы, батареи для гаджетов',
        'construction': 'Щебень для дорог и фундаментов, топливные брикеты, удобрение для почвы',
        'tree': 'Топливные брикеты, ДСП, компост, щепа для клумб',
        'tire': 'Покрытие для спортивных площадок, добавка в асфальт, топливо для цементых заводов',
        'bulb': 'Новые лампочки, извлечение драгоценных металлов, стройматериалы'
    };
    return recycledMap[type] || 'Вторичные материалы';
}