import { UIComponent } from './UIComponent.js';

/**
 * Виджет списка дел (ToDo List)
 */
export class ToDoWidget extends UIComponent {
    constructor(config = {}) {
        super({
            id: config.id,
            title: config.title || '📋 Список дел'
        });

        // Инкапсулированные данные
        this.tasks = config.tasks || [];
    }

    /**
     * Создает DOM-элемент виджета
     */
    render() {
        this.element = this.createWidgetWrapper();

        // Создаем структуру ToDo
        const container = document.createElement('div');
        container.className = 'todo-container';

        // Форма добавления задачи
        const form = document.createElement('div');
        form.className = 'todo-form';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'todo-input';
        input.placeholder = 'Введите новую задачу...';

        const addBtn = document.createElement('button');
        addBtn.className = 'todo-add-btn';
        addBtn.textContent = 'Добавить';

        form.appendChild(input);
        form.appendChild(addBtn);

        // Список задач
        const list = document.createElement('ul');
        list.className = 'todo-list';

        container.appendChild(form);
        container.appendChild(list);

        this.contentElement.appendChild(container);

        // Сохраняем ссылки
        this.input = input;
        this.list = list;

        // Привязываем события
        this.addEventListener(addBtn, 'click', () => this.addTask());
        this.addEventListener(input, 'keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Рендерим существующие задачи
        this.renderTasks();

        return this.element;
    }

    /**
     * Добавляет новую задачу
     */
    addTask() {
        const text = this.input.value.trim();
        if (!text) return;

        const task = {
            id: Date.now(),
            text: text,
            completed: false
        };

        this.tasks.push(task);
        this.input.value = '';
        this.renderTasks();
    }

    /**
     * Удаляет задачу
     */
    removeTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.renderTasks();
    }

    /**
     * Переключает состояние выполнения задачи
     */
    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.renderTasks();
        }
    }

    /**
     * Отрисовывает список задач
     */
    renderTasks() {
        this.list.innerHTML = '';

        if (this.tasks.length === 0) {
            const empty = document.createElement('li');
            empty.className = 'todo-empty';
            empty.textContent = 'Нет задач. Добавьте первую!';
            this.list.appendChild(empty);
            return;
        }

        this.tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `todo-item ${task.completed ? 'completed' : ''}`;
            li.setAttribute('data-task-id', task.id);

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'todo-checkbox';
            checkbox.checked = task.completed;

            const text = document.createElement('span');
            text.className = 'todo-text';
            text.textContent = task.text;

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'todo-delete-btn';
            deleteBtn.innerHTML = '🗑';
            deleteBtn.title = 'Удалить задачу';

            li.appendChild(checkbox);
            li.appendChild(text);
            li.appendChild(deleteBtn);

            this.list.appendChild(li);

            // Привязываем события для элементов списка
            this.addEventListener(checkbox, 'change', () => this.toggleTask(task.id));
            this.addEventListener(deleteBtn, 'click', () => this.removeTask(task.id));
        });
    }
}