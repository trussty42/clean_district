let catalogData = [];
let filteredData = [...catalogData];
let currentPage = 1;
const itemsPerPage = 12;
const wasteTypes = {

    plastic: 'Пластик',
    glass: 'Стекло',
    biological: 'Био отходы',
    metal: 'Металл',
    paper: 'Бумага',
    cardboard: 'Картон',
    battery: 'Батарейки',
    clothes: 'Одежда',
    shoes: 'Обувь',
    trash: 'Мусор'
};

async function loadCatalog() {

    try {

        const response = await fetch('/api/v1/waste-catalog/');

        catalogData = await response.json();

        filteredData = [...catalogData];
        renderCatalog();

        initPagination();

    } catch (error) {
    }
}

document.addEventListener(
    'DOMContentLoaded',
    async () => {

        initFilters();
        initSearch();
        initSort();
        initModal();

        await loadCatalog();

    }
);

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
                <p class="item-category">${wasteTypes[item.type]}</p>
                <div class="item-price">
                    ${item.price.toFixed(2)} руб/кг
                </div>

                <div class="item-points">
                    ${item.points_count}
                    пунктов приёма
                </div>
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
            if (text.includes('Био отходы')) return 'biological';
            if (text.includes('Металл')) return 'metal';
            if (text.includes('Бумага')) return 'paper';
            if (text.includes('Батарейки')) return 'battery';
            if (text.includes('Картон')) return 'cardboard';
            if (text.includes('Одежда')) return 'clothes';
            if (text.includes('Обувь')) return 'shoes';
            if (text.includes('Мусор')) return 'trash';
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
                item.waste_name.toLowerCase().includes(query) ||
                wasteTypes[item.waste_type]
                    ?.toLowerCase()
                    .includes(query)
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
        return;
    }
    
    const modalClose = document.querySelector('.modal-close');
    const modalCloseBtn = document.querySelector('.modal-close-btn');
    
    window.showItemDetails = function(id) {
        const item = catalogData.find(i => i.id === id);
        if (!item) {
            return;
        }
        openModal(item, modal);
    };

    function openModal(item, modalEl) {
        
        const img = document.getElementById('modalImg');
        if (img) {
            img.src = './images/noimg.svg';
            img.alt = item.waste_name;
        }
        
        const elements = {
            'modalTitle': item.waste_name,
            'modalCategory': item.waste_type_display,
            'modalType': `Тип: ${item.waste_type_display}`,
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
        
        const descriptionText =
            document.getElementById('modalNotAccepted');

        if (descriptionText) {

            descriptionText.textContent =
                item.description ||
                'Информация уточняется';
        }
        
        const recycledText = document.getElementById('modalRecycled');
        if (item.warning) {
            recycledText.textContent = 
            item.warning ||
            'Информация уточняется';;
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