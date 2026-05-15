import { UIComponent } from './UIComponent.js';

/**
 * Виджет случайных фото котов
 * Использует API: https://api.thecatapi.com/v1/images/search
 */
export class CatImageWidget extends UIComponent {
    constructor(config = {}) {
        super({
            id: config.id,
            title: config.title || '📸 Фото кота'
        });

        this.imageUrl = null;
        this.isLoading = false;
    }

    render() {
        this.element = this.createWidgetWrapper();

        const container = document.createElement('div');
        container.className = 'image-container';

        // Область для изображения
        this.imageWrapper = document.createElement('div');
        this.imageWrapper.className = 'image-wrapper';

        this.catImage = document.createElement('img');
        this.catImage.className = 'cat-image';
        this.catImage.alt = 'Милый котик';

        this.imageWrapper.appendChild(this.catImage);

        // Кнопка обновления
        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'image-refresh-btn';
        refreshBtn.innerHTML = '😺 Другой котик';

        container.appendChild(this.imageWrapper);
        container.appendChild(refreshBtn);

        this.contentElement.appendChild(container);

        // Обработчики
        this.addEventListener(refreshBtn, 'click', () => this.fetchImage());

        // Загружаем первое изображение
        this.fetchImage();

        return this.element;
    }

    async fetchImage() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.imageWrapper.classList.add('loading');
        this.catImage.style.opacity = '0.3';

        try {
            // Используем TheCatAPI (не требует ключа для базовых запросов)
            const response = await fetch('https://api.thecatapi.com/v1/images/search');

            if (!response.ok) {
                throw new Error('Ошибка загрузки');
            }

            const data = await response.json();

            if (data && data.length > 0) {
                this.imageUrl = data[0].url;
                this.showImage();
            } else {
                throw new Error('Нет изображений');
            }
        } catch (error) {
            this.showError();
        } finally {
            this.isLoading = false;
            this.imageWrapper.classList.remove('loading');
        }
    }

    showImage() {
        if (!this.imageUrl) return;

        this.catImage.src = this.imageUrl;

        this.catImage.onload = () => {
            this.catImage.style.opacity = '1';
        };
    }

    showError() {
        // Fallback изображение если API недоступен
        this.imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZTZmMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmZmE1MDAiPuaZiCDwn5qBPC90ZXh0Pjwvc3ZnPg==';
        this.catImage.src = this.imageUrl;
        this.catImage.style.opacity = '1';
    }
}
