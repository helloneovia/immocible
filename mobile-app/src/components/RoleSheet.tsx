import { router } from 'expo-router'
import { Building2, KeyRound } from 'lucide-react-native'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { OptionCard } from '@/components/ui/OptionCard'
import { Text } from '@/components/ui/Text'

/** Choix du type de compte avant l'inscription. */
export function RoleSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const go = (href: '/inscription-acquereur' | '/inscription-agence') => {
    onClose()
    setTimeout(() => router.push(href), 250)
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Créer un compte">
      <Text variant="subhead">Choisissez l'espace qui vous correspond.</Text>
      <OptionCard
        label="Je cherche un bien"
        description="Acquéreur · gratuit, sans engagement"
        icon={KeyRound}
        selected={false}
        onPress={() => go('/inscription-acquereur')}
      />
      <OptionCard
        label="Je suis une agence"
        description="Accédez aux acquéreurs qualifiés"
        icon={Building2}
        selected={false}
        onPress={() => go('/inscription-agence')}
      />
    </BottomSheet>
  )
}
