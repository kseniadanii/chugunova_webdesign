import { UIComponent } from './UIComponent.js';

/**
 * Виджет случайных фактов о котах
 * Использует API: https://catfact.ninja/
 */
export class CatFactWidget extends UIComponent {
    constructor(config = {}) {
        super({
            id: config.id,
            title: config.title || '🧶 Факт о котах'
        });

        this.currentFact = null;
        this.isLoading = false;
    }

    render() {
        this.element = this.createWidgetWrapper();

        const container = document.createElement('div');
        container.className = 'fact-container';

        // Иконка кота
        const icon = document.createElement('div');
        icon.className = 'fact-icon';
        icon.innerHTML = '🐈';

        // Текст факта
        this.factText = document.createElement('p');
        this.factText.className = 'fact-text';

        // Кнопка обновления
        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'fact-refresh-btn';
        refreshBtn.innerHTML = '🐱 Новый факт';

        container.appendChild(icon);
        container.appendChild(this.factText);
        container.appendChild(refreshBtn);

        this.contentElement.appendChild(container);

        // Обработчики
        this.addEventListener(refreshBtn, 'click', () => this.fetchFact());

        // Загружаем первый факт
        this.fetchFact();

        return this.element;
    }

    async fetchFact() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.factText.innerHTML = '<span class="loading">🐾 Загружаем факт...</span>';

        try {
            const response = await fetch('https://catfact.ninja/fact');

            if (!response.ok) {
                throw new Error('Ошибка загрузки');
            }

            const data = await response.json();
            this.currentFact = data.fact;
            this.showFact();
        } catch (error) {
            this.showError();
        } finally {
            this.isLoading = false;
        }
    }

    showFact() {
        if (!this.currentFact) return;

        // Плавная смена текста
        this.factText.style.opacity = '0';

        setTimeout(() => {
            this.factText.textContent = this.currentFact;
            this.factText.style.opacity = '1';
        }, 200);
    }

    showError() {
        // Fallback факты если API недоступен
        const fallbackFacts = [
            'Кошки спят в среднем 12-16 часов в день.',
            'У кошек 32 мышцы в каждом ухе, что позволяет им поворачивать уши на 180 градусов.',
            'Кошки могут прыгать в высоту в 6 раз больше своего роста.',
            'Мурлыканье кошки может способствовать заживлению костей.',
            'Кошки не чувствуют сладкого вкуса из-за генетических особенностей.'
        ];

        this.currentFact = fallbackFacts[Math.floor(Math.random() * fallbackFacts.length)];
        this.factText.innerHTML = `<span class="fallback">${this.currentFact}</span>`;
    }
}
