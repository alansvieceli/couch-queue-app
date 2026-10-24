import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import type { AppStore } from '../../hooks/useAppState';
import type { DeviceSetting } from '../../hooks/useDeviceSetting';
import { backupFileName, createBackupText, parseBackupText } from '../../lib/backup';
import { type HistorySettings, periodLabel } from '../../lib/history';
import { pickBackupText, shareBackupFile } from '../../services/backupFiles';
import { sha256 } from '../../services/sha256';
import { confirmAction } from '../common/confirmAction';
import { DataSection, type DataStatus } from './DataSection';
import { GroupsSection } from './GroupsSection';
import { HistorySection } from './HistorySection';
import { ServicesSection } from './ServicesSection';

export function MaintenanceScreen({
  store,
  history,
}: {
  store: AppStore;
  history: DeviceSetting<HistorySettings>;
}) {
  const [status, setStatus] = useState<DataStatus>(null);

  async function handleKeepMonths(keepMonths: number | null) {
    const expired = store.countExpiredWatched(keepMonths);
    if (expired > 0) {
      const confirmed = await confirmAction(
        'Apagar títulos antigos',
        `Apagar ${expired} título(s) visto(s) há mais de ${periodLabel(keepMonths)}?`,
        'Apagar',
      );
      if (!confirmed) return;
    }
    await history.save({ keepMonths });
    store.purgeOldWatched(keepMonths);
  }

  async function handleBackup() {
    try {
      const now = new Date();
      const text = await createBackupText(store.state, now, sha256);
      await shareBackupFile(backupFileName(now), text);
      setStatus({ kind: 'success', text: 'Backup pronto para salvar.' });
    } catch {
      setStatus({ kind: 'error', text: 'Não foi possível criar o backup.' });
    }
  }

  async function handleRestore() {
    try {
      const text = await pickBackupText();
      if (text === null) return;
      const result = await parseBackupText(text, sha256);
      if (!result.ok) {
        setStatus({ kind: 'error', text: result.error });
        return;
      }
      const confirmed = await confirmAction(
        'Restaurar backup',
        'Os dados atuais serão substituídos.',
        'Restaurar',
      );
      if (!confirmed) return;
      store.replaceState(result.state);
      setStatus({ kind: 'success', text: 'Backup restaurado.' });
    } catch {
      setStatus({ kind: 'error', text: 'Não foi possível ler o arquivo.' });
    }
  }

  async function handleReset() {
    const confirmed = await confirmAction(
      'Limpar tudo',
      'Todos os dados serão apagados e o app volta ao estado inicial.',
      'Limpar',
    );
    if (!confirmed) return;
    store.resetState();
    setStatus({ kind: 'success', text: 'Dados apagados.' });
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <GroupsSection store={store} />
      <ServicesSection store={store} />
      <HistorySection
        keepMonths={history.value.keepMonths}
        onSelect={handleKeepMonths}
      />
      <DataSection
        onBackup={handleBackup}
        onReset={handleReset}
        onRestore={handleRestore}
        status={status}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 12,
  },
});
