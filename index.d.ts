// Type definitions for nucleus-nodejs
// Project: https://github.com/nucleus-sh/nucleus-nodejs

export interface Nucleus {
  init: ( 
    appId: string,
    options?: {
      /* Enable logging (default: false) */
      debug?: boolean;
      /* disable module while in development (default: false) */
      disableInDev?: boolean;
      /* completely disable tracking (default: false) */
      disableTracking?: boolean;
      /* disable errors reporting (default: false) */
      disableErrorReports?: boolean;
      /* auto gives the user an id: username@hostname default: false) */
      autoUserId?: boolean;
      /* change how often (in s) events should be refreshed (default: 20s) */
      reportInterval?: number;
    } 
  ) => void;
  appStarted: () => void;
  setUserId: (id: number | string) => void;
  onError: (
    type: "uncaughtException" | "unhandledRejection" | "windowError",
    error: Error
  ) => void;
  trackError: (name: string, error: Error) => void;
  setProps: (
    props: { [key: string]: string | number | boolean }, 
    overwrite: boolean
  ) => void;
  track: (
    customEvent: string,
    data?: { [key: string]: string | number | boolean }
  ) => void;
  disableTracking: () => void;
  enableTracking: () => void;
  getCustomData: (
    callback: (error: Error | null, customData?: any) => void
  ) => void;
  checkUpdates: () => void;
  onUpdate: ( version: string ) => void;
}

declare const nucleus: Nucleus;

export default nucleus;
