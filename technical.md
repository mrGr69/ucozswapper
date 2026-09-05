# UcozSwapper — технический запуск

## 1. Что установить

Обязательно:

- Git 2.x;
- Node.js, совместимый с Vite 7: `^20.19.0` или `>=22.12.0`;
- npm, который устанавливается вместе с Node.js.

Рекомендация для команды: актуальная LTS-ветка Node.js 22+.

Не требуется:

- Python;
- глобальная установка Vite, React, Fastify или `ucoz-mcp`;
- GitHub CLI `gh` — он нужен только для удобного создания репозитория/PR из терминала.

В текущей рабочей среде проверены Node.js `v26.8.1`, npm `11.19.0` и Git `2.55.0.windows.5`.

## 2. Установка проекта

Команды выполняются из корня репозитория в CMD:

```cmd
npm ci
npm --prefix client ci
npm --prefix server ci
copy server\.env.example server\.env
```

У проекта три lock-файла: корневой, frontend и backend. Поэтому зависимости устанавливаются отдельно для каждого уровня.

## 3. Переменные окружения

Секреты хранятся только в `server\.env`. Файл уже исключён через `.gitignore`.

Основные переменные:

```dotenv
PORT=3001
NODE_ENV=development
DEMO_FALLBACK=true

ZENROWS_API_KEY=
ZENROWS_CAPTURE_XHR=false
ZENROWS_EMPTY_RETRY=true

NEXUS_API_KEY=
NEXUS_API_BASE_URL=https://api.nexus-hub.tech/v1
NEXUS_MODEL=gemini-3.8-flash
AI_DEMO_FALLBACK=false

UCOZ_SITE_URL=
UCOZ_PUBLISH_MODE=ftp
UCOZ_API_TOKEN=
UCOZ_FTP_HOST=
UCOZ_FTP_USER=
UCOZ_FTP_PASS=
```

Назначение:

- `ZENROWS_API_KEY` — реальный сбор карточки WB.
- `NEXUS_API_KEY` — реальная генерация LandingContent.
- `DEMO_FALLBACK` и `AI_DEMO_FALLBACK` — разрешение резервных demo/mock данных.
- `UCOZ_PUBLISH_MODE=ftp` — standalone HTML через FTP.
- `UCOZ_PUBLISH_MODE=pages` — создание страницы через Pages API; требует `UCOZ_API_TOKEN`.
- `WB_API_TOKEN`, `OZON_CLIENT_ID`, `OZON_API_KEY` пока зарезервированы и в текущем MVP не используются.

Перед Git-публикацией необходимо заменить все ключи, которые ранее передавались в чат или попадали на скриншоты.

## 4. Локальная разработка

Запустить frontend и backend одной командой:

```cmd
npm run dev
```

- frontend: `http://127.0.0.1:5173`;
- backend: `http://127.0.0.1:3001`;
- запросы `/api/*` Vite проксирует на backend.

Отдельный запуск:

```cmd
npm run dev:client
npm run dev:server
```

## 5. Production-проверка

```cmd
npm run build
npm start
```

`npm run build` создаёт `client\dist`. Fastify раздаёт эту сборку и API с одного процесса на порту `PORT`.

Проверка backend:

```cmd
curl http://127.0.0.1:3001/api/health
```

Основные endpoints:

- `GET /api/health` — конфигурация и состояние сервисов;
- `POST /api/parse` — URL WB → `ProductDTO`;
- `POST /api/generate` — `ProductDTO` → AI JSON + HTML preview;
- `POST /api/publish` — валидированный контент → публичная uCoz-страница.

## 6. Проверки перед merge

Автоматический test runner пока не добавлен. Минимальный smoke-набор:

1. `npm run build` завершается без ошибок.
2. `/api/health` возвращает `ok: true`.
3. Реальная WB-ссылка проходит `/api/parse` и показывает title, цену, ID, описание и фото.
4. `/api/generate` возвращает `mode: live`, правильную модель и валидный JSON.
5. `/api/publish` возвращает `published: true` и доступный публичный URL.
6. CTA опубликованной страницы ведёт на исходную карточку WB.
7. Операция появляется в локальной истории браузера.

## 7. uCoz MCP

Приложение не требует отдельной глобальной установки MCP: backend запускает `ucoz-mcp` из `server\node_modules` через MCP SDK.

Отдельное подключение MCP нужно только агенту/IDE для ручной диагностики uCoz. В Windows используется:

```cmd
cmd.exe /c npx -y ucoz-mcp@latest
```

Working directory — корень проекта. Переменные uCoz/FTP передаются окружением MCP-сервера.

## 8. Git hygiene

Не добавлять в Git:

- `server\.env` и любые `.env` с ключами;
- `node_modules`;
- `client\dist`;
- логи и временные файлы.

Перед первым commit проверить:

```cmd
git status --short
git diff --cached
```

GitHub CLI является опциональным. Репозиторий можно создать через сайт GitHub и подключить обычным Git.
