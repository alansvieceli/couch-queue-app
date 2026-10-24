import { Fraunces_600SemiBold, useFonts } from '@expo-google-fonts/fraunces';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from './components/common/AppHeader';
import { TabBar, type TabItem } from './components/common/TabBar';
import { MaintenanceScreen } from './components/maintenance/MaintenanceScreen';
import { QueueScreen } from './components/queue/QueueScreen';
import { WatchedScreen } from './components/watched/WatchedScreen';
import { useAppState } from './hooks/useAppState';
import { useDeviceSetting } from './hooks/useDeviceSetting';
import { normalizeSelectedGroup, resolveGroupId } from './lib/groups';
import { DEFAULT_HISTORY_SETTINGS, normalizeHistorySettings } from './lib/history';
import { colors } from './theme/colors';
import { typography } from './theme/typography';

const HISTORY_KEY = '@couch-queue-app/history/v1';
const SELECTED_GROUP_KEY = '@couch-queue-app/selected-group/v1';

type AppTab = 'queue' | 'watched' | 'maintenance';

const tabs: TabItem<AppTab>[] = [
  { id: 'queue', icon: 'list-outline', label: 'Fila' },
  { id: 'watched', icon: 'checkmark-done-outline', label: 'Já vistos' },
  { id: 'maintenance', icon: 'settings-outline', label: 'Manutenção' },
];

export function CouchQueueApp() {
  const insets = useSafeAreaInsets();
  const store = useAppState();
  const history = useDeviceSetting(
    HISTORY_KEY,
    DEFAULT_HISTORY_SETTINGS,
    normalizeHistorySettings,
  );
  const selectedGroup = useDeviceSetting<string | null>(
    SELECTED_GROUP_KEY,
    null,
    normalizeSelectedGroup,
  );
  // A remembered group that was deleted (or removed by a restore) falls back to the first.
  const selectedGroupId = resolveGroupId(store.state.groups, selectedGroup.value);
  const hasPurged = useRef(false);
  const [activeTab, setActiveTab] = useState<AppTab>('queue');
  const [fontsLoaded, fontError] = useFonts({ Fraunces_600SemiBold });
  // A font failure falls back to the system serif instead of holding the splash.
  const isReady = store.isLoaded && (fontsLoaded || fontError !== null);

  useEffect(() => {
    if (isReady) SplashScreen.hideAsync();
  }, [isReady]);

  // Cleanup runs once per start, after both the data and the period are loaded.
  // A failed read of either must never lead to deleting data based on a default.
  useEffect(() => {
    if (hasPurged.current || !store.isLoaded || !history.isLoaded) return;
    if (store.loadFailed || history.loadFailed) return;
    hasPurged.current = true;
    store.purgeOldWatched(history.value.keepMonths);
  }, [store, history.isLoaded, history.loadFailed, history.value.keepMonths]);

  if (!isReady) return null;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 10, paddingBottom: insets.bottom },
      ]}
    >
      <AppHeader />
      {store.saveError ? <Text style={styles.error}>{store.saveError}</Text> : null}
      <View style={styles.content}>
        {activeTab === 'queue' ? (
          <QueueScreen
            onSelectGroup={selectedGroup.save}
            selectedGroupId={selectedGroupId}
            store={store}
          />
        ) : null}
        {activeTab === 'watched' ? (
          <WatchedScreen
            onSelectGroup={selectedGroup.save}
            selectedGroupId={selectedGroupId}
            store={store}
          />
        ) : null}
        {activeTab === 'maintenance' ? (
          <MaintenanceScreen history={history} store={store} />
        ) : null}
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
  error: {
    color: colors.negative,
    paddingHorizontal: 20,
    paddingBottom: 8,
    ...typography.bodySmall,
  },
});
