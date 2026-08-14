import type { Metadata } from 'next'
import { LegalShell, LegalSection, ToFill } from '@/components/layout/LegalShell'

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: "Mentions légales du site IMMOCIBLE : éditeur, hébergeur et propriété intellectuelle.",
  alternates: { canonical: '/mentions-legales' },
}

export default function MentionsLegalesPage() {
  return (
    <LegalShell title="Mentions légales" lastUpdated="14 août 2026">
      <p className="mb-8 text-sm text-slate-500">
        Les mentions ci-dessous doivent être complétées avec les informations réelles de la
        société éditrice avant toute mise en ligne. Les éléments surlignés restent à renseigner.
      </p>

      <LegalSection title="Éditeur du site">
        <p>
          Le site IMMOCIBLE est édité par <ToFill>[Raison sociale]</ToFill>, société{' '}
          <ToFill>[forme juridique, ex. SAS]</ToFill> au capital de{' '}
          <ToFill>[montant]</ToFill> €, immatriculée au RCS de <ToFill>[ville]</ToFill> sous le
          numéro <ToFill>[SIREN / SIRET]</ToFill>.
        </p>
        <p>
          Siège social : <ToFill>[adresse complète]</ToFill>.<br />
          Numéro de TVA intracommunautaire : <ToFill>[FR..]</ToFill>.<br />
          Adresse e-mail : contact@immocible.com — Téléphone : <ToFill>[numéro]</ToFill>.
        </p>
        <p>
          Directeur de la publication : <ToFill>[nom du représentant légal]</ToFill>.
        </p>
      </LegalSection>

      <LegalSection title="Hébergement">
        <p>
          Le site est hébergé par <ToFill>[nom de l'hébergeur]</ToFill>,{' '}
          <ToFill>[adresse de l'hébergeur]</ToFill>, <ToFill>[téléphone / site]</ToFill>.
        </p>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          L&apos;ensemble des contenus présents sur le site (marque IMMOCIBLE, logo, textes,
          visuels, éléments graphiques, structure) est protégé par le droit de la propriété
          intellectuelle. Toute reproduction ou représentation, totale ou partielle, sans
          autorisation écrite préalable, est interdite.
        </p>
      </LegalSection>

      <LegalSection title="Responsabilité">
        <p>
          L&apos;éditeur s&apos;efforce d&apos;assurer l&apos;exactitude des informations diffusées
          mais ne saurait être tenu responsable des erreurs, d&apos;une absence de disponibilité des
          informations ou de la présence de virus sur le site.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Pour toute question relative au site, vous pouvez écrire à l&apos;adresse{' '}
          contact@immocible.com.
        </p>
      </LegalSection>
    </LegalShell>
  )
}
