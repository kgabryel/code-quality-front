# @kgabryel-dev/code-quality

Współdzielone konfiguracje [ESLint](https://eslint.org), [Prettier](https://prettier.io), 
[Stylelint](https://stylelint.io) i [TypeScript](https://www.typescriptlang.org). Z dedykowanym wsparciem dla 
ekosystemów [Vue 3](https://vuejs.org) i [Angular](https://angular.dev).

---

## Spis treści

- [Główne założenia](#główne-założenia)
- [Instalacja i konfiguracja](#instalacja-i-konfiguracja)
    - [Przebieg konfiguracji](#przebieg-konfiguracji)
    - [Opcje CLI](#opcje-cli)
    - [Instalowane zależności](#instalowane-zależności)
    - [Generowane skrypty pomocnicze (.sh)](#generowane-skrypty-pomocnicze-sh)
        - [Wariant lokalny (local)](#wariant-lokalny-local)
        - [Wariant kontenerowy (docker)](#wariant-kontenerowy-docker)
- [ESLint](#eslint)
    - [Konfiguracja](#konfiguracja)
    - [Builder](#builder)
    - [Dostosowanie](#dostosowanie)
        - [Reguły](#reguły)
        - [Overrides](#overrides)
    - [Plugin vue-order](#plugin-vue-order)
- [Prettier](#prettier)
    - [Dostosowanie](#dostosowanie-1)
        - [Opcje](#opcje)
        - [Overrides](#overrides-1)
- [Stylelint](#stylelint)
    - [Dostosowanie](#dostosowanie-2)
        - [Reguły](#reguły-1)
- [TypeScript](#typescript)
    - [Dostosowanie](#dostosowanie-3)
- [Reguły Vue](#reguły-vue)
    - [ESLint](#eslint-1)
    - [Prettier](#prettier-1)
    - [Stylelint](#stylelint-1)
    - [TypeScript](#typescript-1)
- [Reguły Angulara](#reguły-angulara)
    - [ESLint](#eslint-2)
    - [Prettier](#prettier-2)
    - [Stylelint](#stylelint-2)
    - [TypeScript](#typescript-2)
- [Reguły Base](#reguły-base)
    - [ESLint](#eslint-3)
    - [Prettier](#prettier-3)
    - [Stylelint](#stylelint-3)
    - [TypeScript](#typescript-3)

---

## Główne założenia

`@kgabryel-dev/code-quality` powstał z myślą o jednym standardzie jakości kodu w projektach TypeScript - zamiast
rozproszonych plików konfiguracyjnych, które trudno trzymać w synchronizacji, pakiet agreguje, unifikuje i automatyzuje
działanie czterech kluczowych narzędzi: ESLint, Prettier, Stylelint i TypeScript.

---

## Instalacja i konfiguracja

```bash
npm install --save-dev @kgabryel-dev/code-quality
npx code-quality
```

Skrypt prowadzi przez cały proces konfiguracji krok po kroku: od wyboru frameworka i instalacji zależności, przez
kopiowanie plików konfiguracyjnych, po opcjonalne generowanie skryptów pomocniczych w `package.json`.

### Przebieg konfiguracji

1. Wybór frameworka i środowiska projektu (`Vue`, `Angular` lub `Base` - czysty TypeScript). Determinuje zestaw
   instalowanych zależności, kształt plików konfiguracyjnych oraz specyfikę skryptów sprawdzania typów.

2. Wybór modułów (funkcji), czyli narzędzi, które trafią do projektu. Można dowolnie łączyć pozycje z listy:
   `editorconfig`, `tsconfig`, `eslint`, `prettier`, `stylelint`.

3. Ścieżka docelowa (`Base path`) - katalog, do którego mają trafić skopiowane konfiguracje (domyślnie katalog główny
   projektu, `.`).

4. Instalacja zależności - pytanie o automatyczne pobranie i instalację pakietów.

5. Tworzenie plików konfiguracyjnych - skrypt kopiuje gotowe, zoptymalizowane szablony konfiguracji (np.
   `eslint.config.js`, `tsconfig.json`, `prettier.config.js` wraz z `.prettierignore`) do projektu. Jeśli w katalogu
   docelowym istnieje już plik o tej samej nazwie, CLI zapyta o potwierdzenie nadpisania - nadpisywanie poszczególnych
   plików można też pominąć.

6. Decyzja o generowaniu skryptów - jeśli wybrano przynajmniej jeden moduł weryfikujący kod (`tsconfig`, `eslint`,
   `prettier` lub `stylelint`), skrypt zapyta o wygenerowanie pomocniczych skryptów powłoki (`.sh`). Odpowiedź przecząca
   kończy działanie skryptu w tym miejscu.

7. Środowisko skryptów - wybór miejsca uruchamiania generowanych skryptów: `local` (bezpośrednio na maszynie lokalnej)
   lub `docker` (polecenia zostaną automatycznie opakowane w instrukcję `docker exec`).

8. Tworzenie skryptów pomocniczych - generowanie plików wywołujących polecenia zainstalowanych narzędzi. Podobnie jak
   przy plikach konfiguracyjnych, istniejący już skrypt o tej samej nazwie wymaga potwierdzenia nadpisania, a
   poszczególne pliki można pominąć.

### Opcje CLI

Opcje pozwalają pominąć interaktywne pytania i zautomatyzować konfigurację.

**Framework**

| Opcja       | Opis                      |
|-------------|---------------------------|
| `--vue`     | Wybiera framework Vue     |
| `--angular` | Wybiera framework Angular |

**Instalacja zależności**

| Opcja          | Opis                             |
|----------------|----------------------------------|
| `--install`    | Instaluje zależności bez pytania |
| `--no-install` | Pomija instalację                |

**Skrypty**

| Opcja         | Opis                                  |
|---------------|---------------------------------------|
| `--docker`    | Generuje skrypty w wariancie Docker   |
| `--no-docker` | Generuje skrypty w wariancie lokalnym |

Opcje można łączyć dowolnie:

```bash
npx code-quality --vue --no-install --docker
```

### Instalowane zależności

Skrypt instaluje tylko zależności potrzebne dla wybranych modułów i frameworka.

| Moduł            | Zależności                                                                                                                                                        |
|------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| ESLint (wspólne) | `eslint` `typescript-eslint` `@eslint/js` `eslint-config-prettier` `eslint-plugin-perfectionist` `eslint-plugin-sonarjs` `eslint-plugin-unused-imports` `globals` |
| ESLint (Vue)     | `eslint-plugin-vue` `eslint-plugin-vuetify` `postcss-html`                                                                                                        |
| ESLint (Angular) | `angular-eslint` `eslint-plugin-no-relative-import-paths`                                                                                                         |
| Prettier         | `prettier`                                                                                                                                                        |
| Stylelint        | `stylelint` `stylelint-config-standard-scss` `stylelint-order`                                                                                                    |
| TypeScript       | `typescript`                                                                                                                                                      |

### Generowane skrypty pomocnicze (.sh)

W zależności od wybranych modułów oraz środowiska skrypt wygeneruje w katalogu bazowym pliki powłoki `.sh` do
automatycznego sprawdzania i naprawiania kodu.

#### Wariant lokalny (local)

Generuje czyste polecenia uruchamiane przez npx:

| Skrypt             | Moduł                | Polecenie                                            |
|--------------------|----------------------|------------------------------------------------------|
| `lint.sh`          | `eslint`             | `npx eslint src`                                     |
| `lint-fix.sh`      | `eslint`             | `npx eslint src --fix`                               |
| `prettier.sh`      | `prettier`           | `npx prettier --write .`                             |
| `stylelint.sh`     | `stylelint`          | `npx stylelint "src/**/*.vue" "src/**/*.scss"`       |
| `stylelint-fix.sh` | `stylelint`          | `npx stylelint "src/**/*.vue" "src/**/*.scss" --fix` |
| `typecheck.sh`     | `tsconfig` (Vue)     | `npx vue-tsc --noEmit`                               |
| `typecheck.sh`     | `tsconfig` (Angular) | `npx tsc --noEmit`                                   |

#### Wariant kontenerowy (docker)

Jeśli wybrano środowisko Docker i podano nazwę kontenera (np. `my-app-container`), zawartość każdego z powyższych
skryptów zostaje automatycznie opakowana w komendę proxy:

```shell
# Przykład zawartości pliku lint.sh w wariancie Docker
docker exec -it my-app-container sh -c 'npx eslint src'
```

---

## ESLint

Konfiguracja ESLint opiera się na wzorcu buildera - `createConfig()` zwraca instancję buildera właściwego dla danego
frameworka, a jego metody można ze sobą łączyć; `get()` kończy budowanie i zwraca gotową konfigurację.

### Konfiguracja

Skrypt CLI kopiuje do projektu dwa pliki: `eslint.config.js` z konfiguracją dla wybranego typu projektu oraz
`tsconfig.eslint.json`, rozszerzający główny `tsconfig.json` o pliki konfiguracyjne z katalogu głównego:

**Vue:**

```json
// tsconfig.eslint.json
{
  "extends": "./tsconfig.json",
  "include": ["src/**/*.ts", "src/**/*.vue", "env.d.ts", "*.ts", "*.js"]
}
```

```js
// eslint.config.js
import { createConfig, vueRules, vueExtends, vuePlugins } from '@kgabryel-dev/code-quality/eslint/VueConfigBuilder';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import { vueOrderConfig } from '@kgabryel-dev/code-quality/eslint/plugins/vue-order/example.config';

const config = createConfig()
  .useTsConfig('./tsconfig.eslint.json')  // wczytywanie plików i reguł ignorowania na podstawie tsconfig, błąd przerywa proces
  .setRules(vueRules)                     // zestaw reguł dla Vue
  .setExtends(vueExtends)                 // zestawy reguł (presety) dla Vue (eslint-plugin-vue, vuetify itp.)
  .setPlugins(vuePlugins(vueOrderConfig)) // przekazanie konfiguracji vueOrderConfig do pluginu vue-order
  .setLanguageOptions({
    globals: {
      ...globals.browser,
    },
    parserOptions: {
      parser: tseslint.parser,
      project: ['./tsconfig.eslint.json'],
      tsconfigRootDir: import.meta.dirname,
      extraFileExtensions: ['.vue'],
    },
  });

export default config.get();
```

**Angular:**

```json
// tsconfig.eslint.json
{
  "extends": "./tsconfig.json",
  "include": ["src/**/*.ts", "src/**/*.js", "*.ts", "*.js"]
}
```

```js
// eslint.config.js
import tseslint from 'typescript-eslint';

import {
  createConfig,
  angularRules,
  angularExtends,
  angularPlugins,
  templateConfig,                        // gotowy blok reguł dla plików **/*.html
} from '@kgabryel-dev/code-quality/eslint/AngularConfigBuilder';
import globals from 'globals';

const config = createConfig()
  .useTsConfig('./tsconfig.eslint.json') // wczytywanie plików i reguł ignorowania na podstawie tsconfig, błąd przerywa proces
  .setRules(angularRules)                // zestaw reguł dla Angulara
  .setExtends(angularExtends)            // zestawy reguł (presety) dla Angulara (angular-eslint itp.)
  .setPlugins(angularPlugins)            // pluginy dla Angulara (perfectionist, sonarjs, unused-imports)
  .setLanguageOptions({
    globals: { ...globals.browser },
    parserOptions: {
      project: ['./tsconfig.eslint.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  })
  .setPrefixes(['app'])                  // dozwolone prefiksy dla selektorów komponentów i dyrektyw
  .addOverride(templateConfig);          // reguły dla **/*.html - zalecane, niewymagane

export default tseslint.config(
    ...config.get(),
);

```

Pominięcie `addOverride(templateConfig)` sprawi, że pliki `**/*.html` nie będą sprawdzane przez ESLint.

**Base:**

```json
// tsconfig.eslint.json
{
  "extends": "./tsconfig.json",
  "include": ["src/**/*.ts", "src/**/*.js", "*.ts", "*.js"]
}
```

```js
// eslint.config.js
import { createConfig, baseRules, baseExtends, basePlugins } from '@kgabryel-dev/code-quality/eslint/BaseConfigBuilder';
import globals from 'globals';

const config = createConfig()
  .useTsConfig('./tsconfig.eslint.json') // wczytywanie plików i reguł ignorowania na podstawie tsconfig, błąd przerywa proces
  .setRules(baseRules)                   // zestaw reguł dla TypeScript
  .setExtends(baseExtends)               // bazowe zestawy reguł (eslint, typescript-eslint, prettier)
  .setPlugins(basePlugins)               // pluginy (perfectionist, sonarjs, unused-imports)
  .setLanguageOptions({
    globals: { ...globals.browser },
    parserOptions: {
      project: ['./tsconfig.eslint.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  });

export default config.get();
```

Pełny opis reguł jest w sekcjach [Reguły Vue](#eslint-1), [Reguły Angulara](#eslint-2) i [Reguły Base](#eslint-3).

### Builder

| Metoda                        | Opis                                                                         |
|-------------------------------|------------------------------------------------------------------------------|
| `addOverride(config)`         | Dodaje dodatkowy blok konfiguracyjny dla wybranego zestawu plików            |
| `removeRule(rule)`            | Usuwa regułę z zestawu                                                       |
| `setExtends(config)`          | Ustawia tablicę presetów                                                     |
| `setIgnoresFiles(ignores)`    | Ustawia pliki i katalogi ignorowane przez ESLint                             |
| `setLanguageOptions(options)` | Ustawia opcje języka (`globals`, `parserOptions`)                            |
| `setPlugins(plugins)`         | Ustawia obiekt z pluginami                                                   |
| `setRule(rule, config)`       | Dodaje lub nadpisuje pojedynczą regułę bez zmiany pozostałych                |
| `setRules(rules)`             | Zastępuje cały zestaw reguł                                                  |
| `setWatchedFiles(files)`      | Ustawia pliki sprawdzane przez ESLint                                        |
| `useTsConfig(configPath)`     | Ustawia sprawdzane i ignorowane pliki i katalogi na podstawie pliku tsconfig |
| `get()`                       | Zwraca finalną tablicę obiektów flat config                                  |

**`AngularConfigBuilder`** - dodatkowa metoda:

| Metoda                  | Opis                                                                                                                                       |
|-------------------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| `setPrefixes(prefixes)` | Ustawia dozwolone prefiksy selektorów komponentów (`@angular-eslint/component-selector`) i dyrektyw (`@angular-eslint/directive-selector`) |

### Dostosowanie

#### Reguły

**Dodawanie i nadpisywanie** - `setRule` zostawia pozostałe reguły bez zmian:

```js
createConfig()
  .setRules(vueRules)
  .setRule('max-lines', ['warn', { max: 300 }]) // nadpisanie
  .setRule('no-alert', 'error');                // nowa reguła
```

**Usuwanie:**

```js
createConfig()
  .setRules(vueRules)
  .removeRule('no-console');                    // usuwa regułę no-console
```

#### Overrides

`addOverride` dodaje osobny blok konfiguracyjny dla wybranego zestawu plików - działa dokładnie tak samo jak
`templateConfig` w konfiguracji Angulara:

```js
createConfig()
  .setRules(vueRules)
  // ...
  .addOverride({
    files: ['**/*.spec.ts'],
    rules: {
      'max-lines': 'off',
      'no-console': 'off',
    },
  });
```

### Plugin vue-order

Plugin `vue-order` pilnuje kolejności bloków kodu w plikach `.vue` (`<script setup>`) i `.ts` - composables, store
Pinia, serwisy. Konfigurację przekazuje się przez `vuePlugins`:

```js
import { vueOrderConfig } from '@kgabryel-dev/code-quality/eslint/plugins/vue-order/example.config';

.setPlugins(vuePlugins(vueOrderConfig))
```

Bez argumentów `vuePlugins()` korzysta z pustej konfiguracji, co wyłącza plugin `vue-order` i automatycznie usuwa
powiązane z nim reguły. Pełna dokumentacja: [vue-order/README.md](./eslint/plugins/vue-order/README.md).

---

## Prettier

Skrypt CLI kopiuje do projektu dwa pliki: `prettier.config.js` z importem odpowiedniej konfiguracji oraz
`.prettierignore` z domyślną listą wykluczeń.

```js
// prettier.config.js
import vueConfig from '@kgabryel-dev/code-quality/prettier/vue';

export default {
  ...vueConfig,
};
```

Importowana konfiguracja zawiera gotowy zestaw opcji Prettiera. Warianty `base` i `angular` konfiguruje się tak samo

- wystarczy zmienić ścieżkę importu na `@kgabryel-dev/code-quality/prettier/base` lub
  `@kgabryel-dev/code-quality/prettier/angular`. Pełny opis reguł oraz zawartość `.prettierignore` są w
  sekcjach [Reguły Vue](#prettier-1), [Reguły Angulara](#prettier-2) i [Reguły Base](#prettier-3).

### Dostosowanie

#### Opcje

**Dodawanie i nadpisywanie** - klucz podany po rozwinięciu ma pierwszeństwo nad oryginałem:

```js
import vueConfig from '@kgabryel-dev/code-quality/prettier/vue';

export default {
  ...vueConfig,
  printWidth: 120,               // nadpisanie
  vueIndentScriptAndStyle: true, // nowa reguła
};
```

**Usuwanie:**

```js
import baseConfig from '@kgabryel-dev/code-quality/prettier/base';

const config = { ...baseConfig }; // usunięcie z oryginału (delete) zmodyfikowałoby importowany moduł
delete config.printWidth;

export default config;
```

#### Overrides

**Dodawanie i nadpisywanie** - `overrides` to tablica, więc rozszerza się ją przez spread, zamiast zastępować w całości:

```js
import vueConfig from '@kgabryel-dev/code-quality/prettier/vue';

export default {
  ...vueConfig,
  overrides: [
    ...vueConfig.overrides,
    {
      files: '*.json',
      options: {
        printWidth: 80,
        tabWidth: 2,
      },
    },
  ],
};
```

Prettier stosuje nadpisania `overrides` po kolei. Ostatni pasujący wzorzec nadpisuje poprzednie. Dopisanie reguły na
końcu gwarantuje jej priorytet nad wpisami bazowymi. Istniejące nadpisanie modyfikuje się tak samo, wskazując ten sam
wzorzec `files`.

---

## Stylelint

Skrypt CLI kopiuje do projektu plik `stylelint.config.js`, rozszerzający odpowiednią konfigurację.

```js
// stylelint.config.js
export default {
  extends: ['@kgabryel-dev/code-quality/stylelint/vue'],
};
```

Warianty `base` i `angular` konfiguruje się tak samo - wystarczy zmienić ścieżkę w tablicy `extends` na
`@kgabryel-dev/code-quality/stylelint/base` lub `@kgabryel-dev/code-quality/stylelint/angular`. Pełny opis reguł jest w
sekcjach [Reguły Vue](#stylelint-1), [Reguły Angulara](#stylelint-2) i [Reguły Base](#stylelint-3).

### Dostosowanie

#### Reguły

**Dodawanie i nadpisywanie** - klucz w `rules` podany po `extends` ma pierwszeństwo:

```js
export default {
  extends: ['@kgabryel-dev/code-quality/stylelint/vue'],
  rules: {
    'max-nesting-depth': 5,       // nadpisanie istniejącej
    'color-no-invalid-hex': true, // dodanie nowej
  },
};
```

**Usuwanie** - w Stylelint do wyłączania reguły służy oficjalnie wartość `null`:

```js
export default {
  extends: ['@kgabryel-dev/code-quality/stylelint/vue'],
  rules: {
    'block-no-empty': null,
  },
};
```

---

## TypeScript

Skrypt CLI kopiuje do projektu plik `tsconfig.json`, rozszerzający odpowiednią konfigurację.

**Vue:**

```json
// tsconfig.json
{
  "extends": "@kgabryel-dev/code-quality/tsconfig/vue.json",
  "compilerOptions": {
    "baseUrl": ".",                                        // katalog główny projektu jako baza ścieżek, wymagane przy używaniu paths
    "paths": {
      "@/*": ["./src/*"]                                  // tylko dla TypeScript i IDE, wymaga też aliasu w vite.config.ts
    }
  },
  "include": ["src/**/*.ts", "src/**/*.vue", "env.d.ts"], // pliki uwzględniane przy kompilacji
  "exclude": ["node_modules", "dist"]                     // katalogi pomijane przy kompilacji
}
```

**Angular:**

```json
// tsconfig.json
{
  "extends": "@kgabryel-dev/code-quality/tsconfig/angular.json",
  "compilerOptions": {
    "baseUrl": ".",                               // katalog główny projektu jako baza ścieżek, wymagane przy używaniu paths
    "paths": {
      "@/*": ["./src/*"]                          // alias @/... → src/...
    }
  },
  "include": ["src/**/*.ts"],                     // pliki uwzględniane przy kompilacji
  "exclude": ["node_modules", "dist", ".angular"] // katalogi pomijane przy kompilacji
}
```

**Base:**

```json
// tsconfig.json
{
  "extends": "@kgabryel-dev/code-quality/tsconfig/base.json",
  "compilerOptions": {
    "baseUrl": "."                    // katalog główny projektu jako baza ścieżek
  },
  "include": ["src/**/*.ts"],         // pliki uwzględniane przy kompilacji
  "exclude": ["node_modules", "dist"] // katalogi pomijane przy kompilacji
}
```

Pełny opis opcji kompilatora jest w sekcjach [Reguły Vue](#typescript-1), [Reguły Angulara](#typescript-2)
i [Reguły Base](#typescript-3).

### Dostosowanie

**Dodawanie i nadpisywanie** - opcje w `compilerOptions` projektu mają pierwszeństwo przed tymi z `extends`:

```json
{
  "extends": "@kgabryel-dev/code-quality/tsconfig/vue.json",
  "compilerOptions": {
    "baseUrl": ".",
    "target": "ES2020",   // nadpisanie
    "paths": {
      "@/*": ["./src/*"]  // dodanie
    }
  }
}
```

**Wyłączanie flag** - TypeScript nie pozwala usunąć opcji odziedziczonej po `extends`, można ją jedynie nadpisać:

```json
{
  "extends": "@kgabryel-dev/code-quality/tsconfig/base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "noUnusedLocals": false,
    "noUncheckedIndexedAccess": false
  }
}
```

---

## Reguły Vue

### ESLint

| Preset                                                                                         |
|------------------------------------------------------------------------------------------------|
| [`eslint/recommended`](https://eslint.org/docs/latest/rules/)                                  |
| [`typescript-eslint/recommended`](https://typescript-eslint.io/users/configs/#recommended)     |
| [`typescript-eslint/stylistic`](https://typescript-eslint.io/users/configs/#stylistic)         |
| [`eslint-config-prettier`](https://github.com/prettier/eslint-config-prettier)                 |
| [`eslint-plugin-vue/flat/recommended`](https://eslint.vuejs.org/)                              |
| [`eslint-plugin-vuetify/flat/base`](https://github.com/vuetifyjs/eslint-plugin-vuetify)        |
| [`eslint-plugin-vuetify/flat/recommended`](https://github.com/vuetifyjs/eslint-plugin-vuetify) |

**Aktywne**

| Reguła                                             | Opis                                                                                                    |
|----------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| `@typescript-eslint/ban-ts-comment`                | Zabrania komentarzy `@ts-ignore`, `@ts-nocheck` i podobnych                                             |
| `@typescript-eslint/consistent-type-imports`       | Wymaga `import type` dla importów zawierających wyłącznie typy                                          |
| `@typescript-eslint/explicit-function-return-type` | Jawny typ zwracany funkcji, bez wnioskowania                                                            |
| `@typescript-eslint/no-deprecated`                 | Zgłasza błąd przy API oznaczonym jako `@deprecated`                                                     |
| `@typescript-eslint/no-duplicate-enum-values`      | Zabrania definiowania tych samych wartości dla różnych kluczy wewnątrz jednego enuma                    |
| `@typescript-eslint/no-empty-function`             | Zabrania pustych funkcji bez ciała                                                                      |
| `@typescript-eslint/no-empty-object-type`          | Zabrania tworzenia pustych interfejsów oraz typów obiektowych (zapobiega niebezpiecznemu używaniu `{}`) |
| `@typescript-eslint/no-explicit-any`               | Zabrania użycia `any`                                                                                   |
| `@typescript-eslint/no-floating-promises`          | Każdy `Promise` musi być obsłużony (`await`, `.catch`, `void`)                                          |
| `@typescript-eslint/no-unused-vars`                | Błąd przy nieużywanych zmiennych; zmienne z prefiksem `_` są wykluczone                                 |
| `@typescript-eslint/no-non-null-assertion`         | Zabrania używania operatora non-null assertion (`!`), który omija system typów podobnie jak `any`       |
| `comma-dangle`                                     | Wymaga przecinka po ostatnim elemencie w wieloliniowych strukturach                                     |
| `eol-last`                                         | Wymaga pustej linii na końcu każdego pliku                                                              |
| `max-lines`                                        | Maksymalnie 200 linii na plik (bez pustych i komentarzy)                                                |
| `no-console`                                       | Zabrania `console.log` i `console.info`; dozwolone tylko `warn` i `error`                               |
| `padding-line-between-statements`                  | Pusta linia: po bloku importów, przed `export`, przed `return`, przed blokiem po zmiennej               |
| `perfectionist/sort-enums`                         | Sortuje wartości enumów rosnąco                                                                         |
| `perfectionist/sort-exports`                       | Sortuje eksporty z pliku rosnąco                                                                        |
| `perfectionist/sort-imports`                       | Sortuje bloki importów rosnąco                                                                          |
| `perfectionist/sort-objects`                       | Sortuje klucze obiektów literałowych rosnąco                                                            |
| `quotes`                                           | Wymaga pojedynczych cudzysłowów                                                                         |
| `semi`                                             | Wymaga średników na końcu instrukcji                                                                    |
| `sonarjs/cognitive-complexity`                     | Maksymalna złożoność kognitywna funkcji: 10                                                             |
| `spaced-comment`                                   | Wymaga spacji po `//` i `/*` w komentarzach                                                             |
| `unused-imports/no-unused-imports`                 | Błąd przy nieużywanych importach                                                                        |
| `@typescript-eslint/typedef`                       | Jawne adnotacje typów dla parametrów arrow function, zmiennych, właściwości i parametrów metod          |
| `vue-order/vue-order`                              | Wymusza skonfigurowaną kolejność bloków w `<script setup>` i plikach `.ts`                              |
| `vue/block-order`                                  | Kolejność bloków SFC: `<script>` → `<template>` → `<style>`                                             |
| `vue/component-name-in-template-casing`            | Nazwy komponentów w szablonach muszą być w PascalCase                                                   |
| `vue/no-unused-vars`                               | Błąd przy nieużywanych zmiennych w dyrektywach `v-for` i `v-slot`                                       |
| `vue/no-v-html`                                    | Zabrania `v-html` (ryzyko XSS)                                                                          |
| `vue/order-in-components`                          | Wymagana kolejność opcji w komponentach Options API                                                     |
| `vue/padding-line-between-blocks`                  | Wymaga pustej linii między blokami `<script>`, `<template>`, `<style>`                                  |

**Wyłączone**

| Reguła                                        | Opis                                                                                      |
|-----------------------------------------------|-------------------------------------------------------------------------------------------|
| `@typescript-eslint/no-inferrable-types`      | Jawne adnotacje typów przy inferowanych wartościach dozwolone                             |
| `vue/html-self-closing`                       | Styl zamykania pustych elementów HTML (self-closing), wyłączona z powodu Prettiera        |
| `vue/multiline-html-element-content-newline`  | Podział zawartości wieloliniowych elementów na osobne linie, wyłączona z powodu Prettiera |
| `vue/singleline-html-element-content-newline` | Podział zawartości jednoliniowych elementów na osobne linie, wyłączona z powodu Prettiera |
### Prettier

| Opcja                        | Wartość       | Opis                                                                     |
|------------------------------|---------------|--------------------------------------------------------------------------|
| `arrowParens`                | `'always'`    | Nawiasy wokół parametru arrow function zawsze: `(x) => x`                |
| `bracketSameLine`            | `false`       | Zamykający `>` znacznika JSX/HTML w nowej linii                          |
| `bracketSpacing`             | `true`        | Spacje wewnątrz nawiasów klamrowych: `{ foo: bar }`                      |
| `embeddedLanguageFormatting` | `'auto'`      | Automatyczne formatowanie języków osadzonych (SQL, CSS w JS itp.)        |
| `endOfLine`                  | `'lf'`        | Końce linii w stylu Unix (LF)                                            |
| `htmlWhitespaceSensitivity`  | `'ignore'`    | Białe znaki w HTML ignorowane przy formatowaniu                          |
| `jsxSingleQuote`             | `false`       | Podwójne cudzysłowy w atrybutach JSX                                     |
| `printWidth`                 | `120`         | Maksymalna długość linii                                                 |
| `proseWrap`                  | `'preserve'`  | Zawijanie tekstu w Markdown pozostawione bez zmian                       |
| `quoteProps`                 | `'as-needed'` | Cudzysłowy przy kluczach obiektów tylko gdy konieczne                    |
| `semi`                       | `true`        | Średniki na końcu instrukcji                                             |
| `singleAttributePerLine`     | `true`        | Każdy atrybut HTML/JSX w osobnej linii                                   |
| `singleQuote`                | `true`        | Pojedyncze cudzysłowy w JS/TS                                            |
| `tabWidth`                   | `2`           | Wcięcia o szerokości 2 spacji                                            |
| `trailingComma`              | `'all'`       | Przecinek po ostatnim elemencie we wszystkich wieloliniowych strukturach |
| `useTabs`                    | `false`       | Spacje zamiast tabulatorów                                               |

| Ignorowane pliki  |
|-------------------|
| node_modules      |
| dist              |
| package-lock.json |

### Stylelint

| Reguła                                      | Wartość         | Opis                                                                 |
|---------------------------------------------|-----------------|----------------------------------------------------------------------|
| `stylelint-config-standard-scss`            | preset          | Standardowe reguły SCSS (nomenklatura, formatowanie, kompatybilność) |
| `block-no-empty`                            | `true`          | Zabrania pustych bloków CSS/SCSS                                     |
| `color-hex-length`                          | `'short'`       | Wymaga skróconej formy hex: `#fff` zamiast `#ffffff`                 |
| `declaration-block-no-duplicate-properties` | `true`          | Zabrania powtarzania tej samej właściwości w jednym bloku            |
| `max-nesting-depth`                         | `3`             | Maksymalne zagłębienie selektorów: 3 poziomy                         |
| `order/properties-alphabetical-order`       | `true`          | Właściwości CSS/SCSS muszą być posortowane alfabetycznie             |
| `scss/at-mixin-pattern`                     | `^[a-z0-9\-]+$` | Nazwy mixinów: tylko małe litery, cyfry i myślniki                   |
| `scss/dollar-variable-pattern`              | `^[a-z0-9\-]+$` | Zmienne SCSS: tylko małe litery, cyfry i myślniki                    |
| `scss/load-no-partial-leading-underscore`   | `true`          | Zabrania podkreślnika w ścieżkach `@use` i `@forward`                |
| `scss/percent-placeholder-pattern`          | `^[a-z0-9\-]+$` | Placeholder selektory (`%name`): tylko małe litery, cyfry i myślniki |
| `selector-class-pattern`                    | `null`          | Wyłączone, konwencja nazewnictwa klas CSS nie jest wymuszana         |
| `selector-pseudo-class-no-unknown`          | `true`          | Zezwala na `:deep`, `:global`, `:slotted` (pseudoklasy Vue)          |
| `selector-pseudo-element-no-unknown`        | `true`          | Zezwala na `::deep`, `::global`, `::slotted` (pseudoklasy Vue)       |

### TypeScript

| Opcja                                | Wartość                             | Opis                                                                      |
|--------------------------------------|-------------------------------------|---------------------------------------------------------------------------|
| `target`                             | `"ES2022"`                          | Cel kompilacji, generowany kod zgodny z ES2022                            |
| `moduleResolution`                   | `"bundler"`                         | Rozwiązywanie modułów przez bundler (Vite, webpack)                       |
| `alwaysStrict`                       | `true`                              | Tryb strict ECMAScript aktywny w każdym pliku                             |
| `strict`                             | `true`                              | Włącza wszystkie flagi strict TypeScript                                  |
| `declaration`                        | `false`                             | Nie generuje plików deklaracji `.d.ts`                                    |
| `esModuleInterop`                    | `true`                              | Interoperacyjność importów CommonJS i ESM                                 |
| `exactOptionalPropertyTypes`         | `true`                              | Właściwości opcjonalne (`?`) nie mogą być jawnie ustawione na `undefined` |
| `forceConsistentCasingInFileNames`   | `true`                              | Spójna wielkość liter w importowanych nazwach plików                      |
| `noFallthroughCasesInSwitch`         | `true`                              | Błąd przy brakującym `break` lub `return` w `switch`                      |
| `noImplicitAny`                      | `true`                              | Zgłasza błąd, gdy typ niejawnie przyjmuje wartość `any`                   |
| `noImplicitReturns`                  | `true`                              | Funkcja musi zwracać wartość we wszystkich ścieżkach kodu                 |
| `sourceMap`                          | `true`                              | Generuje pliki `.map` dla debugowania                                     |
| `noImplicitOverride`                 | `true`                              | Nadpisane metody muszą być oznaczone słowem `override`                    |
| `noUnusedLocals`                     | `true`                              | Błąd przy nieużywanych zmiennych lokalnych                                |
| `noUncheckedIndexedAccess`           | `true`                              | Dostęp przez indeks (`arr[i]`) może zwrócić `undefined`                   |
| `noPropertyAccessFromIndexSignature` | `true`                              | Właściwości z index signature wymagają notacji nawiasowej                 |
| `module`                             | `"ESNext"`                          | Format modułów ESNext                                                     |
| `lib`                                | `["ES2022", "DOM", "DOM.Iterable"]` | Dostępne biblioteki typów, ES2022 + DOM                                   |
| `allowSyntheticDefaultImports`       | `true`                              | Domyślne importy z modułów bez `export default`                           |
| `jsx`                                | `"preserve"`                        | Zachowuje JSX bez transpilacji (Vue obsługuje go własnym kompilatorem)    |
| `isolatedModules`                    | `true`                              | Każdy plik traktowany niezależnie (wymagane przez Vite/esbuild)           |
| `skipLibCheck`                       | `true`                              | Pomija sprawdzanie typów w plikach `.d.ts`                                |
| `useDefineForClassFields`            | `true`                              | Pola klasy definiowane przez `Object.defineProperty`                      |

---

## Reguły Angulara

### ESLint

Reguły dla plików `.ts`:

| Preset                                                                                     |
|--------------------------------------------------------------------------------------------|
| [`eslint/recommended`](https://eslint.org/docs/latest/rules/)                              |
| [`typescript-eslint/recommended`](https://typescript-eslint.io/users/configs/#recommended) |
| [`typescript-eslint/stylistic`](https://typescript-eslint.io/users/configs/#stylistic)     |
| [`eslint-config-prettier`](https://github.com/prettier/eslint-config-prettier)             |
| [`angular-eslint/tsRecommended`](https://github.com/angular-eslint/angular-eslint)         |

**Aktywne**

| Reguła                                              | Opis                                                                                                                             |
|-----------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| `@typescript-eslint/ban-ts-comment`                 | Zabrania komentarzy `@ts-ignore`, `@ts-nocheck` i podobnych                                                                      |
| `@typescript-eslint/consistent-type-imports`        | Wymaga `import type` dla importów zawierających wyłącznie typy                                                                   |
| `@typescript-eslint/explicit-function-return-type`  | Jawny typ zwracany funkcji, bez wnioskowania                                                                                     |
| `@typescript-eslint/no-deprecated`                  | Zgłasza błąd przy API oznaczonym jako `@deprecated`                                                                              |
| `@typescript-eslint/no-duplicate-enum-values`       | Zabrania definiowania tych samych wartości dla różnych kluczy wewnątrz jednego enuma                                             |
| `@typescript-eslint/no-empty-function`              | Zabrania pustych funkcji bez ciała                                                                                               |
| `@typescript-eslint/no-empty-object-type`           | Zabrania tworzenia pustych interfejsów oraz typów obiektowych (zapobiega niebezpiecznemu używaniu `{}`)                          |
| `@typescript-eslint/no-explicit-any`                | Zabrania użycia `any`                                                                                                            |
| `@typescript-eslint/no-floating-promises`           | Każdy `Promise` musi być obsłużony (`await`, `.catch`, `void`)                                                                   |
| `@typescript-eslint/no-non-null-assertion`          | Zabrania używania operatora non-null assertion (`!`), który omija system typów podobnie jak `any`                                |
| `@typescript-eslint/no-unused-vars`                 | Błąd przy nieużywanych zmiennych; zmienne z prefiksem `_` są wykluczone                                                          |
| `comma-dangle`                                      | Wymaga przecinka po ostatnim elemencie w wieloliniowych strukturach                                                              |
| `eol-last`                                          | Wymaga pustej linii na końcu każdego pliku                                                                                       |
| `max-lines`                                         | Maksymalnie 200 linii na plik (bez pustych i komentarzy)                                                                         |
| `no-console`                                        | Zabrania `console.log` i `console.info`; dozwolone tylko `warn` i `error`                                                        |
| `padding-line-between-statements`                   | Pusta linia: po bloku importów, przed `export`, przed `return`, przed blokiem po zmiennej                                        |
| `perfectionist/sort-enums`                          | Sortuje wartości enumów rosnąco                                                                                                  |
| `perfectionist/sort-exports`                        | Sortuje eksporty z pliku rosnąco                                                                                                 |
| `perfectionist/sort-imports`                        | Sortuje bloki importów rosnąco                                                                                                   |
| `perfectionist/sort-objects`                        | Sortuje klucze obiektów literałowych rosnąco                                                                                     |
| `quotes`                                            | Wymaga pojedynczych cudzysłowów                                                                                                  |
| `semi`                                              | Wymaga średników na końcu instrukcji                                                                                             |
| `sonarjs/cognitive-complexity`                      | Maksymalna złożoność kognitywna funkcji: 10                                                                                      |
| `spaced-comment`                                    | Wymaga spacji po `//` i `/*` w komentarzach                                                                                      |
| `unused-imports/no-unused-imports`                  | Błąd przy nieużywanych importach                                                                                                 |
| `@angular-eslint/component-selector`                | Komponenty (elementy) muszą mieć prefiks `app` i styl kebab-case                                                                 |
| `@angular-eslint/directive-selector`                | Dyrektywy atrybutowe muszą mieć prefiks `app` i styl camelCase                                                                   |
| `@angular-eslint/no-empty-lifecycle-method`         | Zabrania pustych metod lifecycle Angulara                                                                                        |
| `@angular-eslint/use-lifecycle-interface`           | Wymaga implementacji interfejsów lifecycle (`OnInit`, `OnDestroy` itp.)                                                          |
| `@typescript-eslint/explicit-member-accessibility`  | Jawny modyfikator dostępu (`public`, `private`, `protected`) dla każdego członka klasy                                           |
| `@typescript-eslint/member-ordering`                | Kolejność w klasie: pola statyczne → z dekoratorem → instancji → konstruktor → metody                                            |
| `@typescript-eslint/typedef`                        | Jawne typy wyłącznie dla parametrów arrow function (pozostałe adnotacje wyłączone)                                               |
| `sonarjs/no-duplicate-string`                       | Błąd przy zduplikowanych literałach tekstowych w kodzie                                                                          |
| `no-relative-import-paths/no-relative-import-paths` | Zabrania importów względnych spoza bieżącego katalogu (`../`), wymaga aliasu `@/` (`@/*` → `src/*`); importy z `./` są dozwolone |
**Wyłączone**

| Reguła                                   | Opis                                                          |
|------------------------------------------|---------------------------------------------------------------|
| `@typescript-eslint/no-inferrable-types` | Jawne adnotacje typów przy inferowanych wartościach dozwolone |
| `@angular-eslint/prefer-inject`          | `inject()` i constructor injection oba dozwolone              |

Reguły dla plików `**/*.html` (przez `templateConfig`):

| Preset                                                                                     |
|--------------------------------------------------------------------------------------------|
| [`angular-eslint/templateRecommended`](https://github.com/angular-eslint/angular-eslint)   |
| [`angular-eslint/templateAccessibility`](https://github.com/angular-eslint/angular-eslint) |

**Aktywne**

| Reguła                                           | Opis                                                                     |
|--------------------------------------------------|--------------------------------------------------------------------------|
| `@angular-eslint/template/cyclomatic-complexity` | Maksymalna złożoność cyklomatyczna szablonu: 10                          |
| `@angular-eslint/template/eqeqeq`                | Wymaga `===` zamiast `==` w wyrażeniach szablonu                         |
| `@angular-eslint/template/no-any`                | Zabrania rzutowania `$any()` w szablonach                                |
| `@angular-eslint/template/no-negated-async`      | Zapobiega błędnej negacji obiektów Observable przed użyciem `async` pipe |

**Wyłączone**

| Reguła                                                  | Opis                                                     |
|---------------------------------------------------------|----------------------------------------------------------|
| `@angular-eslint/template/click-events-have-key-events` | Klawiaturowe odpowiedniki kliknięć nie są wymagane       |
| `@angular-eslint/template/interactive-supports-focus`   | Fokus na interaktywnych elementach nie jest wymagany     |
| `@angular-eslint/template/no-inline-styles`             | Style inline są dozwolone                                |
| `@typescript-eslint/adjacent-overload-signatures`       | Reguła TypeScript, nie ma zastosowania w szablonach HTML |
| `@typescript-eslint/ban-ts-comment`                     | Reguła TypeScript, nie ma zastosowania w szablonach HTML |

### Prettier

| Opcja                        | Wartość       | Opis                                                                     |
|------------------------------|---------------|--------------------------------------------------------------------------|
| `arrowParens`                | `'always'`    | Nawiasy wokół parametru arrow function zawsze: `(x) => x`                |
| `bracketSameLine`            | `false`       | Zamykający `>` znacznika JSX/HTML w nowej linii                          |
| `bracketSpacing`             | `true`        | Spacje wewnątrz nawiasów klamrowych: `{ foo: bar }`                      |
| `embeddedLanguageFormatting` | `'auto'`      | Automatyczne formatowanie języków osadzonych (SQL, CSS w JS itp.)        |
| `endOfLine`                  | `'lf'`        | Końce linii w stylu Unix (LF)                                            |
| `htmlWhitespaceSensitivity`  | `'ignore'`    | Białe znaki w HTML ignorowane przy formatowaniu                          |
| `jsxSingleQuote`             | `false`       | Podwójne cudzysłowy w atrybutach JSX                                     |
| `printWidth`                 | `120`         | Maksymalna długość linii                                                 |
| `proseWrap`                  | `'preserve'`  | Zawijanie tekstu w Markdown pozostawione bez zmian                       |
| `quoteProps`                 | `'as-needed'` | Cudzysłowy przy kluczach obiektów tylko gdy konieczne                    |
| `semi`                       | `true`        | Średniki na końcu instrukcji                                             |
| `singleAttributePerLine`     | `true`        | Każdy atrybut HTML/JSX w osobnej linii                                   |
| `singleQuote`                | `true`        | Pojedyncze cudzysłowy w JS/TS                                            |
| `tabWidth`                   | `2`           | Wcięcia o szerokości 2 spacji                                            |
| `trailingComma`              | `'all'`       | Przecinek po ostatnim elemencie we wszystkich wieloliniowych strukturach |
| `useTabs`                    | `false`       | Spacje zamiast tabulatorów                                               |

**Dedykowane nadpisania (Overrides)**

| Pliki              | Opcja    | Wartość     | Opis                                                                 |
|--------------------|----------|-------------|----------------------------------------------------------------------|
| `*.component.html` | `parser` | `'angular'` | Wymusza użycie parsera Angulara do poprawnego formatowania szablonów |

| Ignorowane pliki  |
|-------------------|
| node_modules      |
| dist              |
| package-lock.json |
| .angular          |

### Stylelint

| Reguła                                      | Wartość         | Opis                                                                 |
|---------------------------------------------|-----------------|----------------------------------------------------------------------|
| `stylelint-config-standard-scss`            | preset          | Standardowe reguły SCSS (nomenklatura, formatowanie, kompatybilność) |
| `block-no-empty`                            | `true`          | Zabrania pustych bloków CSS/SCSS                                     |
| `color-hex-length`                          | `'short'`       | Wymaga skróconej formy hex: `#fff` zamiast `#ffffff`                 |
| `declaration-block-no-duplicate-properties` | `true`          | Zabrania powtarzania tej samej właściwości w jednym bloku            |
| `max-nesting-depth`                         | `3`             | Maksymalne zagłębienie selektorów: 3 poziomy                         |
| `order/properties-alphabetical-order`       | `true`          | Właściwości CSS/SCSS muszą być posortowane alfabetycznie             |
| `scss/at-mixin-pattern`                     | `^[a-z0-9\-]+$` | Nazwy mixinów: tylko małe litery, cyfry i myślniki                   |
| `scss/dollar-variable-pattern`              | `^[a-z0-9\-]+$` | Zmienne SCSS: tylko małe litery, cyfry i myślniki                    |
| `scss/load-no-partial-leading-underscore`   | `true`          | Zabrania podkreślnika w ścieżkach `@use` i `@forward`                |
| `scss/percent-placeholder-pattern`          | `^[a-z0-9\-]+$` | Placeholder selektory (`%name`): tylko małe litery, cyfry i myślniki |
| `selector-class-pattern`                    | `null`          | Wyłączone, konwencja nazewnictwa klas CSS nie jest wymuszana         |
| `selector-pseudo-class-no-unknown`          | `true`          | Zezwala na `:ng-deep`                                                |
| `selector-pseudo-element-no-unknown`        | `true`          | Zezwala na `::ng-deep`                                               |

### TypeScript

| Opcja                                                    | Wartość             | Opis                                                                      |
|----------------------------------------------------------|---------------------|---------------------------------------------------------------------------|
| `target`                                                 | `"ES2022"`          | Cel kompilacji, generowany kod zgodny z ES2022                            |
| `moduleResolution`                                       | `"bundler"`         | Rozwiązywanie modułów przez bundler (Vite, webpack)                       |
| `alwaysStrict`                                           | `true`              | Tryb strict ECMAScript aktywny w każdym pliku                             |
| `strict`                                                 | `true`              | Włącza wszystkie flagi strict TypeScript                                  |
| `declaration`                                            | `false`             | Nie generuje plików deklaracji `.d.ts`                                    |
| `esModuleInterop`                                        | `true`              | Interoperacyjność importów CommonJS i ESM                                 |
| `exactOptionalPropertyTypes`                             | `true`              | Właściwości opcjonalne (`?`) nie mogą być jawnie ustawione na `undefined` |
| `forceConsistentCasingInFileNames`                       | `true`              | Spójna wielkość liter w importowanych nazwach plików                      |
| `noFallthroughCasesInSwitch`                             | `true`              | Błąd przy brakującym `break` lub `return` w `switch`                      |
| `noImplicitAny`                                          | `true`              | Zgłasza błąd, gdy typ niejawnie przyjmuje wartość `any`                   |
| `noImplicitReturns`                                      | `true`              | Funkcja musi zwracać wartość we wszystkich ścieżkach kodu                 |
| `sourceMap`                                              | `true`              | Generuje pliki `.map` dla debugowania                                     |
| `noImplicitOverride`                                     | `true`              | Nadpisane metody muszą być oznaczone słowem `override`                    |
| `noUnusedLocals`                                         | `true`              | Błąd przy nieużywanych zmiennych lokalnych                                |
| `noUncheckedIndexedAccess`                               | `true`              | Dostęp przez indeks (`arr[i]`) może zwrócić `undefined`                   |
| `noPropertyAccessFromIndexSignature`                     | `true`              | Właściwości z index signature wymagają notacji nawiasowej                 |
| `experimentalDecorators`                                 | `true`              | Wsparcie dla dekoratorów Angulara (`@Component`, `@Injectable` itp.)      |
| `importHelpers`                                          | `true`              | Importuje helpery TypeScript z `tslib` zamiast je inlinować               |
| `module`                                                 | `"ES2022"`          | Format modułów ES2022                                                     |
| `lib`                                                    | `["ES2022", "DOM"]` | Dostępne biblioteki typów, ES2022 + DOM                                   |
| `skipLibCheck`                                           | `true`              | Pomija sprawdzanie typów w plikach `.d.ts`                                |
| `useDefineForClassFields`                                | `false`             | Pola klasy przypisywane przez `assign` (kompatybilność z dekoratorami)    |
| `strictPropertyInitialization`                           | `false`             | Wyłączone, właściwości klasy nie muszą być inicjalizowane w konstruktorze |
| `angularCompilerOptions.enableI18nLegacyMessageIdFormat` | `false`             | Nowy format ID wiadomości i18n                                            |
| `angularCompilerOptions.strictInjectionParameters`       | `true`              | Weryfikacja typów parametrów wstrzykiwanych przez DI                      |
| `angularCompilerOptions.strictInputAccessModifiers`      | `true`              | Weryfikacja modyfikatorów dostępu w bindowaniu `@Input`                   |
| `angularCompilerOptions.strictTemplates`                 | `true`              | Pełne sprawdzanie typów w szablonach HTML                                 |

---

## Reguły Base

### ESLint

| Preset                                                                                     |
|--------------------------------------------------------------------------------------------|
| [`eslint/recommended`](https://eslint.org/docs/latest/rules/)                              |
| [`typescript-eslint/recommended`](https://typescript-eslint.io/users/configs/#recommended) |
| [`typescript-eslint/stylistic`](https://typescript-eslint.io/users/configs/#stylistic)     |
| [`eslint-config-prettier`](https://github.com/prettier/eslint-config-prettier)             |

**Aktywne**

| Reguła                                             | Opis                                                                                                    |
|----------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| `@typescript-eslint/ban-ts-comment`                | Zabrania komentarzy `@ts-ignore`, `@ts-nocheck` i podobnych                                             |
| `@typescript-eslint/consistent-type-imports`       | Wymaga `import type` dla importów zawierających wyłącznie typy                                          |
| `@typescript-eslint/explicit-function-return-type` | Jawny typ zwracany funkcji, bez wnioskowania                                                            |
| `@typescript-eslint/no-deprecated`                 | Zgłasza błąd przy API oznaczonym jako `@deprecated`                                                     |
| `@typescript-eslint/no-duplicate-enum-values`      | Zabrania definiowania tych samych wartości dla różnych kluczy wewnątrz jednego enuma                    |
| `@typescript-eslint/no-empty-function`             | Zabrania pustych funkcji bez ciała                                                                      |
| `@typescript-eslint/no-empty-object-type`          | Zabrania tworzenia pustych interfejsów oraz typów obiektowych (zapobiega niebezpiecznemu używaniu `{}`) |
| `@typescript-eslint/no-explicit-any`               | Zabrania użycia `any`                                                                                   |
| `@typescript-eslint/no-floating-promises`          | Każdy `Promise` musi być obsłużony (`await`, `.catch`, `void`)                                          |
| `@typescript-eslint/no-unused-vars`                | Błąd przy nieużywanych zmiennych; zmienne z prefiksem `_` są wykluczone                                 |
| `@typescript-eslint/no-non-null-assertion`         | Zabrania używania operatora non-null assertion (`!`), który omija system typów podobnie jak `any`       |
| `comma-dangle`                                     | Wymaga przecinka po ostatnim elemencie w wieloliniowych strukturach                                     |
| `eol-last`                                         | Wymaga pustej linii na końcu każdego pliku                                                              |
| `max-lines`                                        | Maksymalnie 200 linii na plik (bez pustych i komentarzy)                                                |
| `no-console`                                       | Zabrania `console.log` i `console.info`; dozwolone tylko `warn` i `error`                               |
| `padding-line-between-statements`                  | Pusta linia: po bloku importów, przed `export`, przed `return`, przed blokiem po zmiennej               |
| `perfectionist/sort-enums`                         | Sortuje wartości enumów rosnąco                                                                         |
| `perfectionist/sort-exports`                       | Sortuje eksporty z pliku rosnąco                                                                        |
| `perfectionist/sort-imports`                       | Sortuje bloki importów rosnąco                                                                          |
| `perfectionist/sort-objects`                       | Sortuje klucze obiektów literałowych rosnąco                                                            |
| `quotes`                                           | Wymaga pojedynczych cudzysłowów                                                                         |
| `semi`                                             | Wymaga średników na końcu instrukcji                                                                    |
| `sonarjs/cognitive-complexity`                     | Maksymalna złożoność kognitywna funkcji: 10                                                             |
| `spaced-comment`                                   | Wymaga spacji po `//` i `/*` w komentarzach                                                             |
| `unused-imports/no-unused-imports`                 | Błąd przy nieużywanych importach                                                                        |

**Wyłączone**

| Reguła                                   | Opis                                                          |
|------------------------------------------|---------------------------------------------------------------|
| `@typescript-eslint/no-inferrable-types` | Jawne adnotacje typów przy inferowanych wartościach dozwolone |

### Prettier

| Opcja                        | Wartość       | Opis                                                                     |
|------------------------------|---------------|--------------------------------------------------------------------------|
| `arrowParens`                | `'always'`    | Nawiasy wokół parametru arrow function zawsze: `(x) => x`                |
| `bracketSameLine`            | `false`       | Zamykający `>` znacznika JSX/HTML w nowej linii                          |
| `bracketSpacing`             | `true`        | Spacje wewnątrz nawiasów klamrowych: `{ foo: bar }`                      |
| `embeddedLanguageFormatting` | `'auto'`      | Automatyczne formatowanie języków osadzonych (SQL, CSS w JS itp.)        |
| `endOfLine`                  | `'lf'`        | Końce linii w stylu Unix (LF)                                            |
| `htmlWhitespaceSensitivity`  | `'ignore'`    | Białe znaki w HTML ignorowane przy formatowaniu                          |
| `jsxSingleQuote`             | `false`       | Podwójne cudzysłowy w atrybutach JSX                                     |
| `printWidth`                 | `120`         | Maksymalna długość linii                                                 |
| `proseWrap`                  | `'preserve'`  | Zawijanie tekstu w Markdown pozostawione bez zmian                       |
| `quoteProps`                 | `'as-needed'` | Cudzysłowy przy kluczach obiektów tylko gdy konieczne                    |
| `semi`                       | `true`        | Średniki na końcu instrukcji                                             |
| `singleAttributePerLine`     | `true`        | Każdy atrybut HTML/JSX w osobnej linii                                   |
| `singleQuote`                | `true`        | Pojedyncze cudzysłowy w JS/TS                                            |
| `tabWidth`                   | `2`           | Wcięcia o szerokości 2 spacji                                            |
| `trailingComma`              | `'all'`       | Przecinek po ostatnim elemencie we wszystkich wieloliniowych strukturach |
| `useTabs`                    | `false`       | Spacje zamiast tabulatorów                                               |

| Ignorowane pliki  |
|-------------------|
| node_modules      |
| package-lock.json |

### Stylelint

| Reguła                                      | Wartość         | Opis                                                                 |
|---------------------------------------------|-----------------|----------------------------------------------------------------------|
| `stylelint-config-standard-scss`            | preset          | Standardowe reguły SCSS (nomenklatura, formatowanie, kompatybilność) |
| `block-no-empty`                            | `true`          | Zabrania pustych bloków CSS/SCSS                                     |
| `color-hex-length`                          | `'short'`       | Wymaga skróconej formy hex: `#fff` zamiast `#ffffff`                 |
| `declaration-block-no-duplicate-properties` | `true`          | Zabrania powtarzania tej samej właściwości w jednym bloku            |
| `max-nesting-depth`                         | `3`             | Maksymalne zagłębienie selektorów: 3 poziomy                         |
| `order/properties-alphabetical-order`       | `true`          | Właściwości CSS/SCSS muszą być posortowane alfabetycznie             |
| `scss/at-mixin-pattern`                     | `^[a-z0-9\-]+$` | Nazwy mixinów: tylko małe litery, cyfry i myślniki                   |
| `scss/dollar-variable-pattern`              | `^[a-z0-9\-]+$` | Zmienne SCSS: tylko małe litery, cyfry i myślniki                    |
| `scss/load-no-partial-leading-underscore`   | `true`          | Zabrania podkreślnika w ścieżkach `@use` i `@forward`                |
| `scss/percent-placeholder-pattern`          | `^[a-z0-9\-]+$` | Placeholder selektory (`%name`): tylko małe litery, cyfry i myślniki |

### TypeScript

| Opcja                                | Wartość     | Opis                                                                      |
|--------------------------------------|-------------|---------------------------------------------------------------------------|
| `target`                             | `"ES2022"`  | Cel kompilacji, generowany kod zgodny z ES2022                            |
| `moduleResolution`                   | `"bundler"` | Rozwiązywanie modułów przez bundler (Vite, webpack)                       |
| `alwaysStrict`                       | `true`      | Tryb strict ECMAScript aktywny w każdym pliku                             |
| `strict`                             | `true`      | Włącza wszystkie flagi strict TypeScript                                  |
| `declaration`                        | `false`     | Nie generuje plików deklaracji `.d.ts`                                    |
| `esModuleInterop`                    | `true`      | Interoperacyjność importów CommonJS i ESM                                 |
| `exactOptionalPropertyTypes`         | `true`      | Właściwości opcjonalne (`?`) nie mogą być jawnie ustawione na `undefined` |
| `forceConsistentCasingInFileNames`   | `true`      | Spójna wielkość liter w importowanych nazwach plików                      |
| `noFallthroughCasesInSwitch`         | `true`      | Błąd przy brakującym `break` lub `return` w `switch`                      |
| `noImplicitAny`                      | `true`      | Zgłasza błąd, gdy typ niejawnie przyjmuje wartość `any`                   |
| `noImplicitReturns`                  | `true`      | Funkcja musi zwracać wartość we wszystkich ścieżkach kodu                 |
| `sourceMap`                          | `true`      | Generuje pliki `.map` dla debugowania                                     |
| `noImplicitOverride`                 | `true`      | Nadpisane metody muszą być oznaczone słowem `override`                    |
| `noUnusedLocals`                     | `true`      | Błąd przy nieużywanych zmiennych lokalnych                                |
| `noUncheckedIndexedAccess`           | `true`      | Dostęp przez indeks (`arr[i]`) może zwrócić `undefined`                   |
| `noPropertyAccessFromIndexSignature` | `true`      | Właściwości z index signature wymagają notacji nawiasowej                 |
