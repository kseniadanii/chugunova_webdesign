/**
 * Класс Dashboard — управляет коллекцией виджетов CatHub
 */
export class Dashboard {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.widgets = [];
        this.widgetTypes = new Map();

        if (!this.container) {
            throw new Error(`Контейнер "${containerSelector}" не найден`);
        }
    }

    /**
     * Регистрирует тип виджета
     */
    registerWidgetType(typeName, WidgetClass) {
        this.widgetTypes.set(typeName, WidgetClass);
    }

    /**
     * Создает и добавляет виджет указанного типа
     */
    addWidget(type, config = {}) {
        const WidgetClass = this.widgetTypes.get(type);

        if (!WidgetClass) {
            console.error(`Тип виджета "${type}" не зарегистрирован`);
            return null;
        }

        // Создаем экземпляр
        const widget = new WidgetClass(config);

        // Рендерим и добавляем в DOM
        const element = widget.render();

        // Анимация появления
        element.style.opacity = '0';
        element.style.transform = 'scale(0.95)';
        this.container.appendChild(element);

        requestAnimationFrame(() => {
            element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            element.style.opacity = '1';
            element.style.transform = 'scale(1)';
        });

        // Добавляем в массив
        this.widgets.push(widget);

        // Обработчик закрытия
        element.addEventListener('widget-close', (e) => {
            e.stopPropagation();
            this.removeWidget(e.detail.widgetId);
        });

        return widget;
    }

    /**
     * Удаляет виджет по ID
     */
    removeWidget(widgetId) {
        const index = this.widgets.findIndex(w => w.id === widgetId);

        if (index === -1) {
            console.warn(`Виджет с ID "${widgetId}" не найден`);
            return false;
        }

        const widget = this.widgets[index];

        // Анимация удаления
        if (widget.element) {
            widget.element.style.opacity = '0';
            widget.element.style.transform = 'scale(0.95)';
        }

        // Удаляем после анимации
        setTimeout(() => {
            widget.destroy();
            this.widgets.splice(index, 1);
        }, 250);

        return true;
    }

    /**
     * Возвращает массив всех виджетов
     */
    getWidgets() {
        return [...this.widgets];
    }

    /**
     * Возвращает виджет по ID
     */
    getWidgetById(id) {
        return this.widgets.find(w => w.id === id);
    }

    /**
     * Удаляет все виджеты
     */
    clear() {
        [...this.widgets].forEach(widget => {
            this.removeWidget(widget.id);
        });
    }

    /**
     * Возвращает количество виджетов
     */
    get count() {
        return this.widgets.length;
    }
}
