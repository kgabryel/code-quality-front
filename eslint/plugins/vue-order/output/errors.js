import { withDot } from '../helpers.js';
import { ErrorMessages } from './messages.js';

export class PluginError extends Error {
  constructor(message) {
    super(message);
  }
}

export class ConfigError extends PluginError {
  constructor(error, source) {
    const errorMessage = ErrorMessages.configError(error);
    super(errorMessage.fullMessage);
    this.name = 'ConfigError';

    this.content = [];
    if (source !== undefined) {
      this.content = [ErrorMessages.path(source)];
    }
    this.content.push(errorMessage.message);
    this.fix = error?.fix;
  }
}

export class MultipleAssignmentError extends PluginError {
  constructor(nodeType, source) {
    const errorMessage = ErrorMessages.multipleAssignment(nodeType, source);
    super(errorMessage.fullMessage);
    this.name = 'MultipleAssignmentError';
    this.content = [ErrorMessages.path(source), errorMessage.message, ErrorMessages.multipleAssignFix];
  }
}

export class MultipleGroupError extends PluginError {
  constructor(nodeType, group1, group2, source) {
    const errorMessage = ErrorMessages.multipleGroup(nodeType, group1, group2);
    super(errorMessage.fullMessage);
    this.name = 'MultipleGroupError';
    this.content = [ErrorMessages.path(source), errorMessage.message, ErrorMessages.multipleAssignFix];
  }
}

export class UnassignedNodeError extends PluginError {
  constructor(node, nodeType, filename) {
    const line = node?.loc?.start.line ?? '?';
    const errorMessage = ErrorMessages.unassignedNode(nodeType);
    super(ErrorMessages.fullMessage(errorMessage.message, filename, line));
    this.name = 'UnassignedNodeError';
    this.content = [ErrorMessages.file(filename), ErrorMessages.line(line), withDot(errorMessage.message)];
  }
}

export class UnrecognizedNodeError extends PluginError {
  constructor(node, filename) {
    const line = node?.loc?.start.line ?? '?';
    const errorMessage = ErrorMessages.unrecognizedNode(node.type);
    super(ErrorMessages.fullMessage(errorMessage.message, filename, line));
    this.name = 'UnrecognizedNodeError';
    this.content = [ErrorMessages.file(filename), ErrorMessages.line(line), withDot(errorMessage.message)];
  }
}
