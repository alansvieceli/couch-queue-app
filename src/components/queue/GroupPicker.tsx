import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Group } from '../../lib/appState';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { ModalShell } from '../common/ModalShell';

type GroupPickerProps = {
  groups: Group[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export function GroupPicker({ groups, selectedId, onSelect }: GroupPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = groups.find((group) => group.id === selectedId);

  function handleSelect(id: string) {
    setIsOpen(false);
    onSelect(id);
  }

  return (
    <>
      <Pressable
        accessibilityLabel={`Grupo: ${selected?.name ?? ''}. Trocar grupo`}
        accessibilityRole="button"
        onPress={() => setIsOpen(true)}
        style={styles.card}
      >
        <View style={styles.texts}>
          <Text style={styles.label}>Grupo</Text>
          <Text numberOfLines={1} style={styles.name}>
            {selected?.name}
          </Text>
        </View>
        <Ionicons color={colors.textSecondary} name="chevron-down" size={22} />
      </Pressable>
      {isOpen ? (
        <ModalShell onClose={() => setIsOpen(false)} title="Escolher grupo">
          {groups.map((group) => {
            const isSelected = group.id === selectedId;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                key={group.id}
                onPress={() => handleSelect(group.id)}
                style={styles.option}
              >
                <Text numberOfLines={1} style={styles.optionText}>
                  {group.name}
                </Text>
                {isSelected ? (
                  <Ionicons color={colors.accent} name="checkmark" size={22} />
                ) : null}
              </Pressable>
            );
          })}
        </ModalShell>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 56,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  texts: {
    flex: 1,
  },
  label: {
    color: colors.textSecondary,
    ...typography.label,
  },
  name: {
    color: colors.textPrimary,
    ...typography.cardTitle,
  },
  option: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  optionText: {
    color: colors.textPrimary,
    flex: 1,
    ...typography.cardTitle,
  },
});
