import { UIComponent } from './UIComponent.js';

/**
 * Виджет заметок хозяина кота
 */
export class NotesWidget extends UIComponent {
    constructor(config = {}) {
        super({
            id: config.id,
            title: config.title || '📝 Заметки'
        });

        this.notes = config.notes || [];
    }

    render() {
        this.element = this.createWidgetWrapper();

        const container = document.createElement('div');
        container.className = 'notes-container';

        // Форма добавления
        const form = document.createElement('div');
        form.className = 'notes-form';

        const textarea = document.createElement('textarea');
        textarea.className = 'notes-input';
        textarea.placeholder = 'Напишите заметку о вашем коте...';
        textarea.rows = 2;

        const addBtn = document.createElement('button');
        addBtn.className = 'notes-add-btn';
        addBtn.innerHTML = '🐾 Добавить';

        form.appendChild(textarea);
        form.appendChild(addBtn);

        // Список заметок
        this.notesList = document.createElement('div');
        this.notesList.className = 'notes-list';

        container.appendChild(form);
        container.appendChild(this.notesList);

        this.contentElement.appendChild(container);

        this.textarea = textarea;

        // Обработчики
        this.addEventListener(addBtn, 'click', () => this.addNote());
        this.addEventListener(textarea, 'keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.addNote();
            }
        });

        this.renderNotes();

        return this.element;
    }

    addNote() {
        const text = this.textarea.value.trim();
        if (!text) return;

        const note = {
            id: Date.now(),
            text: text,
            date: new Date().toLocaleString('ru-RU', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            })
        };

        this.notes.unshift(note);
        this.textarea.value = '';
        this.renderNotes();
    }

    removeNote(noteId) {
        this.notes = this.notes.filter(note => note.id !== noteId);
        this.renderNotes();
    }

    renderNotes() {
        this.notesList.innerHTML = '';

        if (this.notes.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'notes-empty';
            empty.innerHTML = '🐱 Пока нет заметок...';
            this.notesList.appendChild(empty);
            return;
        }

        this.notes.forEach(note => {
            const noteEl = document.createElement('div');
            noteEl.className = 'note-item';

            const header = document.createElement('div');
            header.className = 'note-header';

            const date = document.createElement('span');
            date.className = 'note-date';
            date.textContent = note.date;

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'note-delete-btn';
            deleteBtn.innerHTML = '🗑️';
            deleteBtn.title = 'Удалить';

            header.appendChild(date);
            header.appendChild(deleteBtn);

            const text = document.createElement('p');
            text.className = 'note-text';
            text.textContent = note.text;

            noteEl.appendChild(header);
            noteEl.appendChild(text);

            this.notesList.appendChild(noteEl);

            this.addEventListener(deleteBtn, 'click', () => this.removeNote(note.id));
        });
    }
}
