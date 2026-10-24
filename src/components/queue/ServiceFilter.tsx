import type { Service } from '../../lib/appState';
import { ChipRow } from '../common/ChipRow';

const ALL = '';

type ServiceFilterProps = {
  services: Service[];
  selectedId: string | null; // null = Todos
  onSelect: (id: string | null) => void;
};

export function ServiceFilter({ services, selectedId, onSelect }: ServiceFilterProps) {
  const options = [
    { id: ALL, label: 'Todos' },
    ...services.map((service) => ({ id: service.id, label: service.name })),
  ];
  return (
    <ChipRow
      onSelect={(id) => onSelect(id === ALL ? null : id)}
      options={options}
      selectedId={selectedId ?? ALL}
    />
  );
}
