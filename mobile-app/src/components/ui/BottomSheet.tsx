import { useEffect, useRef } from 'react'
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { X } from 'lucide-react-native'
import { Text } from './Text'
import { t } from '@/i18n'
import { colors, radius, spacing } from '@/theme'

interface Props {
  visible: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function BottomSheet({ visible, onClose, title, children, footer }: Props) {
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()
  const translateY = useRef(new Animated.Value(height)).current

  useEffect(() => {
    if (visible) {
      translateY.setValue(height)
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 200 }).start()
    }
  }, [visible, height, translateY])

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      {/* Android edge-to-edge : la fenêtre n'est plus redimensionnée par le clavier, on remonte la feuille nous-mêmes. */}
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <Pressable accessibilityLabel={t('common.actions.close')} style={[StyleSheet.absoluteFill, styles.backdrop]} onPress={onClose} />
        <View style={styles.container} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.sheet,
              { maxHeight: height * 0.88, paddingBottom: Math.max(insets.bottom, spacing.lg), transform: [{ translateY }] },
            ]}
          >
            <View style={styles.handle} />
            {title ? (
              <View style={styles.header}>
                <Text variant="heading" style={styles.flex}>
                  {title}
                </Text>
                <Pressable accessibilityRole="button" accessibilityLabel={t('common.actions.close')} hitSlop={12} onPress={onClose} style={styles.close}>
                  <X size={20} color={colors.slate600} />
                </Pressable>
              </View>
            ) : null}
            <ScrollView
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { backgroundColor: 'rgba(15, 23, 42, 0.5)' },
  container: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.slate200,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screen,
    paddingVertical: 8,
  },
  close: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: spacing.screen, paddingVertical: 8, gap: 12 },
  footer: { paddingHorizontal: spacing.screen, paddingTop: 12, gap: 10 },
})
