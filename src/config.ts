export default {
  endpoint: 'wss://app.nucleus.sh',
  disableInDev: false,
  debug: false,
  disableTracking: false,
  automaticPageTracking: true,
  reportInterval: 2 * 1000, // 2 seconds
  sessionTimeout: 60 * 30 * 1000, // 30 minutes
  cutoff: 60 * 60 * 48 * 1000, // 48 hours
  disableErrorReports: false,
  moduleVersion: __VERSION__,
};
