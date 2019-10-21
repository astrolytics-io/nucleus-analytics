// Type definitions for electron-nucleus
// Project: https://github.com/lyserio/electron-nucleus

export interface Nucleus {
  init: ( 
    appId: string,
    config?: {} 
  ) => void;
  setUserId: (id: number | string) => void;
  onError: (
    type: "uncaughtException" | "unhandledRejection" | "windowError",
    error: Error
  ) => void;
  trackError: (name: string, error: Error) => void;
  setProps: (props: { [key: string]: string | number | boolean }, overwrite: boolean) => void;
  track: (
    customEvent: string,
    data?: { [key: string]: string | number | boolean }
  ) => void;
  disableTracking: () => void;
  enableTracking: () => void;
  checkLicense: (
    license: string,
    callback: (error: Error | null, licenseInfo?: any) => void,
  ) => void;
  getCustomData: (callback: (error: Error | null, customData?: any) => void) => void;
  checkUpdates: () => void;
  onUpdate: ( version: string ) => void;
}

declare const nucleus: (
  appId: string,
  config?: {
    /*  disable module while in development (default: false) */
    disableInDev?: boolean;
    /*  completely disable tracking (default: false) */
    disableTracking?: boolean;
    /*  if you can only use Nucleus in the mainprocess (default: false)*/
    onlyMainProcess?: boolean;
    /*  disable errors reporting (default: false) */
    disableErrorReports?: boolean;
    /*  auto gives the user an id: username@hostname default: false) */
    autoUserId?: boolean;
    /*  set an identifier for this user */
    userId?: number | string;
    /*  cache events to disk if offline to report later (default: false) */
    persist?: boolean;
    /*  set a custom version for your app (default: autodetected) */
    version?: string;
    /*  specify a custom language (default: autodetected) */
    language?: string;
  }
) => Nucleus;

export default nucleus;
