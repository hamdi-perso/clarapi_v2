"use client";

import { useState, useMemo } from 'react';
import { FileText, Trash2, MoreVertical, ChevronRight, ChevronDown, Eye } from 'lucide-react';
import { useApiSpecs } from '@/contexts/api-specs-context';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ApiTreeView } from './api-tree-view';
import { ViewSpecModal } from './view-spec-modal';
import { buildApiTree } from '@/lib/parser/openapi-tree';
import type { ApiSpecRecord } from '@/lib/db/schema';

export function ApiList() {
  const { specs, loading, deleteSpec } = useApiSpecs();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [expandedApiId, setExpandedApiId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [viewSpec, setViewSpec] = useState<ApiSpecRecord | null>(null);

  // Build trees for all specs
  const apiTrees = useMemo(() => {
    return specs.reduce((acc, spec) => {
      acc[spec.id] = buildApiTree(spec.content, spec.format);
      return acc;
    }, {} as Record<string, any[]>);
  }, [specs]);

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirm({ id, name });
    setOpenMenuId(null);
  };

  const handleViewClick = (spec: ApiSpecRecord) => {
    setViewSpec(spec);
    setOpenMenuId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteSpec(deleteConfirm.id);
    } catch (error) {
      console.error('Failed to delete API spec:', error);
    }
  };

  if (loading) {
    return (
      <div className="px-3 py-2 text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (specs.length === 0) {
    return (
      <div className="px-3 py-8 text-center">
        <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
        <p className="text-sm text-muted-foreground">No APIs imported</p>
        <p className="text-xs text-muted-foreground mt-1">
          Click Import to add one
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-1">
        {specs.map((spec) => {
          const isExpanded = expandedApiId === spec.id;
          const tree = apiTrees[spec.id] || [];

          return (
            <div key={spec.id} className="group relative">
              {/* API Header */}
              <div
                className="flex items-center gap-2 px-3 py-2 hover:bg-secondary rounded-lg transition-colors cursor-pointer"
                onClick={() => setExpandedApiId(isExpanded ? null : spec.id)}
              >
                {/* Chevron */}
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>

                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{spec.name}</p>
                  {spec.syncStatus === 'pending' && (
                    <p className="text-xs text-yellow-500">Syncing...</p>
                  )}
                  {spec.syncStatus === 'error' && (
                    <p className="text-xs text-red-500">Sync error</p>
                  )}
                </div>

                {/* Three-dot menu button with relative positioning */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === spec.id ? null : spec.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Context Menu */}
                  {openMenuId === spec.id && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenMenuId(null)}
                      />

                      {/* Menu */}
                      <div className="absolute right-0 top-full mt-1 w-40 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-20">
                        <button
                          onClick={() => handleViewClick(spec)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteClick(spec.id, spec.name)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2 text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Tree View */}
              {isExpanded && (
                <div className="ml-4 mt-1">
                  <ApiTreeView tree={tree} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete API Specification"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* View Spec Modal */}
      <ViewSpecModal
        isOpen={viewSpec !== null}
        onClose={() => setViewSpec(null)}
        spec={viewSpec}
      />
    </>
  );
}
