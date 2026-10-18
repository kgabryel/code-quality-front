import { and, getComposableBody, isInDirectory, isTsFile, isVueFile, matchesFile } from './helpers.js';
import { BlankLine } from './types/blank-line.js';
import { NodeType } from './types/node-types.js';

const interfaceTypes = [
  NodeType.StateInterface,
  NodeType.PropsInterface,
  NodeType.EmitsInterface,
  NodeType.Interface,
  NodeType.TypeAlias,
];

const stateTypes = [NodeType.Ref, NodeType.ShallowRef, NodeType.Reactive, NodeType.ShallowReactive];

const watchTypes = [NodeType.Watch, NodeType.WatchEffect, NodeType.WatchPostEffect, NodeType.WatchSyncEffect];

const lifecycleTypes = [
  NodeType.OnMounted,
  NodeType.OnUnmounted,
  NodeType.OnBeforeMount,
  NodeType.OnBeforeUnmount,
  NodeType.OnUpdated,
  NodeType.OnBeforeUpdate,
  NodeType.OnActivated,
  NodeType.OnDeactivated,
  NodeType.OnErrorCaptured,
  NodeType.OnRenderTracked,
  NodeType.OnRenderTriggered,
];

const params = {
  interfaceNames: {
    state: 'State',
    props: 'Props',
    emits: 'Emits',
  },
  allowUnmatchedFiles: true,
  allowUnrecognizedNodes: false,
  allowUnassignedNodes: false,
  disableWarnings: false,
};

const customRecognizers = [];

const vue = {
  identifier: 'vue',
  recognizeFile: isVueFile,
  registeredRecognizers: [
    NodeType.Import,
    ...interfaceTypes,
    NodeType.WithDefaults,
    NodeType.DefineProps,
    NodeType.DefineEmits,
    NodeType.ComposableInstance,
    NodeType.ComposableCall,
    NodeType.Const,
    ...stateTypes,
    NodeType.Computed,
    ...watchTypes,
    ...lifecycleTypes,
    NodeType.Function,
    NodeType.ArrowFunction,
    NodeType.DefineOptions,
  ],
  disabledTypes: [NodeType.ArrowFunction],
  groups: [
    {
      name: 'import',
      comment: null,
      blankLine: BlankLine.NO,
      types: [{ type: NodeType.Import, blankLine: BlankLine.NO }],
    },
    {
      name: 'interfaces',
      comment: 'interfaces',
      blankLine: BlankLine.YES,
      types: [
        { type: NodeType.StateInterface, blankLine: BlankLine.NO },
        { type: NodeType.PropsInterface, blankLine: BlankLine.NO },
        { type: NodeType.EmitsInterface, blankLine: BlankLine.NO },
        { type: NodeType.Interface, blankLine: BlankLine.ONCE },
        { type: NodeType.TypeAlias, blankLine: BlankLine.ONCE },
      ],
    },
    {
      name: 'setup',
      comment: 'setup',
      blankLine: BlankLine.YES,
      types: [
        { type: NodeType.DefineOptions, blankLine: BlankLine.ONCE },
        { type: NodeType.WithDefaults, blankLine: BlankLine.NO },
        { type: NodeType.DefineProps, blankLine: BlankLine.NO },
        { type: NodeType.DefineEmits, blankLine: BlankLine.NO },
        { type: NodeType.ComposableInstance, blankLine: BlankLine.ONCE },
        { type: NodeType.Const, blankLine: BlankLine.ONCE },
      ],
    },
    {
      name: 'state',
      comment: 'state',
      blankLine: BlankLine.YES,
      types: stateTypes.map((type) => ({ type, blankLine: BlankLine.ONCE })),
    },
    {
      name: 'composables',
      comment: 'composables',
      blankLine: BlankLine.YES,
      types: [{ type: NodeType.ComposableCall, blankLine: BlankLine.NO }],
    },
    {
      name: 'computed',
      comment: 'computed',
      blankLine: BlankLine.YES,
      types: [{ type: NodeType.Computed, blankLine: BlankLine.ALL }],
    },
    {
      name: 'watch',
      comment: 'watch',
      blankLine: BlankLine.YES,
      types: watchTypes.map((type) => ({ type, blankLine: BlankLine.ALL })),
    },
    {
      name: 'lifecycle',
      comment: 'lifecycle',
      blankLine: BlankLine.YES,
      types: lifecycleTypes.map((type) => ({ type, blankLine: BlankLine.ALL })),
    },
    {
      name: 'actions',
      comment: 'actions',
      blankLine: BlankLine.YES,
      types: [{ type: NodeType.Function, blankLine: BlankLine.ALL }],
    },
  ],
};

