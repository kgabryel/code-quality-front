import { ConfigError } from '../output/errors.js';
import { PluginConfigMessages } from '../output/messages.js';

export class ProgramConfig {
  #defaultFlags;
  #defaultInterfaceNames;
  #fileConfig;
  #ignoredTypes;
  #params;
  #recognizers;

  constructor(recognizers, fileConfig, params, ignoredTypes) {
    this.#defaultFlags = {
      allowUnassignedNodes: false,
      allowUnmatchedFiles: true,
      allowUnrecognizedNodes: false,
      disableWarnings: false,
    };

    this.#defaultInterfaceNames = {
      emits: 'Emits',
      props: 'Props',
      state: 'State',
    };

    this.#fileConfig = fileConfig;
    this.#ignoredTypes = ignoredTypes;
    this.#params = params;
    this.#recognizers = recognizers;
  }

  getFileConfig() {
    return this.#fileConfig;
  }

  getFlag(key) {
    if (!(key in this.#params) || this.#params[key] === undefined) {
      if (!(key in this.#defaultFlags)) {
        throw new ConfigError(PluginConfigMessages.params.flag.notFound(key));
      }

      return this.#defaultFlags[key];
    }

    if (typeof this.#params[key] !== 'boolean') {
      throw new ConfigError(PluginConfigMessages.params.flag.notBoolean(key));
    }

    return this.#params[key];
  }

  getIgnoredTypes() {
    return this.#ignoredTypes;
  }

  getInterfaceName(key) {
    const interfaceNames = this.#params.interfaceNames ?? {};

    if (!(key in interfaceNames) || interfaceNames[key] === undefined) {
      if (!(key in this.#defaultInterfaceNames)) {
        throw new ConfigError(PluginConfigMessages.params.interfaceName.notFound(key));
      }

      return this.#defaultInterfaceNames[key];
    }

    if (typeof interfaceNames[key] !== 'string' || interfaceNames[key].trim() === '') {
      throw new ConfigError(PluginConfigMessages.params.interfaceName.notString(key));
    }

    return interfaceNames[key];
  }

  getParams() {
    return this.#params;
  }

  getRecognizers() {
    return this.#recognizers;
  }
}
