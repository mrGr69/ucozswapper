# UcozSwapper — план и состояние проекта

## Цель MVP

Публичный сервис превращает ссылку на товар Wildberries в самостоятельный SEO-лендинг с CTA и публикует его на uCoz.

```text
WB URL → ZenRows → ProductDTO → Gemini JSON → случайный шаблон → preview → uCoz
```

## Архитектура

```text
React 19 + Vite 7 + Preline/Tailwind
        ↓ /api
Node.js + Fastify + Zod
        ├── ZenRows adapter
        ├── ProductDTO validator
        ├── Nexus/Gemini handler
        ├── random design resolver
        ├── safe HTML renderer
        └── uCoz publisher
              ├── demo: ucoz-mcp + FTP
              └── user site: one-shot uAPI Pages request
```

## Готово

### Получение карточки

- [x] WB URL и извлечение ID.
- [x] ZenRows с JS rendering.
- [x] Нормализация названия, публичной цены без WB Кошелька, описания, характеристик и до 12 фото.
- [x] Проверка обязательных полей и отдельная error-модалка.
- [x] Адаптивный Product Card Preview на CSS Grid.

### AI и шаблоны

- [x] Nexus Hub + `gemini-3.8-flash`.
- [x] Строгий JSON без произвольного HTML/CSS от модели.
- [x] Серверная рандомизация дизайна после каждого AI-ответа.
- [x] Шаблоны `spotlight`, `editorial`, `spec-driven`, `red_dark`, `green_dark`, `toxic`, `midnight`.
- [x] Варианты hero: `media-left`, `media-right`.
- [x] Галереи `rail`, `cards`, `cinematic` со scroll-snap и управлением.
- [x] SEO meta, CTA, sanitization и предупреждения о неполных данных.

### Публикация

- [x] Demo-публикация standalone HTML через `ucoz-mcp` + FTP.
- [x] Проверка публичного URL после FTP.
- [x] `POST /api/publish/uapi` для создания новой страницы на сайте пользователя.
- [x] uAPI key передаётся только в одном HTTPS-запросе, не сохраняется в браузере или базе.
- [x] Страница создаётся через Pages API с личным шаблоном и `$POWERED_BY$`.
- [x] Генерация отделена от выбора канала публикации.

### Интерфейс

- [x] Светлая liquid-glass и полноценная тёмная тема с сохранением выбора.
- [x] Montserrat Bold через Google Fonts для заголовков, Ubuntu для UI.
- [x] Светлый градиентный фон без фонового изображения.
- [x] Blurry bottom composer.
- [x] Переключатель Card/Landing Preview.
- [x] Одноразовая modal-форма «Свой uAPI».
- [x] Локальная история успешных публикаций без регистрации.

## API

```text
GET  /api/health
POST /api/parse
POST /api/generate
POST /api/publish
POST /api/publish/uapi
```

- `/api/parse`: WB URL → ProductDTO.
- `/api/generate`: ProductDTO → LandingContent + случайный design preset + HTML.
- `/api/publish`: публикация на настроенный demo-uCoz.
- `/api/publish/uapi`: создание редактируемой Pages-страницы на указанном пользователем uCoz-сайте.

## Текущая фаза — 2026-09-05

Фаза: **production/demo hardening и подготовка публичного Git-репозитория**.

Основной end-to-end flow собран. До релиза:

1. Ротировать все показанные ключи и проверить Git history/status на секреты.
2. Добавить rate limit и ограничение размера body для endpoint с uAPI.
3. Добавить автоматические API/renderer tests.
4. Переносить внешние product images в uCoz assets, чтобы лендинг не зависел от CDN WB.
5. Добавить rollback/удаление ошибочной публикации.
6. Добавить README, лицензию и CI.
7. Развернуть frontend/backend за HTTPS.
8. Подготовить pitch и стабильный demo-набор карточек.

## Риски

| Риск | Решение |
|---|---|
| Anti-bot WB | ZenRows JS rendering, timeout, явная ошибка вместо выдуманных данных |
| Неполная карточка | ProductDTO validation и warnings |
| Небезопасный AI HTML | модель отдаёт только JSON, HTML собирает сервер |
| Утечка uAPI key | one-shot HTTPS body, без localStorage/logging; в production нужен redaction/rate limit |
| Слишком широкие права ключа | рекомендовать ключ только с правами модуля Pages |
| Сломанные WB images | следующий этап — копирование assets на uCoz |
| Нестабильный дизайн | ограниченный набор проверенных presets и slider layouts |

## Definition of Done

- [x] Пользователь получает валидный preview карточки и лендинга.
- [x] Контент основан на карточке, а не придуман моделью.
- [x] Шаблон и слайдер выбираются случайно сервером.
- [x] Есть demo-публикация и отдельная публикация на пользовательский uCoz.
- [ ] Все секреты удалены/ротированы перед Git push.
- [ ] Production работает только по HTTPS.
- [ ] Есть README, CI и автоматические smoke-тесты.
