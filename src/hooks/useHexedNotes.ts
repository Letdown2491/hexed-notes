import { useMutation, useQuery, type UseMutationResult, type UseQueryResult } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { useCurrentUser } from './useCurrentUser';

import type { NostrEvent } from '@nostrify/nostrify';

export interface Riddle {
  text: string;
  hint?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface HexedNote {
  id: string;
  event: NostrEvent;
  riddle: Riddle;
  isDecrypted: boolean;
  decryptedContent?: string;
}

export function useCreateHexedNote(): UseMutationResult<NostrEvent, Error, {
  content: string;
  riddle: Riddle;
  recipientPubkey?: string;
}> {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async ({ content, riddle, recipientPubkey }) => {
      if (!user) {
        throw new Error("User is not logged in");
      }

      // Generate a unique ID for this hexed note
      const noteId = `hexed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create the answer hash
      const answerText = riddle.text;
      const answerBuffer = new TextEncoder().encode(answerText);
      const answerHash = await globalThis.crypto.subtle.digest('SHA-256', answerBuffer);

      // Convert hash to hex string for key derivation
      const answerHashHex = Array.from(new Uint8Array(answerHash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // For NIP-04 encryption, we need to use the recipient's or our own key
      const targetPubkey = recipientPubkey || user.pubkey;

      // Create a shared secret using ECDH
      const sharedSecret = await getSharedSecret(user.signer.getPrivateKey(), targetPubkey);

      // Encrypt the content using NIP-04 style encryption
      const encryptedContent = await encryptNip04(content, sharedSecret);

      // Create the hexed note event
      const event: NostrEvent = {
        kind: 30751,
        pubkey: user.pubkey,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ['d', noteId],
          ['alt', riddle.text],
          ...(riddle.hint ? [['hint', riddle.hint]] : []),
          ...(recipientPubkey ? [['p', recipientPubkey]] : []),
          ['client', location.hostname]
        ],
        content: encryptedContent
      };

      // Sign and publish the event
      const signedEvent = await user.signer.signEvent(event);
      await nostr.event(signedEvent, { signal: AbortSignal.timeout(5000) });

      return signedEvent;
    }
  });
}

export function useHexedNotes(pubkey?: string): UseQueryResult<HexedNote[], Error> {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['hexed-notes', pubkey],
    queryFn: async ({ signal }) => {
      const filter = pubkey
        ? { authors: [pubkey], kinds: [30751] }
        : { kinds: [30751] };

      const events = await nostr.query([filter], { signal });

      // Transform events into HexedNote objects
      return events.map(event => ({
        id: event.tags.find(([t]) => t === 'd')?.[1] || event.id,
        event,
        riddle: {
          text: event.tags.find(([t]) => t === 'alt')?.[1] || 'Unknown riddle',
          hint: event.tags.find(([t]) => t === 'hint')?.[1]
        },
        isDecrypted: false
      }));
    },
    enabled: !!pubkey
  });
}

export function useSolveHexedNote(): UseMutationResult<string, Error, {
  event: NostrEvent;
  answer: string;
}> {
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async ({ event, answer }) => {
      if (!user) {
        throw new Error("User is not logged in");
      }

      try {
        // Compute the answer hash
        const answerBuffer = new TextEncoder().encode(answer);
        const answerHash = await crypto.subtle.digest('SHA-256', answerBuffer);

        // Get the shared secret for decryption
        const sharedSecret = await getSharedSecret(user.signer.getPrivateKey(), event.pubkey);

        // Decrypt the content
        const decryptedContent = await decryptNip04(event.content, sharedSecret);

        return decryptedContent;
      } catch (error) {
        throw new Error('Failed to solve riddle. Answer may be incorrect.');
      }
    }
  });
}

// Helper functions
async function getSharedSecret(privateKey: string, publicKey: string): Promise<Uint8Array> {
  // This is a simplified ECDH implementation
  // In a real implementation, you would use the actual ECDH function from nostr-tools
  const priv = Uint8Array.from(Buffer.from(privateKey, 'hex'));
  const pub = Uint8Array.from(Buffer.from(publicKey, 'hex'));

  // This is a placeholder - actual implementation would use secp256k1
  // For now, we'll create a simple hash-based shared secret
  const combined = new Uint8Array([...priv, ...pub]);
  const hash = await globalThis.crypto.subtle.digest('SHA-256', combined);
  return new Uint8Array(hash);
}

async function encryptNip04(content: string, sharedSecret: Uint8Array): Promise<string> {
  // This is a simplified NIP-04 encryption
  // In a real implementation, you would use the actual NIP-04 encryption from nostr-tools

  // Generate random IV
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(16));

  // Create cipher (simplified for demonstration)
  const cipher = new globalThis.CryptoSubtle.AES-CBC.encrypt(
    new TextEncoder().encode(content),
    sharedSecret,
    iv
  );

  // Format as base64 with IV
  const encrypted = Buffer.from(cipher).toString('base64');
  const ivBase64 = Buffer.from(iv).toString('base64');

  return `${encrypted}?iv=${ivBase64}`;
}

async function decryptNip04(encryptedContent: string, sharedSecret: Uint8Array): Promise<string> {
  // Parse the encrypted content
  const [encrypted, ivPart] = encryptedContent.split('?iv=');
  const iv = Buffer.from(ivPart, 'base64');
  const cipher = Buffer.from(encrypted, 'base64');

  // Decrypt (simplified for demonstration)
  const decrypted = await globalThis.CryptoSubtle.AES-CBC.decrypt(
    cipher,
    sharedSecret,
    iv
  );

  return new TextDecoder().decode(decrypted);
}