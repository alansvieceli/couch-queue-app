import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export function AppHeader() {
  return (
    <View style={styles.container}>
      <Image
        accessibilityIgnoresInvertColors
        accessible={false}
        source={require('../../../assets/app-icon.png')}
        style={styles.icon}
      />
      <Text style={styles.brandName}>Couch Queue</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  icon: {
    borderRadius: 10,
    height: 36,
    width: 36,
  },
  brandName: {
    color: colors.textPrimary,
    ...typography.sectionTitle,
  },
});
