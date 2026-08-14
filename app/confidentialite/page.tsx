import type { Metadata } from 'next'
import { LegalShell, LegalSection, ToFill } from '@/components/layout/LegalShell'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description:
    "Politique de confidentialité d'IMMOCIBLE : données collectées, finalités, durées de conservation et exercice de vos droits (RGPD).",
  alternates: { canonical: '/confidentialite' },
}

export default function ConfidentialitePage() {
  return (
    <LegalShell title="Politique de confidentialité" lastUpdated="14 août 2026">
      <p className="mb-8 text-sm text-slate-500">
        Ce document décrit le traitement des données personnelles sur IMMOCIBLE. Il doit être
        validé par l&apos;exploitant (et, le cas échéant, son conseil) avant mise en ligne.
      </p>

      <LegalSection title="Responsable du traitement">
        <p>
          Le responsable du traitement est <ToFill>[Raison sociale]</ToFill>,{' '}
          <ToFill>[adresse]</ToFill>. Pour toute question relative à vos données :
          contact@immocible.com.
        </p>
      </LegalSection>

      <LegalSection title="Données collectées">
        <p>Nous collectons les données que vous nous fournissez et celles générées par l&apos;usage du service :</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Données d&apos;identification : nom, prénom, adresse e-mail, téléphone.</li>
          <li>Données de compte : rôle (acquéreur / agence), mot de passe (stocké chiffré), nom de l&apos;agence.</li>
          <li>Critères de recherche immobilière (budget, localisation, type de bien, etc.).</li>
          <li>Données de paiement d&apos;abonnement, traitées par notre prestataire Stripe (nous ne stockons pas vos numéros de carte).</li>
          <li>Données de navigation et de mesure d&apos;audience, soumises à votre consentement (voir « Cookies »).</li>
        </ul>
      </LegalSection>

      <LegalSection title="Finalités et bases légales">
        <ul className="list-disc pl-6 space-y-2">
          <li>Fournir le service de mise en relation (exécution du contrat).</li>
          <li>Gérer les comptes, l&apos;authentification et le support (exécution du contrat).</li>
          <li>Gérer les abonnements et la facturation (exécution du contrat, obligation légale).</li>
          <li>Envoyer des communications et newsletters (consentement, retirable à tout moment).</li>
          <li>Mesurer l&apos;audience et améliorer le service (consentement / intérêt légitime).</li>
        </ul>
      </LegalSection>

      <LegalSection title="Destinataires">
        <p>
          Vos données sont accessibles aux équipes habilitées d&apos;IMMOCIBLE et à ses sous-traitants
          techniques : hébergeur, prestataire de paiement (Stripe), service d&apos;e-mailing
          (<ToFill>[Mailjet ou autre]</ToFill>) et service de notifications. Les coordonnées d&apos;un
          acquéreur ne sont transmises à une agence qu&apos;après déblocage explicite par cette dernière.
        </p>
      </LegalSection>

      <LegalSection title="Durées de conservation">
        <ul className="list-disc pl-6 space-y-2">
          <li>Données de compte : pendant la durée de vie du compte, puis <ToFill>[ex. 3 ans]</ToFill> après le dernier contact.</li>
          <li>Données de facturation : 10 ans (obligation comptable).</li>
          <li>Données de mesure d&apos;audience : 13 mois maximum.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Vos droits">
        <p>
          Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification,
          d&apos;effacement, d&apos;opposition, de limitation et de portabilité de vos données, ainsi
          que du droit de définir des directives post-mortem. Vous pouvez les exercer à
          contact@immocible.com. Vous pouvez également introduire une réclamation auprès de la CNIL
          (www.cnil.fr).
        </p>
      </LegalSection>

      <LegalSection title="Cookies et mesure d'audience">
        <p>
          Le site dépose des cookies et effectue une mesure d&apos;audience. Les traceurs non
          strictement nécessaires ne sont activés qu&apos;après votre consentement, recueilli via le
          bandeau prévu à cet effet. Vous pouvez modifier votre choix à tout moment en effaçant les
          cookies de votre navigateur.
        </p>
      </LegalSection>

      <LegalSection title="Transferts hors Union européenne">
        <p>
          Certains sous-traitants peuvent traiter des données hors de l&apos;Union européenne. Le cas
          échéant, ces transferts sont encadrés par des garanties appropriées (clauses contractuelles
          types de la Commission européenne).
        </p>
      </LegalSection>
    </LegalShell>
  )
}
