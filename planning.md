# uCoz Hackathon — план проекта

## 1. Цель

Создать публичный AI-сервис, который принимает ссылку на товар Ozon/WB, формирует продающий лендинг и публикует его на uCoz.

Рабочее название: **UcozSwapper** — «Карточка в лендинг за минуту».

Главный demo-flow:

```text
Ссылка на товар → данные карточки → AI JSON → preview → публикация на uCoz → URL лендинга
```

## 2. Scope хакатонного MVP

### Входит в MVP

- публичная стартовая страница с логотипом и описанием проекта;
- input для ссылки или ID товара;
- поддержка одной marketplace-площадки на первом этапе — WB;
- ZenRows — единственный источник данных для текущего MVP;
- отдельный `ProductCardPreview` для проверки карточки до AI;
- `ZenRowsErrorModal` для ошибок и неполного ответа;
- получение доступных названия, описания, характеристик, цены, изображений и ссылки на товар;
- AI-генерация контента в строгом JSON-формате;
- один заранее подготовленный адаптивный шаблон лендинга;
- preview до публикации;
- загрузка изображений на uCoz через FTP;
- создание отдельной страницы на uCoz через uCoz MCP или uAPI;
- кнопка CTA «Купить на WB»;
- обработка ошибок и предупреждений.
- локальный кабинет без регистрации с историей успешных публикаций в `localStorage`.

### Не входит в MVP

- одновременная поддержка Ozon и WB;
- массовая генерация каталога;
- синхронизация цены и остатков;
- полноценный интернет-магазин;
- сложный парсинг отзывов;
- универсальный визуальный конструктор;
- автоматическая публикация без подтверждения пользователя;
- хранение API-ключей в frontend или Git.

## 3. Архитектура

```text
React 19 + Vite 7 + Preline 4 / Tailwind CSS 4
        ↓
Node.js + Fastify API
        ├── Marketplace adapter
        ├── Product normalizer
        ├── LLM service
        ├── JSON validator
        ├── Landing renderer
        └── uCoz publisher
                └── ucoz-mcp SDK
                        ├── FTP standalone HTML
                        └── Pages API
```

### Frontend

- React;
- Vite;
- JavaScript/JSX;
- Preline UI поверх Tailwind CSS v4;
- светлая sunny/liquid-glass тема;
- локальный MV Skifer для display-заголовков и Ubuntu для UI;
- фиксированная нижняя рабочая панель;
- адаптивный `ProductCardPreview` на CSS Grid без HTML-таблиц;
- состояния: idle, loading, preview, publishing, success, error.

### Backend

- Node.js;
- Fastify;
- Zod для валидации входных данных и ответа AI;
- `fetch`/HTTP-клиент для ZenRows и Nexus Hub LLM API;
- renderer на основе фиксированного HTML-шаблона.

### uCoz

- uCoz MCP используется для работы агента и интеграционного сценария;
- production publisher использует `ucoz-mcp` и FTP для самостоятельных HTML-страниц;
- перед публикацией проверяем шаблон и сохраняем backup;
- текущий подключённый сайт: `clone.ucoz.net`;
- MCP и FTP уже проверены read-only операциями.

## 4. Логика приложения

### Шаг 1. Ввод

Пользователь вводит ссылку на карточку или ID товара.

Frontend отправляет:

```json
{
  "marketplace": "wb",
  "productUrl": "https://...",
  "publish": false
}
```

### Шаг 2. Получение данных

1. Определить marketplace и ID.
2. Передать URL в ZenRows с JavaScript rendering.
3. Извлечь JSON-LD, Open Graph, meta-данные и product image URL.
4. Нормализовать результат в `ProductDTO`.
4. Сохранить timestamp и режим получения данных.
5. Если данных недостаточно — показать предупреждение, а не выдумывать значения.

### Шаг 3. Нормализация

Привести источник к единому объекту `ProductDTO`:

```json
{
  "platform": "WB",
  "productId": "123456",
  "title": "Название товара",
  "description": "Описание",
  "images": [],
  "characteristics": [],
  "price": null,
  "productUrl": "https://...",
  "fetchedAt": "2026-09-04T00:00:00Z"
}
```

