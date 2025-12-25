"use client";

import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import type { TreeNode } from '@/lib/parser/openapi-tree';
import { getMethodColor } from '@/lib/parser/openapi-tree';

interface TreeNodeProps {
  node: TreeNode;
  level: number;
}

function TreeNodeComponent({ node, level }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false); // Collapsed by default
  const hasChildren = node.children && node.children.length > 0;
  const isFolder = node.type === 'folder';
  const isEndpoint = node.type === 'endpoint';

  const handleToggle = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  // Folder node
  if (isFolder) {
    return (
      <div>
        <div
          className="flex items-center gap-1.5 py-1.5 px-2 hover:bg-secondary/50 rounded-md cursor-pointer group transition-colors"
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={handleToggle}
        >
          {/* Chevron */}
          <div className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0">
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </div>

          {/* Folder Icon */}
          <div className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0">
            {isExpanded ? (
              <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <Folder className="w-3.5 h-3.5 text-amber-500" />
            )}
          </div>

          {/* Folder Name */}
          <span className="text-xs font-medium truncate flex-1 text-foreground">
            {node.name}
          </span>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map((child, idx) => (
              <TreeNodeComponent key={idx} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Endpoint node (leaf)
  if (isEndpoint && node.method) {
    return (
      <div
        className="flex items-center gap-2 py-1.5 px-2 hover:bg-secondary/50 rounded-md cursor-pointer group transition-colors"
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        title={node.summary || node.operationId || ''}
      >
        {/* Method Badge */}
        <span className={`
          px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase
          flex-shrink-0 w-14 text-center
          ${getMethodColor(node.method)}
        `}>
          {node.method}
        </span>

        {/* Path */}
        <span className="text-xs font-mono text-muted-foreground truncate flex-1">
          {node.path}
        </span>
      </div>
    );
  }

  return null;
}

interface ApiTreeViewProps {
  tree: TreeNode[];
}

export function ApiTreeView({ tree }: ApiTreeViewProps) {
  if (tree.length === 0) {
    return (
      <div className="px-4 py-2 text-xs text-muted-foreground">
        No endpoints found
      </div>
    );
  }

  return (
    <div className="py-1">
      {tree.map((node, idx) => (
        <TreeNodeComponent key={idx} node={node} level={0} />
      ))}
    </div>
  );
}
