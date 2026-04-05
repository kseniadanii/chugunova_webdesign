import { UIComponent } from './UIComponent.js';

/**
 * Виджет случайных цитат
 */
export class QuoteWidget extends UIComponent {
    constructor(config = {}) {
        super({
            id: config.id,
            title: config.title || '💬 Цитата дня'
        });

        // Массив цитат
        this.quotes = config.quotes || [
            { text: 'Будьте тем изменением, которое хотите видеть в мире.', author: 'Махатма Ганди' },
            { text: 'Единственный способ сделать отличную работу — полюбить то, что вы делаете.', author: 'Стив Джобс' },
            { text: 'Успех — это способность идти от поражения к поражению, не теряя энтузиазма.', author: 'Уинстон Черчилль' },
            { text: 'Не откладывай на завтра то, что можно сделать сегодня.', author: 'Бенджамин Франклин' },
            { text: 'Ваше время ограничено, не тратьте его, живя чужой жизнью.', author: 'Стив Джобс' },
            { text: 'Неважно, как медленно вы идете, пока не останавливаетесь.', author: 'Конфуций' },
            { text: 'Все, что вы можете вообразить — реально.', author: 'Пабло Пикассо' },
            { text: 'Сложнее всего начать действовать, все остальное зависит только от упорства.', author: 'Амелия Эрхарт' },
            { text: 'Жизнь — это то, что происходит, пока вы строите планы.', author: 'Джон Леннон' },
            { text: 'Каждый момент — это новое начало.', author: 'Томас Манн' }
        ];

        this.currentQuote = null;
    }

    /**
     * Создает DOM-элемент виджета
     */
    render() {
        this.element = this.createWidgetWrapper();

        // Контейнер для цитаты
        const container = document.createElement('div');
        container.className = 'quote-container';

        // Элемент для текста цитаты
        this.quoteText = document.createElement('blockquote');
        this.quoteText.className = 'quote-text';

        // Элемент для автора
        this.quoteAuthor = document.createElement('cite');
        this.quoteAuthor.className = 'quote-author';

        // Кнопка обновления
        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'quote-refresh-btn';
        refreshBtn.innerHTML = '🔄 Новая цитата';

        container.appendChild(this.quoteText);
        container.appendChild(this.quoteAuthor);
        container.appendChild(refreshBtn);

        this.contentElement.appendChild(container);

        // Привязываем события
        this.addEventListener(refreshBtn, 'click', () => this.showRandomQuote());

        // Показываем первую цитату
        this.showRandomQuote();

        return this.element;
    }

    /**
     * Показывает случайную цитату
     */
    showRandomQuote() {
        // Выбираем случайную цитату (не текущую)
        let newQuote;
        do {
            const randomIndex = Math.floor(Math.random() * this.quotes.length);
            newQuote = this.quotes[randomIndex];
        } while (newQuote === this.currentQuote && this.quotes.length > 1);

        this.currentQuote = newQuote;

        // Анимируем смену цитаты
        this.quoteText.style.opacity = '0';
        this.quoteAuthor.style.opacity = '0';

        setTimeout(() => {
            this.quoteText.textContent = `"${this.currentQuote.text}"`;
            this.quoteAuthor.textContent = `— ${this.currentQuote.author}`;

            this.quoteText.style.opacity = '1';
            this.quoteAuthor.style.opacity = '1';
        }, 200);
    }
}