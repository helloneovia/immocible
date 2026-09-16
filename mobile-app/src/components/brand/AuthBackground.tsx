import { StyleSheet, View } from 'react-native'
import { Image } from 'expo-image'
import { colors } from '@/theme'

// Mêmes visuels d'architecture que les pages de connexion du site.
export const PHOTOS = {
  home: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  // La photo du web (photo-1600607687939) renvoie 404 : on réutilise celle de l'accueil.
  acquereur: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  agence: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  password: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  cta: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  blog: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
}

/** Photo plein écran assombrie + lignes architecturales décoratives. */
export function PhotoBackdrop({ uri, opacity = 0.75 }: { uri: string; opacity?: number }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.ink, opacity }]} />
      <View style={[styles.vLine, { left: '25%' }]} />
      <View style={[styles.vLine, { right: '25%' }]} />
      <View style={[styles.hLine, { top: '33%' }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  vLine: { position: 'absolute', top: 0, bottom: 0, width: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.12)' },
  hLine: { position: 'absolute', left: 0, right: 0, height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.12)' },
})
