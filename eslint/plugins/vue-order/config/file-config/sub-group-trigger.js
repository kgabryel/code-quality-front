import { ConfigError } from '../../output/errors.js';
import { SubGroupTriggerMessages } from '../../output/messages.js';

export class SubGroupTrigger {
  #index;
  #parentIdentifier;
  #trigger;

  constructor(trigger, parentIdentifier, index) {
    this.#index = index;
    this.#parentIdentifier = parentIdentifier;

    if (typeof trigger !== 'object' || trigger === null) {
      throw new ConfigError(SubGroupTriggerMessages.notObject, this.getIdentifier());
    }

    this.#trigger = trigger;
  }

  getBody(node) {
    if (!('getBody' in this.#trigger)) {
      throw new ConfigError(SubGroupTriggerMessages.getBody.missing, this.getIdentifier());
    }

    if (typeof this.#trigger.getBody !== 'function') {
      throw new ConfigError(SubGroupTriggerMessages.getBody.notFunction, this.getIdentifier());
    }

    return this.#trigger.getBody(node);
  }

  getIdentifier() {
    let identifier = `${this.#parentIdentifier}.`;

    try {
      identifier += `subGroupsTriggers[${this.getNodeType()}]`;
    } catch {
      identifier += `subGroupsTriggers[${this.#index}]`;
    }

    return identifier;
  }

  getNodeType() {
    if (!('nodeType' in this.#trigger)) {
      throw new ConfigError(SubGroupTriggerMessages.nodeType.missing, this.getIdentifier());
    }

    if (typeof this.#trigger.nodeType !== 'string' || this.#trigger.nodeType.trim() === '') {
      throw new ConfigError(SubGroupTriggerMessages.nodeType.notString, this.getIdentifier());
    }

    return this.#trigger.nodeType;
  }

  getSubGroup() {
    if (!('subGroup' in this.#trigger)) {
      throw new ConfigError(SubGroupTriggerMessages.subGroup.missing, this.getIdentifier());
    }

    if (typeof this.#trigger.subGroup !== 'string' || this.#trigger.subGroup.trim() === '') {
      throw new ConfigError(SubGroupTriggerMessages.subGroup.notString, this.getIdentifier());
    }

    return this.#trigger.subGroup;
  }
}
