// ===== СИСТЕМА УВЕДОМЛЕНИЙ =====
class ToastNotificationSystem {
    constructor() {
        this.toasts = [];
        this.maxToasts = 3;
        this.defaultDuration = 4000;
        this.init();
    }

    init() {
        this.createStack();
    }

    // Создаем контейнер для стека уведомлений
    createStack() {
        this.stack = document.querySelector('.toast-stack');
        if (!this.stack) {
            this.stack = document.createElement('div');
            this.stack.className = 'toast-stack';
            document.body.appendChild(this.stack);
        }
    }

    handleToastClick(toast) {
        toast.remove();
    }

    // Показать уведомление
    show(message, options = {}) {
        const {
            type = 'success',
            title = '',
            duration = this.defaultDuration,
            tip = '',
            icon = '',
            withProgress = false,
            closable = true
        } = options;

        // Ограничиваем количество уведомлений
        if (this.toasts.length >= this.maxToasts) {
            this.toasts[0].remove(true);
        }

        const toast = this.createToast(message, type, title, tip, icon, withProgress, closable);
        this.stack.appendChild(toast);
        this.toasts.push(toast);

        // Автоматическое удаление
        if (duration > 0) {
            setTimeout(() => {
                toast.remove();
            }, duration);
        }

        return toast;
    }

    // Создать DOM-элемент уведомления
    createToast(message, type, title, tip, icon, withProgress, closable) {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;

        // Иконки по умолчанию
        const defaultIcons = {
            success: '',
            error: '',
            warning: '',
            info: '',
            tip: '',
            achievement: ''
        };

        const displayIcon = icon || defaultIcons[type] || '';
        const displayTitle = title || this.getDefaultTitle(type);

        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-title">${displayTitle}</div>
                <div class="toast-message">${message}</div>
                ${tip ? `<div class="toast-tip">${tip}</div>` : ''}
            </div>
            ${closable ? '<button class="toast-close" aria-label="Закрыть">✕</button>' : ''}
            ${withProgress ? '<div class="toast-progress"></div>' : ''}
        `;

        // Обработчики
        toast.addEventListener('click', (e) => {
            if (!e.target.closest('.toast-close')) {
                // Клик по уведомлению (кроме кнопки закрытия)
                this.handleToastClick(toast);
            }
        });

        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toast.remove();
            });
        }

        // В методе createToast():

        // Сохраняем ссылку на оригинальный remove ПЕРЕД переопределением
        const nativeRemove = Element.prototype.remove;

        toast.remove = (immediate = false) => {
            if (immediate) {
                nativeRemove.call(toast);  // ✅ Используем call()
                return;
            }
            toast.classList.add('hide');
            setTimeout(() => {
                if (toast.parentNode) {
                    nativeRemove.call(toast);
                }
                this.toasts = this.toasts.filter(t => t !== toast);
            }, 300);
        };

        return toast;
    }

    // Заголовки по умолчанию
    getDefaultTitle(type) {
        const titles = {
            success: 'Успешно!',
            error: 'Ошибка',
            warning: 'Внимание',
            info: 'Информация',
            tip: 'Полезный совет',
            achievement: 'Достижение!'
        };
        return titles[type] || 'Уведомление';
    }

    // Вспомогательные методы
    success(message, options = {}) {
        return this.show(message, { ...options, type: 'success' });
    }

    error(message, options = {}) {
        return this.show(message, { ...options, type: 'error', duration: options.duration || 6000 });
    }

    warning(message, options = {}) {
        return this.show(message, { ...options, type: 'warning' });
    }

    info(message, options = {}) {
        return this.show(message, { ...options, type: 'info' });
    }

    tip(message, tip = '', options = {}) {
        return this.show(message, { ...options, type: 'tip', tip });
    }

    achievement(message, options = {}) {
        return this.show(message, { 
            ...options, 
            type: 'achievement', 
            duration: options.duration || 5000,
            withProgress: false 
        });
    }
}

// Создаем глобальный экземпляр
const toasts = new ToastNotificationSystem();
window.toasts = toasts;