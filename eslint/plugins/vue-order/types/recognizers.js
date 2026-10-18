import { NodeType } from './node-types.js';

// Rozpakowuje ExportNamedDeclaration żeby obsłużyć zarówno:
//   function useX() { ... }
//   export function useX() { ... }
//   interface Props { ... }
//   export interface Props { ... }
function unwrapExport(node) {
  return node.type === 'ExportNamedDeclaration' ? node.declaration : node;
}

function getCallName(node) {
  if (node?.type !== 'CallExpression') {
    return null;
  }

  if (node.callee?.type === 'Identifier') {
    return node.callee.name;
  }

  return null;
}

function isCallExpression(node, name) {
  return getCallName(node) === name;
}

function isExpressionCall(node, name) {
  return node.type === 'ExpressionStatement' && isCallExpression(node.expression, name);
}

function isVarCall(node, name) {
  const inner = unwrapExport(node);

  if (inner?.type !== 'VariableDeclaration') {
    return false;
  }

  return isCallExpression(inner.declarations[0]?.init, name);
}

function isNamedInterface(node, interfaceName) {
  const inner = unwrapExport(node);

  return (
    (inner?.type === 'TSInterfaceDeclaration' || inner?.type === 'TSTypeAliasDeclaration') &&
    inner.id?.name === interfaceName
  );
}

function isComposable(node, type) {
  const inner = unwrapExport(node);

  if (inner?.type !== 'VariableDeclaration') {
    return false;
  }

  const decl = inner.declarations[0];
  const name = getCallName(decl?.init);

  return name != null && name.startsWith('use') && decl?.id?.type === type;
}

