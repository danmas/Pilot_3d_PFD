# Система профилей и конфигураций панелей

> Версия: v2.4.4

---

## 1. Архитектура

Профили и конфигурации панелей — два независимых слоя, связка через поле `panelConfigName`.

```
data/
├── panels/              ← Конфигурации панелей (PanelKit-дерево)
│   ├── panel-config-current.json   ← Текущая (автосохраняемая)
│   ├── pan_cfg_1.json             ← Пример
│   └── ...                         ← Другие конфигурации
│
└── profiles/            ← Профили (имя + привязка к панели)
    ├── default.json
    └── ...              ← Создаются через UI
```

---

## 2. Формат профиля

Каждый профиль — простой JSON-файл в `data/profiles/`:

```json
{
  "name": "Default",
  "panelConfigName": "pan_cfg_1"
}
```

- `name` — отображаемое имя в селекторе
- `panelConfigName` — имя файла конфигурации панели (без `.json`) из `data/panels/`. Если `null` — панель не меняется.

---

## 3. Серверное API

Роуты в `bridge-plugin.ts`, блок `// API: Profiles`:

| Метод    | Путь                      | Описание                          |
|----------|---------------------------|-----------------------------------|
| `GET`    | `/api/profiles/`          | Список всех профилей              |
| `GET`    | `/api/profiles/:name`     | Деталь профиля                    |
| `PUT`    | `/api/profiles/:name`     | Создать/обновить профиль          |
| `DELETE` | `/api/profiles/:name`     | Удалить профиль                   |

`GET /api/profiles/` возвращает:
```json
[
  {
    "id": "default",
    "name": "Default",
    "panelConfigName": "pan_cfg_1",
    "updatedAt": "2026-06-03T06:53:49.258Z"
  }
]
```

`PUT /api/profiles/:name` принимает:
```json
{
  "name": "ILS Approach",
  "panelConfigName": "pan_cfg_5"
}
```

---

## 4. Клиент (profileStore.ts)

`src/stores/profileStore.ts` — 4 функции-обёртки над API:

| Функция                | Описание                                    |
|------------------------|---------------------------------------------|
| `getProfiles()`        | Получить список всех профилей               |
| `loadProfile(id)`      | Загрузить один профиль по id                |
| `saveProfile(id, name, panelConfigName?)` | Сохранить профиль |
| `deleteProfile(id)`    | Удалить профиль                             |

---

## 5. Селектор на PFD

В хедере PFD страницы (`App.tsx`, строка ~1015) — `<select>` с профилями.

**При переключении профиля:**

```
1. handleProfileChange(profileId)
   │
   ├── 2. Сохранить текущую панель в panel-config-current.json
   │       (через window.__panelBuilderRootNode)
   │
   ├── 3. Загрузить профиль с сервера (loadServerProfile)
   │
   ├── 4. Если profile.panelConfigName !== null:
   │       └── загрузить конфигурацию панели (loadPanelProfile)
   │       └── положить в window.__pendingPanelLoad
   │
   └── 5. setSelectedProfileId(profileId)
```

**PanelBuilder** при монтировании проверяет `window.__pendingPanelLoad`:
- Если есть — использует его как rootNode
- Если нет — грузит `panel-config-current.json` как обычно

Таким образом:
- **PFD** — меняет только идентификатор профиля (визуально не меняется)
- **PanelBuilder** — при переходе в него показывает панель из нового профиля

---

## 6. Отличие от старой системы (до v2.4.4)

| Старое                              | Новое                                |
|-------------------------------------|--------------------------------------|
| `panelStore.ts` для всего           | `panelStore.ts` — только панели      |
| Профили в `data/panels/`            | Профили в `data/profiles/`           |
| Нет привязки профиля к панели       | Явная привязка через panelConfigName |
| Селектор только в PanelBuilder      | Селектор в хедере PFD + PanelBuilder |

---

## 7. Замечания

- При первом запуске на устройстве селектор покажет "Default (pan_cfg_1)" — это будет работать, если `pan_cfg_1.json` существует в `data/panels/`.
- `panel-config-current.json` продолжает автосохраняться при изменении панели в PanelBuilder — это "рабочий" слот.
- Профили не удаляют конфигурации панелей при удалении — конфигурация остаётся в `data/panels/`.
- Создать новый профиль из UI пока нельзя (только через API) — если нужно, добавлю кнопку.
