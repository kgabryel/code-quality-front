import { ConfigError } from '../../output/errors.js';
import { GroupMessages } from '../../output/messages.js';
import { BlankLine } from '../../types/blank-line.js';
import { GroupType } from './group-type.js';

export class Group {
  static DefaultBlankLine = BlankLine.NO;

  #group;
  #groupTypes;
  #index;
  #parentIdentifier;

  constructor(group, parentIdentifier, index) {
    this.#index = index;
    this.#parentIdentifier = parentIdentifier;

    if (typeof group !== 'object' || group === null) {
      throw new ConfigError(GroupMessages.notObject, this.getIdentifier());
    }

    this.#group = group;
    this.#groupTypes = undefined;
  }

  getBlankLine() {
    if (!('blankLine' in this.#group)) {
      return Group.DefaultBlankLine;
    }

    const blankLine = this.#group.blankLine ?? Group.DefaultBlankLine;

    if (blankLine !== BlankLine.YES && blankLine !== BlankLine.NO) {
      throw new ConfigError(GroupMessages.blankLine.invalid, this.getIdentifier());
    }

    return blankLine;
  }

  getComment() {
    if (!('comment' in this.#group)) {
      return null;
    }

    if (this.#group.comment === undefined || this.#group.comment === null) {
      return null;
    }

    if (typeof this.#group.comment !== 'string') {
      throw new ConfigError(GroupMessages.comment.notString, this.getIdentifier());
    }

    if (this.#group.comment.trim() === '') {
      throw new ConfigError(GroupMessages.comment.empty, this.getIdentifier());
    }

    return this.#group.comment;
  }

  getIdentifier() {
    let identifier = `${this.#parentIdentifier}.`;

    try {
      identifier += `groups[${this.getName()}]`;
    } catch {
      identifier += `groups[${this.#index}]`;
    }

    return identifier;
  }

  getName() {
    if (!('name' in this.#group)) {
      throw new ConfigError(GroupMessages.name.missing, this.getIdentifier());
    }

    if (typeof this.#group.name !== 'string' || this.#group.name.trim() === '') {
      throw new ConfigError(GroupMessages.name.notString, this.getIdentifier());
    }

    return this.#group.name;
  }

  getType(nodeType) {
    const type = this.getTypes().find((el) => el.getType() === nodeType);

    if (!type) {
      throw new ConfigError(GroupMessages.types.item.notFound, this.getIdentifier());
    }

    return type;
  }

  getTypes() {
    if (!('types' in this.#group)) {
      throw new ConfigError(GroupMessages.types.missing(this.getName()), this.getIdentifier());
    }

    if (!Array.isArray(this.#group.types)) {
      throw new ConfigError(GroupMessages.types.notArray(this.getName()), this.getIdentifier());
    }

    if (this.#groupTypes === undefined) {
      this.#groupTypes = this.#group.types.map((type, index) => new GroupType(type, this.getIdentifier(), index));
    }

    return this.#groupTypes;
  }
}
