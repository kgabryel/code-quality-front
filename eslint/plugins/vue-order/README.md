# vue-order

`vue-order` to plugin ESLint pilnujący kolejności bloków kodu w plikach `.vue` (`<script setup>`) i `.ts`: w
composables, serwisach itd.

Nie narzuca jednej „słusznej” kolejności - pozwala skonfigurować, jak ma wyglądać struktura. Zadanie pluginu sprowadza
się do jednego: egzekwowania tej struktury, gdy już zostanie ustalona.

**Ograniczenia i kompatybilność:**

- Tylko raportowanie - na razie plugin działa wyłącznie w trybie sprawdzania i zgłaszania błędów. Automatyczne
  poprawianie kodu flagą `--fix` nie jest jeszcze obsługiwane.
- Vue 3 / Composition API - narzędzie powstało z myślą o `<script setup>` i nowoczesnym Composition API i pod tym kątem
  było testowane. Na starszym kodzie (Vue 2, klasyczne Options API, czysty `setup()`) może zachowywać się
  nieprzewidywalnie.

---

## Spis treści

- [Główne założenia](#główne-założenia)
- [Integracja](#integracja)
    - [Ręczna konfiguracja (bez helperów)](#ręczna-konfiguracja-bez-helperów)
- [Elementy bazowe](#elementy-bazowe)
    - [Typ węzła (NodeType)](#typ-węzła-nodetype)
    - [Recognizer](#recognizer)
    - [Grupa](#grupa)
    - [BlankLine](#blankline)
    - [Subgrupy i triggery](#subgrupy-i-triggery)
- [Elementy konfiguracji](#elementy-konfiguracji)
    - [Parametry globalne (params)](#parametry-globalne-params)
    - [Ignorowane typy (ignoredTypes)](#ignorowane-typy-ignoredtypes)
    - [Custom recognizery (customRecognizers)](#custom-recognizery-customrecognizers)
    - [Konfiguracja per plik (configs)](#konfiguracja-per-plik-configs)
- [Konfiguracja per plik](#konfiguracja-per-plik)
    - [identifier](#identifier)
    - [recognizeFile](#recognizefile)
    - [registeredRecognizers](#registeredrecognizers)
    - [disabledTypes](#disabledtypes)
    - [Grupy (groups)](#grupy-groups)
    - [Typy w grupach (types)](#typy-w-grupach-types)
    - [Subgrupy i triggery (subGroupsTriggers, subGroups)](#subgrupy-i-triggery-subgroupstriggers-subgroups)
- [Wbudowane typy węzłów](#wbudowane-typy-węzłów)
    - [Import](#import)
    - [Interfejsy](#interfejsy)
    - [Vue macros](#vue-macros)
    - [Composables](#composables)
    - [State](#state)
    - [Computed](#computed)
    - [Watch](#watch)
    - [Lifecycle](#lifecycle)
    - [Akcje](#akcje)
    - [Fallbacki](#fallbacki)
    - [Globalne](#globalne)
- [Przykłady konfiguracji](#przykłady-konfiguracji)
    - [Plik .vue](#plik-vue)
    - [Composable (use\*.ts)](#composable-usets)

---

## Główne założenia

Plugin działa na zasadzie grupowania fragmentów kodu - węzłów AST, czyli np. importów, wywołań `ref()` czy funkcji - i
ustalania, w jakiej kolejności te grupy oraz elementy wewnątrz nich mają występować w pliku. Pilnuje tej kolejności, a
każde odejście od niej zgłasza jako błąd ESLint.

Do każdego pliku musi być przypisana konfiguracja. Robi to funkcja `recognizeFile`, sprawdzając, czy dany plik pasuje do
konkretnej konfiguracji. Konfiguracje są od siebie niezależne i każda ma własny zestaw reguł - plik `.vue` rządzi się
inną strukturą niż composable, a store Pinia inną niż zwykły serwis.

W samej konfiguracji ustala się też, jakie typy węzłów są w ogóle dozwolone (`registeredRecognizers`), a które są wprost
zabronione (`disabledTypes`).

---

## Integracja

Plugin wchodzi w skład pakietu `@kgabryel/code-quality`. Podpina się go w pliku `eslint.config.js` za pomocą funkcji
`create()`:

```js
// eslint.config.js
import {
  createConfig,
  vuePlugins,
  // ...inne helpery konfiguracyjne, niezwiązane z vue-order
} from '@kgabryel/code-quality/eslint/VueConfigBuilder';
import { vueOrderConfig } from '@kgabryel/code-quality/eslint/plugins/vue-order/example.config';

const config = createConfig()
  // ...pozostała konfiguracja projektu (rules, extends, languageOptions itd.)
  .setPlugins(vuePlugins(vueOrderConfig));

export default config.get();
```

`vueOrderConfig` to gotowa, bazowa konfiguracja pluginu - punkt wyjścia, który dostosowuje się do potrzeb konkretnego
projektu. Bez względu na to, jak ostatecznie będzie wyglądać, zawsze składa się z tych samych czterech pól:

```js
{
  params: { ... },            // opcjonalne - domyślnie wartości wbudowane
  customRecognizers: [ ... ], // opcjonalne - domyślnie pusta tablica []
  configs: [ ... ],           // wymagane - konfiguracje per plik
  ignoredTypes: [ ... ],      // opcjonalne - domyślnie pusta tablica []
}
```

- **`params`** - parametry globalne sterujące ogólnym zachowaniem pluginu, np. tym, co ma się stać, gdy trafi na plik
  lub węzeł, którego żaden recognizer nie rozpozna.
- **`customRecognizers`** - własne recognizery do rozpoznawania wzorców spoza wbudowanych typów.
- **`configs`** - lista konfiguracji per plik: definiuje grupy, ich kolejność i reguły dotyczące pustych linii.
- **`ignoredTypes`** - typy węzłów, które mogą pojawić się w dowolnym miejscu pliku i są całkowicie pomijane przy
  sprawdzaniu kolejności.

### Ręczna konfiguracja (bez helperów)

```js
// eslint.config.js
import { create } from '@kgabryel/code-quality/eslint/plugins/vue-order';
import { vueOrderConfig } from './twoja-konfiguracja-vue-order.js';

export default [
  // ...inne obiekty konfiguracyjne
  {
    plugins: {
      'vue-order': {
        rules: {
          'vue-order': create(vueOrderConfig),
        },
      },
    },
    rules: {
      'vue-order/vue-order': 'error',
    },
  },
];
```

---

## Elementy bazowe

### Typ węzła (NodeType)

Każdy fragment kodu w pliku - import, deklaracja `ref()`, funkcja, interfejs i tak dalej - otrzymuje przypisany
konkretny typ, np. `Import`, `Ref` czy `Function`. Konfiguracja korzysta potem z tych typów, żeby określić, do której
grupy trafia dany fragment i gdzie w kolejności powinien się znaleźć. Pełna lista wbudowanych typów znajduje się w
sekcji [Wbudowane typy węzłów](#wbudowane-typy-węzłów).

### Recognizer

Recognizer decyduje, czy dany węzeł AST odpowiada konkretnemu typowi. Każdy wbudowany typ węzła ma swój recognizer. Dla
`Ref` sprawdza on, czy węzeł to deklaracja `const x = ref( ... )`. Recognizery można też rozszerzać o własne,
niestandardowe wzorce, np. `defineStore()` z Pinia - patrz [Custom recognizery](#custom-recognizery-customrecognizers).

### Grupa

Grupa to nazwany zbiór typów węzłów, które pojawiają się razem, w jednym miejscu pliku, w określonej kolejności. Plugin
pilnuje przy tym czterech rzeczy:

1. Grupy pojawiają się w zadeklarowanej kolejności.
2. Typy wewnątrz grupy występują w kolejności zgodnej z konfiguracją.
3. Przed pierwszym elementem grupy znajduje się odpowiedni komentarz (jeśli `comment` nie jest `null`).
4. Między grupami i między elementami w grupie są zachowane odpowiednie puste linie.

### BlankLine

Enum `BlankLine` opisuje wymagania dotyczące pustych linii i działa na dwóch poziomach:

| Wartość          | Znaczenie                                                     |
|------------------|---------------------------------------------------------------|
| `BlankLine.NO`   | Brak wymaganej pustej linii                                   |
| `BlankLine.YES`  | Wymagana pusta linia przed pierwszym elementem grupy          |
| `BlankLine.ONCE` | Wymagana pusta linia przed pierwszym wystąpieniem danego typu |
| `BlankLine.ALL`  | Wymagana pusta linia przed każdym wystąpieniem danego typu    |

- **`group.blankLine`** - `BlankLine.YES`, `BlankLine.NO`
- **`type.blankLine`** - `BlankLine.NO`, `BlankLine.ONCE`, `BlankLine.ALL`

"Wymagana pusta linia" oznacza **co najmniej jedną** pustą linię, większa ich liczba jest jak najbardziej dopuszczalna.

```js
// przykład użycia BlankLine na poziomie grupy i typu
{
  name: 'computed',
  comment: 'computed',
  blankLine: BlankLine.YES,     // pusta linia przed grupą
  types: [
    {
      type: NodeType.Computed,
      blankLine: BlankLine.ALL, // pusta linia przed każdym computed
    },
  ],
}
```

Jeśli grupa jest **pierwszą** w pliku (lub w subgrupie), wymóg `BlankLine.YES` przestaje obowiązywać. Komentarz grupy
może wtedy stać bezpośrednio na początku.

```js
// state
const count = ref(0)

{
  name: 'state',
  comment : 'state',
  blankLine: BlankLine.YES,
  types: [
    {
      type: NodeType.Ref,
      blankLine: BlankLine.ALL,
    },
  ],
}
```

### Subgrupy i triggery

Subgrupy pozwalają zdefiniować osobną, wewnętrzną kolejność grup w ciele funkcji. Przydają się w composables i store'ach
z własną strukturą wewnętrzną (`setup`, `state`, `computed`, `actions`). Trigger wskazuje, jaki typ węzła inicjuje
wejście w subgrupę i jak wyciągnąć z niego węzły do sprawdzenia. Subgrupy można zagnieżdżać dowolnie głęboko. Każda ma
własne triggery i może mieć kolejne subgrupy.

W danej konfiguracji ten sam `nodeType` może być triggerem tylko raz. Jeśli ten sam węzeł pasuje do więcej niż jednego
triggera, plugin kończy działanie błędem.

Przykład struktury konfiguracji z subgrupami:

```js
subGroupsTriggers: [
  {
    nodeType: NodeType.Function,        // w przypadku napotkania Function (export function useX)...
    subGroup: 'composableBody',         // ...następuje sprawdzenie ciała zgodnie z subgrupą
    getBody: helpers.getComposableBody, // helper wyciągający węzły z ciała
  },
]
        
subGroups: {
  composableBody: {
  groups: [ /* kolejność wewnątrz funkcji */],
  // subgrupy mogą być zagnieżdżane
  subGroupsTriggers: [ ... ],
  subGroups: { ... },
  },
}
```

---

## Elementy konfiguracji

### Parametry globalne (params)

Obiekt `params` kontroluje globalne zachowanie pluginu:

| Parametr                 | Typ       | Domyślnie | Opis                                                                                                                          |
|--------------------------|-----------|-----------|-------------------------------------------------------------------------------------------------------------------------------|
| `allowUnmatchedFiles`    | `boolean` | `true`    | Plik bez pasującej konfiguracji: `true` → ostrzeżenie w konsoli, `false` → plugin zgłasza błąd i przerywa                     |
| `allowUnrecognizedNodes` | `boolean` | `false`   | Węzeł nierozpoznany przez żaden recognizer: `true` → ostrzeżenie w konsoli, `false` → plugin zgłasza błąd i przerywa          |
| `allowUnassignedNodes`   | `boolean` | `false`   | Węzeł rozpoznany, ale nieprzypisany do żadnej grupy: `true` → ostrzeżenie w konsoli, `false` → plugin zgłasza błąd i przerywa |
| `disableWarnings`        | `boolean` | `false`   | Wyłącza wszystkie ostrzeżenia w konsoli.                                                                                      |
| `interfaceNames.state`   | `string`  | `'State'` | Nazwa interfejsu rozpoznawanego jako `StateInterface` - patrz [Wbudowane typy węzłów](#wbudowane-typy-węzłów)                 |
| `interfaceNames.props`   | `string`  | `'Props'` | Nazwa interfejsu rozpoznawanego jako `PropsInterface` - patrz [Wbudowane typy węzłów](#wbudowane-typy-węzłów)                 |
| `interfaceNames.emits`   | `string`  | `'Emits'` | Nazwa interfejsu rozpoznawanego jako `EmitsInterface` - patrz [Wbudowane typy węzłów](#wbudowane-typy-węzłów)                 |

```js
params: {
  allowUnmatchedFiles: true,
  allowUnrecognizedNodes: false,
  allowUnassignedNodes: false,
  disableWarnings: false,
  interfaceNames: {
    state: 'State',
    props: 'Props',
    emits: 'Emits',
  },
}
```

Obiekt `params` trafia do każdego recognizera, dzięki czemu można go rozszerzyć o własne pola i wykorzystać je w logice
custom recognizerów - patrz [Custom recognizery](#custom-recognizery-customrecognizers).

### Ignorowane typy (ignoredTypes)

`ignoredTypes` to tablica typów węzłów, które są rozpoznawane, ale ignorowane, bez zgłaszania komunikatów. Mogą pojawić
się w dowolnym miejscu pliku, bez żadnego wpływu na sprawdzanie kolejności.

Przykładowa konfiguracja dostarcza gotową, kompletną listę typów zalecanych do `ignoredTypes`:

```js
ignoredTypes: [
  NodeType.Return,            // Instrukcje zwracania wartości (return)
  NodeType.IfStatement,       // Konstrukcje warunkowe if oraz if-else
  NodeType.ForOfStatement,    // Pętle iterujące po wartościach (for ... of)
  NodeType.ForInStatement,    // Pętle iterujące po kluczach (for ... in)
  NodeType.ForStatement,      // Klasyczne pętle licznikowe (for)
  NodeType.WhileStatement,    // Pętle warunkowe (while)
  NodeType.DoWhileStatement,  // Pętle warunkowe wykonawcze (do ... while)
  NodeType.TryStatement,      // Bloki obsługi błędów (try ... catch ... finally)
  NodeType.ThrowStatement,    // Rzucanie wyjątków (throw new Error)
  NodeType.SwitchStatement,   // Instrukcje wyboru switch-case
  NodeType.LabeledStatement,  // Bloki kodu z etykietami skoku (label:)
  NodeType.BlockStatement,    // Samodzielne bloki kodu ograniczone klamrami {}
  NodeType.BreakStatement,    // Instrukcje przerwania pętli lub switcha (break)
  NodeType.ContinueStatement, // Instrukcje przejścia do kolejnej iteracji (continue)
  NodeType.EmptyStatement,    // Puste instrukcje (samotne średniki ;)
  NodeType.WithStatement,     // Instrukcje zamykające zasięg (with)
  NodeType.DebuggerStatement, // Instrukcje wstrzymania wykonania kodu (debugger)
]
```

Typy wpisane w `ignoredTypes` nie wymagają rejestrowania w `registeredRecognizers`.

### Custom recognizery (customRecognizers)

`customRecognizers` to tablica własnych recognizerów, która rozszerza wbudowane typy węzłów o niestandardowe wzorce.
Przydaje się, gdy projekt korzysta z konstrukcji, których plugin domyślnie nie rozpoznaje - np. `defineStore()` z Pinia.

Każdy custom recognizer to obiekt o trzech polach:

```js
{
  type: 'NazwaTypu',                      // unikalna nazwa - string lub stała z własnego enum
  priority: 50,                           // kolejność sprawdzania względem innych recognizerów, domyślnie 0
  test: (node, programConfig) => boolean, // czy węzeł pasuje do tego typu
}
```

Recognizery są sprawdzane w kolejności malejącego priorytetu - węzeł dostaje typ pierwszego recognizera, którego funkcja
`test` zwróci `true`. Priorytety wbudowanych recognizerów mieszczą się w zakresie 0-30, więc custom recognizer z
priorytetem np. `50` zawsze je wyprzedzi. Żeby nadpisać węzły obsługiwane przez konkretny wbudowany recognizer, własnemu
trzeba nadać priorytet wyższy niż ten, który ma wbudowany odpowiednik.

Funkcja `test` przyjmuje dwa argumenty: węzeł AST i obiekt `programConfig`. Wywołanie `programConfig.getParams()` zwraca
obiekt `params` z konfiguracji, dzięki temu logikę recognizera można parametryzować, zamiast wpisywać wartości na
sztywno.

Przykład recognizera dla `defineStore()`, z nazwą funkcji pobieraną z `params`:

```js
// w konfiguracji - własne pole w params
params: {
  storeFactory: 'defineStore',
  // ...
}

// recognizer:
const storeRecognizer = {
  type: 'StoreDefinition',
  priority: 50,
  test: (node, programConfig) => {
    const { storeFactory } = programConfig.getParams();
    const inner = node.type === 'ExportNamedDeclaration' ? node.declaration : node;

    if (inner?.type !== 'VariableDeclaration') {
      return false;
    }

    const init = inner.declarations[0]?.init;
    return init?.type === 'CallExpression' && init.callee?.name === storeFactory;
  },
};
```

Własny typ (`StoreDefinition`) należy dopisać do `registeredRecognizers`w konfiguracji tego pliku, który ma z niego
korzystać - patrz [Konfiguracja per plik](#konfiguracja-per-plik-configs).

### Konfiguracja per plik (configs)

`configs` to tablica konfiguracji definiujących reguły kolejności dla poszczególnych typów plików. Każda z nich określa,
które pliki obsługuje (`recognizeFile`), jakie typy węzłów są dozwolone (`registeredRecognizers`) lub zabronione 
(`disabledTypes`) oraz jak powinny być ułożone grupy i ich zawartość (`groups`, `subGroupsTriggers`, `subGroups`).

Pełny opis wszystkich pól i dostępnych helperów znajduje się w
sekcji [Konfiguracja per plik](#konfiguracja-per-plik-configs).

---

## Konfiguracja per plik

Tablica `configs` zawiera konfiguracje, z których każda obsługuje określony typ pliku. Każdy plik musi pasować dokładnie
do jednej z nich (funkcja `recognizeFile` może zwrócić `true` tylko dla jednego elementu tablicy). Jeśli zwróci `true`
dla więcej niż jednej konfiguracji, plugin zgłosi błąd.

Każda konfiguracja składa się z następujących pól:

```js
{
  identifier: 'vue',              // wymagane - unikalna nazwa konfiguracji
  recognizeFile: isVueFile,       // wymagane - które pliki obsługuje ta konfiguracja
  registeredRecognizers: [ ... ], // wymagane - dozwolone typy węzłów
  groups: [ ... ],                // wymagane - kolejność grup
  disabledTypes: [ ... ],         // opcjonalne - zabronione typy węzłów
  subGroupsTriggers: [ ... ],     // opcjonalne - triggery subgrup
  subGroups: { ... },             // opcjonalne - definicje subgrup
}
```

### identifier

`identifier` to unikalna nazwa konfiguracji, używana w komunikatach błędów i ostrzeżeniach. Może przyjąć dowolną wartość
`string`, np.:

```js
identifier: 'vue'
identifier: 'composable'
identifier: 'pinia-store'
```

### recognizeFile

`recognizeFile` to funkcja `(filename: string) => boolean`, która decyduje, czy plik jest obsługiwany przez daną
konfigurację. Wbudowane helpery importuje się z:

```js
import {
  hasExtension,
  isVueFile,
  isTsFile,
  isInDirectory,
  matchesFile,
  isFile,
  and,
  or,
  not,
} from '@kgabryel/code-quality/eslint/plugins/vue-order/helpers';
```

Dostępne helpery:

| Helper               | Opis                                                                                      |
|----------------------|-------------------------------------------------------------------------------------------|
| `hasExtension(ext)`  | Pasuje do plików o danym rozszerzeniu, np. `hasExtension('ts')` lub `hasExtension('.ts')` |
| `isVueFile`          | Pasuje do plików `.vue`                                                                   |
| `isTsFile`           | Pasuje do plików `.ts` (bez `.d.ts`)                                                      |
| `isInDirectory(dir)` | Pasuje do plików w danym katalogu i podkatalogach                                         |
| `matchesFile(regex)` | Pasuje do plików o nazwie zgodnej z wyrażeniem regularnym                                 |
| `isFile(filename)`   | Pasuje do pliku o dokładnie podanej nazwie                                                |
| `and(...fns)`        | Wszystkie warunki muszą być spełnione                                                     |
| `or(...fns)`         | Dowolny warunek musi być spełniony                                                        |
| `not(fn)`            | Negacja, warunek nie może być spełniony                                                   |

Przykłady:

```js
// pliki .vue
recognizeFile: isVueFile

// pliki .ts w katalogu composables/
recognizeFile: and(isTsFile, isInDirectory('composables'))

// pliki .ts w katalogu composables/ o nazwie zgodnej z wzorcem
recognizeFile: and(isTsFile, isInDirectory('composables'), matchesFile(/^use[A-Z]/))

// pliki .vue lub .ts w katalogu components/
recognizeFile: or(isVueFile, and(isTsFile, isInDirectory('components')))

// pliki .ts poza katalogiem tests/
recognizeFile: and(isTsFile, not(isInDirectory('tests')))

// wszystkie pliki o podanej nazwie (w dowolnym katalogu)
recognizeFile: isFile('router.ts')
```

### registeredRecognizers

`registeredRecognizers` to tablica typów węzłów obsługiwanych przez tę konfigurację. Trzeba w niej uwzględnić 
**wszystkie** typy używane w `groups` i `subGroups`, zarówno wbudowane, jak i własne z `customRecognizers`. Typy z
`ignoredTypes` nie wymagają wpisu w tym miejscu.

Węzeł, którego typu nie ma na liście, wywołuje ostrzeżeniem lub błędem - zależnie od `allowUnrecognizedNodes`.

```js
registeredRecognizers: [
  NodeType.Import,
  NodeType.Interface,
  NodeType.DefineProps,
  NodeType.Ref,
  NodeType.Computed,
  NodeType.Function,
  'StoreDefinition', // własny typ z customRecognizers
]
```

To pole pełni funkcję filtra bezpieczeństwa. W rozbudowanych projektach lista `customRecognizers` może zawierać reguły
dedykowane różnym typom plików (komponenty, store'y Pinia, serwisy), które mogłyby ze sobą kolidować. Jawne
zadeklarowanie obsługiwanych typów w `registeredRecognizers` izoluje konfigurację danego pliku i ogranicza aktywne
recognizery tylko do tych, które rzeczywiście go dotyczą.

### disabledTypes

`disabledTypes` to opcjonalna, domyślnie pusta tablica. Typy węzłów, których obecność jest w tej konfiguracji *
*zabroniona**, każde wystąpienie powoduje zgłoszenie błędu ESLint.

```js
// ArrowFunction zabroniona w plikach Vue
disabledTypes: [NodeType.ArrowFunction]
```

Typ zablokowany w `disabledTypes` musi jednocześnie znaleźć się w `registeredRecognizers`. Bez tego plugin nie rozpozna
danego węzła - efektem będzie zgłoszenie błędu albo ostrzeżenia z całkowitym pominięciem węzła (zależnie od wartości
`allowUnrecognizedNodes`).

### Grupy (groups)

Tablica `groups` definiuje kolejność bloków kodu w pliku. Grupy muszą mieć unikalne nazwy.

```js
groups: [
  {
    name: 'state',            // wymagane - unikalna nazwa grupy
    comment: 'state',         // opcjonalne - wymagany komentarz przed grupą, domyślnie null
    blankLine: BlankLine.YES, // opcjonalne – pusta linia przed grupą, domyślnie BlankLine.NO
    types: [ ... ],           // wymagane - typy należące do grupy
  },
]
```

Jeśli pole `comment` jest podane, plugin wymaga komentarza zaczynającego się od `// <comment>` bezpośrednio przed
pierwszym elementem grupy. Dopasowanie jest niewrażliwe na wielkość liter, a komentarz może zawierać dodatkowy tekst po
zadeklarowanej wartości:

```ts
// state             ✓ dokładne dopasowanie
// State             ✓ inna wielkość liter
// state - computed  ✓ dodatkowy tekst po
// computed          ✗ inny komentarz
```

Brak wartości `comment` jest równoważny `null` - w takim przypadku plugin nie wymaga komentarza przed grupą.

Między komentarzem grupy a pierwszym węzłem mogą znaleźć się komentarze dokumentacyjne:

```ts
// state
/**
 * Licznik kliknięć
 */
const count = ref(0);
```

### Typy w grupach (types)

Każdy element tablicy `types` definiuje typ węzła i wymagania dotyczące pustych linii:

```js
types: [
  { type: NodeType.Ref, blankLine: BlankLine.NO }, // opcjonalne - pusta linia przed każdym ref(), domyślnie BlankLine.NO
  { type: NodeType.Reactive, blankLine: BlankLine.ONCE },
  { type: NodeType.Computed, blankLine: BlankLine.ALL },
]
```

Kolejność elementów w tablicy `types` odpowiada kolejności, w jakiej dane typy powinny następować po sobie w kodzie.

### Subgrupy i triggery (subGroupsTriggers, subGroups)

Oba pola są opcjonalne i są potrzebne tylko wtedy, gdy konfiguracja korzysta z subgrup.

Opis samego mechanizmu subgrup i triggerów znajduje się w sekcji 
[Elementy bazowe - Subgrupy i triggery](#subgrupy-i-triggery).

**`subGroupsTriggers`** - lista triggerów dla tej konfiguracji:

```js
import { getComposableBody } from './helpers.js';

subGroupsTriggers: [
  {
    nodeType: NodeType.Function, // typ węzła wyzwalający subgrupę
    subGroup: 'composableBody',  // klucz w obiekcie subGroups
    getBody: getComposableBody,  // helper wyciągający węzły z ciała
  },
]
```

**`subGroups`** - obiekt z definicjami subgrup. Każda subgrupa ma taką samą strukturę jak konfiguracja główna i może
zawierać własne `groups`, `subGroupsTriggers` i `subGroups`:

```js
subGroups: {
  composableBody: {
    groups: [
      { name: 'setup', comment: 'setup', blankLine: BlankLine.YES, types: [ ... ] },
      { name: 'state', comment: 'state', blankLine: BlankLine.YES, types: [ ... ] },
      { name: 'computed', comment: 'computed', blankLine: BlankLine.YES, types: [ ... ] },
      { name: 'actions', comment: 'actions', blankLine: BlankLine.YES, types: [ ... ] },
    ],
    subGroupsTriggers: [ ... ], // opcjonalne - zagnieżdżanie subgrup
    subGroups: { ... },
  },
}
```

Dostępne helpery do wyciągania ciała funkcji:

| Helper              | Obsługuje                        |
|---------------------|----------------------------------|
| `getComposableBody` | `export function useX() { ... }` |

---

## Wbudowane typy węzłów

### Import

| Typ      | Priorytet | Opis                                                                                       |
|----------|-----------|--------------------------------------------------------------------------------------------|
| `Import` | `10`      | Instrukcja importu<br>`import { ref } from 'vue'`<br>`import type { User } from './types'` |

### Interfejsy

| Typ              | Priorytet | Opis                                                                                                                                                                                     |
|------------------|-----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `StateInterface` | `20`      | Interfejs o nazwie zgodnej z `params.interfaceNames.state` (domyślnie `State`)<br>`interface State { count: number; isOpen: boolean }`                                                   |
| `PropsInterface` | `20`      | Interfejs o nazwie zgodnej z `params.interfaceNames.props` (domyślnie `Props`)<br>`interface Props { name: string; disabled?: boolean }`                                                 |
| `EmitsInterface` | `20`      | Interfejs o nazwie zgodnej z `params.interfaceNames.emits` (domyślnie `Emits`)<br>`interface Emits { (e: 'update', value: string): void }`<br>`type Emits = { update: [value: string] }` |
| `Interface`      | `10`      | Pozostałe interfejsy, które nie zostały przechwycone przez typy nazwane<br>`interface UserResponse { id: number; email: string }`<br>`export interface X { ... }`                        |
| `TypeAlias`      | `10`      | Aliasy typów<br>`type Status = 'active' \| 'inactive'`<br>`export type X = ...`                                                                                                          |

`StateInterface`, `PropsInterface` i `EmitsInterface` rozpoznawane są po nazwie - patrz 
[`params.interfaceNames`](#parametry-globalne-params). Węzły, które nie pasują do żadnego z tych trzech typów, trafiają
do `Interface` lub `TypeAlias`.

### Vue macros

| Typ             | Priorytet | Opis                                                                                                                |
|-----------------|-----------|---------------------------------------------------------------------------------------------------------------------|
| `WithDefaults`  | `30`      | Definicja props z wartościami domyślnymi<br>`const props = withDefaults(defineProps<Props>(), { name: 'default' })` |
| `DefineProps`   | `20`      | Definicja props<br>`defineProps<Props>()`<br>`const props = defineProps({ name: String })`                          |
| `DefineEmits`   | `20`      | Definicja emitów<br>`defineEmits<Emits>()`<br>`const emit = defineEmits(['update', 'close'])`                       |
| `DefineOptions` | `20`      | Opcje komponentu<br>`defineOptions({ inheritAttrs: false })`                                                        |

### Composables

| Typ                  | Priorytet | Opis                                                                                                                                           |
|----------------------|-----------|------------------------------------------------------------------------------------------------------------------------------------------------|
| `ComposableInstance` | `10`      | Wywołanie composable z przypisaniem do pojedynczej zmiennej<br>`const store = useStore()`                                                      |
| `ComposableCall`     | `10`      | Wywołanie composable z destrukturyzacją<br>`const { formErrors, valid } = useValidation()`<br>`const { data, error } = useFetch('/api/users')` |

### State

| Typ               | Priorytet | Opis                                                                                     |
|-------------------|-----------|------------------------------------------------------------------------------------------|
| `Ref`             | `10`      | Reaktywna referencja<br>`const count = ref(0)`<br>`const user = ref<User \| null>(null)` |
| `ShallowRef`      | `10`      | Płytka reaktywna referencja<br>`const list = shallowRef<Item[]>([])`                     |
| `Reactive`        | `10`      | Reaktywny obiekt<br>`const form = reactive({ email: '', password: '' })`                 |
| `ShallowReactive` | `10`      | Płytki reaktywny obiekt<br>`const cache = shallowReactive<Record<string, Data>>({})`     |

### Computed

| Typ        | Priorytet | Opis                                                                                   |
|------------|-----------|----------------------------------------------------------------------------------------|
| `Computed` | `10`      | Wartość wyliczana<br>`const fullName = computed(() => first.value + ' ' + last.value)` |

### Watch

| Typ               | Priorytet | Opis                                                                                                                                                  |
|-------------------|-----------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| `Watch`           | `10`      | Obserwator z jawnym źródłem<br>`watch(count, (newVal, oldVal) => { console.log(newVal) })`<br>`watch(() => props.id, fetchUser, { immediate: true })` |
| `WatchEffect`     | `10`      | Obserwator ze śledzeniem zależności<br>`watchEffect(() => { document.title = title.value })`                                                          |
| `WatchPostEffect` | `10`      | Obserwator uruchamiany po aktualizacji DOM<br>`watchPostEffect(() => { scrollTo(position.value) })`                                                   |
| `WatchSyncEffect` | `10`      | Obserwator uruchamiany synchronicznie<br>`watchSyncEffect(() => { syncExternalLib(value.value) })`                                                    |

### Lifecycle

| Typ                 | Priorytet | Opis                                                                                   |
|---------------------|-----------|----------------------------------------------------------------------------------------|
| `OnMounted`         | `10`      | `onMounted(() => { fetchData() })`                                                     |
| `OnUnmounted`       | `10`      | `onUnmounted(() => { clearInterval(timer) })`                                          |
| `OnBeforeMount`     | `10`      | `onBeforeMount(() => { prepareData() })`                                               |
| `OnBeforeUnmount`   | `10`      | `onBeforeUnmount(() => { cleanup() })`                                                 |
| `OnUpdated`         | `10`      | `onUpdated(() => { checkScroll() })`                                                   |
| `OnBeforeUpdate`    | `10`      | `onBeforeUpdate(() => { saveScrollPosition() })`                                       |
| `OnActivated`       | `10`      | Komponent objęty `<KeepAlive>`, aktywacja<br>`onActivated(() => { refreshData() })`    |
| `OnDeactivated`     | `10`      | Komponent objęty `<KeepAlive>`, deaktywacja<br>`onDeactivated(() => { pauseVideo() })` |
| `OnErrorCaptured`   | `10`      | `onErrorCaptured((err, instance, info) => { logError(err); return false })`            |
| `OnRenderTracked`   | `10`      | `onRenderTracked((event) => { console.log(event) })`                                   |
| `OnRenderTriggered` | `10`      | `onRenderTriggered((event) => { console.log(event) })`                                 |

### Akcje

| Typ             | Priorytet | Opis                                                                                                                                                                               |
|-----------------|-----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `Function`      | `10`      | Deklaracja funkcji<br>`function handleSubmit() { ... }`<br>`async function loadUser(id: string) { ... }`<br>`export function useX() { ... }`                                       |
| `ArrowFunction` | `10`      | Funkcja strzałkowa przypisana do zmiennej<br>`const handleClick = () => { ... }`<br>`const formatDate = (date: Date) => date.toISOString()`<br>`export const useX = () => { ... }` |

### Fallbacki

Typy przechwytujące węzły, które nie pasują do żadnego bardziej szczegółowego recognizera.

| Typ     | Priorytet | Opis                                                                                                                                                          |
|---------|-----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `Const` | `5`       | Dowolny `const x = ...` nieprzechwycony przez żaden bardziej szczegółowy recognizer<br>`const API_URL = 'https://api.example.com'`<br>`const MAX_RETRIES = 3` |

### Globalne

Typy, które mogą pojawić się w dowolnym miejscu kodu i są przeznaczone do umieszczenia w `ignoredTypes`. Wszystkie
mają priorytet `0`.

| Typ                 | Priorytet | Opis                                                                                                                    |
|---------------------|-----------|-------------------------------------------------------------------------------------------------------------------------|
| `Return`            | `0`       | Instrukcja return<br>`return { count, increment }`                                                                      |
| `Expression`        | `0`       | Dowolny `ExpressionStatement` nieprzechwycony przez inny recognizer<br>`console.log(value)`<br>`someExternalLib.init()` |
| `IfStatement`       | `0`       | `if (isReady.value) { ... }`<br>`if (x) { ... } else { ... }`                                                           |
| `ForStatement`      | `0`       | `for (let i = 0; i < 10; i++) { ... }`                                                                                  |
| `ForOfStatement`    | `0`       | `for (const item of list) { ... }`                                                                                      |
| `ForInStatement`    | `0`       | `for (const key in obj) { ... }`                                                                                        |
| `WhileStatement`    | `0`       | `while (condition) { ... }`                                                                                             |
| `DoWhileStatement`  | `0`       | `do { ... } while (condition)`                                                                                          |
| `TryStatement`      | `0`       | `try { ... } catch (e) { ... } finally { ... }`                                                                         |
| `ThrowStatement`    | `0`       | `throw new Error('message')`                                                                                            |
| `SwitchStatement`   | `0`       | `switch (status) { case 'a': ... }`                                                                                     |
| `LabeledStatement`  | `0`       | `label: { ... }`                                                                                                        |
| `BlockStatement`    | `0`       | Samodzielny blok kodu<br>`{ const x = 1 }`                                                                              |
| `BreakStatement`    | `0`       | `break`<br>`break label`                                                                                                |
| `ContinueStatement` | `0`       | `continue`<br>`continue label`                                                                                          |
| `EmptyStatement`    | `0`       | `;` - pusta instrukcja                                                                                                  |
| `WithStatement`     | `0`       | `with (obj) { ... }`                                                                                                    |
| `DebuggerStatement` | `0`       | `debugger`                                                                                                              |

---

## Przykłady konfiguracji

### Plik .vue

```js
import { BlankLine } from '@kgabryel/code-quality/eslint/plugins/vue-order/types/blank-line';
import { NodeType } from '@kgabryel/code-quality/eslint/plugins/vue-order/types/node-types';
import { isVueFile } from '@kgabryel/code-quality/eslint/plugins/vue-order/helpers';

const vue = {
  identifier: 'vue',
  recognizeFile: isVueFile,                                    // dopasowuje wszystkie pliki .vue
  registeredRecognizers: [
    NodeType.Import,
    NodeType.Ref,
    NodeType.ComposableCall,
    NodeType.Computed,
    NodeType.Function,                                         // występuje w disabledTypes, więc musi też być w registeredRecognizers
    NodeType.ArrowFunction,
  ],
  disabledTypes: [
    NodeType.ArrowFunction,                                    // arrow functions są zabronione, wymagane jest użycie słowa kluczowego function
  ],
  groups: [
    {
      name: 'import',
      comment: null,                                           // brak wymaganego komentarza
      blankLine: BlankLine.NO,                                 // import zawsze na początku pliku
      types: [
        { type: NodeType.Import, blankLine: BlankLine.NO },    // kolejne importy bez odstępów
      ],
    },
    {
      name: 'state',
      comment: 'state',
      blankLine: BlankLine.YES,
      types: [
        { type: NodeType.Ref, blankLine: BlankLine.ONCE },     // pusta linia przed pierwszym ref()
      ],
    },
    {
      name: 'composables',
      comment: 'composables',
      blankLine: BlankLine.YES,
      types: [{ type: NodeType.ComposableCall, blankLine: BlankLine.NO }],
    },
    {
      name: 'computed',
      comment: 'computed',
      blankLine: BlankLine.YES,
      types: [
        { type: NodeType.Computed, blankLine: BlankLine.ALL }, // pusta linia przed każdym computed
      ],
    },
    {
      name: 'actions',
      comment: 'actions',
      blankLine: BlankLine.YES,
      types: [{ type: NodeType.Function, blankLine: BlankLine.ALL }],
    },
  ],
};
```

### Composable (use\*.ts)

```js
import { BlankLine } from '@kgabryel/code-quality/eslint/plugins/vue-order/types/blank-line';
import { NodeType } from '@kgabryel/code-quality/eslint/plugins/vue-order/types/node-types';
import {
  and,
  getComposableBody,
  isInDirectory,
  isTsFile,
  matchesFile,
} from '@kgabryel/code-quality/eslint/plugins/vue-order/helpers';

const composable = {
  identifier: 'composableFile',
  recognizeFile: and(
    isTsFile,                                                            // tylko pliki .ts
    isInDirectory('composables'),                                        // w katalogu composables/
    matchesFile(/^use[A-Z]/),                                            // o nazwie zaczynającej się od use + wielka litera
  ),
  registeredRecognizers: [NodeType.Import, NodeType.Ref, NodeType.Function, NodeType.ArrowFunction],
  groups: [
    {
      name: 'import',
      blankLine: BlankLine.NO,
      types: [{ type: NodeType.Import, blankLine: BlankLine.NO }],
    },
    {
      name: 'composableFunction',
      comment: null,                                                     // brak komentarza, funkcja jest oczywistym elementem pliku
      blankLine: BlankLine.YES,
      types: [
        { type: NodeType.Function, blankLine: BlankLine.NO },            // export function useX() { ... }
      ],
    },
  ],
  subGroupsTriggers: [
    {
      nodeType: NodeType.Function,                                       // w przypadku napotkania Function (export function useX)...
      subGroup: 'composableBody',                                        // ...następuje sprawdzenie ciała zgodnie z subgrupą composableBody
      getBody: getComposableBody,                                        // helper wyciągający węzły z ciała
    },
  ],
  subGroups: {
    composableBody: {
      groups: [
        {
          name: 'state',
          comment: 'state',
          blankLine: BlankLine.YES,
          types: [
            { type: NodeType.Ref, blankLine: BlankLine.ONCE },           // pusta linia przed pierwszym ref()
          ],
        },
        {
          name: 'actions',
          comment: 'actions',
          blankLine: BlankLine.YES,
          types: [
            { type: NodeType.Function, blankLine: BlankLine.ALL },       // pusta linia przed każdą funkcją
            { type: NodeType.ArrowFunction, blankLine: BlankLine.ONCE }, // pusta linia przed pierwszą arrow function
          ],
        },
      ],
    },
  },
};
```
