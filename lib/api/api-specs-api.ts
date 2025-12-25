import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

export interface RemoteApiSpec {
  id: string;
  name: string;
  fileName: string;
  content: string;
  format: string;
  specVersion?: string | null;
  createdAt: string;
  updatedAt: string;
  owner?: string;
}

/**
 * Fetch all API specs from AppSync
 */
export async function fetchRemoteApiSpecs(): Promise<RemoteApiSpec[]> {
  try {
    const { data, errors } = await client.models.ApiSpec.list();

    if (errors) {
      console.error('[API] Error fetching API specs:', errors);
      throw new Error(errors[0].message);
    }

    return data as RemoteApiSpec[];
  } catch (error) {
    console.error('[API] Failed to fetch API specs:', error);
    throw error;
  }
}

/**
 * Create or update API spec in AppSync
 */
export async function saveRemoteApiSpec(
  name: string,
  fileName: string,
  content: string,
  format: string,
  specVersion?: string,
  id?: string
): Promise<RemoteApiSpec> {
  try {
    if (id) {
      // Update existing
      const { data, errors } = await client.models.ApiSpec.update({
        id,
        name,
        fileName,
        content,
        format,
        specVersion,
      });

      if (errors) {
        console.error('[API] Error updating API spec:', errors);
        throw new Error(errors[0].message);
      }

      return data as RemoteApiSpec;
    } else {
      // Create new
      const { data, errors } = await client.models.ApiSpec.create({
        name,
        fileName,
        content,
        format,
        specVersion,
      });

      if (errors) {
        console.error('[API] Error creating API spec:', errors);
        throw new Error(errors[0].message);
      }

      return data as RemoteApiSpec;
    }
  } catch (error) {
    console.error('[API] Failed to save API spec:', error);
    throw error;
  }
}

/**
 * Delete API spec from AppSync
 */
export async function deleteRemoteApiSpec(id: string): Promise<void> {
  try {
    const { errors } = await client.models.ApiSpec.delete({ id });

    if (errors) {
      console.error('[API] Error deleting API spec:', errors);
      throw new Error(errors[0].message);
    }
  } catch (error) {
    console.error('[API] Failed to delete API spec:', error);
    throw error;
  }
}
