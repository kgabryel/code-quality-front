export function and(...fns) {
  return (path) => fns.every((fn) => fn(path));
}

export function getComposableBody(node) {
  const inner = node.type === 'ExportNamedDeclaration' ? node.declaration : node;

  return inner?.body?.body ?? [];
}

export function hasExtension(extension) {
  const ext = extension.startsWith('.') ? extension : `.${extension}`;

  return (path) => {
    return normalize(path).endsWith(ext);
  };
}

export function isFile(filename) {
  return (path) => {
    return normalize(path).endsWith(filename);
  };
}

export function isInDirectory(dir) {
  return (path) => {
    const normalized = normalize(path);

    return normalized.includes(`/${dir}/`) || normalized.startsWith(`${dir}/`);
  };
}

export function isTsFile(path) {
  return path.endsWith('.ts') && !path.endsWith('.d.ts');
}

export function isVueFile(path) {
  return path.endsWith('.vue');
}

export function matchesFile(regex) {
  return (path) => {
    const normalized = normalize(path);
    const filename = normalized.split('/').pop();

    return regex.test(filename);
  };
}

function normalize(path) {
  return path.replace(/\\/g, '/');
}

export function not(fn) {
  return (...args) => !fn(...args);
}

export function or(...fns) {
  return (path) => fns.some((fn) => fn(path));
}

export function withDot(str) {
  return `${str}.`;
}
