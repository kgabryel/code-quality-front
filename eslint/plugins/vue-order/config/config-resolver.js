import { ConfigError } from '../output/errors.js';
import { FileMessages, PluginConfigMessages, FileConfigMessages } from '../output/messages.js';
import { reportWarning } from '../output/output-helpers.js';
import { buildFinalRecognizers, coreRecognizers } from '../types/recognizers.js';
import { FileConfig } from './file-config/file-config.js';
import { ProgramConfig } from './program-config.js';

export class ConfigResolver {
  #config;
  #filename;
  #ignoredTypes;
  #params;
  #recognizers;
  #selectedConfig;

  constructor(filename, config) {
    if (typeof config !== 'object' || config === null) {
      throw new ConfigError(PluginConfigMessages.notObject);
    }

    this.#config = config;
    this.#filename = filename;
    this.#ignoredTypes = [];
    this.#params = undefined;
    this.#recognizers = undefined;
    this.#selectedConfig = undefined;

    this.#setParams();
    this.#selectConfig();
    this.#setIgnoredTypes();
    this.#setRecognizers();
  }

  getConfig() {
    if (this.#selectedConfig !== undefined) {
      return new ProgramConfig(
        this.#recognizers,
        new FileConfig(this.#selectedConfig, this.#selectedConfig.identifier),
        this.#params,
        this.#ignoredTypes,
      );
    }

    if ((this.#params.allowUnmatchedFiles ?? true) === false) {
      throw new ConfigError(FileMessages.noConfig(this.#filename));
    }

    const msg = FileMessages.noConfig(this.#filename);

    if ((this.#params.disableWarnings ?? false) === false) {
      reportWarning([msg.message]);
    }

    return undefined;
  }

  #buildRecognizerMap() {
    const recognizers = new Map(coreRecognizers.map((r) => [r.type, r]));
    const customRecognizers = this.#config.customRecognizers ?? [];

    if (!Array.isArray(customRecognizers)) {
      throw new ConfigError(PluginConfigMessages.customRecognizers.notArray);
    }

    for (const [index, recognizer] of customRecognizers.entries()) {
      this.#validateRecognizer(recognizer, index);
      recognizers.set(recognizer.type, recognizer);
    }

    return [...recognizers.values()];
  }

  #getRegisteredRecognizers() {
    if (!('registeredRecognizers' in this.#selectedConfig)) {
      throw new ConfigError(FileConfigMessages.registeredRecognizers.missing, this.#selectedConfig.identifier);
    }

    const registered = this.#selectedConfig.registeredRecognizers;

    if (!Array.isArray(registered)) {
      throw new ConfigError(FileConfigMessages.registeredRecognizers.notArray, this.#selectedConfig.identifier);
    }

    return registered;
  }

  #selectConfig() {
    if (!('configs' in this.#config)) {
      throw new ConfigError(PluginConfigMessages.configs.missing);
    }

    if (!Array.isArray(this.#config.configs)) {
      throw new ConfigError(PluginConfigMessages.configs.notArray);
    }

    const identifiers = new Set();

    for (const [index, config] of this.#config.configs.entries()) {
      this.#validateConfigItem(config, index, identifiers);

      if (config.recognizeFile(this.#filename)) {
        if (this.#selectedConfig) {
          throw new ConfigError(FileMessages.multipleConfig(this.#filename));
        }

        this.#selectedConfig = config;
      }
    }
  }

  #setIgnoredTypes() {
    this.#ignoredTypes = this.#config.ignoredTypes ?? [];
    if (!Array.isArray(this.#ignoredTypes)) {
      throw new ConfigError(PluginConfigMessages.ignoredTypes.notArray);
    }

    for (const [index, item] of this.#ignoredTypes.entries()) {
      if (typeof item !== 'string' || item.trim() === '') {
        throw new ConfigError(PluginConfigMessages.ignoredTypes.item.notString(index));
      }
    }
  }

  #setParams() {
    if (!('params' in this.#config)) {
      this.#params = {};

      return;
    }

    if (typeof this.#config.params !== 'object' || this.#config.params === null) {
      throw new ConfigError(PluginConfigMessages.params.notObject);
    }

    this.#params = this.#config.params;
  }

  #setRecognizers() {
    if (!this.#selectedConfig) {
      return;
    }

    this.#recognizers = buildFinalRecognizers(
      this.#getRegisteredRecognizers(),
      this.#ignoredTypes,
      this.#buildRecognizerMap(),
    );
  }

  #validateConfigItem(config, index, identifiers) {
    if (typeof config !== 'object' || config === null) {
      throw new ConfigError(PluginConfigMessages.configs.item.notObject(index));
    }

    if (!('identifier' in config)) {
      throw new ConfigError(PluginConfigMessages.identifier.missing, `configs[${index}]`);
    }

    if (typeof config.identifier !== 'string' || config.identifier.trim() === '') {
      throw new ConfigError(PluginConfigMessages.identifier.notString, `configs[${index}]`);
    }

    const identifier = config.identifier.trim();

    if (identifiers.has(identifier)) {
      throw new ConfigError(PluginConfigMessages.identifier.duplicate(identifier), `configs[${identifier}]`);
    }

    identifiers.add(identifier);

    if (!('recognizeFile' in config)) {
      throw new ConfigError(PluginConfigMessages.recognizeFile.missing, `configs[${config.identifier}]`);
    }

    if (typeof config.recognizeFile !== 'function') {
      throw new ConfigError(PluginConfigMessages.recognizeFile.notFunction, `configs[${config.identifier}]`);
    }
  }

  #validateRecognizer(recognizer, index) {
    if (typeof recognizer !== 'object' || recognizer === null) {
      throw new ConfigError(
        PluginConfigMessages.customRecognizers.item.notObject(index),
        `customRecognizers[${index}]`,
      );
    }

    if (!('type' in recognizer)) {
      throw new ConfigError(
        PluginConfigMessages.customRecognizers.item.type.missing(index),
        `customRecognizers[${index}]`,
      );
    }

    if (typeof recognizer.type !== 'string' || recognizer.type.trim() === '') {
      throw new ConfigError(
        PluginConfigMessages.customRecognizers.item.type.notString(index),
        `customRecognizers[${index}]`,
      );
    }

    if (!('test' in recognizer)) {
      throw new ConfigError(
        PluginConfigMessages.customRecognizers.item.test.missing(index),
        `customRecognizers[${index}]`,
      );
    }

    if (typeof recognizer.test !== 'function') {
      throw new ConfigError(
        PluginConfigMessages.customRecognizers.item.test.notFunction(index),
        `customRecognizers[${index}]`,
      );
    }

    const priority = recognizer.priority ?? 0;

    if (typeof priority !== 'number') {
      throw new ConfigError(
        PluginConfigMessages.customRecognizers.item.priority.notNumber(index),
        `customRecognizers[${index}]`,
      );
    }
  }
}
