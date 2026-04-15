import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kibarashi.app',
  appName: '気晴らしレシピ',
  webDir: 'dist',
  server: {
    // WKWebViewをHTTPSローカルサーバーとして動かし、外部fetch制限を回避
    iosScheme: 'https',
    hostname: 'app.kibarashi.local',
    allowNavigation: ['kibarashi-app.vercel.app'],
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    allowsLinkPreview: false,
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,  // fetch/XMLHttpRequestをネイティブHTTPで置換し、WKWebView制限を回避
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0ea5e9',
      showSpinner: false,
      launchAutoHide: true,
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
