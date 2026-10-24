import { StyleSheet, Text } from 'react-native';
import ReorderableList, { reorderItems } from 'react-native-reorderable-list';

import type { Service, Title } from '../../lib/appState';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { QueueRow } from './QueueRow';

type QueueListProps = {
  titles: Title[];
  services: Service[];
  canDrag: boolean;
  onReorder: (ids: string[]) => void;
  onEdit: (title: Title) => void;
  onMarkWatched: (title: Title) => void;
};

export function QueueList({
  titles,
  services,
  canDrag,
  onReorder,
  onEdit,
  onMarkWatched,
}: QueueListProps) {
  const serviceNames = new Map(services.map((service) => [service.id, service.name]));
  return (
    <ReorderableList
      ListEmptyComponent={
        <Text style={styles.empty}>Nada na fila. Toque em + para adicionar.</Text>
      }
      contentContainerStyle={styles.content}
      data={titles}
      dragEnabled={canDrag}
      keyExtractor={(title) => title.id}
      onReorder={({ from, to }) =>
        onReorder(reorderItems(titles, from, to).map((title) => title.id))
      }
      renderItem={({ item, index }) => (
        <QueueRow
          canDrag={canDrag}
          onEdit={() => onEdit(item)}
          onMarkWatched={() => onMarkWatched(item)}
          position={index + 1}
          serviceName={serviceNames.get(item.serviceId) ?? ''}
          title={item}
        />
      )}
      style={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    paddingBottom: 80,
    paddingTop: 4,
  },
  empty: {
    color: colors.textSecondary,
    paddingVertical: 32,
    textAlign: 'center',
    ...typography.body,
  },
});
