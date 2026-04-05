import { UIComponent } from './UIComponent.js';

/**
 * Виджет погоды (использует Open-Meteo API - бесплатный, не требует ключа)
 */
export class WeatherWidget extends UIComponent {
    constructor(config = {}) {
        super({
            id: config.id,
            title: config.title || '🌤 Погода'
        });

        this.lat = config.lat || 55.7558; // Москва по умолчанию
        this.lon = config.lon || 37.6173;
        this.city = config.city || 'Москва';
        this.weatherData = null;
    }

    /**
     * Создает DOM-элемент виджета
     */
    render() {
        this.element = this.createWidgetWrapper();

        // Контейнер
        const container = document.createElement('div');
        container.className = 'weather-container';

        // Выбор города
        const cityForm = document.createElement('div');
        cityForm.className = 'weather-city-form';

        const cityInput = document.createElement('input');
        cityInput.type = 'text';
        cityInput.className = 'weather-city-input';
        cityInput.placeholder = 'Введите город...';
        cityInput.value = this.city;

        const searchBtn = document.createElement('button');
        searchBtn.className = 'weather-search-btn';
        searchBtn.innerHTML = '🔍';

        cityForm.appendChild(cityInput);
        cityForm.appendChild(searchBtn);

        // Контент погоды
        this.weatherContent = document.createElement('div');
        this.weatherContent.className = 'weather-content';
        this.weatherContent.innerHTML = '<div class="weather-loading">Загрузка...</div>';

        container.appendChild(cityForm);
        container.appendChild(this.weatherContent);

        this.contentElement.appendChild(container);

        // Сохраняем ссылки
        this.cityInput = cityInput;

        // Привязываем события
        this.addEventListener(searchBtn, 'click', () => this.searchCity());
        this.addEventListener(cityInput, 'keypress', (e) => {
            if (e.key === 'Enter') this.searchCity();
        });

        // Загружаем погоду
        this.fetchWeather();

        return this.element;
    }

    /**
     * Поиск города (геокодинг)
     */
    async searchCity() {
        const city = this.cityInput.value.trim();
        if (!city) return;

        this.weatherContent.innerHTML = '<div class="weather-loading">Поиск города...</div>';

        try {
            // Используем Open-Meteo Geocoding API
            const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=ru&format=json`;
            const response = await fetch(geoUrl);
            const data = await response.json();

            if (data.results && data.results.length > 0) {
                const result = data.results[0];
                this.lat = result.latitude;
                this.lon = result.longitude;
                this.city = result.name;
                this.cityInput.value = this.city;
                await this.fetchWeather();
            } else {
                this.weatherContent.innerHTML = '<div class="weather-error">Город не найден</div>';
            }
        } catch (error) {
            this.weatherContent.innerHTML = `<div class="weather-error">Ошибка: ${error.message}</div>`;
        }
    }

    /**
     * Получает данные о погоде
     */
    async fetchWeather() {
        this.weatherContent.innerHTML = '<div class="weather-loading">Загрузка...</div>';

        try {
            // Open-Meteo API - бесплатный, не требует API ключа
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${this.lat}&longitude=${this.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('Ошибка загрузки данных');

            const data = await response.json();
            this.weatherData = data.current;
            this.renderWeather();
        } catch (error) {
            this.weatherContent.innerHTML = `<div class="weather-error">Ошибка загрузки: ${error.message}</div>`;
        }
    }

    /**
     * Отрисовывает данные о погоде
     */
    renderWeather() {
        if (!this.weatherData) return;

        const temp = Math.round(this.weatherData.temperature_2m);
        const feelsLike = Math.round(this.weatherData.apparent_temperature);
        const humidity = this.weatherData.relative_humidity_2m;
        const windSpeed = this.weatherData.wind_speed_10m;
        const weatherCode = this.weatherData.weather_code;

        const weatherIcon = this.getWeatherIcon(weatherCode);
        const description = this.getWeatherDescription(weatherCode);

        this.weatherContent.innerHTML = `
            <div class="weather-main">
                <div class="weather-icon">${weatherIcon}</div>
                <div class="weather-temp">${temp}°C</div>
            </div>
            <div class="weather-description">${description}</div>
            <div class="weather-details">
                <div class="weather-detail">
                    <span class="detail-label">Ощущается:</span>
                    <span class="detail-value">${feelsLike}°C</span>
                </div>
                <div class="weather-detail">
                    <span class="detail-label">Влажность:</span>
                    <span class="detail-value">${humidity}%</span>
                </div>
                <div class="weather-detail">
                    <span class="detail-label">Ветер:</span>
                    <span class="detail-value">${windSpeed} км/ч</span>
                </div>
            </div>
        `;
    }

    /**
     * Возвращает иконку погоды по коду
     */
    getWeatherIcon(code) {
        const icons = {
            0: '☀️',    // Ясно
            1: '🌤️',   // Преимущественно ясно
            2: '⛅',    // Переменная облачность
            3: '☁️',    // Пасмурно
            45: '🌫️',  // Туман
            48: '🌫️',  // Иней
            51: '🌧️',  // Морось
            53: '🌧️',
            55: '🌧️',
            61: '🌧️',  // Дождь
            63: '🌧️',
            65: '🌧️',
            71: '🌨️',  // Снег
            73: '🌨️',
            75: '🌨️',
            80: '🌦️',  // Ливень
            81: '🌦️',
            82: '🌦️',
            95: '⛈️',  // Гроза
            96: '⛈️',
            99: '⛈️'
        };
        return icons[code] || '🌡️';
    }

    /**
     * Возвращает описание погоды по коду
     */
    getWeatherDescription(code) {
        const descriptions = {
            0: 'Ясно',
            1: 'Преимущественно ясно',
            2: 'Переменная облачность',
            3: 'Пасмурно',
            45: 'Туман',
            48: 'Иней',
            51: 'Легкая морось',
            53: 'Умеренная морось',
            55: 'Сильная морось',
            61: 'Небольшой дождь',
            63: 'Умеренный дождь',
            65: 'Сильный дождь',
            71: 'Небольшой снег',
            73: 'Умеренный снег',
            75: 'Сильный снег',
            80: 'Небольшой ливень',
            81: 'Умеренный ливень',
            82: 'Сильный ливень',
            95: 'Гроза',
            96: 'Гроза с градом',
            99: 'Сильная гроза с градом'
        };
        return descriptions[code] || 'Неизвестно';
    }
}