import type { NucleusEvent } from './types';

export const isDevMode = window.location.hostname === 'localhost'
      || window.location.protocol === 'file:';

export class ExtendedWebSocket extends WebSocket {
  sendJson(data: any) {
    this.send(JSON.stringify({ data }));
  }
}

export function cleanEvent(event: NucleusEvent): NucleusEvent {
  // not sure if this is a good idea in typescript, there shouldn't
  // really be null/undefined keys according to the interfaces?
  return Object.entries(event).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined) {
      acc[key as keyof NucleusEvent] = value;
    }
    return acc;
  }, {} as Partial<NucleusEvent>) as NucleusEvent;
}

export function generateNumId(): number {
  const LENGTH = 8;
  const min = 10 ** (LENGTH - 1);
  const max = (10 ** LENGTH) - 1;

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateStrId(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
