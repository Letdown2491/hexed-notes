# NIP-30751: Hexed Notes

## Status
Draft

## Summary
This NIP defines a new event kind for "Hexed Notes" - encrypted notes that can only be decrypted by solving a riddle. The encryption key is distributed puzzle-style, making it a fun and interactive way to share private messages.

## Motivation
Hexed Notes add an element of gamification and puzzle-solving to Nostr messaging. Instead of direct encryption/decryption, users must solve riddles to obtain the decryption key, making the process more engaging and interactive.

## Event Schema

### Kind 30751: Hexed Note

**Content**: Base64-encoded NIP-04 encrypted message

**Tags**:
- `d` (required): Unique identifier for the hexed note
- `p` (optional): Recipient's public key for direct messages
- `alt` (recommended): Human-readable description of the puzzle
- `r` (optional): Reference to related puzzle or previous note

### Event Structure

```json
{
  "kind": 30751,
  "pubkey": "author_pubkey",
  "created_at": 1234567890,
  "tags": [
    ["d", "unique-puzzle-id"],
    ["p", "recipient_pubkey"],
    ["alt", "Solve this riddle to decrypt the message"],
    ["r", "previous-puzzle-id"]
  ],
  "content": "base64_encoded_encrypted_message?iv=base64_iv"
}
```

## Puzzle System

### Key Generation
The encryption key is derived from solving a riddle. The process works as follows:

1. **Puzzle Creation**: Author creates a riddle and computes its answer hash
2. **Key Derivation**: Answer hash is used as encryption key for NIP-04
3. **Message Encryption**: Content is encrypted using NIP-04 with the puzzle-derived key
4. **Puzzle Distribution**: Riddle is published alongside the encrypted message

### Riddle Format
Riddles should be stored in the `alt` tag or as a separate event. The answer should be:
- A short string (1-50 characters)
- Hashed using SHA256 to create the encryption key
- Unique enough to prevent brute force attacks

## Encryption Process

1. Generate riddle and compute answer
2. Hash the answer: `key = SHA256(answer)`
3. Use NIP-04 to encrypt content with the derived key
4. Publish event with kind 30751 and riddle in `alt` tag

## Decryption Process

1. Read the hexed note event
2. Solve the riddle in the `alt` tag
3. Compute key: `key = SHA256(answer)`
4. Use NIP-04 decryption with the derived key
5. Display decrypted content

## Example Implementation

```javascript
// Creating a hexed note
async function createHexedNote(content, riddle, recipientPubkey = null) {
  // Answer to the riddle
  const answer = riddle.answer;
  const key = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(answer));
  
  // Convert key to ArrayBuffer for NIP-04
  const keyArray = new Uint8Array(key);
  
  // Encrypt content using NIP-04
  const encrypted = await nip04.encrypt(recipientPubkey || authorPubkey, content, keyArray);
  
  // Create event
  return {
    kind: 30751,
    content: encrypted,
    tags: [
      ['d', generateUniqueId()],
      ['alt', riddle.text],
      ...(recipientPubkey ? [['p', recipientPubkey]] : [])
    ]
  };
}

// Solving a hexed note
async function solveHexedNote(event, answer) {
  // Compute key from answer
  const key = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(answer));
  const keyArray = new Uint8Array(key);
  
  // Decrypt using NIP-04
  return await nip04.decrypt(event.pubkey, event.content, keyArray);
}
```

## Security Considerations

1. **Riddle Difficulty**: Riddles should be challenging enough to prevent brute force attacks
2. **Key Length**: SHA256 provides adequate security for the derived key
3. **Metadata**: Event metadata is still visible, only content is encrypted
4. **Relay Privacy**: Use private or restricted relays for sensitive content

## Compatibility

- Compatible with all Nostr clients that support custom event kinds
- Requires NIP-04 implementation for encryption/decryption
- Works with existing Nostr relay infrastructure