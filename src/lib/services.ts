import type { AppState } from './appState';

export function addService(state: AppState, id: string, name: string): AppState {
  const trimmed = name.trim();
  if (trimmed === '') return state;
  return { ...state, services: [...state.services, { id, name: trimmed }] };
}

export function renameService(state: AppState, id: string, name: string): AppState {
  const trimmed = name.trim();
  if (trimmed === '' || !state.services.some((service) => service.id === id)) {
    return state;
  }
  return {
    ...state,
    services: state.services.map((service) =>
      service.id === id ? { ...service, name: trimmed } : service,
    ),
  };
}

export function serviceDeleteBlock(state: AppState, id: string): 'in-use' | null {
  return state.titles.some((title) => title.serviceId === id) ? 'in-use' : null;
}

export function deleteService(state: AppState, id: string): AppState {
  if (serviceDeleteBlock(state, id) !== null) return state;
  if (!state.services.some((service) => service.id === id)) return state;
  return { ...state, services: state.services.filter((service) => service.id !== id) };
}
