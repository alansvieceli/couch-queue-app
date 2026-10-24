import { type ReactNode, useEffect, useState } from 'react';
import {
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { IconButton } from './IconButton';

type ModalShellProps = { title: string; onClose: () => void; children: ReactNode };

const EDGE_GAP = 24;

function useKeyboardHeight() {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (event) =>
      setHeight(event.endCoordinates.height),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () => setHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return height;
}

// A dialog centered in the space the keyboard leaves free, so fields and buttons never
// end up behind the keyboard or the system bars. The card shrinks and scrolls instead.
export function ModalShell({ title, onClose, children }: ModalShellProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const keyboardHeight = useKeyboardHeight();
  const availableHeight =
    windowHeight - insets.top - insets.bottom - keyboardHeight - EDGE_GAP * 2;

  return (
    <Modal
      animationType="fade"
      navigationBarTranslucent
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible
    >
      <View
        style={[
          styles.overlay,
          {
            paddingBottom: insets.bottom + keyboardHeight + EDGE_GAP,
            paddingTop: insets.top + EDGE_GAP,
          },
        ]}
      >
        <Pressable
          accessibilityLabel="Fechar"
          onPress={onClose}
          style={styles.backdrop}
        />
        <View style={[styles.card, { maxHeight: Math.max(availableHeight, 160) }]}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <IconButton icon="close" label="Fechar" onPress={onClose} />
          </View>
          <ScrollView
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
            style={styles.scroll}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  backdrop: {
    backgroundColor: colors.overlay,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.textPrimary,
    ...typography.screenTitle,
  },
  scroll: {
    flexShrink: 1,
  },
  body: {
    gap: 12,
    paddingBottom: 20,
  },
});
