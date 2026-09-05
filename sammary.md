# UcozSwapper — краткая передача контекста

UcozSwapper превращает публичную карточку Wildberries в самостоятельный продающий лендинг и публикует его на uCoz.

## Что уже работает

- URL WB передаётся в ZenRows с JS rendering.
- Backend нормализует title, цену без WB Кошелька, ID, описание, характеристики и до 12 фото в `ProductDTO`.
- Невалидная карточка блокируется и показывается через `ZenRowsErrorModal`.
- Frontend отображает полноэкранный preview с адаптивной галереей и CSS Grid.
- Nexus Hub + `gemini-3.8-flash` возвращает валидируемый JSON лендинга.
- Серверный renderer собирает безопасный standalone HTML с SEO и CTA на исходный WB URL.
- `ucoz-mcp` публикует страницу через FTP или Pages API и проверяет публичный URL.
- Успешные операции сохраняются локально в браузере: hash ID, preview, WB URL и uCoz URL.

## Стек

- Frontend: React 19, Vite 7, JavaScript/JSX, Preline 4, Tailwind CSS 4, Lucide React.
- Backend: Node.js, Fastify 5, Zod 4, Cheerio, native Fetch.
- AI: Nexus Hub, модель `gemini-3.8-flash`.
- Scraping: ZenRows.
- Publish: uCoz, `ucoz-mcp`, MCP SDK, FTP/Pages API.
- State: React state и browser `localStorage`.

## Главные файлы

- `client/src/App.jsx` — основной flow и состояния UI.
- `client/src/components/ProductCardPreview.jsx` — preview карточки.
- `client/src/components/LocalAccount.jsx` — локальная история.
- `server/src/index.js` — API, parsing, DTO и HTML renderer.
- `server/src/handlers/llmhandler.js` — Nexus/Gemini.
- `server/src/handlers/ucozpublisher.js` — публикация через uCoz.
- `planning.md` — полный статус и backlog.
- `technical.md` — локальный запуск и проверки.

## Текущий этап

Основной MVP-flow готов. Сейчас проект готовится к Git и публичному deployment: нужны ротация ключей, README, первый commit, хостинг backend/frontend и автоматические тесты.
