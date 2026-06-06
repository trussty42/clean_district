let rejectType = null;
let rejectId = null;

// ===== ИНИЦИАЛИЗАЦИЯ =====

document.addEventListener(
    'DOMContentLoaded',
    async () => {

        initTabs();

        await loadOrganizations();
        await loadReviews();
        await loadNews();
        await loadLogs();
    }
);

// ===== ВКЛАДКИ =====

function initTabs() {

    document
        .querySelectorAll('.org-nav-item')
        .forEach(btn => {

            btn.addEventListener('click', () => {

                document
                    .querySelectorAll('.org-nav-item')
                    .forEach(item =>
                        item.classList.remove('active')
                    );

                document
                    .querySelectorAll('.moderation-tab')
                    .forEach(tab =>
                        tab.classList.remove('active')
                    );

                btn.classList.add('active');

                document
                    .getElementById(
                        `${btn.dataset.tab}-tab`
                    )
                    ?.classList.add('active');
            });
        });
}

// ===== ЗАГРУЗКА ОРГАНИЗАЦИЙ =====

async function loadOrganizations() {

    const token =
        localStorage.getItem(
            'ck_access_token'
        );

    const response = await fetch(
        '/api/v1/moderation/organizations/',
        {
            headers: {
                Authorization:
                    `Bearer ${token}`
            }
        }
    );

    const data =
        await response.json();

    renderOrganizations(data);
}

function renderOrganizations(data) {

    const container =
        document.getElementById(
            'organizationsList'
        );

    container.innerHTML =
        data.map(org => `

            <div class="moderation-card">

                <h3>${org.name}</h3>

                <p>
                    ИНН:
                    ${org.inn || 'Не указан'}
                </p>

                <p>
                    Email:
                    ${org.email || 'Не указан'}
                </p>

                <div class="moderation-actions">

                    <button
                        class="btn-approve"
                        onclick="approveOrganization(${org.id})"
                    >
                        Одобрить
                    </button>

                    <button
                        class="btn-reject"
                        onclick="openRejectModal(
                            'organization',
                            ${org.id}
                        )"
                    >
                        Отклонить
                    </button>

                </div>

            </div>

        `).join('');
}

// ===== ЗАГРУЗКА ОТЗЫВОВ =====

async function loadReviews() {

    const token =
        localStorage.getItem(
            'ck_access_token'
        );

    const response = await fetch(
        '/api/v1/moderation/reviews/',
        {
            headers: {
                Authorization:
                    `Bearer ${token}`
            }
        }
    );

    const data =
        await response.json();

    renderReviews(data);
}

function renderReviews(data) {

    const container =
        document.getElementById(
            'reviewsList'
        );

    container.innerHTML =
        data.map(review => `

            <div class="moderation-card">

                <div class="feedback-header">

                    <span class="feedback-user">
                        ${review.user}
                    </span>

                    <span class="feedback-rating">
                        ${'★'.repeat(review.rating)}
                    </span>

                </div>

                <div class="feedback-text">
                    ${review.text}
                </div>

                <div class="moderation-actions">

                    <button
                        class="btn-approve"
                        onclick="approveReview(${review.id})"
                    >
                        Одобрить
                    </button>

                    <button
                        class="btn-reject"
                        onclick="openRejectModal(
                            'review',
                            ${review.id}
                        )"
                    >
                        Отклонить
                    </button>

                </div>

            </div>

        `).join('');
}

// ===== ЗАГРУЗКА НОВОСТЕЙ =====

async function loadNews() {

    const token =
        localStorage.getItem(
            'ck_access_token'
        );

    const response = await fetch(
        '/api/v1/moderation/news/',
        {
            headers: {
                Authorization:
                    `Bearer ${token}`
            }
        }
    );

    const data =
        await response.json();

    renderNews(data);
}

