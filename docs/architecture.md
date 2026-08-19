# Архитектура проекта

## Стек технологий

| Компонент | Технология |
|-----------|-----------|
| Runtime | Node.js v22 |
| Язык | TypeScript 7.x (ES2022 target) |
| MCP SDK | `@modelcontextprotocol/sdk` ^1.30.0 |
| Модули | ES Modules (NodeNext resolution) |
| Транспорт | stdio |

## Структура файлов

```
mcp-learning/
├── src/
│   └── index.ts          # MCP-сервер (единственный файл с логикой)
├── build/                # Скомпилированный JS (сгенерирован tsc)
├── docs/                 # Документация
├── package.json
├── tsconfig.json
└── mcp-server.service    # Systemd unit для автозапуска
```

## Как работает MCP-сервер

Сервер построен на высококлассном API (`McpServer`) из официального MCP SDK.

### Транспорт

Сервер использует **stdio** — стандартный ввод/вывод для обмена JSON-RPC сообщениями. Это базовый транспорт для MCP: клиент (Claude Desktop, Inspector) запускает сервер как дочерний процесс и общается с ним через stdin/stdout.

### Tool (инструмент)

Tool — это функция, которую клиент может вызвать. Сервер предоставляет tool `hello`:

- **Имя:** `hello`
- **Параметры:** `name` (string, необязательный) — имя для приветствия
- **Возвращает:** текстовое приветствие

### Resource (ресурс)

Resource — это данные, которые клиент может прочитать. Сервер предоставляет ресурс:

- **URI:** `greeting://hello`
- **Содержимое:** текст "Hello, World!"
- **MIME-тип:** text/plain

## Схема взаимодействия

```
┌─────────────────┐         stdio          ┌──────────────────┐
│  MCP-клиент     │◄──────────────────────►│  MCP-сервер      │
│  (Claude,       │    JSON-RPC messages   │  (build/index.js)│
│   Inspector)    │                        │                  │
└─────────────────┘                        └────────┬─────────┘
                                                    │
                                          ┌─────────┴─────────┐
                                          │                   │
                                    ┌─────▼─────┐     ┌──────▼──────┐
                                    │   Tool    │     │  Resource   │
                                    │  (hello)  │     │ (greeting)  │
                                    └───────────┘     └─────────────┘
```

## Добавление нового компонента

### Новый Tool

```typescript
server.tool(
  "tool-name",
  { param: z.string().describe("Описание параметра") },
  async ({ param }) => ({
    content: [{ type: "text" as const, text: `Результат: ${param}` }],
  })
);
```

### Новый Resource

```typescript
server.resource("name", "scheme://path", async (uri) => ({
  contents: [{
    uri: uri.href,
    mimeType: "text/plain",
    text: "Содержимое ресурса",
  }],
}));
```
