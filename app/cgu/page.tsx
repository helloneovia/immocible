import type { Metadata } from 'next'
import { LegalShell, LegalSection, ToFill } from '@/components/layout/LegalShell'

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation et de vente",
  description:
    "Conditions générales d'utilisation et de vente d'IMMOCIBLE : inscription, service acquéreur, abonnement agence et paiement.",
  alternates: { canonical: '/cgu' },
}

export default function CguPage() {
  return (
    <LegalShell title="Conditions générales (CGU / CGV)" lastUpdated="14 août 2026">
      <p className="mb-8 text-sm text-slate-500">
        Modèle à faire valider par un conseil juridique avant mise en ligne, notamment sur les
        clauses de vente d&apos;abonnement, de rétractation et de responsabilité.
      </p>

      <LegalSection title="1. Objet">
        <p>
          Les présentes conditions régissent l&apos;accès et l&apos;utilisation de la plateforme
          IMMOCIBLE, service de mise en relation entre acquéreurs et agences immobilières autour
          d&apos;opportunités off-market.
        </p>
      </LegalSection>

      <LegalSection title="2. Inscription et compte">
        <p>
          L&apos;inscription requiert une adresse e-mail valide et la définition d&apos;un mot de
          passe. L&apos;utilisateur est responsable de la confidentialité de ses identifiants et des
          actions réalisées depuis son compte.
        </p>
      </LegalSection>

      <LegalSection title="3. Service acquéreur">
        <p>
          La création d&apos;un profil acquéreur et la réception de propositions sont gratuites. Les
          coordonnées de l&apos;acquéreur ne sont partagées avec une agence qu&apos;après démarche
          explicite de celle-ci.
        </p>
      </LegalSection>

      <LegalSection title="4. Abonnement agence">
        <p>
          L&apos;accès agence est soumis à un abonnement payant dont le prix en vigueur est affiché
          avant paiement. Le paiement est opéré via notre prestataire Stripe. L&apos;abonnement est
          conclu pour la durée indiquée (<ToFill>[mensuelle / annuelle]</ToFill>) et{' '}
          <ToFill>[reconductible ou non]</ToFill> dans les conditions précisées lors de la souscription.
        </p>
        <p>
          Conformément à l&apos;article L221-28 du Code de la consommation, le droit de rétractation
          ne s&apos;applique pas aux professionnels agissant dans le cadre de leur activité. Les
          conditions de résiliation sont précisées à <ToFill>[modalités de résiliation]</ToFill>.
        </p>
      </LegalSection>

      <LegalSection title="5. Obligations des utilisateurs">
        <p>
          Les utilisateurs s&apos;engagent à fournir des informations exactes, à ne pas détourner le
          service et à ne pas contourner les mécanismes de mise en relation (notamment la
          communication de coordonnées hors des canaux prévus).
        </p>
      </LegalSection>

      <LegalSection title="6. Responsabilité">
        <p>
          IMMOCIBLE fournit un service de mise en relation et n&apos;est pas partie aux transactions
          immobilières conclues entre utilisateurs. Sa responsabilité ne saurait être engagée à raison
          du contenu des annonces ni de l&apos;issue des mises en relation.
        </p>
      </LegalSection>

      <LegalSection title="7. Données personnelles">
        <p>
          Le traitement des données personnelles est décrit dans la{' '}
          <a href="/confidentialite" className="text-slate-900 underline">politique de confidentialité</a>.
        </p>
      </LegalSection>

      <LegalSection title="8. Droit applicable et litiges">
        <p>
          Les présentes conditions sont soumises au droit français. En cas de litige, une solution
          amiable sera recherchée avant toute action judiciaire. Le consommateur peut recourir
          gratuitement à un médiateur de la consommation : <ToFill>[médiateur à désigner]</ToFill>.
        </p>
      </LegalSection>
    </LegalShell>
  )
}
