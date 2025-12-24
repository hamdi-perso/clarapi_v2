import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

export interface RemoteApiKey {
  id: string;
  provider: string;
  apiKey: string;
  createdAt: string;
  updatedAt: string;
  owner?: string;
}

/**
 * Fetch all API keys from AppSync
 */
export async function fetchRemoteApiKeys(): Promise<RemoteApiKey[]> {
  try {
    const { data, errors } = await client.models.UserApiKey.list();

    if (errors) {
      console.error('[API] Error fetching API keys:', errors);
      throw new Error(errors[0].message);
    }

    return data as RemoteApiKey[];
  } catch (error) {
    console.error('[API] Failed to fetch API keys:', error);
    throw error;
  }
}

/**
 * Create or update API key in AppSync
 */
export async function saveRemoteApiKey(provider: string, apiKey: string, id?: string): Promise<RemoteApiKey> {
  try {
    if (id) {
      // Update existing
      const { data, errors } = await client.models.UserApiKey.update({
        id,
        apiKey,
      });

      if (errors) {
        console.error('[API] Error updating API key:', errors);
        throw new Error(errors[0].message);
      }

      return data as RemoteApiKey;
    } else {
      // Create new
      const { data, errors } = await client.models.UserApiKey.create({
        provider,
        apiKey,
      });

      if (errors) {
        console.error('[API] Error creating API key:', errors);
        throw new Error(errors[0].message);
      }

      return data as RemoteApiKey;
    }
  } catch (error) {
    console.error('[API] Failed to save API key:', error);
    throw error;
  }
}

/**
 * Delete API key from AppSync
 */
export async function deleteRemoteApiKey(id: string): Promise<void> {
  try {
    const { errors } = await client.models.UserApiKey.delete({ id });

    if (errors) {
      console.error('[API] Error deleting API key:', errors);
      throw new Error(errors[0].message);
    }
  } catch (error) {
    console.error('[API] Failed to delete API key:', error);
    throw error;
  }
}
