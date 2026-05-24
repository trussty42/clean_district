document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Подсветка активной ссылки
    setActiveLink();
    
    // 2. Бургер-меню
    initMobileMenu();
    
    // 3. Кнопки в hero
    initHeroButtons();
    
    // 4. Загрузка новостей с API
    loadNews();
    
    // 5. Кнопка входа/профиля
    if (typeof initAuthButton === 'function') {
        initAuthButton();
    }
});


// -------------------- НАВИГАЦИЯ --------------------

function setActiveLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    document.querySelectorAll('.js-nav-link').forEach(link => {
        link.classList.remove('header__menu-link_active');
        if (link.dataset.page === currentPage) {
            link.classList.add('header__menu-link_active');
        }
    });
}


// -------------------- МЕНЮ --------------------

function initMobileMenu() {
    const burger = document.querySelector('.header__burger');
    const navGroup = document.querySelector('.header__nav-group');
    const body = document.body;

    if (!burger || !navGroup) return;

    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        navGroup.classList.toggle('open');
        body.classList.toggle('menu-open');
    });

    document.querySelectorAll('.header__menu-link').forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            navGroup.classList.remove('open');
            body.classList.remove('menu-open');
        });
    });
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.header__nav-group') && 
            !e.target.closest('.header__burger') &&
            navGroup.classList.contains('open')) {
            burger.classList.remove('active');
            navGroup.classList.remove('open');
            body.classList.remove('menu-open');
        }
    });
}


// -------------------- HERO --------------------

function initHeroButtons() {
    const catalogBtn = document.querySelector('.hero__button-catalog');
    const mapBtn = document.querySelector('.hero__button-map');
    
    if (catalogBtn) {
        catalogBtn.addEventListener('click', () => window.location.href = 'catalog.html');
    }
    if (mapBtn) {
        mapBtn.addEventListener('click', () => window.location.href = 'map.html');
    }
}


// -------------------- НОВОСТИ --------------------

async function loadNews() {
    try {
        const response = await fetch('/api/v1/news/');
        const data = await response.json();

        // если DRF pagination
        const newsList = data.results || data;

        renderNews(newsList);
    } catch (error) {
        console.error('Ошибка загрузки новостей:', error);
    }
}


function renderNews(newsList) {
    const container = document.querySelector('.news-cards');
    if (!container) return;

    container.innerHTML = '';

    newsList.forEach(news => {
        const el = document.createElement('article');
        el.className = 'news-card';

        el.innerHTML = `
            <p class="news-card__date">${formatDate(news.created_at)}</p>
            <h3 class="news-card__title">${news.title}</h3>
            <div class="news-card__content">
                <p class="news-card__short">${getShortText(news)}</p>
                <div class="news-card__full">
                    <p>${news.text}</p>
                </div>
            </div>
            <button class="button__read-more">
                <span class="button__text">Читать полностью</span>
            </button>
        `;

        container.appendChild(el);
    });

    // перевешиваем обработчики
    initNewsToggle();
}


function initNewsToggle() {
    document.querySelectorAll('.button__read-more').forEach(button => {
        button.addEventListener('click', function() {
            const newsItem = this.closest('.news-card');
            const newsFull = newsItem?.querySelector('.news-card__full');
            const btnText = this.querySelector('.button__text');
            
            if (!newsFull || !btnText) return;
            
            const isExpanded = newsFull.classList.contains('active');
            newsFull.classList.toggle('active');
            this.classList.toggle('expanded');
            btnText.textContent = isExpanded ? 'Читать полностью' : 'Свернуть';
            
            if (!isExpanded) {
                newsItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    });
}


// -------------------- УТИЛИТЫ --------------------

function getShortText(news) {
    if (news.short_description) return news.short_description;
    return news.content ? news.content.slice(0, 120) + '...' : '';
}


function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}
