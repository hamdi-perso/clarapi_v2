"use client";

import { useState } from 'react';
import { FileText, Trash2, MoreVertical } from 'lucide-react';
import { useApiSpecs } from '@/contexts/api-specs-context';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export function ApiList() {
  const { specs, loading, deleteSpec } = useApiSpecs();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirm({ id, name });
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
        {specs.map((spec) => (
        <div
          key={spec.id}
          className="group relative"
        >
          <div className="flex items-center gap-2 px-3 py-2 hover:bg-secondary rounded-lg transition-colors cursor-pointer">
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

            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId(openMenuId === spec.id ? null : spec.id);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          {/* Context Menu */}
          {openMenuId === spec.id && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setOpenMenuId(null)}
              />

              {/* Menu */}
              <div className="absolute right-2 top-full mt-1 w-40 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-20">
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
      ))}
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
    </>
  );
}
