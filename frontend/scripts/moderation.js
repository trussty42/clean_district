let rejectType = null;
let rejectId = null;

const counters = {
    organizations: document.getElementById('orgCount'),
    reviews: document.getElementById('reviewCount'),
    news: document.getElementById('newsCount'),
    logs: document.getElementById('logsCount'),
};

const logTypeLabels = {
    organization: 'Организация',
    review: 'Отзыв',
    news: 'Новость',
};

const logActionLabels = {
    approve: 'Одобрено',
    reject: 'Отклонено',
};

document.addEventListener('DOMContentLoaded', async () => {

    const token = localStorage.getItem('ck_access_token');

    if (!token) {
        window.location.href = '/';
        return;
    }

    const response = await fetch('/api/v1/users/me/', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        window.location.href = '/';
        return;
    }

    const user = await response.json();

    if (!user.is_staff) {
        window.location.href = '/';
        return;
    }

    initTabs();

    await Promise.all([
        loadOrganizations(),
        loadReviews(),
        loadNews(),
        loadLogs(),
    ]);
});

function initTabs() {
    document.querySelectorAll('.org-nav-item').forEach((btn) => {
        btn.addEventListener('click', () => {
            document
                .querySelectorAll('.org-nav-item')
                .forEach((item) => item.classList.remove('active'));

            document
                .querySelectorAll('.moderation-tab')
                .forEach((tab) => tab.classList.remove('active'));

            btn.classList.add('active');

            document
                .getElementById(`${btn.dataset.tab}-tab`)
                ?.classList.add('active');
        });
    });
}

async function requestModerationData(url) {
    const token = localStorage.getItem('ck_access_token');

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Не удалось загрузить данные модерации');
    }

    const data = await response.json();
    return Array.isArray(data) ? data : data.results || [];
}

async function requestJson(url) {
    const token = localStorage.getItem('ck_access_token');

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        return null;
    }

    return response.json();
}

function setCounter(type, value) {
    const counter = counters[type] || document.getElementById(`${type}Count`);

    if (counter) {
        counter.textContent = value;
    }
}

function escapeHtml(value = '') {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function renderEmpty(container, text) {
    container.innerHTML = `
        <div class="moderation-card moderation-empty">
            <h3>Пока пусто</h3>
            <p>${text}</p>
        </div>
    `;
}

function renderError(container, text) {
    container.innerHTML = `
        <div class="moderation-card moderation-empty">
            <h3>Ошибка загрузки</h3>
            <p>${text}</p>
        </div>
    `;
}

async function loadOrganizations() {
    const container = document.getElementById('organizationsList');

    try {
        const data = await requestModerationData('/api/v1/moderation/organizations/');
        setCounter('organizations', data.length);
        renderOrganizations(data);
    } catch (error) {
        setCounter('organizations', 0);
        renderError(container, 'Проверьте авторизацию модератора и доступность сервера.');
    }
}

function renderOrganizations(data) {
    const container = document.getElementById('organizationsList');

    if (!data.length) {
        renderEmpty(container, 'Новых организаций на проверке нет.');
        return;
    }

    container.innerHTML = data.map((org) => `
        <div class="moderation-card">
            <span class="status-badge status-pending">На проверке</span>
            <h3>${escapeHtml(org.name)}</h3>
            <p><strong>ИНН:</strong> ${escapeHtml(org.inn || 'не указан')}</p>
            <p><strong>Email:</strong> ${escapeHtml(org.email || 'не указан')}</p>
            <p><strong>Телефон:</strong> ${escapeHtml(org.phone || 'не указан')}</p>
            <div class="moderation-actions">
                <button class="btn-approve" onclick="approveOrganization(${org.id})">Одобрить</button>
                <button class="btn-reject" onclick="openRejectModal('organization', ${org.id})">Отклонить</button>
            </div>
        </div>
    `).join('');
}

async function loadReviews() {
    const container = document.getElementById('reviewsList');

    try {
        const data = await requestModerationData('/api/v1/moderation/reviews/');
        setCounter('reviews', data.length);
        renderReviews(data);
    } catch (error) {
        setCounter('reviews', 0);
        renderError(container, 'Отзывы не загрузились. Проверьте авторизацию и сервер.');
    }
}

function renderReviews(data) {
    const container = document.getElementById('reviewsList');

    if (!data.length) {
        renderEmpty(container, 'Новых отзывов на проверке нет.');
        return;
    }

    container.innerHTML = data.map((review) => {
        const rating = Math.max(0, Math.min(Number(review.rating) || 0, 5));

        return `
            <div class="moderation-card">
                <div class="feedback-header">
                    <div>
                        <span class="feedback-user">${escapeHtml(review.user || 'Пользователь')}</span>
                        <div class="feedback-point">${escapeHtml(review.point_name || 'Пункт не указан')}</div>
                    </div>
                    <span class="feedback-rating">${'★'.repeat(rating)}</span>
                </div>
                <div class="feedback-text">${escapeHtml(review.text)}</div>
                <div class="feedback-date">${review.created_at ? new Date(review.created_at).toLocaleString('ru-RU') : ''}</div>
                <div class="moderation-actions">
                    <button class="btn-approve" onclick="approveReview(${review.id})">Одобрить</button>
                    <button class="btn-reject" onclick="openRejectModal('review', ${review.id})">Отклонить</button>
                </div>
            </div>
        `;
    }).join('');
}

async function loadNews() {
    const container = document.getElementById('newsList');

    try {
        const data = await requestModerationData('/api/v1/moderation/news/');
        setCounter('news', data.length);
        renderNews(data);
    } catch (error) {
        setCounter('news', 0);
        renderError(container, 'Новости не загрузились. Проверьте авторизацию и сервер.');
    }
}

function renderNews(data) {
    const container = document.getElementById('newsList');

    if (!data.length) {
        renderEmpty(container, 'Новых новостей и акций на проверке нет.');
        return;
    }

    container.innerHTML = data.map((news) => `
        <div class="moderation-card">
            <span class="status-badge status-pending">На проверке</span>
            <h3>${escapeHtml(news.title)}</h3>
            <p>${escapeHtml(news.text)}</p>
            <div class="moderation-meta">
                ${news.created_at ? new Date(news.created_at).toLocaleString('ru-RU') : ''}
            </div>
            <div class="moderation-actions">
                <button class="btn-approve" onclick="approveNews(${news.id})">Одобрить</button>
                <button class="btn-reject" onclick="openRejectModal('news', ${news.id})">Отклонить</button>
            </div>
        </div>
    `).join('');
}

window.approveOrganization = async function(id) {
    await approve(`/api/v1/moderation/${id}/approve_organization/`);
    await Promise.all([loadOrganizations(), loadLogs()]);
};

window.approveReview = async function(id) {
    await approve(`/api/v1/moderation/${id}/approve_review/`);
    await Promise.all([loadReviews(), loadLogs()]);
};

window.approveNews = async function(id) {
    await approve(`/api/v1/moderation/${id}/approve_news/`);
    await Promise.all([loadNews(), loadLogs()]);
};

async function approve(url) {
    const token = localStorage.getItem('ck_access_token');

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        window.toasts?.error('Не удалось одобрить объект', { duration: 3000 });
        throw new Error('Ошибка модерации');
    }

    window.toasts?.success('Объект одобрен', { duration: 3000 });
}

