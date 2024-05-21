-- CreateTable
CREATE TABLE "Users" (
    "id" UUID NOT NULL,
    "firstname" VARCHAR(50) NOT NULL,
    "lastname" VARCHAR(50) NOT NULL,
    "birthday" DATE NOT NULL,
    "birthDate" SMALLINT NOT NULL,
    "timezone" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL,
    "updatedAt" TIMESTAMPTZ,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jobs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "birthDate" SMALLINT NOT NULL,
    "timezone" VARCHAR(20) NOT NULL,
    "status" VARCHAR(10),
    "reason" TEXT,
    "executedAt" TIMESTAMP(3),

    CONSTRAINT "Jobs_pkey" PRIMARY KEY ("id")
);
