import { cn } from '@/lib/utils'

/**
 * Icône de marque IMMOCIBLE : une maison stylisée dont l'intérieur forme
 * une cible, avec une épingle dorée (jeu de mots « immo » + « cible »).
 *
 * Le tracé de la maison et de la cible utilise `currentColor` : il suffit de
 * poser une classe de couleur de texte sur le parent (`text-white`,
 * `text-slate-900`, …) pour l'adapter au fond. L'épingle reste dorée en toutes
 * circonstances grâce à un dégradé fixe.
 */
export function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      role="img"
      aria-label="IMMOCIBLE"
    >
      <defs>
        <linearGradient id="immocible-gold" x1="26" y1="24" x2="38" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F4D480" />
          <stop offset="0.55" stopColor="#E0A93B" />
          <stop offset="1" stopColor="#C8912E" />
        </linearGradient>
      </defs>

      {/* Maison (toit + cheminée, ouverte en bas pour la porte) */}
      <path
        d="M26 55 L13 55 L13 25 L32 7 L43 17.4 L43 11 L48 11 L48 22.1 L51 25 L51 55 L38 55"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Cible : arc en fer à cheval ouvert vers le bas */}
      <path
        d="M21 40 A13 13 0 1 1 43 40"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
      />

      {/* Épingle dorée */}
      <line
        x1="32"
        y1="30"
        x2="32"
        y2="48"
        stroke="url(#immocible-gold)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="32" cy="28.5" r="5.6" fill="url(#immocible-gold)" />
    </svg>
  )
}

interface LogoProps {
  /** Affiche le mot « IMMOCIBLE » à côté de l'icône. Défaut : true. */
  showWordmark?: boolean
  /** Classe du conteneur (porte la couleur du texte, ex. `text-white`). */
  className?: string
  /** Classe de l'icône (dimensions). */
  iconClassName?: string
  /** Classe du wordmark — pratique pour le masquer en mobile : `hidden sm:inline-block`. */
  wordmarkClassName?: string
}

/**
 * Logo complet (icône + wordmark). Pour masquer le texte en version mobile,
 * passer `wordmarkClassName="hidden sm:inline-block"`.
 */
export function Logo({
  showWordmark = true,
  className,
  iconClassName,
  wordmarkClassName,
}: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoIcon className={cn('h-9 w-9 shrink-0', iconClassName)} />
      {showWordmark && (
        <span
          className={cn(
            'text-xl sm:text-2xl font-bold tracking-[0.16em] leading-none',
            wordmarkClassName,
          )}
        >
          IMMOCIBLE
        </span>
      )}
    </span>
  )
}
