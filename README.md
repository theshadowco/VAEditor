# Vanessa Automation Editor

Редактор сценариев, созданный с помощью [Monaco](https://github.com/Microsoft/monaco-editor) и поддерживающий взаимодействие с платформой [1C:Предприятие](https://1c-dn.com/) 8.3.15+.

Собрано для [Vanessa Automation](https://github.com/Pr-Mex/vanessa-automation).


## Сборка

Для установки выполните команду (необходим установленный node.js для сборки)
```
npm install .
```

Для запуска отладки в браузере (на встроенном сервере для разработки) выполните команду
```
npm run debug
```

Для сборки финального файла `./dist/index.html`, встраиваемого в проект выполните команду
```
npm run build
```

Для сборки примера внешней обработки из исходников в epf файл (необходим oscrip) выполните команду
```
npm run compile
```

Для разборки примера внешней обработки из epf в исходники (необходим oscript) выполните команду
```
npm run decompile
```

Для запуска статанализа проверки стиля кода
```
npm run codestyle
```

## Как использовать в своем проекте

Доступны три режима работы:
* Простой редактор кода в одном окне
* Редактор для сравнение двух файлов
* Многооконный интерфейс с вкладками

По умолчанию открывается пустая страница без редакторов. Для начала работы при помощи
глобального метода необходимо создать экземпляр объекта, соответствующий выбраному режиму.

Смотрите пример использования во внешней обработке [Example](./example).

## API

### Глобальные свойства

**VanessaGherkinProvider** - экземпляр класса, реализующего поддержку языка Gherkin и обеспечивающий его конфигурирование.

**VanessaEditor** - экземпляр редактора, если оспользуется модель одного окна.

**VanessaDiffEditor** - экземпляр редактора для сравнение двух файлов, если оспользуется модель одного окна.

**VanessaTabs** - объект для управления множеством редакторов, с вкладками для переключения между ними.

### Глобальные методы

**createVanessaTabs()** - создать многооконный интерфейс для управления множеством редакторов.

**createVanessaEditor(content, language)** - создать простой редактор с одним окном для редактирования кода.

**createVanessaDiffEditor(original, modified, language)** - создать простой редактор для сравнения двух файлов.

**popVanessaMessage()** - получение одного сообщения из очереди событий.

### Действия (Actions)

Для управления редактором кода из 1С:Предпрития вы можете вызывать методы-действия объекта редактора, полученного из HTML-документа расположенного на форме.

| Action                         | Description                                                                                     |
| ------------------------------ | ----------------------------------------------------------------------------------------------- |
| `setTheme`                     | Установить тему редактора `vs`, `vs-dark` или `hc-black`                                        |
| `setContent`                   | Загрузить контент в модель редактора                                                            |
| `getContent`                   | Получить текст из модели редактора                                                              |
| `revealLine`                   | Выполнить прокрутку редактора до определенной строки                                            |
| ... другие команды ...         | см. другие команды в [vanessa-editor.ts](./src/vanessa-editor.ts)                               |

Пример:

```bsl
view = Items.VanessaEditor.Document.defaultView;
VanessaEditor = view.createVanessaEditor("", "turbo-gherkin");

VanessaEditor.setContent("Text to edit");
```

Посмотреть все доступные действия можно в списке действий в [Example](./example).

### События (Events)

Редактор может отправлять события, которые будут получены и могут быть обработаны на стороне 1С:Предприятия.

| Событие                                | Описание                                                                     |
| -------------------------------------- | ---------------------------------------------------------------------------- |
| `UPDATE_BREAKPOINTS`                   | При обновлении состояния брейкпоинтов                                        |
| `ON_HREF_CLICK`                        | При нажатии на ссылку                                                        |
| ... другие события ...                 | Команды, переданные в `VanessaEditor.addCommands`                            |

Пример:

```bsl
Function VanessaEditorOnReceiveEventHandler(Event, Arg)

  If Event = "UPDATE_BREAKPOINTS" Then
    UpdateBreakpoints(Arg);
  EndIf;

EndFunction
```

Отслеживать события можно в логе событий в [Example](./example).

## Примеры

### Json

В большинстве случаев обмен редактора и 1С:Предприятия осуществляется с помощью сообщений в json формате.
Для быстрой сериализации и десериализации объектов 1С:Предпрития в json формат Вы можете воспользоваться функциями:

```bsl
&AtClient
Function JsonDump(Value)

	JSONWriter = New JSONWriter;
	JSONWriter.SetString();
	WriteJSON(JSONWriter, Value);
	Return JSONWriter.Close();

EndFunction

&AtClient
Function JsonLoad(Json)

	JSONReader = New JSONReader;
	JSONReader.SetString(Json);
	Value = ReadJSON(JSONReader);
	JSONReader.Close();
	Return Value;

EndFunction
```

## Правила сворачивания строк

1. Ключевые слова верхнего уровня делят файл на секции и сворачиваются сами по себе, независимо от наличия отступов.
1. Комментарии которые идут подряд сворачиваются к первой строке комментариев тоже независимо от отступов. Пустая строка прерывает группу комментариев.
1. Параметры шага, строки начинающиеся с символа "|" сворачиваются к своей строке шага. Если внутри комментарии, то они сворачиваются независимо, сами в себя.
1. Инструкции, которые начинаются с собаки "@", группируются внутри себя.
1. Всё остальное сворачивается внутри секций по числу пробелов и табуляторов.