### Шаг 4. Проверка карточки

До передачи данных в AI backend и frontend проверяют обязательные поля: название, цену, описание, фотографии и ID товара. Невалидный ответ или статус, отличный от `sourceStatus=fetched`, показывается в `ZenRowsErrorModal` и не попадает в preview.

### Шаг 5. AI

В AI отправляются только нормализованные данные товара и инструкции:

- не выдумывать характеристики, цифры и гарантии;
- использовать только подтверждённые данные;
- отсутствующие значения добавлять в `warnings`;
- вернуть только JSON по заданной схеме.

AI формирует:

- hero headline и subtitle;
- преимущества;
- краткое описание;
- характеристики;
- FAQ из имеющихся данных;
- SEO title и description;
- CTA с исходной ссылкой.

### Шаг 5. Валидация и renderer

1. Проверить ответ AI через Zod/JSON Schema.
2. Очистить текст от опасного HTML.
3. Подставить JSON в фиксированный шаблон.
4. Сформировать preview.
5. Не разрешать AI менять layout и произвольные скрипты.

### Шаг 6. Публикация

После подтверждения пользователя:

1. Сформировать standalone HTML с SEO-полями и CTA.
2. Передать HTML в `ucoz-mcp` через `ftp_tool`.
3. Создать уникальный файл с hash ID операции.
4. Проверить опубликованный URL.
5. Вернуть URL и предупреждения.
6. Сохранить операцию в локальном кабинете браузера.

## 5. API backend

```text
GET  /api/health
POST /api/parse
POST /api/generate
POST /api/publish
```

### `POST /api/parse`

Получает ссылку, возвращает нормализованный `ProductDTO`.

### `POST /api/generate`

Получает `ProductDTO`, возвращает `LandingContent` и preview.

### `POST /api/publish`

Получает валидированный `LandingContent`, публикует standalone HTML на uCoz и возвращает публичный URL с hash ID операции.

## 6. План этапов

### Этап 0 — подготовка

- [x] Подключить uCoz MCP.
- [x] Проверить список модулей uCoz.
- [x] Проверить список страниц.
- [x] Проверить FTP read-only.
- [x] Зафиксировать stack и scope.
- [ ] Проверить, что секреты после тестов ротированы.

### Этап 1 — каркас проекта

- [x] Создать `client` на React + Vite.
- [x] Подключить Tailwind CSS v4 как utility-движок.
- [x] Подключить Preline UI.
- [x] Создать `server` на Fastify.
- [x] Настроить общий запуск frontend/backend.
- [x] Перенести визуальные принципы из `dashboard.html`.

### Этап 2 — frontend

- [x] Собрать hero-блок с логотипом и описанием.
- [x] Добавить поле ссылки на товар.
- [x] Добавить кнопку генерации и публикации.
- [x] Добавить loading/error states.
- [x] Сделать `ProductCardPreview` с title, price, description, images и ID.
- [x] Добавить большой ZenRows toggle.
- [x] Добавить animated `ZenRowsErrorModal`.
- [x] Вернуть кнопку публикации после проверки parser flow.
- [x] Добавить localStorage-кабинет с hash ID, preview, WB URL и uCoz URL.
- [x] Перенести рабочую панель вниз экрана.
- [x] Сделать полноэкранный адаптивный preview.
- [x] Перевести данные preview с HTML-таблицы на CSS Grid.
- [x] Добавить адаптивную галерею: одно основное и до 12 дополнительных фото.
- [x] Убрать блокирующие overlay/backdrop и тяжёлые эффекты из preview.
- [x] Подключить MV Skifer и Ubuntu Light/Medium.

### Этап 3 — backend и AI

- [x] Добавить `/api/health`.
- [x] Добавить ZenRows adapter.
- [x] Оставить в UI только ZenRows parser.
- [x] Добавить HTML parser и извлечение product images.
- [x] Добавить fixture fallback для demo.
- [x] Реализовать `ProductDTO`.
- [x] Вынести AI service в `handlers/llmhandler.js`.
- [x] Подключить Nexus Hub через `chat/completions`.
- [x] Подключить и проверить `gemini-3.8-flash`.
- [x] Добавить строгую JSON-схему `LandingContent`.
- [x] Добавить mock AI для локального теста без ключа.
- [x] Добавить live smoke test через `.env`.

