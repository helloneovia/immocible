import { NativeTabs } from 'expo-router/unstable-native-tabs'
import { useUnread } from '@/contexts/UnreadContext'
import { colors } from '@/theme'

/** Barre d'onglets native de l'espace agence. */
export default function AgenceTabs() {
  const { count } = useUnread()
  return (
    <NativeTabs tintColor={colors.navy} badgeBackgroundColor={colors.danger}>
      <NativeTabs.Trigger name="acquereurs">
        <NativeTabs.Trigger.Icon sf={{ default: 'person.2', selected: 'person.2.fill' }} md="group" />
        <NativeTabs.Trigger.Label>Acquéreurs</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="messages">
        <NativeTabs.Trigger.Icon sf={{ default: 'bubble.left.and.bubble.right', selected: 'bubble.left.and.bubble.right.fill' }} md="forum" />
        <NativeTabs.Trigger.Label>Messages</NativeTabs.Trigger.Label>
        {count > 0 ? <NativeTabs.Trigger.Badge>{count > 9 ? '9+' : String(count)}</NativeTabs.Trigger.Badge> : null}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profil">
        <NativeTabs.Trigger.Icon sf={{ default: 'building.2', selected: 'building.2.fill' }} md="apartment" />
        <NativeTabs.Trigger.Label>Profil</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}