window.openRejectModal = function(type, id) {
    rejectType = type;
    rejectId = id;

    const modal = document.getElementById('rejectModal');
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
};

window.closeRejectModal = function() {
    const modal = document.getElementById('rejectModal');
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');

    document.getElementById('rejectReason').value = '';
};

window.confirmReject = async function() {
    const reason = document.getElementById('rejectReason').value.trim();

    const urls = {
        organization: `/api/v1/moderation/${rejectId}/reject_organization/`,
        review: `/api/v1/moderation/${rejectId}/reject_review/`,
        news: `/api/v1/moderation/${rejectId}/reject_news/`,
    };

    const url = urls[rejectType];

    if (!url) {
        return;
    }

    const token = localStorage.getItem('ck_access_token');

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
        window.toasts?.error('Не удалось отклонить объект', { duration: 3000 });
        throw new Error('Ошибка отклонения');
    }

    closeRejectModal();
    window.toasts?.success('Объект отклонён', { duration: 3000 });

    await Promise.all([
        loadOrganizations(),
        loadReviews(),
        loadNews(),
        loadLogs(),
    ]);
};

async function loadLogs() {
    const container = document.getElementById('logsList');

    try {
        const data = await requestModerationData('/api/v1/moderation/logs/');
        const enrichedData = await hydrateLogTitles(data);
        setCounter('logs', data.length);
        renderLogs(enrichedData);
    } catch (error) {
        setCounter('logs', 0);
        renderError(container, 'История решений не загрузилась.');
    }
}

async function hydrateLogTitles(logs) {
    return Promise.all(
        logs.map(async (log) => ({
            ...log,
            object_display:
                log.object_display
                || log.object_title
                || await fetchLogObjectTitle(log)
                || `Объект #${log.object_id}`,
        }))
    );
}

async function fetchLogObjectTitle(log) {
    const endpoints = {
        organization: `/api/v1/organizations/${log.object_id}/`,
        review: `/api/v1/reviews/${log.object_id}/`,
        news: `/api/v1/news/${log.object_id}/`,
    };

    const item = await requestJson(endpoints[log.content_type]);

    if (!item) {
        return '';
    }

    if (log.content_type === 'organization') {
        return item.name || '';
    }

    if (log.content_type === 'news') {
        return item.title || '';
    }

    if (log.content_type === 'review') {
        const text = item.text || '';
        return text.length > 120 ? `${text.slice(0, 120)}...` : text;
    }

    return '';
}

function renderLogs(data) {
    const container = document.getElementById('logsList');

    if (!data.length) {
        renderEmpty(container, 'История решений пока пуста.');
        return;
    }

    container.innerHTML = data.map((log) => {
        const isApprove = log.action === 'approve';
        const actionLabel = log.action_display || logActionLabels[log.action] || log.action;
        const objectTitle = log.object_display || log.object_title || `Объект #${log.object_id}`;
        const contentType = log.content_type_display || logTypeLabels[log.content_type] || log.content_type;

        return `
            <div class="log-item">
                <div class="log-top">
                    <span class="log-badge ${isApprove ? 'approve' : 'reject'}">${actionLabel}</span>
                    <span class="log-date">${log.created_at ? new Date(log.created_at).toLocaleString('ru-RU') : ''}</span>
                </div>
                <div class="log-type">${escapeHtml(contentType)}</div>
                <div class="log-title">${escapeHtml(objectTitle)}</div>
                <div class="log-object">Модератор: ${escapeHtml(log.moderator || 'не указан')}</div>
                ${log.reason ? `
                    <div class="log-reason">
                        <strong>Причина:</strong> ${escapeHtml(log.reason)}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}
