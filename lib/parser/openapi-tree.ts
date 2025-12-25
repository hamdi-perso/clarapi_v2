import yaml from 'js-yaml';

export interface TreeNode {
  name: string;
  type: 'folder' | 'endpoint';
  path?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  summary?: string;
  operationId?: string;
  children?: TreeNode[];
}

/**
 * Parse OpenAPI spec and build tree structure
 */
export function buildApiTree(content: string, format: 'json' | 'yaml'): TreeNode[] {
  let spec: any;

  try {
    spec = format === 'json' ? JSON.parse(content) : yaml.load(content);
  } catch (error) {
    console.error('Failed to parse spec:', error);
    return [];
  }

  if (!spec.paths) {
    return [];
  }

  const root: TreeNode[] = [];

  // Process each path
  Object.entries(spec.paths).forEach(([path, pathItem]: [string, any]) => {
    // Extract methods for this path
    const methods: Array<{ method: string; summary?: string; operationId?: string }> = [];
    ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'].forEach((method) => {
      if (pathItem[method]) {
        methods.push({
          method: method.toUpperCase(),
          summary: pathItem[method].summary,
          operationId: pathItem[method].operationId,
        });
      }
    });

    // Split path into segments
    const segments = path.split('/').filter(Boolean);

    // Build tree
    let currentLevel = root;

    segments.forEach((segment, index) => {
      const isLastSegment = index === segments.length - 1;

      // Check if folder node already exists
      let folderNode = currentLevel.find((n) => n.name === segment && n.type === 'folder');

      if (!folderNode) {
        folderNode = {
          name: segment,
          type: 'folder',
          children: [],
        };
        currentLevel.push(folderNode);
      }

      if (isLastSegment) {
        // Add endpoint nodes for each method
        methods.forEach((methodInfo) => {
          const endpointNode: TreeNode = {
            name: `${methodInfo.method} ${path}`,
            type: 'endpoint',
            path: path,
            method: methodInfo.method as any,
            summary: methodInfo.summary,
            operationId: methodInfo.operationId,
          };
          folderNode!.children!.push(endpointNode);
        });
      } else {
        currentLevel = folderNode.children!;
      }
    });
  });

  return root;
}

/**
 * Get HTTP method color for display
 */
export function getMethodColor(method: string): string {
  switch (method) {
    case 'GET':
      return 'text-blue-500 bg-blue-500/10';
    case 'POST':
      return 'text-green-500 bg-green-500/10';
    case 'PUT':
      return 'text-yellow-600 bg-yellow-500/10';
    case 'DELETE':
      return 'text-red-500 bg-red-500/10';
    case 'PATCH':
      return 'text-orange-500 bg-orange-500/10';
    case 'HEAD':
      return 'text-purple-500 bg-purple-500/10';
    case 'OPTIONS':
      return 'text-gray-500 bg-gray-500/10';
    default:
      return 'text-gray-500 bg-gray-500/10';
  }
}