function renderNews(data) {

    const container =
        document.getElementById(
            'newsList'
        );

    container.innerHTML =
        data.map(news => `

            <div class="moderation-card">

                <h3>
                    ${news.title}
                </h3>

                <p>
                    ${news.text}
                </p>

                <div class="moderation-actions">

                    <button
                        class="btn-approve"
                        onclick="approveNews(${news.id})"
                    >
                        Одобрить
                    </button>

                    <button
                        class="btn-reject"
                        onclick="openRejectModal(
                            'news',
                            ${news.id}
                        )"
                    >
                        Отклонить
                    </button>

                </div>

            </div>

        `).join('');
}

// ===== ОДОБРЕНИЕ =====

window.approveOrganization =
async function(id) {

    await approve(
        `/api/v1/moderation/${id}/approve_organization/`
    );

    loadOrganizations();
};

window.approveReview =
async function(id) {

    await approve(
        `/api/v1/moderation/${id}/approve_review/`
    );

    loadReviews();
};

window.approveNews =
async function(id) {

    await approve(
        `/api/v1/moderation/${id}/approve_news/`
    );

    loadNews();
};

async function approve(url) {

    const token =
        localStorage.getItem(
            'ck_access_token'
        );

    const response = await fetch(
        url,
        {
            method: 'POST',

            headers: {
                Authorization:
                    `Bearer ${token}`
            }
        }
    );

    if (!response.ok) {

        throw new Error(
            'Ошибка модерации'
        );
    }

    window.toasts?.success(
        'Объект одобрен',
        {
            duration: 3000
        }
    );
}

// ===== ОТКЛОНЕНИЕ =====

window.openRejectModal =
function(type, id) {

    rejectType = type;
    rejectId = id;

    document
        .getElementById(
            'rejectModal'
        )
        .classList.add('active');
};

window.closeRejectModal =
function() {

    document
        .getElementById(
            'rejectModal'
        )
        .classList.remove('active');

    document
        .getElementById(
            'rejectReason'
        )
        .value = '';
};

window.confirmReject =
async function() {

    const reason =
        document
            .getElementById(
                'rejectReason'
            )
            .value
            .trim();

    let url = '';

    if (rejectType === 'organization') {

        url =
            `/api/v1/moderation/${rejectId}/reject_organization/`;
    }

    if (rejectType === 'review') {

        url =
            `/api/v1/moderation/${rejectId}/reject_review/`;
    }

    if (rejectType === 'news') {

        url =
            `/api/v1/moderation/${rejectId}/reject_news/`;
    }

    const token =
        localStorage.getItem(
            'ck_access_token'
        );

    const response = await fetch(
        url,
        {
            method: 'POST',

            headers: {
                Authorization:
                    `Bearer ${token}`,
                'Content-Type':
                    'application/json'
            },

            body: JSON.stringify({
                reason
            })
        }
    );

    if (!response.ok) {

        throw new Error(
            'Ошибка отклонения'
        );
    }

    closeRejectModal();

    window.toasts?.success(
        'Объект отклонён',
        {
            duration: 3000
        }
    );

    await loadOrganizations();
    await loadReviews();
    await loadNews();
};

// ===== ЛОГИ =====

async function loadLogs() {

    const token =
        localStorage.getItem(
            'ck_access_token'
        );

    try {

        const response = await fetch(
            '/api/v1/moderation/logs/',
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            return;
        }

        const data =
            await response.json();

        renderLogs(data);

    } catch (e) {

        console.error(e);
    }
}

function renderLogs(data) {

    const container =
        document.getElementById(
            'logsList'
        );

    if (!container) {
        return;
    }

    container.innerHTML =
        data.map(log => `

            <div class="log-card">

                <div class="log-date">
                    ${new Date(
                        log.created_at
                    ).toLocaleString('ru-RU')}
                </div>

                <div class="log-action">

                    ${log.action}

                    ${log.content_type}

                    #${log.object_id}

                </div>

                ${
                    log.reason
                    ? `
                        <div class="log-reason">
                            ${log.reason}
                        </div>
                    `
                    : ''
                }

            </div>

        `).join('');
}