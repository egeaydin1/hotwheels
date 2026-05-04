-- CreateEnum
CREATE TYPE "Source" AS ENUM ('official', 'user_submitted');
CREATE TYPE "SeriesType" AS ENUM ('mainline', 'premium', 'treasure_hunt', 'super_treasure_hunt', 'pop_culture', 'id_car', 'custom');
CREATE TYPE "CarStatus" AS ENUM ('owned', 'wishlist', 'for_trade');
CREATE TYPE "Visibility" AS ENUM ('public', 'private', 'unlisted');
CREATE TYPE "UserRole" AS ENUM ('free', 'pro', 'dealer', 'admin');

-- CreateTable users
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "username" TEXT NOT NULL,
    "display_name" TEXT,
    "avatar_url" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'free',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateTable series
CREATE TABLE "series" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "type" "SeriesType" NOT NULL DEFAULT 'mainline',
    "car_count" INTEGER,
    "photo_url" TEXT,
    CONSTRAINT "series_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "series_name_year_key" ON "series"("name", "year");

-- CreateTable cars
CREATE TABLE "cars" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "series_id" TEXT,
    "year" INTEGER NOT NULL,
    "collector_number" TEXT,
    "color" TEXT,
    "category" TEXT,
    "photo_url" TEXT,
    "market_value" DOUBLE PRECISION,
    "source" "Source" NOT NULL DEFAULT 'official',
    "submitted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cars_pkey" PRIMARY KEY ("id")
);

-- CreateTable portfolios
CREATE TABLE "portfolios" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cover_photo_url" TEXT,
    "visibility" "Visibility" NOT NULL DEFAULT 'private',
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "share_slug" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "portfolios_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "portfolios_share_slug_key" ON "portfolios"("share_slug");

-- CreateTable portfolio_cars
CREATE TABLE "portfolio_cars" (
    "id" TEXT NOT NULL,
    "portfolio_id" TEXT NOT NULL,
    "car_id" TEXT NOT NULL,
    "status" "CarStatus" NOT NULL DEFAULT 'owned',
    "notes" TEXT,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "portfolio_cars_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "portfolio_cars_portfolio_id_car_id_key" ON "portfolio_cars"("portfolio_id", "car_id");

-- AddForeignKey
ALTER TABLE "cars" ADD CONSTRAINT "cars_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "series"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "cars" ADD CONSTRAINT "cars_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "portfolio_cars" ADD CONSTRAINT "portfolio_cars_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "portfolio_cars" ADD CONSTRAINT "portfolio_cars_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "cars"("id") ON DELETE CASCADE ON UPDATE CASCADE;
