import { useRef } from 'react'
import { Platform } from 'react-native'
import { router } from 'expo-router'
import { Building2, KeyRound } from 'lucide-react-native'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { OptionCard } from '@/components/ui/OptionCard'
import { Text } from '@/components/ui/Text'
import { t } from '@/i18n'

type SignupHref = '/inscription-acquereur' | '/inscription-agence'

/** Choix du type de compte avant l'inscription. */
export function RoleSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const pending = useRef<SignupHref | null>(null)

  const go = (href: SignupHref) => {
    onClose()
    if (Platform.OS === 'ios') {
      // iOS : une navigation lancée pendant la fermeture de la modale est ignorée ;
      // on attend que la feuille soit entièrement fermée (onDismiss).
      pending.current = href
    } else {
      setTimeout(() => router.push(href), 250)
    }
  }

  const onDismissed = () => {
    const href = pending.current
    pending.current = null
    if (href) router.push(href)
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} onDismissed={onDismissed} title={t('auth.roleSheet.title')}>
      <Text variant="subhead">{t('auth.roleSheet.subtitle')}</Text>
      <OptionCard
        label={t('auth.roleSheet.buyerLabel')}
        description={t('auth.roleSheet.buyerDescription')}
        icon={KeyRound}
        selected={false}
        onPress={() => go('/inscription-acquereur')}
      />
      <OptionCard
        label={t('auth.roleSheet.agencyLabel')}
        description={t('auth.roleSheet.agencyDescription')}
        icon={Building2}
        selected={false}
        onPress={() => go('/inscription-agence')}
      />
    </BottomSheet>
  )
}
