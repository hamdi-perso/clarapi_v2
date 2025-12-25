"use client";

import { useState, useRef, useCallback } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { validateFile, detectFormat, type ValidationResult } from '@/lib/validation/openapi-validator';
import { useApiSpecs } from '@/contexts/api-specs-context';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const { importSpec } = useApiSpecs();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await handleFileSelect(e.target.files[0]);
    }
  }, []);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setValidation(null);
    setValidating(true);

    try {
      const result = await validateFile(selectedFile);
      setValidation(result);
    } catch (error: any) {
      setValidation({
        valid: false,
        errors: [error.message || 'Failed to validate file'],
        warnings: [],
      });
    } finally {
      setValidating(false);
    }
  };

  const handleImport = async () => {
    if (!file || !validation?.valid) return;

    setImporting(true);

    try {
      // Read file content
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
      });

      const format = detectFormat(content);

      // Import
      await importSpec(
        validation.name || file.name,
        file.name,
        content,
        format,
        validation.version
      );

      // Close modal
      handleClose();
    } catch (error: any) {
      setValidation({
        ...validation,
        valid: false,
        errors: [error.message || 'Failed to import specification'],
      });
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setValidation(null);
    setDragActive(false);
    setValidating(false);
    setImporting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Import API Specification</h2>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".json,.yaml,.yml"
              onChange={handleChange}
              className="hidden"
            />

            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />

            <p className="text-lg font-medium mb-2">
              {file ? file.name : 'Drop your OpenAPI file here'}
            </p>

            <p className="text-sm text-muted-foreground mb-4">
              or
            </p>

            <button
              onClick={() => inputRef.current?.click()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Browse Files
            </button>

            <p className="text-xs text-muted-foreground mt-4">
              Supports: JSON, YAML, YML (OpenAPI 2.0 & 3.x, Swagger)
            </p>
          </div>

          {/* Validation Status */}
          {validating && (
            <div className="mt-6 flex items-center gap-3 p-4 bg-muted rounded-lg">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Validating specification...</span>
            </div>
          )}

          {/* Validation Results */}
          {validation && !validating && (
            <div className="mt-6 space-y-4">
              {/* Success */}
              {validation.valid && (
                <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-green-500">Valid Specification</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {validation.name} (v{validation.version})
                    </p>
                  </div>
                </div>
              )}

              {/* Errors */}
              {validation.errors.length > 0 && (
                <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-red-500 mb-1">
                      {validation.errors.length} Error{validation.errors.length > 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-red-400 mb-2">Cannot import - fix these errors first</p>
                    <ul className="text-sm space-y-1">
                      {validation.errors.map((error, i) => (
                        <li key={i} className="text-red-400">• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Warnings */}
              {validation.warnings.length > 0 && (
                <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-yellow-500 mb-1">
                      {validation.warnings.length} Warning{validation.warnings.length > 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-yellow-400 mb-2">You can still import, but review these warnings</p>
                    <ul className="text-sm space-y-1">
                      {validation.warnings.map((warning, i) => (
                        <li key={i} className="text-yellow-400">• {warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={handleClose}
            disabled={importing}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!validation?.valid || importing}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {importing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Import
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
