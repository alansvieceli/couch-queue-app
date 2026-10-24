import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { IconButton } from './IconButton';
import { SectionCard } from './SectionCard';

export type NamedItem = { id: string; name: string };

type EditableListSectionProps = {
  title: string;
  noun: string; // lowercase singular, e.g. "grupo"
  items: NamedItem[];
  onAdd: () => void;
  onRename: (id: string, name: string) => void;
  // Resolves to a message when the delete was blocked, or null when it ran or was cancelled.
  onDelete: (item: NamedItem) => Promise<string | null>;
};

export function EditableListSection({
  title,
  noun,
  items,
  onAdd,
  onRename,
  onDelete,
}: EditableListSectionProps) {
  const [message, setMessage] = useState<string | null>(null);

  async function handleDelete(item: NamedItem) {
    setMessage(await onDelete(item));
  }

  return (
    <SectionCard title={title}>
      {items.map((item) => (
        <ItemRow
          item={item}
          key={`${item.id}:${item.name}`}
          noun={noun}
          onDelete={() => handleDelete(item)}
          onRename={onRename}
        />
      ))}
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <View style={styles.addRow}>
        <IconButton
          color={colors.accent}
          icon="add-circle-outline"
          label={`Adicionar ${noun}`}
          onPress={onAdd}
        />
        <Text style={styles.addLabel}>Adicionar {noun}</Text>
      </View>
    </SectionCard>
  );
}

type ItemRowProps = {
  item: NamedItem;
  noun: string;
  onRename: (id: string, name: string) => void;
  onDelete: () => void;
};

function ItemRow({ item, noun, onRename, onDelete }: ItemRowProps) {
  const [draft, setDraft] = useState(item.name);

  function commit() {
    if (draft.trim() === '') setDraft(item.name);
    else onRename(item.id, draft);
  }

  return (
    <View style={styles.row}>
      <TextInput
        accessibilityLabel={`Nome do ${noun} ${item.name}`}
        onChangeText={setDraft}
        onEndEditing={commit}
        style={styles.input}
        value={draft}
      />
      <IconButton
        icon="trash-outline"
        label={`Excluir ${item.name}`}
        onPress={onDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  input: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    color: colors.textPrimary,
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 12,
    ...typography.input,
  },
  message: {
    color: colors.negative,
    ...typography.bodySmall,
  },
  addRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  addLabel: {
    color: colors.accent,
    ...typography.button,
  },
});
