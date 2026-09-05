# UcozSwapper — краткая передача контекста

UcozSwapper превращает публичную карточку Wildberries в самостоятельный SEO-лендинг с CTA и публикует его на uCoz.

## Что работает

- ZenRows собирает title, публичную цену без WB Кошелька, ID, описание, характеристики и до 12 фото.
- ProductDTO проходит строгую проверку до preview и AI.
- Nexus Hub / `gemini-3.8-flash` генерирует только безопасный контентный JSON.
- Backend случайно выбирает один из 7 шаблонов, layout и тип слайдера (`rail`, `cards`, `cinematic`).
- Четыре тёмных шаблона: `red_dark`, `green_dark`, `toxic`, `midnight`.
- Renderer собирает standalone HTML с SEO и CTA.
- Публикация доступна на demo-сайт через MCP/FTP либо на сайт пользователя через одноразовый uAPI key.
- UI имеет light/dark themes, Montserrat Bold/Ubuntu, лёгкий градиентный фон, blurry composer и локальную историю.

## Стек

- Frontend: React 19, Vite 7, Preline 4, Tailwind CSS 4, Lucide React.
- Backend: Node.js, Fastify 5, Zod 4, Cheerio, native Fetch.
- AI: Nexus Hub, `gemini-3.8-flash`.
- Scraping: ZenRows.
- Publish: uCoz Pages uAPI и `ucoz-mcp`/FTP.
- Assets: Sharp для генерации desktop/mobile WebP.
- State: React state + browser `localStorage`; секреты там не сохраняются.

## Ключевые файлы

- `client/src/App.jsx` — основной пользовательский flow.
- `client/src/components/LandingPreview.jsx` — preview вариантов лендинга.
- `client/src/components/UapiPublishModal.jsx` — одноразовый ввод URL/key.
- `server/src/handlers/llmhandler.js` — AI schema и random design resolver.
- `server/src/handlers/landingrenderer.js` — шаблоны и slider layouts.
- `server/src/handlers/ucozpublisher.js` — FTP и Pages uAPI.
- `planning.md` — статус/backlog; `technical.md` — запуск и тесты.

## Сейчас

MVP готов к hardening. Перед Git/production нужны ротация секретов, README/CI, rate limit endpoint с ключом, автоматические тесты и HTTPS deployment.
