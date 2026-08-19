# Разработка

## Установка зависимостей

```bash
npm install
```

## Команды

| Команда | Описание |
|---------|----------|
| `npm run build` | Компиляция TypeScript в `build/` |
| `npm start` | Запуск сервера через stdio |
| `npm run inspector` | Запуск MCP Inspector (веб-UI) |

## Процесс разработки

1. Внесите изменения в `src/index.ts`
2. Запустите `npm run build`
3. Запустите `npm run inspector` для проверки в веб-интерфейсе
4. Или `npm start` для запуска в консоли

## Как добавить новый Tool

Откройте `src/index.ts` и добавьте вызов `server.tool()`:

```typescript
server.tool(
  "my-tool",                          // уникальное имя
  {                                    // параметры (Zod-схемы)
    input: z.string().describe("Входные данные"),
  },
  async ({ input }) => ({             // обработчик
    content: [
      {
        type: "text" as const,
        text: `Результат: ${input}`,
      },
    ],
  })
);
```

После этого:
1. `npm run build` — перекомпилируйте
2. `npm run inspector` — убедитесь, что tool появился в UI

## Как добавить новый Resource

```typescript
server.resource(
  "my-resource",            // имя ресурса
  "my-scheme://path",       // URI
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify({ key: "value" }),
      },
    ],
  })
);
```

## Как запустить Inspector для отладки

```bash
npm run inspector
```

Откроется http://localhost:6274 с веб-интерфейсом для просмотра и вызова tools/resources. Подробнее в [docs/mcp-inspector.md](./mcp-inspector.md).

## Добавление зависимостей

```bash
npm install <package>
```

Для dev-зависимостей:

```bash
npm install -D <package>
```
