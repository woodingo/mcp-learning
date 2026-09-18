# Автозапуск через systemd

## Что такое systemd service

Systemd — система инициализации в Debian/Ubuntu. Service-файл описывает, как запускать процесс, когда он должен стартовать и как перезапускаться при сбоях.

## Файл сервиса

Файл `mcp-server.service` уже создан в корне проекта. Перед установкой замените плейсхолдеры `<USER>` и `<PROJECT_DIR>` на свои значения:

```bash
sed -e 's/<USER>/'$USER'/g' -e 's|<PROJECT_DIR>|'"$(pwd)"'|g' mcp-server.service > /tmp/mcp-server.service
```

## Установка сервиса

1. Сгенерируйте файл с подставленными путями:

```bash
sed -e 's/<USER>/'$USER'/g' -e 's|<PROJECT_DIR>|'"$(pwd)"'|g' mcp-server.service > /tmp/mcp-server.service
```

2. Скопируйте файл в системную директорию:

```bash
sudo cp /tmp/mcp-server.service /etc/systemd/system/
```

2. Перезагрузите конфигурацию systemd:

```bash
sudo systemctl daemon-reload
```

3. Включите автозапуск:

```bash
sudo systemctl enable mcp-server
```

4. Запустите сервис:

```bash
sudo systemctl start mcp-server
```

## Управление сервисом

| Команда | Описание |
|---------|----------|
| `sudo systemctl start mcp-server` | Запустить |
| `sudo systemctl stop mcp-server` | Остановить |
| `sudo systemctl restart mcp-server` | Перезапустить |
| `sudo systemctl status mcp-server` | Проверить статус |
| `sudo systemctl disable mcp-server` | Отключить автозапуск |

## Просмотр логов

```bash
# Текущие логи
sudo journalctl -u mcp-server

# Логи в реальном времени
sudo journalctl -u mcp-server -f

# Логи за последние 50 строк
sudo journalctl -u mcp-server -n 50
```

## Проверка статуса

```bash
sudo systemctl status mcp-server
```

Вывод покажет:
- `Active: active (running)` — сервис работает
- `Active: inactive (dead)` — сервис остановлен
- `Active: failed` — произошла ошибка

## Решение проблем

### Сервис не запускается

1. Проверьте, что `build/http.js` существует:
   ```bash
   ls -la build/http.js
   ```

2. Проверьте логи:
   ```bash
   sudo journalctl -u mcp-server -n 50
   ```

3. Проверьте права доступа:
   ```bash
   sudo systemctl status mcp-server
   ```

### Сервис падает и перезапускается

Systemd будет перезапускать его каждые 5 секунд (RestartSec=5). Проверьте логи для выяснения причины.

### Изменение путей

Если проект перемещён, обновите пути в файле сервиса:

```bash
sudo nano /etc/systemd/system/mcp-server.service
```

Затем:

```bash
sudo systemctl daemon-reload
sudo systemctl restart mcp-server
```
