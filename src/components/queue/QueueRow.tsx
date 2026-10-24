import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useReorderableDrag } from 'react-native-reorderable-list';

import type { Title } from '../../lib/appState';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { kindLabels } from './kindLabels';

type QueueRowProps = {
  title: Title;
  position: number;
  serviceName: string;
  canDrag: boolean;
  onEdit: () => void;
  onMarkWatched: () => void;
};

// Must render inside a ReorderableList cell (useReorderableDrag reads the cell context).
export function QueueRow({
  title,
  position,
  serviceName,
  canDrag,
  onEdit,
  onMarkWatched,
}: QueueRowProps) {
  const drag = useReorderableDrag();
  return (
    <Pressable
      accessibilityLabel={`Editar ${title.name}`}
      accessibilityRole="button"
      onPress={onEdit}
      style={styles.row}
    >
      {canDrag ? (
        <Pressable
          accessibilityLabel="Arrastar para reordenar"
          accessibilityRole="button"
          onPressIn={drag}
          style={styles.grip}
        >
          <Ionicons color={colors.textSecondary} name="reorder-two-outline" size={22} />
        </Pressable>
      ) : null}
      <Text style={[styles.position, position === 1 ? styles.positionFirst : null]}>
        {position}
      </Text>
      <View style={styles.texts}>
        <Text numberOfLines={1} style={styles.name}>
          {title.name}
        </Text>
        <View style={styles.meta}>
          <Text numberOfLines={1} style={styles.tag}>
            {serviceName}
          </Text>
          <Text style={styles.kind}>{kindLabels[title.kind]}</Text>
        </View>
      </View>
      <Pressable
        accessibilityLabel="Marcar como visto"
        accessibilityRole="button"
        onPress={onMarkWatched}
        style={styles.checkTarget}
      >
        <View style={styles.check} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
    minHeight: 64,
    paddingHorizontal: 6,
  },
  grip: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 36,
  },
  position: {
    color: colors.textSecondary,
    minWidth: 24,
    textAlign: 'center',
    ...typography.cardTitle,
  },
  positionFirst: {
    color: colors.accent,
  },
  texts: {
    flex: 1,
    gap: 4,
    paddingVertical: 8,
  },
  name: {
    color: colors.textPrimary,
    ...typography.cardTitle,
  },
  meta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    color: colors.textPrimary,
    flexShrink: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    ...typography.bodySmall,
  },
  kind: {
    color: colors.textSecondary,
    ...typography.bodySmall,
  },
  checkTarget: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  check: {
    borderColor: colors.accent,
    borderRadius: 12,
    borderWidth: 2,
    height: 24,
    width: 24,
  },
});
