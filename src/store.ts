import { getDeviceInfo } from './device';
import { safeLocalStorage, safeSessionStorage } from './storage';
import { generateNumId, generateStrId } from './utils';
import type { Store } from './types';

const storageKeys = {
  appId: 'local',
  queue: 'local',
  props: 'local',
  userId: 'local',
  anonId: 'local',
  device: 'local',
  sessionId: 'session',
  lastActive: 'local',
  initialized: 'local',
};

function getInitialStore(): Store {
  return {
    appId: safeLocalStorage.getItem('nucleus-appId') ?? null,
    queue: JSON.parse(safeLocalStorage.getItem('nucleus-queue') || '[]'),
    props: JSON.parse(safeLocalStorage.getItem('nucleus-props') || '{}'),
    userId: safeLocalStorage.getItem('nucleus-userId') ?? null,
    anonId: safeLocalStorage.getItem('nucleus-anonId') ?? generateStrId(12),
    device: JSON.parse(safeLocalStorage.getItem('nucleus-device') || 'null') ?? getDeviceInfo(),
    sessionId: safeLocalStorage.getItem('nucleus-sessionId') ?? generateNumId(),
    lastActive: JSON.parse(safeLocalStorage.getItem('nucleus-lastActive') || 'null') ?? Date.now(),
    initialized: JSON.parse(safeLocalStorage.getItem('nucleus-initialized') || 'false'),
  };
}

const stored: Store = getInitialStore();

const store = new Proxy(stored, {
  get(target: Store, prop: keyof Store) {
    const value = Reflect.get(target, prop);
    if (value != null) return value; // value in memory

    const storageType = storageKeys[prop];
    const storage = storageType === 'session' ? safeSessionStorage : safeLocalStorage;

    const storageValue = storage.getItem(`nucleus-${String(prop)}`);
    if (storageValue !== null && typeof storageValue === 'string') {
      const parsedValue = JSON.parse(storageValue);
      // @ts-expect-error: this is fine
      target[prop] = parsedValue;
      return parsedValue;
    }

    return getInitialStore()[prop];
  },
  set(target: Store, prop: keyof Store, value: unknown) {
    const storageType = storageKeys[prop];
    const storage = storageType === 'session' ? safeSessionStorage : safeLocalStorage;

    // @ts-expect-error: this is fine
    target[prop] = value;
    storage.setItem(`nucleus-${String(prop)}`, JSON.stringify(value));
    return true;
  },
});

export default store;
