import { UIComponent } from './UIComponent.js';

/**
 * Виджет новостей (использует NewsAPI или GNews - бесплатные версии)
 * Для демонстрации используем RSS через allorigins proxy
 */
export class NewsWidget extends UIComponent {
    constructor(config = {}) {
        super({
            id: config.id,
            title: config.title || '📰 Новости'
        });

        this.newsItems = [];
        this.maxItems = config.maxItems || 5;
    }

    /**
     * Создает DOM-элемент виджета
     */
    render() {
        this.element = this.createWidgetWrapper();

        // Контейнер
        const container = document.createElement('div');
        container.className = 'news-container';

        // Заголовок с кнопкой обновления
        const header = document.createElement('div');
        header.className = 'news-header';

        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'news-refresh-btn';
        refreshBtn.innerHTML = '🔄 Обновить';

        header.appendChild(refreshBtn);

        // Список новостей
        this.newsList = document.createElement('div');
        this.newsList.className = 'news-list';

        container.appendChild(header);
        container.appendChild(this.newsList);

        this.contentElement.appendChild(container);

        // Привязываем события
        this.addEventListener(refreshBtn, 'click', () => this.fetchNews());

        // Загружаем новости
        this.fetchNews();

        return this.element;
    }

    /**
     * Получает новости через RSS
     */
    async fetchNews() {
        this.newsList.innerHTML = '<div class="news-loading">Загрузка новостей...</div>';

        try {
            // Используем RSS-ленту BBC через allorigins (CORS proxy)
            // или любую другую доступную RSS-ленту
            const rssFeeds = [
                'https://feeds.bbci.co.uk/news/world/rss.xml',
                'https://rss.cnn.com/rss/edition.rss',
                'https://feeds.reuters.com/reuters/topNews'
            ];

            // Выбираем случайную ленту
            const feedUrl = rssFeeds[Math.floor(Math.random() * rssFeeds.length)];

            // Используем allorigins для обхода CORS
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`;

            const response = await fetch(proxyUrl);
            if (!response.ok) throw new Error('Ошибка загрузки');

            const data = await response.json();

            // Парсим XML
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data.contents, 'text/xml');

            const items = xmlDoc.querySelectorAll('item');
            this.newsItems = [];

            items.forEach((item, index) => {
                if (index < this.maxItems) {
                    const title = item.querySelector('title')?.textContent || 'Без заголовка';
                    const description = item.querySelector('description')?.textContent || '';
                    const link = item.querySelector('link')?.textContent || '#';
                    const pubDate = item.querySelector('pubDate')?.textContent || '';

                    this.newsItems.push({
                        title: this.cleanText(title),
                        description: this.cleanText(description),
                        link: link,
                        date: this.formatDate(pubDate)
                    });
                }
            });

            this.renderNews();
        } catch (error) {
            // Если API не работает, показываем демо-новости
            this.showDemoNews();
        }
    }

    /**
     * Очищает текст от HTML-сущностей
     */
    cleanText(text) {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        return textarea.value.replace(/<[^>]*>/g, '').substring(0, 200);
    }

    /**
     * Форматирует дату
     */
    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    }

    /**
     * Показывает демо-новости если API недоступен
     */
    showDemoNews() {
        this.newsItems = [
            {
                title: 'OpenAI представляет новую модель GPT-5',
                description: 'Компания OpenAI анонсировала следующее поколение своей языковой модели с улучшенными возможностями.',
                link: '#',
                date: 'Сегодня, 10:30'
            },
            {
                title: 'Apple проведет презентацию новых продуктов',
                description: 'На предстоящем мероприятии ожидается анонс новых MacBook и iPad.',
                link: '#',
                date: 'Сегодня, 09:15'
            },
            {
                title: 'SpaceX успешно запустила новую партию спутников',
                description: 'Ракета Falcon 9 вывела на орбиту очередную группу спутников Starlink.',
                link: '#',
                date: 'Вчера, 18:45'
            },
            {
                title: 'Google обновляет алгоритмы поиска',
                description: 'Новые изменения направлены на улучшение качества результатов поиска.',
                link: '#',
                date: 'Вчера, 14:20'
            },
            {
                title: 'Microsoft интегрирует ИИ в Windows 12',
                description: 'Операционная система получит встроенные функции искусственного интеллекта.',
                link: '#',
                date: '2 дня назад'
            }
        ];
        this.renderNews();
    }

    /**
     * Отрисовывает список новостей
     */
    renderNews() {
        this.newsList.innerHTML = '';

        if (this.newsItems.length === 0) {
            this.newsList.innerHTML = '<div class="news-empty">Нет новостей</div>';
            return;
        }

        this.newsItems.forEach(item => {
            const newsItem = document.createElement('div');
            newsItem.className = 'news-item';

            const title = document.createElement('a');
            title.className = 'news-item-title';
            title.href = item.link;
            title.target = '_blank';
            title.textContent = item.title;

            const date = document.createElement('span');
            date.className = 'news-item-date';
            date.textContent = item.date;

            const desc = document.createElement('p');
            desc.className = 'news-item-desc';
            desc.textContent = item.description;

            newsItem.appendChild(title);
            newsItem.appendChild(date);
            newsItem.appendChild(desc);

            this.newsList.appendChild(newsItem);
        });
    }
}