import { useMutation, useQuery, type UseMutationResult, type UseQueryResult } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { useCurrentUser } from './useCurrentUser';

import type { NostrEvent } from '@nostrify/nostrify';

export interface Riddle {
  text: string;
  answer: string;
  hint?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface HexedNote {
  id: string;
  event: NostrEvent;
  riddle: Omit<Riddle, 'answer'>;
  isDecrypted: boolean;
  decryptedContent?: string;
}

const HEXED_KIND = 30751;
const DEFAULT_DIFFICULTY: NonNullable<Riddle['difficulty']> = 'medium';

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

      const noteId = `hexed-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      const encryptedContent = await encryptWithAnswer(content, riddle.answer);

      const tags: NostrEvent['tags'] = [
        ['d', noteId],
        ['alt', riddle.text],
        ['difficulty', riddle.difficulty ?? DEFAULT_DIFFICULTY],
        ['encryption', 'answer:aes-gcm'],
        ['client', location.hostname],
        ['t', 'hexed-note'],
        ['t', `difficulty-${riddle.difficulty ?? DEFAULT_DIFFICULTY}`],
      ];

      if (riddle.hint) {
        tags.push(['hint', riddle.hint]);
      }

      if (recipientPubkey) {
        tags.push(['p', recipientPubkey]);
      }

      const event: NostrEvent = {
        kind: HEXED_KIND,
        pubkey: user.pubkey,
        created_at: Math.floor(Date.now() / 1000),
        tags,
        content: encryptedContent,
      };

      const signedEvent = await user.signer.signEvent(event);
      await nostr.event(signedEvent, { signal: AbortSignal.timeout(5000) });

      return signedEvent;
    }
  });
}

export function useHexedNotes(pubkey?: string): UseQueryResult<HexedNote[], Error> {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['hexed-notes', pubkey ?? 'public'],
    queryFn: async ({ signal }) => {
      const filter = pubkey
        ? { authors: [pubkey], kinds: [HEXED_KIND] }
        : { kinds: [HEXED_KIND] };

      const events = await nostr.query([filter], { signal });

      return events.map<HexedNote>((event) => {
        const riddleText = event.tags.find(([tag]) => tag === 'alt')?.[1] ?? 'Unknown riddle';
        const hint = event.tags.find(([tag]) => tag === 'hint')?.[1];
        const difficulty = (event.tags.find(([tag]) => tag === 'difficulty')?.[1] as Riddle['difficulty']) ?? DEFAULT_DIFFICULTY;

        return {
          id: event.tags.find(([tag]) => tag === 'd')?.[1] || event.id,
          event,
          riddle: {
            text: riddleText,
            hint,
            difficulty,
          },
          isDecrypted: false,
        };
      });
    },
    enabled: pubkey ? pubkey.length > 0 : true,
  });
}

export function useSolveHexedNote(): UseMutationResult<string, Error, {
  event: NostrEvent;
  answer: string;
}> {
  return useMutation({
    mutationFn: async ({ event, answer }) => {
      try {
        return await decryptWithAnswer(event.content, answer);
      } catch (error) {
        throw new Error('Failed to solve riddle. Answer may be incorrect.');
      }
    }
  });
}

async function encryptWithAnswer(content: string, answer: string): Promise<string> {
  const key = await deriveKeyFromAnswer(answer);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedContent = new TextEncoder().encode(content);
  const cipherBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encodedContent);
  const cipherBytes = new Uint8Array(cipherBuffer);

  return `${toBase64(iv)}:${toBase64(cipherBytes)}`;
}

async function decryptWithAnswer(payload: string, answer: string): Promise<string> {
  const [ivPart, cipherPart] = payload.split(':');
  if (!ivPart || !cipherPart) {
    throw new Error('Invalid encrypted payload');
  }

  const key = await deriveKeyFromAnswer(answer);
  const iv = fromBase64(ivPart);
  const cipherBytes = fromBase64(cipherPart);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipherBytes);

  return new TextDecoder().decode(decrypted);
}

async function deriveKeyFromAnswer(answer: string): Promise<CryptoKey> {
  const normalized = normalizeAnswer(answer);
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalized));
  return crypto.subtle.importKey('raw', hash, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

function normalizeAnswer(answer: string): string {
  return answer.trim().toLowerCase();
}

function toBase64(bytes: Uint8Array): string {
  if (typeof globalThis.btoa === 'function') {
    let binary = '';
    bytes.forEach((b) => {
      binary += String.fromCharCode(b);
    });
    return globalThis.btoa(binary);
  }

  const bufferCtor = (globalThis as typeof globalThis & { Buffer?: typeof import('buffer').Buffer }).Buffer;
  if (bufferCtor) {
    return bufferCtor.from(bytes).toString('base64');
  }

  throw new Error('No base64 encoder available');
}

function fromBase64(value: string): Uint8Array {
  const binary = typeof globalThis.atob === 'function'
    ? globalThis.atob(value)
    : (() => {
        const bufferCtor = (globalThis as typeof globalThis & { Buffer?: typeof import('buffer').Buffer }).Buffer;
        if (!bufferCtor) {
          throw new Error('No base64 decoder available');
        }
        return bufferCtor.from(value, 'base64').toString('binary');
      })();
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
