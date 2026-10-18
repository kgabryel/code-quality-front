import { ConfigError } from '../../output/errors.js';
import { FileConfigMessages, GroupMessages } from '../../output/messages.js';
import { Group } from './group.js';
import { SubGroupTrigger } from './sub-group-trigger.js';

export class FileConfig {
  #config;
  #groups;
  #identifier;
  #subGroupsTriggers;

  constructor(config, identifier) {
    this.#identifier = identifier;

    if (typeof config !== 'object' || config === null) {
      throw new ConfigError(FileConfigMessages.notObject, this.#identifier);
    }

    this.#config = config;
    this.#groups = undefined;
    this.#subGroupsTriggers = undefined;
  }

  getDisabledTypes() {
    if (!('disabledTypes' in this.#config) || this.#config.disabledTypes === undefined) {
      return [];
    }

    if (!Array.isArray(this.#config.disabledTypes)) {
      throw new ConfigError(FileConfigMessages.disabledTypes.notArray, this.#identifier);
    }

    return this.#config.disabledTypes;
  }

  getGroupByName(name) {
    const group = this.getGroups().find((el) => el.getName() === name);

    if (!group) {
      throw new ConfigError(FileConfigMessages.name.notFound(name), this.#identifier);
    }

    return group;
  }

  getGroups() {
    if (!('groups' in this.#config)) {
      throw new ConfigError(FileConfigMessages.groups.missing, this.#identifier);
    }

    if (!Array.isArray(this.#config.groups)) {
      throw new ConfigError(FileConfigMessages.groups.notArray, this.#identifier);
    }

    if (this.#groups === undefined) {
      this.#groups = [];
      const identifiers = new Set();

      for (const [index, group] of this.#config.groups.entries()) {
        const g = new Group(group, this.#identifier, index);
        const name = g.getName();

        if (identifiers.has(name)) {
          throw new ConfigError(GroupMessages.name.duplicate(name), g.getIdentifier());
        }
        identifiers.add(name);
        this.#groups.push(g);
      }
    }

    return this.#groups;
  }

  getIdentifier() {
    return this.#identifier;
  }

  getSubGroup(name) {
    if (!('subGroups' in this.#config)) {
      throw new ConfigError(FileConfigMessages.subGroups.missing, this.#identifier);
    }

    if (typeof this.#config.subGroups !== 'object' || this.#config.subGroups === null) {
      throw new ConfigError(FileConfigMessages.subGroups.notObject, this.#identifier);
    }

    if (!(name in this.#config.subGroups)) {
      throw new ConfigError(FileConfigMessages.subGroups.item.missing(name), this.#identifier);
    }

    return this.#config.subGroups[name];
  }

  getSubGroupsTriggers() {
    if (!('subGroupsTriggers' in this.#config) || this.#config.subGroupsTriggers === undefined) {
      return [];
    }

    if (!Array.isArray(this.#config.subGroupsTriggers)) {
      throw new ConfigError(FileConfigMessages.subGroupsTriggers.notArray, this.#identifier);
    }

    if (this.#subGroupsTriggers === undefined) {
      const types = new Set();
      this.#subGroupsTriggers = this.#config.subGroupsTriggers.map((trigger, index) => {
        const t = new SubGroupTrigger(trigger, this.#identifier, index);
        const nodeType = t.getNodeType();

        if (types.has(nodeType)) {
          throw new ConfigError(FileConfigMessages.subGroupsTriggers.duplicate(nodeType), this.#identifier);
        }
        types.add(nodeType);

        return t;
      });
    }

    return this.#subGroupsTriggers;
  }

  isDisabledType(type) {
    return this.getDisabledTypes().includes(type);
  }
}
