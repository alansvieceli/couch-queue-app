import { FlatList, StyleSheet, Text, View } from 'react-native';

import type { AppStore } from '../../hooks/useAppState';
import type { Title } from '../../lib/appState';
import { watchedFor } from '../../lib/titles';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { confirmAction } from '../common/confirmAction';
import { GroupPicker } from '../queue/GroupPicker';
import { WatchedRow } from './WatchedRow';

type WatchedScreenProps = {
  store: AppStore;
  selectedGroupId: string;
  onSelectGroup: (id: string) => void;
};

export function WatchedScreen({
  store,
  selectedGroupId,
  onSelectGroup,
}: WatchedScreenProps) {
  const { state } = store;
  const serviceNames = new Map(
    state.services.map((service) => [service.id, service.name]),
  );

  async function handleDelete(title: Title) {
    if (await confirmAction('Excluir título', `Excluir "${title.name}"?`, 'Excluir')) {
      store.deleteTitle(title.id);
    }
  }

  return (
    <View style={styles.container}>
      <GroupPicker
        groups={state.groups}
        onSelect={onSelectGroup}
        selectedId={selectedGroupId}
      />
      <FlatList
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhum título visto ainda.</Text>
        }
        contentContainerStyle={styles.content}
        data={watchedFor(state, selectedGroupId)}
        keyExtractor={(title) => title.id}
        renderItem={({ item }) => (
          <WatchedRow
            onDelete={() => handleDelete(item)}
            onReturn={() => store.returnToQueue(item.id)}
            serviceName={serviceNames.get(item.serviceId) ?? ''}
            title={item}
          />
        )}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 8,
  },
  list: {
    flex: 1,
  },
  content: {
    paddingBottom: 16,
    paddingTop: 4,
  },
  empty: {
    color: colors.textSecondary,
    paddingVertical: 32,
    textAlign: 'center',
    ...typography.body,
  },
});
