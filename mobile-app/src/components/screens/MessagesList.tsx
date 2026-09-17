import { useCallback, useMemo, useState } from 'react'
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native'
import { router, Stack, useFocusEffect } from 'expo-router'
import { MessagesSquare } from 'lucide-react-native'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonRows } from '@/components/ui/Skeleton'
import { Text } from '@/components/ui/Text'
import { useUnread } from '@/contexts/UnreadContext'
import { api } from '@/lib/api'
import { formatRelative, singleLine } from '@/lib/format'
import { useFocusedInterval, useStatusBar } from '@/lib/hooks'
import { largeTitleScrollProps } from '@/lib/navigation'
import type { Conversation } from '@/lib/types'
import { colors, fonts, spacing } from '@/theme'

type Viewer = 'acquereur' | 'agence'

/** Nom affiché de l'interlocuteur — même règle que les pages messagerie du web. */
export function recipientOf(conv: Conversation, viewer: Viewer) {
  if (viewer === 'agence') {
    const profile = conv.buyer?.profile
    const name = singleLine(`${profile?.prenom || ''} ${profile?.nom || ''}`)
    return { name: name || conv.buyer?.email || 'Acquéreur', role: 'Acquéreur' }
  }
  // Message de bienvenue : envoyé par la plateforme, pas par une agence.
  return { name: conv.agency?.profile?.nomAgence || conv.agency?.email || 'Agence', role: conv.isPlatform ? 'Plateforme' : 'Agence' }
}

export function openConversation(id: string, name: string, role: string) {
  router.push({ pathname: '/conversation/[id]', params: { id, name, role } })
}

export function MessagesList({ viewer }: { viewer: Viewer }) {
  const { refresh: refreshUnread } = useUnread()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [query, setQuery] = useState('')
  useStatusBar('dark')

  const load = useCallback(async () => {
    try {
      const data = await api<{ conversations: Conversation[] }>('/api/chat/conversations')
      setConversations(data?.conversations || [])
    } catch {
      // la liste précédente reste affichée
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      load()
      refreshUnread()
    }, [load, refreshUnread]),
  )
  useFocusedInterval(load, 15_000)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return conversations
    return conversations.filter((conv) => {
      const { name } = recipientOf(conv, viewer)
      return name.toLowerCase().includes(q) || (conv.messages?.[0]?.content ?? '').toLowerCase().includes(q)
    })
  }, [conversations, query, viewer])

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Messages',
          headerSearchBarOptions: {
            placeholder: 'Rechercher',
            hideWhenScrolling: true,
            onChangeText: (event) => setQuery(event.nativeEvent.text),
            onCancelButtonPress: () => setQuery(''),
          },
        }}
      />
      <FlatList
        {...largeTitleScrollProps}
        style={styles.root}
        data={loading ? [] : filtered}
        keyExtractor={(item) => item.id}
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true)
              load()
              refreshUnread()
            }}
          />
        }
        contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : styles.listContent}
        ListHeaderComponent={loading ? <SkeletonRows count={6} /> : null}
        ListEmptyComponent={
          loading ? null : (
            <EmptyState
              icon={MessagesSquare}
              title={query ? 'Aucun résultat' : 'Aucune conversation'}
              message={
                query
                  ? `Aucune conversation ne correspond à « ${query} ».`
                  : viewer === 'agence'
                    ? 'Ouvrez un dossier acquéreur puis touchez « Discuter » pour démarrer un échange.'
                    : "Les agences partenaires vous écrivent ici dès qu'un bien correspond à votre projet."
              }
              actionLabel={viewer === 'agence' && !query ? 'Voir les acquéreurs' : undefined}
              onAction={viewer === 'agence' && !query ? () => router.navigate('/agence/acquereurs') : undefined}
            />
          )
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => {
          const recipient = recipientOf(item, viewer)
          const last = item.messages?.[0]
          const unread = item._count?.messages ?? 0
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${recipient.name}${unread ? `, ${unread} message${unread > 1 ? 's' : ''} non lu${unread > 1 ? 's' : ''}` : ''}`}
              onPress={() => openConversation(item.id, recipient.name, recipient.role)}
              style={({ pressed }) => [styles.row, pressed ? { backgroundColor: colors.slate50 } : null]}
            >
              <Avatar name={recipient.name} size={52} />
              <View style={styles.body}>
                <View style={styles.line}>
                  <Text numberOfLines={1} style={[styles.name, unread ? styles.nameUnread : null]}>
                    {recipient.name}
                  </Text>
                  <Text style={[styles.time, unread ? { color: colors.goldDeep } : null]}>
                    {formatRelative(last?.createdAt ?? item.updatedAt)}
                  </Text>
                </View>
                <View style={styles.line}>
                  <Text numberOfLines={2} style={[styles.preview, unread ? styles.previewUnread : null]}>
                    {last?.content ? singleLine(last.content) : `Conversation avec ${recipient.role.toLowerCase()}`}
                  </Text>
                  {unread > 0 ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </Pressable>
          )
        }}
      />
    </>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  listContent: { paddingBottom: 32 },
  emptyContainer: { flexGrow: 1, justifyContent: 'center', paddingBottom: 80 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingHorizontal: spacing.lg, paddingVertical: 12 },
  body: { flex: 1, gap: 3, paddingTop: 2 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { flex: 1, fontFamily: fonts.semibold, fontSize: 16, color: colors.ink },
  nameUnread: { fontFamily: fonts.bold },
  time: { fontFamily: fonts.regular, fontSize: 13, color: colors.text3 },
  preview: { flex: 1, fontFamily: fonts.regular, fontSize: 15, lineHeight: 20, color: colors.text2 },
  previewUnread: { color: colors.ink, fontFamily: fonts.medium },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: colors.navy, fontFamily: fonts.bold, fontSize: 12 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: colors.separator, marginLeft: spacing.lg + 66 },
})
