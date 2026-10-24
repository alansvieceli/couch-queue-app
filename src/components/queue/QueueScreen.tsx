import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export function QueueScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Fila</Text>
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
