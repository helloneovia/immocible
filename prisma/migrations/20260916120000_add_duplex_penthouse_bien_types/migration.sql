-- Les questionnaires web et mobile proposent « Duplex » et « Penthouse » :
-- sans ces valeurs, le serveur les ignorait silencieusement à l'enregistrement.
ALTER TYPE "BienType" ADD VALUE IF NOT EXISTS 'duplex';
ALTER TYPE "BienType" ADD VALUE IF NOT EXISTS 'penthouse';
