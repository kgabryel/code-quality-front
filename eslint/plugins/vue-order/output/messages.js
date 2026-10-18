import { BlankLine } from '../types/blank-line.js';
import { PLUGIN_SOURCE } from './output-helpers.js';

export const CheckOrderMessages = {
  disabledType: (nodeType) => `NodeType "${nodeType}" jest na liście niedozwolonych nodów.`,
  invalidComment: 'Błędny komentarz.',
  noBlankLine: 'Brak pustej linii.',
  noComment: 'Brak komentarza.',
  wrongOrder: (nodeType, groupsText) => `NodeType "${nodeType}" powinien być przed nodami z ${groupsText}.`,
};

export const ErrorMessages = {
  configError: (error) => ({
    fullMessage: `[${PLUGIN_SOURCE}] ${error?.message ?? error}`,
    message: `Wystąpił błąd: ${error?.message ?? error}`,
  }),
  file: (filename) => `Plik: ${filename}`,
  fullMessage: (message, filename, line) =>
    `[${PLUGIN_SOURCE}] ${message} - w konfiguracji dla pliku "${filename}" (linia ${line}).`,
  line: (line) => `Linia: ${line}`,
  multipleAssignFix: 'Każdy typ musi być przypisany dokładnie raz.',
  multipleAssignment: (nodeType, source) => {
    const message = `NodeType "${nodeType}" występuje więcej niż raz w "${source}".`;

    return {
      fullMessage: `[${PLUGIN_SOURCE}] ${message} ${ErrorMessages.multipleAssignFix}`,
      message,
    };
  },
  multipleGroup: (nodeType, group1, group2) => {
    const message = `NodeType "${nodeType}" występuje w więcej niż jednej grupie ("${group1}" i "${group2}").`;

    return {
      fullMessage: `[${PLUGIN_SOURCE}] ${message} ${ErrorMessages.multipleAssignFix}`,
      message,
    };
  },
  path: (path) => `Ścieżka: ${path}`,
  unassignedNode: (nodeType = '') => ({
    fix: 'Dodaj go do odpowiedniej grupy w config.groups[].types[] lub config.subGroups[].',
    message: `NodeType "${nodeType}" został rozpoznany, ale nie jest przypisany do żadnej grupy`,
  }),
  unrecognizedNode: (nodeType = '') => ({
    fix: 'Dodaj odpowiedni recognizer do coreRecognizers lub do customRecognizers w create(), a następnie zarejestruj go w config.registeredRecognizers.',
    message: `Nie można rozpoznać node'a "${nodeType}"`,
  }),
};

export const FileConfigMessages = {
  disabledTypes: {
    notArray: {
      fix: 'Użyj tablicy wartości z NodeType, np. disabledTypes: [NodeType.ArrowFunction].',
      message: 'Pole "disabledTypes" musi być tablicą.',
    },
  },

  groups: {
    missing: {
      fix: 'Dodaj tablicę "groups" z definicjami grup.',
      message: 'Brakuje pola "groups".',
    },
    notArray: {
      message: 'Pole "groups" musi być tablicą.',
    },
  },

  name: {
    notFound: (name) => ({
      message: `Nie znaleziono grupy o nazwie "${name}".`,
    }),
  },

  notObject: {
    message: 'Konfiguracja pliku musi być obiektem.',
  },

  registeredRecognizers: {
    missing: {
      fix: 'Dodaj tablicę "registeredRecognizers" z typami np. [NodeType.Ref, NodeType.Computed].',
      message: 'Brakuje pola "registeredRecognizers".',
    },
    notArray: {
      message: 'Pole "registeredRecognizers" musi być tablicą.',
    },
  },

  subGroups: {
    item: {
      missing: (name) => ({
        fix: `Dodaj klucz "${name}" do obiektu "subGroups".`,
        message: `Brakuje podgrupy "${name}" w "subGroups".`,
      }),
    },
    missing: {
      fix: 'Dodaj obiekt "subGroups" z definicjami podgrup.',
      message: 'Brakuje pola "subGroups".',
    },
    notObject: {
      message: 'Pole "subGroups" musi być obiektem.',
    },
  },

  subGroupsTriggers: {
    duplicate: (nodeType) => ({
      fix: 'Każdy typ węzła może mieć tylko jeden trigger.',
      message: `Trigger dla "${nodeType}" jest zdefiniowany więcej niż raz.`,
    }),
    notArray: {
      message: 'Pole "subGroupsTriggers" musi być tablicą.',
    },
  },
};

