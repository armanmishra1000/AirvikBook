-- AlterTable
ALTER TABLE "users" ADD COLUMN     "allowGoogleSync" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "occupation" TEXT,
ADD COLUMN     "profilePictureSource" TEXT DEFAULT 'DEFAULT',
ADD COLUMN     "profileVisibility" TEXT NOT NULL DEFAULT 'PUBLIC',
ADD COLUMN     "showEmail" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showPhone" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "website" TEXT;
