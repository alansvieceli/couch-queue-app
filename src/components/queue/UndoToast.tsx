import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type UndoToastProps = { name: string; onUndo: () => void };

export function UndoToast({ name, onUndo }: UndoToastProps) {
  return (
    <View accessibilityLiveRegion="polite" style={styles.toast}>
      <Text numberOfLines={2} style={styles.message}>
        "{name}" foi para Já vistos
      </Text>
      <Pressable accessibilityRole="button" onPress={onUndo} style={styles.action}>
        <Text style={styles.actionText}>Desfazer</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    bottom: 80,
    elevation: 6,
    flexDirection: 'row',
    gap: 8,
    left: 0,
    paddingLeft: 14,
    position: 'absolute',
    right: 0,
  },
  message: {
    color: colors.textPrimary,
    flex: 1,
    ...typography.body,
  },
  action: {
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 44,
    paddingHorizontal: 14,
  },
  actionText: {
    color: colors.accent,
    ...typography.button,
  },
});
