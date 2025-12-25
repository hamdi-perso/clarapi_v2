import { fetchAuthSession } from 'aws-amplify/auth';

/**
 * Get current user ID, or 'anonymous' if not authenticated
 */
export async function getCurrentUserId(): Promise<string> {
  try {
    const session = await fetchAuthSession();
    const userId = session.tokens?.idToken?.payload?.sub as string | undefined;
    return userId || 'anonymous';
  } catch (error) {
    return 'anonymous';
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await fetchAuthSession();
    return !!session.tokens?.accessToken;
  } catch (error) {
    return false;
  }
}
