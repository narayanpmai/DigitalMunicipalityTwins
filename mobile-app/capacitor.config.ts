import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'np.gov.digipalika.app',
  appName: 'डिजिपालिका (DigiPalika)',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#a81c3c',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#FDE047',
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#a81c3c',
      overlaysWebView: false,
    },
  },
};

export default config;