export const coreRecognizers = [
  // Import
  {
    priority: 10,
    test: (node) => node.type === 'ImportDeclaration',
    type: NodeType.Import,
  },

  // Nazwane interfejsy
  {
    priority: 20,
    test: (node, programConfig) => isNamedInterface(node, programConfig.getInterfaceName('state')),
    type: NodeType.StateInterface,
  },
  {
    priority: 20,
    test: (node, programConfig) => isNamedInterface(node, programConfig.getInterfaceName('props')),
    type: NodeType.PropsInterface,
  },
  {
    priority: 20,
    test: (node, programConfig) => isNamedInterface(node, programConfig.getInterfaceName('emits')),
    type: NodeType.EmitsInterface,
  },

  // Interfejsy generyczne
  {
    priority: 10,
    test: (node) => unwrapExport(node)?.type === 'TSInterfaceDeclaration',
    type: NodeType.Interface,
  },
  {
    priority: 10,
    test: (node) => unwrapExport(node)?.type === 'TSTypeAliasDeclaration',
    type: NodeType.TypeAlias,
  },

  // Vue macros
  {
    priority: 20,
    test: (node) => isVarCall(node, 'defineOptions') || isExpressionCall(node, 'defineOptions'),
    type: NodeType.DefineOptions,
  },
  {
    priority: 30,
    test: (node) => {
      const inner = unwrapExport(node);

      return inner?.type === 'VariableDeclaration' && isCallExpression(inner.declarations[0]?.init, 'withDefaults');
    },
    type: NodeType.WithDefaults,
  },
  {
    priority: 20,
    test: (node) => isVarCall(node, 'defineProps') || isExpressionCall(node, 'defineProps'),
    type: NodeType.DefineProps,
  },
  {
    priority: 20,
    test: (node) => isVarCall(node, 'defineEmits') || isExpressionCall(node, 'defineEmits'),
    type: NodeType.DefineEmits,
  },

  // ComposableInstance - bez destrukturyzacji
  {
    priority: 10,
    test: (node) => isComposable(node, 'Identifier'),
    type: NodeType.ComposableInstance,
  },

  // ComposableCall - z destrukturyzacją
  {
    priority: 10,
    test: (node) => isComposable(node, 'ObjectPattern'),
    type: NodeType.ComposableCall,
  },

  // State
  { priority: 10, test: (node) => isVarCall(node, 'ref'), type: NodeType.Ref },
  { priority: 10, test: (node) => isVarCall(node, 'shallowRef'), type: NodeType.ShallowRef },
  { priority: 10, test: (node) => isVarCall(node, 'reactive'), type: NodeType.Reactive },
  {
    priority: 10,
    test: (node) => isVarCall(node, 'shallowReactive'),
    type: NodeType.ShallowReactive,
  },

  // Computed
  { priority: 10, test: (node) => isVarCall(node, 'computed'), type: NodeType.Computed },

  // Watch
  { priority: 10, test: (node) => isExpressionCall(node, 'watch'), type: NodeType.Watch },
  {
    priority: 10,
    test: (node) => isExpressionCall(node, 'watchEffect'),
    type: NodeType.WatchEffect,
  },
  {
    priority: 10,
    test: (node) => isExpressionCall(node, 'watchPostEffect'),
    type: NodeType.WatchPostEffect,
  },
  {
    priority: 10,
    test: (node) => isExpressionCall(node, 'watchSyncEffect'),
    type: NodeType.WatchSyncEffect,
  },

  // Lifecycle
  { priority: 10, test: (node) => isExpressionCall(node, 'onMounted'), type: NodeType.OnMounted },
  {
    priority: 10,
    test: (node) => isExpressionCall(node, 'onUnmounted'),
    type: NodeType.OnUnmounted,
  },
  {
    priority: 10,
    test: (node) => isExpressionCall(node, 'onBeforeMount'),
    type: NodeType.OnBeforeMount,
  },
  {
    priority: 10,
    test: (node) => isExpressionCall(node, 'onBeforeUnmount'),
    type: NodeType.OnBeforeUnmount,
  },
  { priority: 10, test: (node) => isExpressionCall(node, 'onUpdated'), type: NodeType.OnUpdated },
  {
    priority: 10,
    test: (node) => isExpressionCall(node, 'onBeforeUpdate'),
    type: NodeType.OnBeforeUpdate,
  },
  {
    priority: 10,
    test: (node) => isExpressionCall(node, 'onActivated'),
    type: NodeType.OnActivated,
  },
  {
    priority: 10,
    test: (node) => isExpressionCall(node, 'onDeactivated'),
    type: NodeType.OnDeactivated,
  },
  {
    priority: 10,
    test: (node) => isExpressionCall(node, 'onErrorCaptured'),
    type: NodeType.OnErrorCaptured,
  },
  {
    priority: 10,
    test: (node) => isExpressionCall(node, 'onRenderTracked'),
    type: NodeType.OnRenderTracked,
  },
  {
    priority: 10,
    test: (node) => isExpressionCall(node, 'onRenderTriggered'),
    type: NodeType.OnRenderTriggered,
  },

  // Actions
  {
    priority: 10,
    test: (node) => {
      const inner = unwrapExport(node);

      return inner?.type === 'FunctionDeclaration';
    },
    type: NodeType.Function,
  },
  {
    priority: 10,
    test: (node) => {
      const inner = unwrapExport(node);

      return inner?.type === 'VariableDeclaration' && inner.declarations[0]?.init?.type === 'ArrowFunctionExpression';
    },
    type: NodeType.ArrowFunction,
  },

  // Fallbacki
  {
    priority: 5,
    test: (node) => unwrapExport(node)?.type === 'VariableDeclaration',
    type: NodeType.Const,
  },

  // Globalne
  { priority: 0, test: (node) => node.type === 'ReturnStatement', type: NodeType.Return },
  { priority: 0, test: (node) => node.type === 'IfStatement', type: NodeType.IfStatement },
  { priority: 0, test: (node) => node.type === 'ForOfStatement', type: NodeType.ForOfStatement },
  { priority: 0, test: (node) => node.type === 'ForInStatement', type: NodeType.ForInStatement },
  { priority: 0, test: (node) => node.type === 'ForStatement', type: NodeType.ForStatement },
  { priority: 0, test: (node) => node.type === 'WhileStatement', type: NodeType.WhileStatement },
  {
    priority: 0,
    test: (node) => node.type === 'DoWhileStatement',
    type: NodeType.DoWhileStatement,
  },
  { priority: 0, test: (node) => node.type === 'TryStatement', type: NodeType.TryStatement },
  { priority: 0, test: (node) => node.type === 'ThrowStatement', type: NodeType.ThrowStatement },
  { priority: 0, test: (node) => node.type === 'SwitchStatement', type: NodeType.SwitchStatement },
  {
    priority: 0,
    test: (node) => node.type === 'LabeledStatement',
    type: NodeType.LabeledStatement,
  },
  { priority: 0, test: (node) => node.type === 'BlockStatement', type: NodeType.BlockStatement },
  { priority: 0, test: (node) => node.type === 'BreakStatement', type: NodeType.BreakStatement },
  {
    priority: 0,
    test: (node) => node.type === 'ContinueStatement',
    type: NodeType.ContinueStatement,
  },
  { priority: 0, test: (node) => node.type === 'EmptyStatement', type: NodeType.EmptyStatement },
  { priority: 0, test: (node) => node.type === 'WithStatement', type: NodeType.WithStatement },
  {
    priority: 0,
    test: (node) => node.type === 'DebuggerStatement',
    type: NodeType.DebuggerStatement,
  },
  {
    priority: 0,
    test: (node) => node.type === 'ExpressionStatement',
    type: NodeType.Expression,
  },
];

export function buildFinalRecognizers(registeredTypes, ignoredTypes, allRecognizers) {
  const typeSet = new Set([...registeredTypes, ...ignoredTypes]);

  return allRecognizers.filter((r) => typeSet.has(r.type)).sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
}

export function recognizeNode(node, recognizers, programConfig) {
  for (const recognizer of recognizers) {
    if (recognizer.test(node, programConfig)) {
      return recognizer.type;
    }
  }

  return null;
}
