# README_PantlKit

## Что такое PanelKit

`PanelKit` — это абстрактный конструктор компонуемых панелей (layout builder), который решает задачу:

- хранить дерево раскладки (`PanelKitNode`);
- делить области по вертикали/горизонтали;
- менять пропорции split-панелей;
- размещать контентные виджеты через drag-and-drop (из сайдбара и **между ячейками**, v2.8.5);
- вызывать настраиваемые команды панели через меню;
- отдавать интегратору точки расширения (registry, sidebar, renderer, actions).

`PanelKit` не содержит прикладной доменной логики (телеметрия, сети, специфичные API и т.п.).

## Ключевые сущности

- `PanelKitNode` — узел дерева раскладки:
  - `type: 'empty' | 'widget' | 'split'`
  - `widgetId` для контентного узла
  - `children` + `splitDirection` + `splitRatio` для split-узла
- `PanelKitItem` — элемент библиотеки виджетов для sidebar.
- `RegisteredPanelKitWidget<TData>` — регистрация доступного виджета в реестре.
- `PanelKitMenuConfig` — декларативная конфигурация меню команд.

## Компоненты и их роль

- `PanelCanvas`
  - рендерит дерево панелей;
  - поддерживает split/remove/drop;
  - вызывает внешний `renderWidget(node, clearWidget, data)`.
- `SplitContainer`
  - визуализация и изменение ratio через pointer drag.
- `Sidebar`
  - показывает библиотеку элементов;
  - стартует drag-and-drop по `widgetId`.
- `PanelMenuProvider` + `PanelCommandMenu`
  - связывают menu-конфиг с map действий `Record<string, () => void>`.

## Реестр виджетов

Функции:

- `registerPanelKitWidget(widget)`
- `getRegisteredPanelKitWidget(id)`
- `getAllRegisteredPanelKitWidgets()`

Реестр нужен для отделения layout-движка от конкретных UI-виджетов проекта.

## Экспортируемый API

Через `PanelKit/index.ts` наружу отдаются:

- визуальные блоки (`PanelCanvas`, `Sidebar`, `SplitContainer`, menu-компоненты);
- registry API;
- валидатор menu-конфига;
- основные типы.

## Контракт интеграции в приложение

Чтобы подключить `PanelKit` в любом проекте:

1. Зарегистрировать виджеты через `registerPanelKitWidget`.
2. Подготовить корневой layout (`PanelKitNode`).
3. Передать `PanelCanvas`:
   - `node`
   - `onChange`
   - `onRemoveNode`
   - `renderWidget(...)`
   - опциональные `data` (любой тип, зависит от приложения)
4. Подключить `Sidebar` с `items` из реестра.
5. (Опционально) Подключить `PanelMenuProvider`/`PanelCommandMenu`.

## Что считается responsibility интегратора

Интегратор (хост-приложение) сам отвечает за:

- загрузку/сохранение layout-конфигов;
- миграцию legacy-форматов;
- доменные источники данных;
- конкретный UI темы/брендинга;
- lifecycle и side-effects (API, storage, realtime и пр.).

## Текущий статус

Слой `PanelKit` уже отделен от aviation-специфики и используется как generic ядро.
`PanelBuilder` выступает как адаптерный слой, который подмешивает доменные зависимости поверх `PanelKit`.

**v2.8.5:** Drag-and-drop поддерживается не только из сайдбара на холст, но и **между ячейками панели** (move-семантика). **v2.8.6:** `Aircraft3DInstrument` исключён из меж-ячеечного DnD — мышь занята вращением 3D-сцены.
