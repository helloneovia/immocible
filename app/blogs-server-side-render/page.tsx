import { permanentRedirect } from 'next/navigation'

// Ancienne URL de débogage consolidée vers /blogs (évite le contenu dupliqué
// et le « (SSR) » exposé publiquement). Redirection permanente (308) pour le SEO.
export default function BlogsSSRRedirect(): never {
  permanentRedirect('/blogs')
}
