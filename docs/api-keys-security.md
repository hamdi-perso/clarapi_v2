# API Keys Security Documentation

## Overview

This document explains how API keys are encrypted, stored, and transmitted in Clarapi.

## Security Flow

### 1. When Saving an API Key

```
User input: "sk-ant-1234567890abcdef"
    ↓
[Client-side Encryption]
    ↓
Encrypted key: "aB3xK9mP... (base64)"
    ↓
[Local Storage (IndexedDB)]
    ↓
[Sync to AppSync/Cloud]
```

**Encryption Details** (`lib/crypto/encryption.ts`):
- **Algorithm**: AES-GCM (256-bit)
- **Encryption Key**: Derived from `userId` (from Cognito) via SHA-256
- **IV (Initialization Vector)**: Random for each encryption (12 bytes)
- **Storage Format**: `base64(IV + encrypted_data)`

### 2. Local Storage (IndexedDB)

Keys are stored **encrypted** in browser/Tauri:

```javascript
{
  id: "abc123",
  provider: "anthropic",
  apiKey: "aB3xK9mP8qL2nR...",  // ← ENCRYPTED
  syncStatus: "synced",
  updatedAt: 1234567890
}
```

**Database Schema** (`lib/db/schema.ts`):
- Store name: `apiKeys`
- Indexes: `provider` (unique), `syncStatus`
- Version: 3

### 3. Transmission to AppSync

Sync flow to cloud:
```
IndexedDB (encrypted)
    ↓ HTTPS (TLS 1.2+)
AppSync GraphQL API
    ↓ Cognito Auth (JWT)
DynamoDB (encrypted)
```

**Security Layers**:
- **Transport**: HTTPS (TLS 1.2+)
- **Authentication**: Cognito User Pool token (JWT)
- **Authorization**: Owner-based (users see only their keys)
- **Payload**: Key is **already encrypted** client-side

**GraphQL Model** (`amplify/data/resource.ts`):
```typescript
UserApiKey {
  id: ID
  provider: String
  apiKey: String  // Encrypted
  owner: String   // Auto-added by Cognito
  createdAt: AWSDateTime
  updatedAt: AWSDateTime
}
```

### 4. Display in UI

In the interface, you see: `••••••••••••`

**Why?**
- Key is **encrypted** in IndexedDB
- Cannot partially mask an encrypted key (e.g., `aB3x...xyz`)
- Only show bullets `••••••••••••` for consistency

### 5. When Editing

When clicking "Edit":
```
[Fetch from IndexedDB] → Encrypted key
    ↓
[Client-side Decryption]
    ↓ Uses derived key (userId)
    ↓
"sk-ant-1234567890abcdef" ← Plaintext key
    ↓
[Display in input (if visible)]
```

## Complete Security Flow

```
┌─────────────────────────────────────────────────┐
│  User enters "sk-ant-abc123"                    │
└────────────────┬────────────────────────────────┘
                 ↓
         [Encrypt with userId]
                 ↓
         "x9K2mP8qL..."  (encrypted)
                 ↓
    ┌────────────┴────────────┐
    ↓                         ↓
[IndexedDB]              [AppSync]
 (local)                  (cloud)
    ↓                         ↓
Encrypted               Encrypted
    ↓                         ↓
    └────────────┬────────────┘
                 ↓
         [Decrypt with userId]
                 ↓
         "sk-ant-abc123"  (for usage)
```

## Offline-First Architecture

### Sync Strategy

1. **Local-first**: All changes saved to IndexedDB immediately
2. **Background sync**: Automatic sync to AppSync when online
3. **Conflict resolution**: Last-write-wins
4. **Sync status tracking**: `pending`, `synced`, `error`

### Sync Service (`lib/sync/api-keys-sync.ts`)

**Upload (syncToRemote)**:
- Finds keys with `syncStatus: 'pending'`
- Uploads to AppSync (already encrypted)
- Updates `syncStatus: 'synced'`

**Download (syncFromRemote)**:
- Fetches all keys from AppSync
- Compares timestamps
- Updates local if remote is newer

