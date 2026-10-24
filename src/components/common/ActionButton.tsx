import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import type { IconName } from './IconName';

type ActionButtonProps = {
  icon: IconName;
  label: string;
  onPress: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
};

export function ActionButton({
  icon,
  label,
  onPress,
  variant = 'default',
  disabled,
}: ActionButtonProps) {
  const color = variant === 'danger' ? colors.negative : colors.textPrimary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, disabled ? styles.disabled : null]}
    >
      <Ionicons color={color} name={icon} size={20} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 10,
    minHeight: 44,
    paddingHorizontal: 12,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    ...typography.cardTitle,
  },
});
