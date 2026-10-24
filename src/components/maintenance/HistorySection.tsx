import { StyleSheet, Text } from 'react-native';

import { HISTORY_MONTH_OPTIONS, periodLabel } from '../../lib/history';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { ChipRow } from '../common/ChipRow';
import { SectionCard } from '../common/SectionCard';

type HistorySectionProps = {
  keepMonths: number | null;
  onSelect: (keepMonths: number | null) => void;
};

const NEVER = 'never';
const toId = (months: number | null) => (months === null ? NEVER : String(months));
const options = HISTORY_MONTH_OPTIONS.map((months) => ({
  id: toId(months),
  label: periodLabel(months),
}));

export function HistorySection({ keepMonths, onSelect }: HistorySectionProps) {
  return (
    <SectionCard title="Histórico">
      <Text style={styles.note}>Manter títulos vistos por</Text>
      <ChipRow
        onSelect={(id) => onSelect(id === NEVER ? null : Number(id))}
        options={options}
        selectedId={toId(keepMonths)}
      />
      <Text style={styles.note}>
        Títulos vistos há mais tempo são apagados automaticamente.
      </Text>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  note: {
    color: colors.textSecondary,
    ...typography.bodySmall,
  },
});
