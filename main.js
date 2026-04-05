import { Dashboard } from './js/Dashboard.js';
import { ToDoWidget } from './js/ToDoWidget.js';
import { QuoteWidget } from './js/QuoteWidget.js';
import { WeatherWidget } from './js/WeatherWidget.js';
import { NewsWidget } from './js/NewsWidget.js';

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    // Создаем дашборд
    const dashboard = new Dashboard('#dashboard');

    // Регистрируем типы виджетов
    dashboard.registerWidgetType('todo', ToDoWidget);
    dashboard.registerWidgetType('quote', QuoteWidget);
    dashboard.registerWidgetType('weather', WeatherWidget);
    dashboard.registerWidgetType('news', NewsWidget);

    // Находим кнопки управления
    const widgetButtons = document.querySelectorAll('[data-widget]');

    // Добавляем обработчики для кнопок
    widgetButtons.forEach(button => {
        button.addEventListener('click', () => {
            const widgetType = button.getAttribute('data-widget');
            dashboard.addWidget(widgetType);
        });
    });

    // Добавляем начальные виджеты
    dashboard.addWidget('todo');
    dashboard.addWidget('weather');

    // Делаем дашборд доступным глобально для отладки
    window.dashboard = dashboard;

    console.log('🎯 Дашборд инициализирован!');
    console.log('Доступные команды:');
    console.log('  dashboard.addWidget("todo") - добавить ToDo');
    console.log('  dashboard.addWidget("quote") - добавить цитату');
    console.log('  dashboard.addWidget("weather") - добавить погоду');
    console.log('  dashboard.addWidget("news") - добавить новости');
    console.log('  dashboard.clear() - удалить все виджеты');
});