import { StyleSheet, Text, View } from 'react-native';

import type { TitleKind } from '../../lib/appState';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { kindLabels } from './kindLabels';

type TitleMetaProps = {
  serviceName: string;
  kind: TitleKind;
};

export function TitleMeta({ serviceName, kind }: TitleMetaProps) {
  return (
    <View style={styles.meta}>
      <Text numberOfLines={1} style={styles.tag}>
        {serviceName}
      </Text>
      <Text style={styles.kind}>{kindLabels[kind]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
