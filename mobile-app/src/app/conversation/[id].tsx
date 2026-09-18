import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, Keyboard, KeyboardAvoidingView, Pressable, StyleSheet, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { useHeaderHeight } from 'expo-router/react-navigation'
import { Send, User as UserIcon } from 'lucide-react-native'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { pushedScreenOptions } from '@/lib/navigation'
import { Text } from '@/components/ui/Text'
import { useAuth } from '@/contexts/AuthContext'
import { useUnread } from '@/contexts/UnreadContext'
import { t } from '@/i18n'
import { api, ApiError, errorMessage } from '@/lib/api'
import { formatDayLabel, formatTime, isSameDay } from '@/lib/format'
import { useFocusedInterval, useStatusBar } from '@/lib/hooks'
import type { Message } from '@/lib/types'
import { colors, fonts, radius, spacing } from '@/theme'

type Item = { type: 'day'; key: string; label: string } | { type: 'message'; key: string; message: Message }

export default function ConversationScreen() {
  const { id, name = t('messages.conversation.defaultTitle'), role } = useLocalSearchParams<{ id: string; name?: string; role?: string }>()
  const { user } = useAuth()
  const { refresh: refreshUnread } = useUnread()
  const insets = useSafeAreaInsets()
  const headerHeight = useHeaderHeight()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<{ message: string; subscription: boolean } | null>(null)
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const markingRef = useRef(false)
  useStatusBar('dark')

  const fetchMessages = useCallback(async () => {
    try {
      const data = await api<{ messages: Message[] }>(`/api/chat/messages?conversationId=${encodeURIComponent(id)}`)
      setMessages(data?.messages || [])
    } catch {
      // Le polling réessaiera.
    } finally {
      setLoading(false)
    }
  }, [id])

  useFocusEffect(
    useCallback(() => {
      fetchMessages()
    }, [fetchMessages]),
  )
  useFocusedInterval(fetchMessages, 3000)

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true))
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false))
    return () => {
      show.remove()
      hide.remove()
    }
  }, [])

  // Marque comme lus les messages reçus.
  useEffect(() => {
    if (!user || markingRef.current) return
    if (!messages.some((m) => !m.isRead && m.senderId !== user.id)) return
    markingRef.current = true
    api('/api/chat/read', { method: 'POST', body: { conversationId: id } })
      .then(() => refreshUnread())
      .catch(() => {})
      .finally(() => {
        markingRef.current = false
      })
  }, [messages, id, user, refreshUnread])

  const items = useMemo(() => {
    const list: Item[] = []
    messages.forEach((message, index) => {
      const date = new Date(message.createdAt)
      if (index === 0 || !isSameDay(date, new Date(messages[index - 1].createdAt))) {
        list.push({ type: 'day', key: `day-${message.id}`, label: formatDayLabel(date) })
      }
      list.push({ type: 'message', key: message.id, message })
    })
    return list.reverse() // liste inversée : les plus récents en bas
  }, [messages])

  const send = async () => {
    const content = draft.trim()
    if (!content || sending) return
    setSending(true)
    setSendError(null)
    try {
      const data = await api<{ message: Message }>('/api/chat/send', {
        method: 'POST',
        body: { conversationId: id, content },
      })
      setDraft('')
      if (data?.message) {
        setMessages((prev) => (prev.some((m) => m.id === data.message.id) ? prev : [...prev, data.message]))
      }
    } catch (err) {
      const subscription = err instanceof ApiError && err.status === 403 && user?.role === 'agence'
      setSendError({ message: errorMessage(err, t('messages.conversation.sendFailed')), subscription })
    } finally {
      setSending(false)
    }
  }

  return (
    <View style={styles.root}>
      <Stack.Screen
        options={{
          ...pushedScreenOptions,
          headerStyle: { backgroundColor: colors.surface },
          headerTitle: () => (
            <View style={styles.headerTitle}>
              <Text variant="headline" numberOfLines={1}>
                {name}
              </Text>
              {role ? <Text variant="caption">{role}</Text> : null}
            </View>
          ),
          headerRight: () => <Avatar name={name} size={34} />,
        }}
      />

      {/* L'en-tête natif est opaque : sans ce décalage, le champ reste sous le clavier. */}
      <KeyboardAvoidingView style={styles.flex} behavior="padding" keyboardVerticalOffset={headerHeight}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.ink} />
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.center}>
            <View style={styles.emptyIcon}>
              <UserIcon size={24} color={colors.slate500} />
            </View>
            <Text variant="bodyLight" center>
              {t('messages.conversation.start', { name })}
            </Text>
          </View>
        ) : (
          <FlatList
            inverted
            data={items}
            keyExtractor={(item) => item.key}
            contentContainerStyle={styles.list}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              if (item.type === 'day') {
                return (
                  <Text variant="caption" center style={styles.day}>
                    {item.label}
                  </Text>
                )
              }
              const mine = item.message.senderId === user?.id
              return (
                <View style={[styles.bubbleRow, { justifyContent: mine ? 'flex-end' : 'flex-start' }]}>
                  <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                    <Text selectable style={[styles.bubbleText, { color: mine ? colors.white : colors.ink }]}>
                      {item.message.content}
                    </Text>
                    <Text style={[styles.time, { color: mine ? 'rgba(255,255,255,0.6)' : colors.slate400 }]}>
                      {formatTime(item.message.createdAt)}
                    </Text>
                  </View>
                </View>
              )
            }}
          />
        )}

        {sendError ? (
          <View style={styles.errorBox}>
            <Text variant="body" color={colors.red600} style={{ fontSize: 14 }}>
              {sendError.message}
            </Text>
            {sendError.subscription ? (
              <Button title={t('messages.conversation.manageSubscription')} variant="outline" size="sm" fullWidth={false} onPress={() => router.navigate('/agence/profil/abonnement')} />
            ) : null}
          </View>
        ) : null}

        <View style={[styles.composer, { paddingBottom: keyboardVisible ? 10 : Math.max(insets.bottom, 10) }]}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={t('messages.conversation.placeholder')}
            placeholderTextColor={colors.slate400}
            multiline
            style={styles.input}
            accessibilityLabel={t('messages.conversation.inputA11y')}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('messages.conversation.send')}
            disabled={!draft.trim() || sending}
            onPress={send}
            style={[styles.sendButton, !draft.trim() || sending ? { opacity: 0.4 } : null]}
          >
            {sending ? <ActivityIndicator size="small" color={colors.white} /> : <Send size={18} color={colors.white} />}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  headerTitle: { alignItems: 'center', maxWidth: 220 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { paddingHorizontal: spacing.lg, paddingVertical: 12, gap: 6 },
  day: { marginVertical: 10, textTransform: 'capitalize' },
  bubbleRow: { flexDirection: 'row' },
  bubble: { maxWidth: '82%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9, gap: 2 },
  mine: { backgroundColor: colors.ink, borderBottomRightRadius: 4 },
  theirs: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate200,
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21 },
  time: { fontFamily: fonts.regular, fontSize: 10, alignSelf: 'flex-end' },
  errorBox: {
    marginHorizontal: spacing.lg,
    marginBottom: 8,
    padding: 12,
    gap: 8,
    borderRadius: radius.md,
    backgroundColor: colors.red50,
    borderWidth: 1,
    borderColor: colors.red200,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: spacing.lg,
    paddingTop: 10,
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.slate200,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 22,
    backgroundColor: colors.slate100,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.ink,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
