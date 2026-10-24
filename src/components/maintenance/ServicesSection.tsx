import type { AppStore } from '../../hooks/useAppState';
import { confirmAction } from '../common/confirmAction';
import { EditableListSection, type NamedItem } from '../common/EditableListSection';

export function ServicesSection({ store }: { store: AppStore }) {
  async function handleDelete(service: NamedItem) {
    if (store.getServiceDeleteBlock(service.id) === 'in-use') {
      return 'Mova ou exclua os títulos deste streaming antes.';
    }
    const confirmed = await confirmAction(
      'Excluir streaming',
      `Excluir "${service.name}"?`,
      'Excluir',
    );
    if (confirmed) store.deleteService(service.id);
    return null;
  }

  return (
    <EditableListSection
      items={store.state.services}
      noun="streaming"
      onAdd={() => store.addService(`Streaming ${store.state.services.length + 1}`)}
      onDelete={handleDelete}
      onRename={store.renameService}
      title="Streamings"
    />
  );
}
