import type { AppStore } from '../../hooks/useAppState';
import { confirmAction } from '../common/confirmAction';
import { EditableListSection, type NamedItem } from '../common/EditableListSection';

export function GroupsSection({ store }: { store: AppStore }) {
  async function handleDelete(group: NamedItem) {
    if (store.getGroupDeleteBlock(group.id) === 'last-group') {
      return 'É preciso manter ao menos um grupo.';
    }
    const count = store.countGroupTitles(group.id);
    const message =
      count > 0
        ? `Excluir "${group.name}" e os seus ${count} título(s)?`
        : `Excluir "${group.name}"?`;
    if (await confirmAction('Excluir grupo', message, 'Excluir')) {
      store.deleteGroup(group.id);
    }
    return null;
  }

  return (
    <EditableListSection
      items={store.state.groups}
      noun="grupo"
      onAdd={() => store.addGroup(`Grupo ${store.state.groups.length + 1}`)}
      onDelete={handleDelete}
      onRename={store.renameGroup}
      title="Grupos"
    />
  );
}
