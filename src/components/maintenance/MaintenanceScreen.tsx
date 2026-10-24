import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export function MaintenanceScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Manutenção</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  text: {
    color: colors.textSecondary,
    ...typography.body,
  },
});
