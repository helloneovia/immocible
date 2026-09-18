import { router } from 'expo-router'
import { Building2, KeyRound } from 'lucide-react-native'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { OptionCard } from '@/components/ui/OptionCard'
import { Text } from '@/components/ui/Text'
import { t } from '@/i18n'

/** Choix du type de compte avant l'inscription. */
export function RoleSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const go = (href: '/inscription-acquereur' | '/inscription-agence') => {
    onClose()
    setTimeout(() => router.push(href), 250)
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t('auth.roleSheet.title')}>
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
