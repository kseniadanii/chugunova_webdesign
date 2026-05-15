import { Dashboard } from './js/Dashboard.js';
import { ToDoWidget } from './js/ToDoWidget.js';
import { CatFactWidget } from './js/CatFactWidget.js';
import { CatImageWidget } from './js/CatImageWidget.js';
import { NotesWidget } from './js/NotesWidget.js';

/**
 * Инициализация приложения CatHub
 */
document.addEventListener('DOMContentLoaded', () => {
    // Создаем дашборд
    const dashboard = new Dashboard('#dashboard');

    // Регистрируем типы виджетов
    dashboard.registerWidgetType('todo', ToDoWidget);
    dashboard.registerWidgetType('fact', CatFactWidget);
    dashboard.registerWidgetType('image', CatImageWidget);
    dashboard.registerWidgetType('notes', NotesWidget);

    // Привязываем кнопки добавления
    const widgetButtons = document.querySelectorAll('[data-widget]');

    widgetButtons.forEach(button => {
        button.addEventListener('click', () => {
            const widgetType = button.dataset.widget;
            dashboard.addWidget(widgetType);
        });
    });

    // Добавляем стартовые виджеты
    dashboard.addWidget('todo', {
        title: '📋 Уход за Мурзиком',
        tasks: [
            { id: 1, text: 'Купить корм', completed: false },
            { id: 2, text: 'Почистить лоток', completed: true },
            { id: 3, text: 'Купить новые игрушки', completed: false }
        ]
    });

    dashboard.addWidget('fact');
    dashboard.addWidget('image');
    dashboard.addWidget('notes', {
        title: '📝 Наблюдения',
        notes: [
            {
                id: 1,
                text: 'Мурзик особенно любит играть с мышкой на веревочке по вечерам',
                date: '5 апр, 18:30'
            }
        ]
    });

    // Делаем доступным для отладки
    window.dashboard = dashboard;

    console.log('🐱 CatHub запущен!');
});
