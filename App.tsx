import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CouchQueueApp } from './src/CouchQueueApp';

SplashScreen.preventAutoHideAsync();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <CouchQueueApp />
    </SafeAreaProvider>
  );
}
