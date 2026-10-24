import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Title } from '../../lib/appState';
import { formatDateKey } from '../../lib/dates';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { IconButton } from '../common/IconButton';
import { TitleMeta } from '../queue/TitleMeta';

type WatchedRowProps = {
  title: Title;
  serviceName: string;
  onReturn: () => void;
  onDelete: () => void;
};

export function WatchedRow({
  title,
  serviceName,
  onReturn,
  onDelete,
}: WatchedRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.texts}>
        <Text numberOfLines={1} style={styles.name}>
          {title.name}
        </Text>
        <TitleMeta kind={title.kind} serviceName={serviceName} />
        <Text style={styles.date}>Visto em {formatDateKey(title.watchedAt ?? '')}</Text>
        <Pressable
          accessibilityLabel={`Voltar para a lista: ${title.name}`}
          accessibilityRole="button"
          onPress={onReturn}
          style={styles.returnTarget}
        >
          <Text style={styles.returnText}>Voltar para a lista</Text>
        </Pressable>
      </View>
      <IconButton
        icon="trash-outline"
        label={`Excluir ${title.name}`}
        onPress={onDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  texts: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: colors.textPrimary,
    ...typography.cardTitle,
  },
  date: {
    color: colors.textSecondary,
    ...typography.bodySmall,
  },
  returnTarget: {
    justifyContent: 'center',
    minHeight: 44,
  },
  returnText: {
    color: colors.accent,
    ...typography.bodySmall,
  },
});
