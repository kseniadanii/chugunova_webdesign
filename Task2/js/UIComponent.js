/**
 * Базовый класс для всех виджетов CatHub
 */
export class UIComponent {
    constructor(config = {}) {
        if (new.target === UIComponent) {
            throw new Error('UIComponent — абстрактный класс, нельзя создать экземпляр');
        }

        this.id = config.id || this.generateId();
        this.title = config.title || 'Виджет';
        this.element = null;
        this.isMinimized = false;
        this.eventListeners = [];
    }

    /**
     * Генерирует уникальный ID
     */
    generateId() {
        return `widget-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    }

    /**
     * Регистрирует обработчик события для автоматической очистки
     */
    addEventListener(element, event, handler) {
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }

    /**
     * Создает базовую структуру виджета
     */
    createWidgetWrapper() {
        const wrapper = document.createElement('div');
        wrapper.className = 'widget';
        wrapper.id = this.id;
        wrapper.dataset.widgetType = this.constructor.name;

        // Заголовок виджета
        const header = document.createElement('div');
        header.className = 'widget-header';

        const title = document.createElement('h3');
        title.className = 'widget-title';
        title.textContent = this.title;

        const controls = document.createElement('div');
        controls.className = 'widget-controls';

        const minimizeBtn = document.createElement('button');
        minimizeBtn.className = 'widget-btn minimize-btn';
        minimizeBtn.innerHTML = '−';
        minimizeBtn.title = 'Свернуть/Развернуть';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'widget-btn close-btn';
        closeBtn.innerHTML = '×';
        closeBtn.title = 'Закрыть';

        controls.appendChild(minimizeBtn);
        controls.appendChild(closeBtn);
        header.appendChild(title);
        header.appendChild(controls);

        // Контент виджета
        const content = document.createElement('div');
        content.className = 'widget-content';

        wrapper.appendChild(header);
        wrapper.appendChild(content);

        // Привязываем обработчики
        this.addEventListener(minimizeBtn, 'click', () => this.minimize());
        this.addEventListener(closeBtn, 'click', () => this.close());

        this.contentElement = content;
        this.element = wrapper;

        return wrapper;
    }

    /**
     * Свернуть/развернуть виджет
     */
    minimize() {
        if (!this.element) return;

        this.isMinimized = !this.isMinimized;
        this.element.classList.toggle('minimized', this.isMinimized);

        const minimizeBtn = this.element.querySelector('.minimize-btn');
        if (minimizeBtn) {
            minimizeBtn.innerHTML = this.isMinimized ? '+' : '−';
            minimizeBtn.title = this.isMinimized ? 'Развернуть' : 'Свернуть';
        }
    }

    /**
     * Закрыть виджет (вызывает удаление через Dashboard)
     */
    close() {
        const event = new CustomEvent('widget-close', {
            detail: { widgetId: this.id },
            bubbles: true
        });

        if (this.element) {
            this.element.dispatchEvent(event);
        }
    }

    /**
     * Удалить виджет из DOM и очистить обработчики
     */
    destroy() {
        // Удаляем все обработчики событий
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];

        // Удаляем из DOM
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }

        this.element = null;
        this.contentElement = null;
    }

    /**
     * Рендер виджета — должен быть переопределен в наследниках
     */
    render() {
        throw new Error('Метод render() должен быть переопределен в наследнике');
    }
}
