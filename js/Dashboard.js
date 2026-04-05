/**
 * Класс Dashboard - управляет коллекцией виджетов
 */
export class Dashboard {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.widgets = [];
        this.widgetTypes = new Map();

        if (!this.container) {
            throw new Error(`Контейнер ${containerSelector} не найден`);
        }
    }

    /**
     * Регистрирует тип виджета
     */
    registerWidgetType(typeName, WidgetClass) {
        this.widgetTypes.set(typeName, WidgetClass);
    }

    /**
     * Создает и добавляет виджет
     */
    addWidget(type, config = {}) {
        const WidgetClass = this.widgetTypes.get(type);

        if (!WidgetClass) {
            console.error(`Тип виджета "${type}" не зарегистрирован`);
            return null;
        }

        // Создаем экземпляр виджета
        const widget = new WidgetClass(config);

        // Рендерим виджет
        const widgetElement = widget.render();

        // Добавляем в массив
        this.widgets.push(widget);

        // Добавляем в DOM с анимацией
        widgetElement.style.opacity = '0';
        widgetElement.style.transform = 'scale(0.9)';
        this.container.appendChild(widgetElement);

        // Анимация появления
        requestAnimationFrame(() => {
            widgetElement.style.opacity = '1';
            widgetElement.style.transform = 'scale(1)';
        });

        // Добавляем обработчик закрытия
        widgetElement.addEventListener('widget-close', (e) => {
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
            console.error(`Виджет с ID "${widgetId}" не найден`);
            return false;
        }

        const widget = this.widgets[index];

        // Анимация удаления
        if (widget.element) {
            widget.element.style.opacity = '0';
            widget.element.style.transform = 'scale(0.9)';
        }

        // Удаляем после анимации
        setTimeout(() => {
            widget.destroy();
            this.widgets.splice(index, 1);
        }, 200);

        return true;
    }

    /**
     * Возвращает все виджеты
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
        // Удаляем в обратном порядке для корректной работы
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