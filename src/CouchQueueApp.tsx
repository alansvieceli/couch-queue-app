import { Fraunces_600SemiBold, useFonts } from '@expo-google-fonts/fraunces';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from './components/common/AppHeader';
import { TabBar, type TabItem } from './components/common/TabBar';
import { MaintenanceScreen } from './components/maintenance/MaintenanceScreen';
import { QueueScreen } from './components/queue/QueueScreen';
import { WatchedScreen } from './components/watched/WatchedScreen';
import { colors } from './theme/colors';

type AppTab = 'queue' | 'watched' | 'maintenance';

const tabs: TabItem<AppTab>[] = [
  { id: 'queue', icon: 'list-outline', label: 'Fila' },
  { id: 'watched', icon: 'checkmark-done-outline', label: 'Já vistos' },
  { id: 'maintenance', icon: 'settings-outline', label: 'Manutenção' },
];

export function CouchQueueApp() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<AppTab>('queue');
  const [fontsLoaded, fontError] = useFonts({ Fraunces_600SemiBold });
  // A font failure falls back to the system serif instead of holding the splash.
  const isReady = fontsLoaded || fontError !== null;

  useEffect(() => {
    if (isReady) SplashScreen.hideAsync();
  }, [isReady]);

  if (!isReady) return null;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 10, paddingBottom: insets.bottom },
      ]}
    >
      <AppHeader />
      <View style={styles.content}>
        {activeTab === 'queue' ? <QueueScreen /> : null}
        {activeTab === 'watched' ? <WatchedScreen /> : null}
        {activeTab === 'maintenance' ? <MaintenanceScreen /> : null}
      </View>
      <TabBar activeTab={activeTab} onChangeTab={setActiveTab} tabs={tabs} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
