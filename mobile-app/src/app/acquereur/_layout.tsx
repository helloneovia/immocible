import { NativeTabs } from 'expo-router/unstable-native-tabs'
import { useUnread } from '@/contexts/UnreadContext'
import { colors } from '@/theme'

/** Barre d'onglets native : verre liquide sur iOS 26, Material 3 sur Android. */
export default function AcquereurTabs() {
  const { count } = useUnread()
  return (
    <NativeTabs tintColor={colors.navy} badgeBackgroundColor={colors.danger}>
      <NativeTabs.Trigger name="accueil">
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
        <NativeTabs.Trigger.Label>Accueil</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="projet">
        <NativeTabs.Trigger.Icon sf="scope" md="track_changes" />
        <NativeTabs.Trigger.Label>Mon projet</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="messages">
        <NativeTabs.Trigger.Icon sf={{ default: 'bubble.left.and.bubble.right', selected: 'bubble.left.and.bubble.right.fill' }} md="forum" />
        <NativeTabs.Trigger.Label>Messages</NativeTabs.Trigger.Label>
        {count > 0 ? <NativeTabs.Trigger.Badge>{count > 9 ? '9+' : String(count)}</NativeTabs.Trigger.Badge> : null}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profil">
        <NativeTabs.Trigger.Icon sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }} md="account_circle" />
        <NativeTabs.Trigger.Label>Profil</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}
