import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { AppStore } from '../../hooks/useAppState';
import type { Title } from '../../lib/appState';
import { queueFor, servicesInQueue } from '../../lib/titles';
import { FloatingAddButton } from '../common/FloatingAddButton';
import { GroupPicker } from './GroupPicker';
import { QueueList } from './QueueList';
import { ServiceFilter } from './ServiceFilter';
import { TitleFormModal } from './TitleFormModal';
import { UndoToast } from './UndoToast';

const UNDO_MS = 5000;

type QueueScreenProps = {
  store: AppStore;
  selectedGroupId: string;
  onSelectGroup: (id: string) => void;
};

type ServiceFilterState = { groupId: string; serviceId: string };
type FormState = { editing: Title | null };
type Undo = { id: string; name: string };

export function QueueScreen({
  store,
  selectedGroupId,
  onSelectGroup,
}: QueueScreenProps) {
  const { state } = store;
  const [filter, setFilter] = useState<ServiceFilterState | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [undo, setUndo] = useState<Undo | null>(null);

  // The filter belongs to one group, and a service no longer in the queue means Todos.
  const available = servicesInQueue(state, selectedGroupId);
  const serviceId =
    filter?.groupId === selectedGroupId &&
    available.some((service) => service.id === filter.serviceId)
      ? filter.serviceId
      : null;
  // A cleared filter must not return when its service is back in the queue.
  useEffect(() => {
    if (filter && serviceId === null) setFilter(null);
  }, [filter, serviceId]);
  const titles = queueFor(state, selectedGroupId, serviceId);

  // Each new mark is a new object, so it restarts the timer and replaces the toast.
  useEffect(() => {
    if (!undo) return;
    const timer = setTimeout(() => setUndo(null), UNDO_MS);
    return () => clearTimeout(timer);
  }, [undo]);

  function handleMarkWatched(title: Title) {
    store.markWatched(title.id);
    setUndo({ id: title.id, name: title.name });
  }

  function handleUndo() {
    if (undo) store.unwatchTitle(undo.id);
    setUndo(null);
  }

  return (
    <View style={styles.container}>
      <GroupPicker
        groups={state.groups}
        onSelect={(id) => {
          setFilter(null);
          onSelectGroup(id);
        }}
        selectedId={selectedGroupId}
      />
      <View style={styles.filter}>
        <ServiceFilter
          onSelect={(id) =>
            setFilter(id === null ? null : { groupId: selectedGroupId, serviceId: id })
          }
          selectedId={serviceId}
          services={available}
        />
      </View>
      <QueueList
        canDrag={serviceId === null}
        onEdit={(title) => setForm({ editing: title })}
        onMarkWatched={handleMarkWatched}
        onReorder={(ids) => store.reorderQueue(selectedGroupId, ids)}
        services={state.services}
        titles={titles}
      />
      {undo ? <UndoToast name={undo.name} onUndo={handleUndo} /> : null}
      <FloatingAddButton
        label="Adicionar título"
        onPress={() => setForm({ editing: null })}
      />
      {form ? (
        <TitleFormModal
          editing={form.editing}
          initialServiceId={serviceId}
          onClose={() => setForm(null)}
          onDelete={() => {
            if (form.editing) store.deleteTitle(form.editing.id);
            setForm(null);
          }}
          onSave={(draft) => {
            store.saveTitle(form.editing?.id ?? null, selectedGroupId, draft);
            setForm(null);
          }}
          services={state.services}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 8,
  },
  filter: {
    flexGrow: 0,
  },
});
