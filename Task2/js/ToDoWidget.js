import { UIComponent } from './UIComponent.js';

/**
 * Виджет списка дел по уходу за котом
 */
export class ToDoWidget extends UIComponent {
    constructor(config = {}) {
        super({
            id: config.id,
            title: config.title || '📋 Дела по уходу'
        });

        this.tasks = config.tasks || [];
    }

    render() {
        this.element = this.createWidgetWrapper();

        const container = document.createElement('div');
        container.className = 'todo-container';

        // Форма добавления
        const form = document.createElement('div');
        form.className = 'todo-form';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'todo-input';
        input.placeholder = 'Например: купить корм...';

        const addBtn = document.createElement('button');
        addBtn.className = 'todo-add-btn';
        addBtn.innerHTML = '🐾 Добавить';

        form.appendChild(input);
        form.appendChild(addBtn);

        // Список задач
        const list = document.createElement('ul');
        list.className = 'todo-list';

        container.appendChild(form);
        container.appendChild(list);

        this.contentElement.appendChild(container);

        this.input = input;
        this.list = list;

        // Обработчики
        this.addEventListener(addBtn, 'click', () => this.addTask());
        this.addEventListener(input, 'keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        this.renderTasks();

        return this.element;
    }

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

    removeTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.renderTasks();
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.renderTasks();
        }
    }

    renderTasks() {
        this.list.innerHTML = '';

        if (this.tasks.length === 0) {
            const empty = document.createElement('li');
            empty.className = 'todo-empty';
            empty.innerHTML = '🐱 Пока нет задач. Добавьте первую!';
            this.list.appendChild(empty);
            return;
        }

        this.tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `todo-item ${task.completed ? 'completed' : ''}`;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'todo-checkbox';
            checkbox.checked = task.completed;

            const text = document.createElement('span');
            text.className = 'todo-text';
            text.textContent = task.text;

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'todo-delete-btn';
            deleteBtn.innerHTML = '🗑️';
            deleteBtn.title = 'Удалить';

            li.appendChild(checkbox);
            li.appendChild(text);
            li.appendChild(deleteBtn);

            this.list.appendChild(li);

            this.addEventListener(checkbox, 'change', () => this.toggleTask(task.id));
            this.addEventListener(deleteBtn, 'click', () => this.removeTask(task.id));
        });
    }
}