### Этап 4 — генерация лендинга

- [x] Создать один production-like HTML-шаблон.
- [x] Реализовать renderer.
- [x] Добавить безопасную обработку изображений.
- [x] Добавить SEO meta и CTA.
- [x] Проверить mobile layout.

### Этап 5 — публикация на uCoz

- [x] Реализовать боевой publish endpoint через `ucoz-mcp` + FTP.
- [x] Протестировать создание тестовой страницы.
- [x] Сделать главную uCoz отдельным цельным product landing без стандартного sidebar/layout.
- [x] Протестировать публикацию standalone HTML через FTP и публичный URL.
- [ ] Перенести внешние product images в uCoz assets через FTP.
- [x] Добавить проверку результата после публикации.
- [ ] Добавить rollback/backup strategy.

### Этап 6 — production и demo

- [x] Добавить `.env.example`.
- [x] Добавить краткую передачу контекста `sammary.md`.
- [x] Добавить техническую инструкцию `technical.md`.
- [ ] Проверить отсутствие секретов в Git.
- [ ] Добавить README.
- [ ] Создать публичный Git-репозиторий.
- [ ] Развернуть публичный backend/frontend.
- [x] Прогнать demo на реальном товаре.
- [ ] Подготовить короткий pitch и сценарий live demo.

## 7. Риски и решения

| Риск | Решение для MVP |
|---|---|
| Anti-bot marketplace | ZenRows JS rendering, timeout, fixture fallback |
| Неполные данные | `warnings`, ручной fallback, запрет выдумывания |
| Сломанные image URL | скачать assets и загрузить на uCoz |
| Изменение цены | timestamp и CTA на исходную карточку |
| Небезопасный AI HTML | AI отдаёт JSON, HTML собирает renderer |
| Ошибка публикации | preview до publish, backup и понятный статус |
| Утечка секретов | только backend `.env`, не Git и не frontend |
| Большой scope | один marketplace, один шаблон, один товар |

## 8. Definition of Done

Проект считается готовым, если:

- пользователь открывает публичный URL;
- вставляет ссылку на товар WB;
- получает preview лендинга;
- контент основан на данных карточки;
- изображения отображаются корректно;
- лендинг публикуется на тестовый uCoz-сайт;
- CTA ведёт на исходный товар;
- ошибки показываются пользователю;
- секреты отсутствуют в репозитории;
- есть README и инструкция запуска;
- полный demo-flow проходит без ручного редактирования кода.

## 9. Приоритеты

```text
P0: ZenRows → AI JSON → preview → uCoz publish
P1: warnings → mobile polish → README
P2: Ozon adapter → история проектов → авторизация пользователей → bulk generation
```

## 10. Текущее состояние — 2026-09-05

Текущая фаза: **подготовка репозитория и production/demo hardening**.

Рабочий end-to-end flow уже собран:

```text
WB URL → ZenRows → ProductDTO → preview → Nexus/Gemini JSON → renderer → ucoz-mcp → FTP/uCoz URL
```

Готово:

- реальный парсинг WB через ZenRows;
- проверка обязательных полей и модальное отображение ошибок;
- preview названия, публичной цены без WB Кошелька, ID, описания, характеристик и всех фото;
- Nexus Hub LLM handler с моделью `gemini-3.8-flash` и mock fallback;
- генерация безопасного standalone HTML по фиксированному renderer;
- публикация на uCoz через локально установленный `ucoz-mcp` и FTP;
- проверка публичного URL после публикации;
- локальная история успешных операций в `localStorage`;
- production-сборка frontend.

Перед публичным Git-репозиторием остаётся:

1. Ротировать ранее показанные API-ключи.
2. Повторно проверить отсутствие секретов в индексируемых файлах Git.
3. Добавить основной `README.md` и лицензию.
4. Зафиксировать первый commit и создать удалённый репозиторий.
5. Развернуть публичные frontend/backend процессы.
6. Добавить автоматические тесты API и renderer.
7. Подготовить rollback публикации и перенос внешних изображений в uCoz assets.
