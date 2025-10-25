require('dotenv').config()

module.exports = {
  expo: {
    name: 'CKM66',
    slug: 'ckm66',
    version: '1.0.2',
    orientation: 'portrait',
    icon: './src/assets/icon.jpg',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    jsEngine: 'hermes',
    platforms: ['ios', 'android', 'web'],
    splash: {
      image: './src/assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      buildNumber: '4',
      supportsTablet: true,
      bundleIdentifier: 'com.ckm66.myapp',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      versionCode: 4,
      adaptiveIcon: {
        foregroundImage: './src/assets/adaptive-icon.jpg',
        backgroundColor: '#ffffff',
      },
      package: 'com.ckm66.myapp',
      navigationBar: {
        visible: true,
        backgroundColor: '#1A202C',
        barStyle: 'light-content',
      },
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'com.ckm66.myapp',
              host: 'reset-password',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    scheme: 'com.ckm66.myapp',
    plugins: ['expo-router', 'expo-secure-store'],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: '56ef2ff2-fd5f-43f5-9346-6908ee76f769',
      },
    },
  },
}