const composableFile = {
  identifier: 'composableFile',
  recognizeFile: and(isTsFile, isInDirectory('composables'), matchesFile(/^use[A-Z]/)),
  registeredRecognizers: [
    NodeType.Import,
    ...interfaceTypes,
    NodeType.Function,
    NodeType.Const,
    ...stateTypes,
    NodeType.ComposableInstance,
    NodeType.ComposableCall,
    NodeType.Computed,
    ...watchTypes,
    ...lifecycleTypes,
    NodeType.ArrowFunction,
  ],
  groups: [
    {
      name: 'import',
      comment: null,
      blankLine: BlankLine.NO,
      types: [{ type: NodeType.Import, blankLine: BlankLine.NO }],
    },
    {
      name: 'interfaces',
      comment: null,
      blankLine: BlankLine.YES,
      types: [
        { type: NodeType.StateInterface, blankLine: BlankLine.NO },
        { type: NodeType.PropsInterface, blankLine: BlankLine.NO },
        { type: NodeType.EmitsInterface, blankLine: BlankLine.NO },
        { type: NodeType.Interface, blankLine: BlankLine.ONCE },
        { type: NodeType.TypeAlias, blankLine: BlankLine.ONCE },
      ],
    },
    {
      name: 'state',
      comment: null,
      blankLine: BlankLine.YES,
      types: [{ type: NodeType.Ref, blankLine: BlankLine.NO }],
    },
    {
      name: 'composableFunction',
      comment: null,
      blankLine: BlankLine.YES,
      types: [{ type: NodeType.Function, blankLine: BlankLine.NO }],
    },
  ],
  subGroupsTriggers: [
    {
      nodeType: NodeType.Function,
      subGroup: 'composableBody',
      getBody: getComposableBody,
    },
  ],
  subGroups: {
    composableBody: {
      groups: [
        {
          name: 'setup',
          comment: 'setup',
          blankLine: BlankLine.YES,
          types: [
            { type: NodeType.ComposableInstance, blankLine: BlankLine.ONCE },
            { type: NodeType.Const, blankLine: BlankLine.NO },
          ],
        },
        {
          name: 'state',
          comment: 'state',
          blankLine: BlankLine.YES,
          types: stateTypes.map((type) => ({ type, blankLine: BlankLine.ONCE })),
        },
        {
          name: 'composables',
          comment: 'composables',
          blankLine: BlankLine.YES,
          types: [{ type: NodeType.ComposableCall, blankLine: BlankLine.NO }],
        },
        {
          name: 'computed',
          comment: 'computed',
          blankLine: BlankLine.YES,
          types: [{ type: NodeType.Computed, blankLine: BlankLine.ALL }],
        },
        {
          name: 'watch',
          comment: 'watch',
          blankLine: BlankLine.YES,
          types: watchTypes.map((type) => ({ type, blankLine: BlankLine.ALL })),
        },
        {
          name: 'lifecycle',
          comment: 'lifecycle',
          blankLine: BlankLine.YES,
          types: lifecycleTypes.map((type) => ({ type, blankLine: BlankLine.ALL })),
        },
        {
          name: 'actions',
          comment: 'actions',
          blankLine: BlankLine.YES,
          types: [
            { type: NodeType.Function, blankLine: BlankLine.ALL },
            { type: NodeType.ArrowFunction, blankLine: BlankLine.ONCE },
          ],
        },
      ],
    },
  },
};

const configs = [vue, composableFile];
const ignoredTypes = [
  NodeType.Return,
  NodeType.IfStatement,
  NodeType.ForOfStatement,
  NodeType.ForInStatement,
  NodeType.ForStatement,
  NodeType.WhileStatement,
  NodeType.DoWhileStatement,
  NodeType.TryStatement,
  NodeType.ThrowStatement,
  NodeType.SwitchStatement,
  NodeType.LabeledStatement,
  NodeType.BlockStatement,
  NodeType.BreakStatement,
  NodeType.ContinueStatement,
  NodeType.EmptyStatement,
  NodeType.WithStatement,
  NodeType.DebuggerStatement,
];

export const vueOrderConfig = {
  params,
  customRecognizers,
  configs,
  ignoredTypes,
};
