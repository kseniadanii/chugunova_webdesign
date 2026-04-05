/**
 * Базовый (абстрактный) класс для всех виджетов
 */
export class UIComponent {
    constructor(config) {
        if (new.target === UIComponent) {
            throw new Error('Нельзя создать экземпляр абстрактного класса UIComponent');
        }

        this.id = config.id || this.generateId();
        this.title = config.title || 'Виджет';
        this.element = null;
        this.eventListeners = [];
    }

    /**
     * Генерирует уникальный ID
     */
    generateId() {
        return 'widget-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Регистрирует слушатель события для автоматического удаления
     */
    addEventListener(element, event, handler) {
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }

    /**
     * Создает DOM-элемент с базовой структурой виджета
     */
    createWidgetWrapper() {
        const wrapper = document.createElement('div');
        wrapper.className = 'widget';
        wrapper.id = this.id;
        wrapper.setAttribute('data-widget-type', this.constructor.name);

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

        const content = document.createElement('div');
        content.className = 'widget-content';

        wrapper.appendChild(header);
        wrapper.appendChild(content);

        // Привязываем обработчики
        this.addEventListener(minimizeBtn, 'click', () => this.toggleMinimize(wrapper));
        this.addEventListener(closeBtn, 'click', () => this.close());

        // Сохраняем ссылку на контент для наследников
        this.contentElement = content;

        return wrapper;
    }

    /**
     * Переключает свернутое состояние виджета
     */
    toggleMinimize(wrapper) {
        wrapper.classList.toggle('minimized');
    }

    /**
     * Возвращает DOM-элемент виджета
     * Должен быть переопределен в наследниках
     */
    render() {
        throw new Error('Метод render() должен быть переопределен');
    }

    /**
     * Удаляет виджет из DOM и очищает слушатели событий
     */
    destroy() {
        // Удаляем все зарегистрированные слушатели событий
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];

        // Удаляем элемент из DOM
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }

        this.element = null;
    }

    /**
     * Закрывает виджет (вызывается через Dashboard)
     */
    close() {
        // Этот метод будет вызван Dashboard для корректного удаления
        const event = new CustomEvent('widget-close', {
            detail: { widgetId: this.id },
            bubbles: true
        });
        if (this.element) {
            this.element.dispatchEvent(event);
        }
    }
}