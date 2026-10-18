import { ConfigError } from '../../output/errors.js';
import { TypeMessages } from '../../output/messages.js';
import { BlankLine } from '../../types/blank-line.js';

export class GroupType {
  static DefaultBlankLine = BlankLine.NO;

  #index;
  #parentIdentifier;
  #type;

  constructor(type, parentIdentifier, index) {
    this.#index = index;
    this.#parentIdentifier = parentIdentifier;

    if (typeof type !== 'object' || type === null) {
      throw new ConfigError(TypeMessages.notObject, this.getIdentifier());
    }

    this.#type = type;
  }

  getBlankLine() {
    if (!('blankLine' in this.#type)) {
      return GroupType.DefaultBlankLine;
    }

    const blankLine = this.#type.blankLine ?? GroupType.DefaultBlankLine;

    if (blankLine !== BlankLine.ONCE && blankLine !== BlankLine.ALL && blankLine !== BlankLine.NO) {
      throw new ConfigError(TypeMessages.blankLine.invalid, this.getIdentifier());
    }

    return blankLine;
  }

  getIdentifier() {
    let identifier = `${this.#parentIdentifier}.`;

    try {
      identifier += `types[${this.getType()}]`;
    } catch {
      identifier += `types[${this.#index}]`;
    }

    return identifier;
  }

  getType() {
    if (!('type' in this.#type)) {
      throw new ConfigError(TypeMessages.type.missing, this.getIdentifier());
    }

    if (typeof this.#type.type !== 'string' || this.#type.type.trim() === '') {
      throw new ConfigError(TypeMessages.type.notString, this.getIdentifier());
    }

    return this.#type.type;
  }
}
