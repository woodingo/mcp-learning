# MCP Inspector

## Что такое Inspector

MCP Inspector — официальный веб-инструмент от Anthropic для визуального тестирования и отладки MCP-серверов. Позволяет просматривать tools, resources и prompts, вызывать их с параметрами и видеть результаты.

## Запуск

```bash
npm run inspector
```

Или напрямую:

```bash
npx @modelcontextprotocol/inspector node build/index.js
```

Inspector запускает ваш MCP-сервер как дочерний процесс и подключается к нему через stdio. Веб-интерфейс открывается на **http://localhost:6274**.

## Интерфейс

### Вкладка Tools

Отображает все зарегистрированные tools. Для каждого tool показывается:
- Имя и описание
- Параметры (имя, тип, обязательность)
- Форма для вызова с вводом параметров
- Результат последнего вызова

### Вкладка Resources

Отображает доступные ресурсы. Можно:
- Просмотреть список ресурсов с URI
- Загрузить и прочитать содержимое ресурса

### Лог

Внизу страницы — лог всех JSON-RPC сообщений между Inspector и сервером. Полезно для отладки проблем с транспортом.

## Пример: вызов tool `hello`

1. Запустите `npm run inspector`
2. Откройте http://localhost:6274
3. Перейдите на вкладку **Tools**
4. Найдите tool `hello`
5. В поле `name` введите, например, `Alice`
6. Нажмите **Run**
7. В результате увидите `Hello, Alice!`

## Пример: просмотр resource `greeting://hello`

1. Перейдите на вкладку **Resources**
2. Найдите ресурс с URI `greeting://hello`
3. Нажмите на него для загрузки
4. Увидите содержимое: `Hello, World!`

## Использование без npm

Если Inspector уже установлен глобально:

```bash
@modelcontextprotocol/inspector node build/index.js
```

## Указание порта

По умолчанию Inspector использует порт 6274. Для изменения:

```bash
PORT=8080 npx @modelcontextprotocol/inspector node build/index.js
```
