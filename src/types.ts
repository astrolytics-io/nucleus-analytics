declare global {
  const __VERSION__: string;
}

export interface DeviceInfo {
  deviceId: string | null;
  platform: string | null;
  locale: string | null;
}

export interface Options {
  endpoint: string;
  deviceId: string;
  disableInDev: boolean;
  debug: boolean;
  disableTracking: boolean;
  automaticPageTracking: boolean;
  reportInterval: number;
  sessionTimeout: number;
  disableErrorReports: boolean;
  moduleVersion: string;
}

export interface ServerACK {
  reportedIds: number[];
  anonId: string;
}

type EventType = 'nucleus:view'
  | 'nucleus:sessionend'
  | 'init'
  | 'error'
  | 'pageview'
  | 'identify'
  | 'heartbeat'
  | 'event'
  | string;

interface SharedProperties {
  sessionId: number;
  userId: string | null;
  anonId: string;
}

interface CommonEvent extends SharedProperties {
  name: string | null;
  id: number;
  date: number;
  payload: string | object | null;
  deviceId: DeviceInfo['deviceId'];
  moduleVersion: Options['moduleVersion'];
  client: 'tauri',
}

export interface InitOrErrorEvent extends CommonEvent {
  type: 'init' | 'error';
  platform: string;
  locale: string;
}

export interface OtherEvent extends CommonEvent {
  type: Exclude<EventType, 'init' | 'error'> | null;
}

export interface HeartbeatEvent {
  type: 'heartbeat';
  sessionId: SharedProperties['sessionId'];
}

// any Event that is not a Heartbeat
export type NucleusEvent = InitOrErrorEvent | OtherEvent;

export interface Store extends SharedProperties{
  appId: string | null;
  queue: (NucleusEvent | HeartbeatEvent)[];
  props: object;
  device: DeviceInfo
  lastActive: number;
  initialized: boolean;
}
