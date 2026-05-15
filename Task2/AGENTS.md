# CatHub — Дашборд любителя котов

## Описание проекта

Интерактивный дашборд для любителей котов с UI-виджетами на чистом JavaScript (ES6 Modules). Демонстрирует принципы ООП: инкапсуляция, наследование, полиморфизм.

## Структура проекта

```
.
├── index.html              # Главная страница
├── main.js                 # Точка входа
├── AGENTS.md               # Этот файл
├── js/
│   ├── UIComponent.js      # Базовый класс виджетов
│   ├── Dashboard.js        # Управление виджетами
│   ├── ToDoWidget.js       # Список дел по уходу
│   ├── CatFactWidget.js    # Факты о котах (API)
│   ├── CatImageWidget.js   # Фото котов (API)
│   └── NotesWidget.js      # Заметки хозяина
└── styles/
    ├── main.css            # Основные стили
    └── components.css      # Стили виджетов
```

## Виджеты

### 📋 ToDoWidget
Список дел по уходу за котом. Добавление, удаление, отметка выполненных. Каждый экземпляр имеет свой список.

### 🧶 CatFactWidget (API)
Случайные факты о котах через [catfact.ninja](https://catfact.ninja/). Fallback-факты при ошибке API.

### 📸 CatImageWidget (API)
Случайные фото котов через [TheCatAPI](https://thecatapi.com/). Кнопка "Другой котик".

### 📝 NotesWidget
Заметки хозяина о питомце. С датой и возможностью удаления.

## Архитектура

### ООП Принципы

**Инкапсуляция:**
- Данные виджета хранятся внутри класса (this.tasks, this.notes)
- Публичный API через методы (addTask, removeNote и т.д.)

**Наследование:**
- Все виджеты наследуются от UIComponent
- Базовый класс предоставляет render(), destroy(), minimize(), close()

**Полиморфизм:**
- Dashboard работает с любыми виджетами через общий интерфейс
- Метод addWidget() создаёт любой тип виджета по строковому ключу

## Запуск

```bash
# Локальный сервер
python3 -m http.server 8080
# или
npx serve .

# Открыть в браузере
open http://localhost:8080
```

## GitHub Pages

1. Создать репозиторий на GitHub
2. Запушить код: `git push origin main`
3. В Settings → Pages выбрать Source: Deploy from a branch → main → / (root)
4. Сайт будет доступен по ссылке из Pages

## API

- **Cat Fact API:** https://catfact.ninja/fact (бесплатный, без ключа)
- **TheCatAPI:** https://api.thecatapi.com/v1/images/search (бесплатный тир)
