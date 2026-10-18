import { FileConfig } from './config/file-config/file-config.js';
import { ProgramConfig } from './config/program-config.js';
import {
  MultipleAssignmentError,
  MultipleGroupError,
  UnassignedNodeError,
  UnrecognizedNodeError,
} from './output/errors.js';
import { CheckOrderMessages, ErrorMessages } from './output/messages.js';
import { reportWarning } from './output/output-helpers.js';
import { BlankLine } from './types/blank-line.js';
import { recognizeNode } from './types/recognizers.js';

export class CheckOrder {
  #env;
  #errors;
  #groupsOrder;
  #groupTypeHistory;
  #nodes;
  #nodesOrder;
  #prevNode;
  #processedTypes;
  #programConfig;
  #typeToGroup;

  constructor(nodes, env, programConfig) {
    this.#env = env;
    this.#errors = [];
    this.#groupsOrder = new Map();
    this.#groupTypeHistory = new Map();
    this.#nodes = nodes;
    this.#nodesOrder = new Map();
    this.#prevNode = null;
    this.#processedTypes = new Set();
    this.#programConfig = programConfig;
    this.#typeToGroup = new Map();

    this.#assignGroupOrder();
    this.#assignNodeToGroup();
  }

  run() {
    for (const node of this.#nodes) {
      const nodeType = recognizeNode(node, this.#programConfig.getRecognizers(), this.#programConfig);

      if (!this.#checkNode(node, nodeType)) {
        continue;
      }

      this.#processNode(node, nodeType);
    }

    return this.#errors;
  }

  #addNodeToGroup(nodeType, groupName) {
    if (!this.#groupTypeHistory.has(groupName)) {
      this.#groupTypeHistory.set(groupName, []);
    }

    const nodes = this.#groupTypeHistory.get(groupName);
    nodes.push(nodeType);
  }

