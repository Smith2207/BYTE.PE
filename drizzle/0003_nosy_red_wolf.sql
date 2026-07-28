ALTER TABLE "pedidos" ADD COLUMN "token_acceso" text;--> statement-breakpoint
UPDATE "pedidos" SET "token_acceso" = md5(random()::text || clock_timestamp()::text) || md5(random()::text || clock_timestamp()::text) WHERE "token_acceso" IS NULL;--> statement-breakpoint
ALTER TABLE "pedidos" ALTER COLUMN "token_acceso" SET NOT NULL;
