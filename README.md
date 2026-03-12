# Анкета по здоровью

Полнофункциональный сайт для сбора анкет по здоровью с поддержкой двух языков (RU/EN) и безопасной отправкой в Telegram через встроенные Vercel API routes.

## Особенности

- 🎨 Современный wellness-дизайн
- 🌍 Двуязычность (русский/английский)
- 📱 Полная адаптивность для мобильных устройств
- 📋 4 типа анкет (малыши, дети, женская, мужская)
- 🔄 Пошаговая навигация с индикатором прогресса
- ✅ Валидация полей
- 🔀 Условная логика для полей
- 📤 Интеграция с Telegram через Vercel API (токен скрыт от браузера)
- 📄 Страница Impressum (для соответствия европейским законам)
- ✅ Согласие на обработку данных

## Установка

```bash
npm install
```

## Запуск локально

```bash
npm run dev
```

Сайт будет доступен на `http://localhost:3000`

## Деплой на Vercel

Проект уже настроен для деплоя на Vercel как Vite-приложение.

Базовые настройки:

- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Шаги:

1. Зайдите в Vercel и создайте новый проект, выбрав репозиторий  
   [`Nadejda-Melnikova`](https://github.com/Anatoliiyastrebov/Nadejda-Melnikova).
2. Убедитесь, что:
   - команда сборки: `npm run build`
   - директория вывода: `dist`
3. Нажмите **Deploy** — после сборки сайт будет доступен по вашему Vercel-домену.

Файл `vercel.json` уже содержит настройки для правильной работы роутинга (все пути отдаются через `index.html`), чтобы страницы анкет и политики конфиденциальности корректно открывались по прямым ссылкам.

## Настройка Telegram на Vercel

```env
TELEGRAM_BOT_TOKEN=8001202621:AAGXWsdIeAktH1KfnWldeWRmfXzYE69CaLw
TELEGRAM_CHAT_ID=-1003632606246
```

Добавь эти переменные в настройках проекта на Vercel (`Settings -> Environment Variables`).

### Встроенные API routes

- `POST /api/telegram/sendMessage` — принимает JSON: `{ "text": "...", "parse_mode": "HTML" }`
- `POST /api/telegram/sendDocument` — принимает multipart: `document` и опционально `caption`

## Структура проекта

```
src/
├── components/          # React компоненты
├── pages/              # Страницы приложения
├── data/               # Данные анкет
├── utils/              # Утилиты (i18n, telegram)
└── styles/             # Стили
```

## Технологии

- React 18
- TypeScript
- React Router
- Vite
- CSS Modules

## Лицензия

MIT