export const FileMessages = {
  multipleConfig: (filename) => ({
    fix: 'Funkcje "recognizeFile" muszą być rozłączne, każdy plik może pasować do dokładnie jednej konfiguracji.',
    message: `Plik "${filename}" pasuje do więcej niż jednej konfiguracji.`,
  }),
  noConfig: (filename) => ({
    fix: 'Dodaj odpowiedni wpis do tablicy "configs" z pasującą funkcją "recognizeFile".',
    message: `Plik "${filename}" nie pasuje do żadnej konfiguracji.`,
  }),
};

export const GroupMessages = {
  blankLine: {
    invalid: {
      fix: ['BlankLine.YES - wymagana pusta linia przed grupą', 'BlankLine.NO - brak wymagania pustej linii'],
      message: `Pole "blankLine" grupy może mieć tylko wartości: ${BlankLine.YES} lub ${BlankLine.NO}.`,
    },
  },

  comment: {
    empty: {
      fix: 'Podaj treść komentarza lub ustaw comment: null jeśli komentarz nie jest wymagany.',
      message: 'Pole "comment" nie może być pustym stringiem.',
    },
    notString: {
      message: 'Pole "comment" musi być stringiem.',
    },
  },

  name: {
    duplicate: (name) => ({
      fix: 'Każda grupa musi mieć unikalną nazwę.',
      message: `Nazwa grupy "${name}" jest już używana.`,
    }),
    missing: {
      fix: 'Dodaj pole "name" z unikalną nazwą grupy.',
      message: 'Grupa nie ma nazwy.',
    },
    notString: {
      message: 'Nazwa grupy musi być niepustym stringiem.',
    },
  },

  notObject: {
    message: 'Definicja grupy musi być obiektem.',
  },

  types: {
    item: {
      notFound: {
        message: 'Nie znaleziono definicji dla tego typu węzła w grupie.',
      },
    },
    missing: (name) => ({
      fix: 'Dodaj tablicę "types" z definicjami typów węzłów należących do grupy.',
      message: `Grupa "${name}" nie ma pola "types".`,
    }),
    notArray: (name) => ({
      message: `Pole "types" grupy "${name}" musi być tablicą.`,
    }),
  },
};

