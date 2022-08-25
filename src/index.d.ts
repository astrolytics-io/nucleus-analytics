// Type definitions for nucleus-analytics
// Project: https://github.com/nucleus-sh/nucleus-analytics

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
      /* change how often (in s) events should be refreshed (default: 20s) */
      reportInterval?: number;
      /* change the inactivity duration after which a session expires (in s) default: 30min) */
      sessionTimeout?: number;
      /* use the old device id reporting method */
      useOldDeviceId?: boolean;
    } 
  ) => void
  setUserId: (id: string) => void;
  trackError: (name: string, error: Error) => void;
  setProps: (
    props: { [key: string]: string | number | boolean }, 
    overwrite: boolean
  ) => void;
  identify: (
    id: string,
    props: { [key: string]: string | number | boolean }
  ) => void;
  page: (
    name: number | string,
    params: { [key: string]: string | number | boolean }
  ) => void;
  screen: (
    name: number | string,
    params: { [key: string]: string | number | boolean }
  ) => void;
  track: (
    customEvent: string,
    data?: { [key: string]: string | number | boolean }
  ) => void;
  disableTracking: () => void;
  enableTracking: () => void;
}

declare const nucleus: Nucleus

export default nucleus
