-- CreateEnum
CREATE TYPE "Role" AS ENUM ('INDIVIDUAL', 'BUSINESS', 'ADMIN');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('MURABAHA', 'MUSAWAMA', 'IJARAH');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'PENDING_SIGNATURE', 'SIGNED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TitleStatus" AS ENUM ('CLEAN', 'SALVAGE', 'REBUILT');

-- CreateEnum
CREATE TYPE "PaymentFrequency" AS ENUM ('WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "SignerRole" AS ENUM ('SELLER', 'BUYER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT,
    "auth0_id" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'INDIVIDUAL',
    "kyc_status" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "kyc_verified_at" TIMESTAMP(3),
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "contract_number" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "contract_type" "ContractType" NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "vehicle_vin" TEXT,
    "vehicle_year" INTEGER,
    "vehicle_make" TEXT,
    "vehicle_model" TEXT,
    "vehicle_trim" TEXT,
    "vehicle_mileage" INTEGER,
    "vehicle_color" TEXT,
    "title_status" "TitleStatus",
    "seller_name" TEXT,
    "seller_email" TEXT,
    "seller_phone" TEXT,
    "seller_address" TEXT,
    "buyer_name" TEXT,
    "buyer_email" TEXT,
    "buyer_phone" TEXT,
    "buyer_address" TEXT,
    "car_price" DECIMAL(12,2),
    "down_payment" DECIMAL(12,2),
    "markup_percentage" DECIMAL(5,2),
    "markup_amount" DECIMAL(12,2),
    "financed_amount" DECIMAL(12,2),
    "apr" DECIMAL(5,2),
    "term_months" INTEGER,
    "monthly_payment" DECIMAL(12,2),
    "total_payable" DECIMAL(12,2),
    "payment_frequency" "PaymentFrequency",
    "payment_start_date" TIMESTAMP(3),
    "late_fee_amount" DECIMAL(8,2),
    "charity_name" TEXT,
    "special_terms" TEXT,
    "ijarah_subtype" TEXT,
    "security_deposit" DECIMAL(12,2),
    "residual_value" DECIMAL(12,2),
    "docusign_envelope_id" TEXT,
    "seller_signed_at" TIMESTAMP(3),
    "buyer_signed_at" TIMESTAMP(3),
    "signed_pdf_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Signature" (
    "id" TEXT NOT NULL,
    "contract_id" TEXT NOT NULL,
    "signer_role" "SignerRole" NOT NULL,
    "signer_name" TEXT NOT NULL,
    "signer_email" TEXT NOT NULL,
    "signed_at" TIMESTAMP(3),
    "ip_address" TEXT,
    "docusign_recipient_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Signature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_auth0_id_key" ON "User"("auth0_id");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_contract_number_key" ON "Contract"("contract_number");

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Signature" ADD CONSTRAINT "Signature_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
