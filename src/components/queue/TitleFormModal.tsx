import { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';

import type { Service, Title, TitleKind } from '../../lib/appState';
import type { TitleDraft } from '../../lib/titles';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { ActionButton } from '../common/ActionButton';
import { ChipRow } from '../common/ChipRow';
import { confirmAction } from '../common/confirmAction';
import { ModalShell } from '../common/ModalShell';
import { kindLabels } from './kindLabels';

type TitleFormModalProps = {
  editing: Title | null;
  services: Service[];
  initialServiceId: string | null;
  onSave: (draft: TitleDraft) => void;
  onDelete: () => void;
  onClose: () => void;
};

const kindOptions: { id: TitleKind; label: string }[] = [
  { id: 'series', label: kindLabels.series },
  { id: 'movie', label: kindLabels.movie },
];

export function TitleFormModal({
  editing,
  services,
  initialServiceId,
  onSave,
  onDelete,
  onClose,
}: TitleFormModalProps) {
  const [name, setName] = useState(editing?.name ?? '');
  const [kind, setKind] = useState<TitleKind>(editing?.kind ?? 'series');
  const [serviceId, setServiceId] = useState(
    editing?.serviceId ?? initialServiceId ?? services[0]?.id ?? '',
  );
  const [error, setError] = useState<string | null>(null);
  const hasServices = services.length > 0;

  function handleSave() {
    if (name.trim() === '') {
      setError('Informe o nome.');
      return;
    }
    onSave({ name, kind, serviceId });
  }

  async function handleDelete() {
    const label = editing?.name ?? '';
    if (await confirmAction('Excluir título', `Excluir "${label}"?`, 'Excluir')) {
      onDelete();
    }
  }

  return (
    <ModalShell
      onClose={onClose}
      title={editing ? 'Editar título' : 'Adicionar título'}
    >
      <Text style={styles.label}>Nome</Text>
      <TextInput
        accessibilityLabel="Nome"
        onChangeText={(text) => {
          setName(text);
          setError(null);
        }}
        placeholder="Nome"
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
        value={name}
      />
      <Text style={styles.label}>Tipo</Text>
      <ChipRow onSelect={setKind} options={kindOptions} selectedId={kind} />
      <Text style={styles.label}>Streaming</Text>
      {hasServices ? (
        <ChipRow
          onSelect={setServiceId}
          options={services.map((service) => ({ id: service.id, label: service.name }))}
          selectedId={serviceId}
        />
      ) : (
        <Text style={styles.error}>Cadastre um streaming em Manutenção.</Text>
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <ActionButton
        disabled={!hasServices}
        icon="checkmark"
        label="Salvar"
        onPress={handleSave}
      />
      {editing ? (
        <ActionButton
          icon="trash-outline"
          label="Excluir"
          onPress={handleDelete}
          variant="danger"
        />
      ) : null}
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.textSecondary,
    ...typography.label,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.textPrimary,
    minHeight: 44,
    paddingHorizontal: 12,
    ...typography.input,
  },
  error: {
    color: colors.negative,
    ...typography.bodySmall,
  },
});