export const PluginConfigMessages = {
  configs: {
    item: {
      notObject: (index) => ({
        message: `Element "configs[${index}]" musi być obiektem.`,
      }),
    },
    missing: {
      fix: 'Dodaj tablicę "configs" z co najmniej jedną konfiguracją pliku.',
      message: 'Brakuje pola "configs".',
    },
    notArray: {
      message: 'Pole "configs" musi być tablicą.',
    },
  },

  customRecognizers: {
    item: {
      notObject: (index) => ({
        message: `Element "customRecognizers[${index}]" musi być obiektem.`,
      }),
      priority: {
        notNumber: (index) => ({
          message: `"customRecognizers[${index}].priority" musi być liczbą.`,
        }),
      },
      test: {
        missing: (index) => ({
          fix: 'Dodaj funkcję "test: (node) => boolean".',
          message: `"customRecognizers[${index}]" nie ma pola "test".`,
        }),
        notFunction: (index) => ({
          message: `"customRecognizers[${index}].test" musi być funkcją.`,
        }),
      },
      type: {
        missing: (index) => ({
          fix: 'Dodaj pole "type" z wartością z NodeType lub własnym stringiem.',
          message: `"customRecognizers[${index}]" nie ma pola "type".`,
        }),
        notString: (index) => ({
          message: `"customRecognizers[${index}].type" musi być niepustym stringiem.`,
        }),
      },
    },
    notArray: {
      message: 'Pole "customRecognizers" musi być tablicą.',
    },
  },

  identifier: {
    duplicate: (id) => ({
      fix: 'Każda konfiguracja musi mieć unikalny identyfikator.',
      message: `Identyfikator "${id}" jest już używany przez inną konfigurację.`,
    }),
    missing: {
      fix: 'Dodaj pole "identifier" z unikalną nazwą, np. identifier: "vue".',
      message: 'Konfiguracja nie ma identyfikatora.',
    },
    notString: {
      message: 'Identyfikator konfiguracji musi być niepustym stringiem.',
    },
  },

  ignoredTypes: {
    item: {
      notString: (index) => ({
        fix: 'Użyj wartości z NodeType, np. NodeType.IfStatement.',
        message: `Element "ignoredTypes[${index}]" musi być niepustym stringiem.`,
      }),
    },
    notArray: {
      fix: 'Użyj tablicy stringów, np. ignoredTypes: [NodeType.IfStatement].',
      message: 'Pole "ignoredTypes" musi być tablicą.',
    },
  },

  notObject: {
    fix: 'Przekaż obiekt jako argument do funkcji create().',
    message: 'Konfiguracja pluginu musi być obiektem.',
  },

  params: {
    flag: {
      notBoolean: (key) => ({
        message: `Flaga "${key}" musi być wartością logiczną (true/false).`,
      }),
      notFound: (key) => ({
        message: `Nieznana flaga "${key}".`,
      }),
    },
    interfaceName: {
      notFound: (key) => ({
        message: `Brakuje nazwy interfejsu dla klucza "${key}".`,
      }),
      notString: (key) => ({
        message: `Nazwa interfejsu "${key}" musi być niepustym stringiem.`,
      }),
    },
    notObject: {
      message: 'Pole "params" musi być obiektem.',
    },
  },

  recognizeFile: {
    missing: {
      fix: 'Dodaj pole "recognizeFile", np. recognizeFile: isVueFile.',
      message: 'Konfiguracja nie ma funkcji "recognizeFile".',
    },
    notFunction: {
      message: 'Pole "recognizeFile" musi być funkcją.',
    },
  },
};

export const SubGroupTriggerMessages = {
  getBody: {
    missing: {
      fix: 'Dodaj funkcję "getBody: (node) => ASTNode[]", np. getBody: getComposableBody.',
      message: 'Trigger nie ma funkcji "getBody".',
    },
    notFunction: {
      message: 'Pole "getBody" triggera musi być funkcją.',
    },
  },

  nodeType: {
    missing: {
      fix: 'Dodaj pole "nodeType" z wartością z NodeType, np. nodeType: NodeType.Function.',
      message: 'Trigger nie ma pola "nodeType".',
    },
    notString: {
      message: 'Pole "nodeType" triggera musi być niepustym stringiem.',
    },
  },

  notObject: {
    message: 'Definicja triggera musi być obiektem.',
  },

  subGroup: {
    missing: {
      fix: 'Dodaj pole "subGroup" z nazwą podgrupy zdefiniowanej w "subGroups".',
      message: 'Trigger nie ma pola "subGroup".',
    },
    notString: {
      message: 'Pole "subGroup" triggera musi być niepustym stringiem.',
    },
  },
};

export const TypeMessages = {
  blankLine: {
    invalid: {
      fix: [
        'BlankLine.NO - brak pustej linii',
        'BlankLine.ONCE - pusta linia przed pierwszym wystąpieniem tego typu',
        'BlankLine.ALL - pusta linia przed każdym wystąpieniem tego typu',
      ],
      message: `Pole "blankLine" może mieć tylko wartości: ${BlankLine.NO}, ${BlankLine.ONCE} lub ${BlankLine.ALL}.`,
    },
  },

  notObject: {
    message: 'Definicja typu węzła musi być obiektem.',
  },

  type: {
    missing: {
      fix: 'Dodaj pole "type" z wartością z NodeType, np. type: NodeType.Ref.',
      message: 'Definicja typu węzła nie ma pola "type".',
    },
    notString: {
      message: 'Pole "type" musi być niepustym stringiem.',
    },
  },
};