  #assignGroupOrder() {
    for (const [index, group] of this.#programConfig.getFileConfig().getGroups().entries()) {
      const name = group.getName();

      this.#groupsOrder.set(name, index);
    }
  }

  #assignNodeToGroup() {
    this.#programConfig
      .getFileConfig()
      .getGroups()
      .forEach((group) => {
        for (const [index, groupType] of group.getTypes().entries()) {
          const groupName = group.getName();
          const type = groupType.getType();

          if (this.#typeToGroup.has(type)) {
            const assignmentGroup = this.#typeToGroup.get(type);

            if (assignmentGroup === groupName) {
              throw new MultipleAssignmentError(type, group.getIdentifier());
            } else {
              throw new MultipleGroupError(type, assignmentGroup, groupName, group.getIdentifier());
            }
          }

          this.#typeToGroup.set(type, groupName);
          this.#nodesOrder.set(type, index);
        }
      });
  }

  #checkBlankLine(node) {
    if (!this.#prevNode) {
      return;
    }

    const comments = this.#env.sourceCode.getCommentsBefore(node);
    const firstComment = comments[0];

    const referenceNode = firstComment ?? node;

    if (referenceNode.loc.start.line - this.#prevNode.loc.end.line < 2) {
      this.#errors.push({ message: CheckOrderMessages.noBlankLine, node });
    }
  }

  #checkFirstOccurrence(node, nodeType, typeConfig) {
    const blankLine = typeConfig.getBlankLine();

    if (blankLine === BlankLine.NO) {
      return;
    }

    this.#checkBlankLine(node);
  }

  #checkGroupComment(node, comment, firstComment) {
    if (!firstComment) {
      this.#errors.push({ message: CheckOrderMessages.noComment, node });

      return;
    }

    if (!firstComment.value.trim().toLowerCase().startsWith(comment.toLowerCase())) {
      this.#errors.push({ message: CheckOrderMessages.invalidComment, node });
    }
  }

  #checkGroupStart(node, group) {
    const comment = group.getComment();
    const blankLine = group.getBlankLine();

    const comments = this.#env.sourceCode.getCommentsBefore(node);
    const firstComment = comments[0];

    if (comment !== null) {
      this.#checkGroupComment(node, comment, firstComment);
    }

    if (blankLine === BlankLine.YES) {
      this.#checkBlankLine(node);
    }
  }

  #checkNextOccurrence(node, typeConfig) {
    const blankLine = typeConfig.getBlankLine();

    if (blankLine !== BlankLine.ALL) {
      return;
    }

    this.#checkBlankLine(node);
  }

  #checkNode(node, nodeType) {
    if (nodeType === null) {
      const error = new UnrecognizedNodeError(node, this.#env.filename);

      if (!this.#programConfig.getFlag('allowUnrecognizedNodes')) {
        throw error;
      } else if (!this.#programConfig.getFlag('disableWarnings')) {
        reportWarning(error.content ?? [error.message], [ErrorMessages.unrecognizedNode().fix]);
      }

      return false;
    }

    if (
      !this.#typeToGroup.has(nodeType) &&
      !this.#programConfig.getIgnoredTypes().includes(nodeType) &&
      !this.#programConfig.getFileConfig().isDisabledType(nodeType)
    ) {
      const error = new UnassignedNodeError(node, nodeType, this.#env.filename);

      if (!this.#programConfig.getFlag('allowUnassignedNodes')) {
        throw error;
      } else if (!this.#programConfig.getFlag('disableWarnings')) {
        reportWarning(error.content ?? [error.message], [ErrorMessages.unassignedNode().fix]);
      }

      return false;
    }

    return true;
  }

  #checkNodeMeta(node, nodeType) {
    const groupName = this.#typeToGroup.get(nodeType);
    const group = this.#programConfig.getFileConfig().getGroupByName(groupName);

    if (!this.#groupTypeHistory.has(groupName)) {
      this.#checkGroupStart(node, group);

      return;
    }

    const typeConfig = group.getType(nodeType);

    if (!this.#groupTypeHistory.get(groupName).includes(nodeType)) {
      this.#checkFirstOccurrence(node, nodeType, typeConfig);
    } else {
      this.#checkNextOccurrence(node, typeConfig);
    }
  }

  #checkNodeOrder(node, nodeType) {
    const nodeGroupOrder = this.#groupsOrder.get(this.#typeToGroup.get(nodeType));
    const invalidNodes = new Set();

    for (const prevNode of this.#processedTypes.values()) {
      const prevNodeGroupOrder = this.#groupsOrder.get(this.#typeToGroup.get(prevNode));

      if (prevNodeGroupOrder <= nodeGroupOrder) {
        continue;
      }

      invalidNodes.add(prevNode);
    }

    if (invalidNodes.size === 0) {
      return;
    }

    const groupedNodes = [...invalidNodes].reduce((acc, invalidNodeType) => {
      const group = this.#typeToGroup.get(invalidNodeType);

      if (!group) {
        return acc;
      }

      if (!acc[group]) {
        acc[group] = [];
      }

      acc[group].push(invalidNodeType);

      return acc;
    }, {});

    const formattedGroups = Object.entries(groupedNodes)
      .sort(([groupA], [groupB]) => {
        return this.#groupsOrder.get(groupA) - this.#groupsOrder.get(groupB);
      })
      .map(([group, nodes]) => {
        const sortedNodes = nodes.sort((a, b) => {
          return this.#nodesOrder.get(a) - this.#nodesOrder.get(b);
        });

        return `${group} (${sortedNodes.join(', ')})`;
      });

    this.#errors.push({
      message: CheckOrderMessages.wrongOrder(
        nodeType,
        formattedGroups.length === 1 ? `grupy ${formattedGroups[0]}` : `grup ${formattedGroups.join(', ')}`,
      ),
      node,
    });
  }

  #findSubGroupTrigger(nodeType) {
    for (const trigger of this.#programConfig.getFileConfig().getSubGroupsTriggers()) {
      if (trigger.getNodeType() === nodeType) {
        return trigger;
      }
    }

    return null;
  }

  #processNode(node, nodeType) {
    if (this.#programConfig.getFileConfig().isDisabledType(nodeType)) {
      this.#errors.push({ message: CheckOrderMessages.disabledType(nodeType), node });

      return;
    }

    if (this.#programConfig.getIgnoredTypes().includes(nodeType)) {
      this.#prevNode = node;

      return;
    }

    this.#checkNodeMeta(node, nodeType);
    this.#checkNodeOrder(node, nodeType);

    const subGroupTrigger = this.#findSubGroupTrigger(nodeType);

    if (subGroupTrigger !== null) {
      this.#runSubGroup(node, subGroupTrigger);
    }

    this.#prevNode = node;
    this.#processedTypes.add(nodeType);
    this.#addNodeToGroup(nodeType, this.#typeToGroup.get(nodeType));
  }

  #runSubGroup(node, subGroupTrigger) {
    const subGroup = this.#programConfig.getFileConfig().getSubGroup(subGroupTrigger.getSubGroup());
    const programConfig = new ProgramConfig(
      this.#programConfig.getRecognizers(),
      new FileConfig(
        {
          disabledTypes: subGroup.disabledTypes,
          groups: subGroup.groups,
          subGroups: subGroup.subGroups,
          subGroupsTriggers: subGroup.subGroupsTriggers,
        },
        `${this.#programConfig.getFileConfig().getIdentifier()}.subGroups[${subGroupTrigger.getSubGroup()}]`,
      ),
      this.#programConfig.getParams(),
      this.#programConfig.getIgnoredTypes(),
    );
    const errors = new CheckOrder(subGroupTrigger.getBody(node), this.#env, programConfig).run();

    this.#errors.push(...errors);
  }
}
