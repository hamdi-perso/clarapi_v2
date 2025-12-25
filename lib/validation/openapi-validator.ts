import * as yaml from 'js-yaml';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  spec?: any;
  version?: string;
  name?: string;
}

/**
 * Parse YAML content to JSON
 */
function parseYAML(content: string): any {
  try {
    return yaml.load(content);
  } catch (error: any) {
    throw new Error(`YAML parsing error: ${error.message}`);
  }
}

/**
 * Parse JSON content
 */
function parseJSON(content: string): any {
  try {
    return JSON.parse(content);
  } catch (error: any) {
    throw new Error(`JSON parsing error: ${error.message}`);
  }
}

/**
 * Detect if content is JSON or YAML
 */
export function detectFormat(content: string): 'json' | 'yaml' {
  const trimmed = content.trim();

  // Try to detect JSON
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return 'json';
  }

  // Otherwise assume YAML
  return 'yaml';
}

/**
 * Validate OpenAPI/Swagger specification
 */
export function validateOpenAPI(content: string, format: 'json' | 'yaml'): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Parse content based on format
    let spec: any;
    try {
      spec = format === 'json' ? parseJSON(content) : parseYAML(content);
    } catch (error: any) {
      return {
        valid: false,
        errors: [error.message],
        warnings: [],
      };
    }

    // Check if it's an object
    if (typeof spec !== 'object' || spec === null) {
      errors.push('Specification must be a JSON object');
      return { valid: false, errors, warnings };
    }

    // Detect version
    let version: string | undefined;
    let isSwagger = false;
    let isOpenAPI = false;

    if (spec.swagger) {
      // Swagger 2.0
      version = spec.swagger;
      isSwagger = true;

      if (typeof version === 'string' && !version.startsWith('2.')) {
        warnings.push(`Unexpected Swagger version: ${version}`);
      }
    } else if (spec.openapi) {
      // OpenAPI 3.x
      version = spec.openapi;
      isOpenAPI = true;

      if (typeof version === 'string' && !version.startsWith('3.')) {
        warnings.push(`Unexpected OpenAPI version: ${version}`);
      }
    } else {
      errors.push('Missing "swagger" or "openapi" version field');
      return { valid: false, errors, warnings };
    }

    // Validate required fields
    if (!spec.info) {
      errors.push('Missing required "info" object');
    } else {
      if (!spec.info.title) {
        errors.push('Missing required "info.title" field');
      }
      if (!spec.info.version) {
        errors.push('Missing required "info.version" field');
      }
    }

    if (!spec.paths && !spec.components) {
      errors.push('Missing "paths" object (no endpoints defined)');
    }

    // Swagger 2.0 specific validation
    if (isSwagger) {
      if (!spec.host && !spec.basePath) {
        warnings.push('Missing "host" or "basePath" field');
      }
    }

    // OpenAPI 3.x specific validation
    if (isOpenAPI) {
      if (!spec.servers && !spec.paths) {
        warnings.push('Missing "servers" array');
      }
    }

    // Check for paths
    if (spec.paths && typeof spec.paths === 'object') {
      const pathCount = Object.keys(spec.paths).length;
      if (pathCount === 0) {
        warnings.push('No endpoints defined in "paths"');
      }
    }

    const valid = errors.length === 0;
    const name = spec.info?.title || 'Unnamed API';

    return {
      valid,
      errors,
      warnings,
      spec: valid ? spec : undefined,
      version,
      name,
    };
  } catch (error: any) {
    return {
      valid: false,
      errors: [`Unexpected error: ${error.message}`],
      warnings: [],
    };
  }
}

/**
 * Read file content from File object
 */
export function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        resolve(content);
      } else {
        reject(new Error('Failed to read file as text'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Validate file (read + validate)
 */
export async function validateFile(file: File): Promise<ValidationResult> {
  try {
    // Check file extension
    const fileName = file.name.toLowerCase();
    const isJSON = fileName.endsWith('.json');
    const isYAML = fileName.endsWith('.yaml') || fileName.endsWith('.yml');

    if (!isJSON && !isYAML) {
      return {
        valid: false,
        errors: ['File must be .json, .yaml, or .yml'],
        warnings: [],
      };
    }

    // Read file content
    const content = await readFileContent(file);

    // Detect format (fallback to extension)
    const detectedFormat = detectFormat(content);
    const format = isJSON ? 'json' : isYAML ? 'yaml' : detectedFormat;

    // Validate
    return validateOpenAPI(content, format);
  } catch (error: any) {
    return {
      valid: false,
      errors: [error.message],
      warnings: [],
    };
  }
}