**Full Sync**:
1. Upload local changes first
2. Download remote changes
3. Auto-triggers on:
   - Component mount
   - Coming back online
   - After saving/deleting

## Security Assessment

### ✅ What is Secure

- **Encryption at rest**: Keys encrypted in IndexedDB + DynamoDB
- **Encryption in transit**: HTTPS for all communications
- **Client-side encryption**: Server never sees plaintext keys
- **User isolation**: Owner-based authorization (Cognito)
- **No third-party access**: Only user can decrypt their keys

### ⚠️ Current Limitations

1. **Encryption key derivation**:
   - Key derived from `userId` (predictable)
   - No additional password/salt

2. **Local access**:
   - Anyone with device access + userId can decrypt
   - No master password protection

3. **Key rotation**:
   - No automatic key rotation
   - Manual process required

4. **Audit trail**:
   - No logging of key access/usage
   - Limited monitoring capabilities

### 🔒 Potential Improvements

1. **Master Password**:
   ```typescript
   // Derive key from master password instead of userId
   const key = await deriveKey(masterPassword + userId + salt);
   ```

2. **Unique Salt Per User**:
   ```typescript
   // Store salt in AppSync, use for key derivation
   const salt = crypto.getRandomValues(new Uint8Array(32));
   ```

3. **AWS KMS Integration**:
   - Use AWS Key Management Service for encryption
   - Hardware security module (HSM) backed keys
   - Automatic key rotation

4. **Multi-factor Encryption**:
   - Require biometric + password for decryption
   - Time-based key rotation

5. **Audit Logging**:
   - Log all key access/modifications
   - CloudWatch integration
   - Anomaly detection

## Code References

### Encryption
- `lib/crypto/encryption.ts` - Encryption/decryption utilities
- Functions: `encryptApiKey()`, `decryptApiKey()`, `maskApiKey()`

### Storage
- `lib/db/schema.ts` - IndexedDB schema definition
- `lib/db/api-keys.ts` - CRUD operations for IndexedDB

### Sync
- `lib/sync/api-keys-sync.ts` - Bidirectional sync service
- `lib/api/api-keys-api.ts` - AppSync GraphQL client

### UI
- `hooks/use-api-keys.ts` - React hook for API keys management
- `components/settings/ai-keys.tsx` - UI component
- `app/settings/page.tsx` - Settings page

### Backend
- `amplify/data/resource.ts` - GraphQL schema
- `amplify_outputs.json` - AppSync configuration

## Supported Providers

Currently supported AI providers:
- **Anthropic** (Claude)
- **Google AI** (Gemini)
- **OpenAI** (GPT)

Provider list defined in: `lib/db/schema.ts`

## Best Practices

### For Users

1. **Use strong API keys**: Never reuse keys across services
2. **Regular rotation**: Rotate keys periodically
3. **Monitor usage**: Check provider dashboards for unusual activity
4. **Secure device**: Keep your device locked and secure
5. **Sign out**: Sign out when using shared devices

### For Developers

1. **Never log plaintext keys**: Always log masked versions
2. **Validate input**: Check key format before encryption
3. **Handle errors gracefully**: Don't expose encryption errors to users
4. **Test offline mode**: Ensure sync works correctly
5. **Monitor sync status**: Alert on persistent sync failures

## Troubleshooting

### Keys not syncing

1. Check network connectivity
2. Verify Cognito authentication
3. Check console for sync errors
4. Manual sync: Click "Sync" button

### Cannot decrypt keys

1. Verify user is authenticated
2. Check userId consistency
3. Clear IndexedDB and re-enter keys
4. Contact support if persistent

### IndexedDB errors

1. Clear browser/Tauri cache
2. Check storage quota
3. Verify IndexedDB version
4. Re-initialize database

## Future Enhancements

- [ ] Master password protection
- [ ] Biometric authentication
- [ ] Hardware security module integration
- [ ] Key usage analytics
- [ ] Automatic key rotation
- [ ] Multi-device sync notifications
- [ ] Encrypted backup/restore
- [ ] Key sharing (encrypted, time-limited)
