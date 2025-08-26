import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1756199868260 implements MigrationInterface {
    name = 'InitSchema1756199868260'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "group_invitations" DROP CONSTRAINT "FK_704e91e3040e6f3752baf5b752e"`);
        await queryRunner.query(`ALTER TABLE "preset_amounts" DROP CONSTRAINT "preset_amounts_user_commerce_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "auth_verifications" DROP CONSTRAINT "fk_auth_verifications_role"`);
        await queryRunner.query(`ALTER TABLE "amount_to_payment" DROP CONSTRAINT "amount_to_payment_user_commerce_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "group_invitations" DROP CONSTRAINT "UQ_37005828e09a0a0f48e3779c7fd"`);
        await queryRunner.query(`CREATE TABLE "organizations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(150) NOT NULL, "legal_name" character varying(150), "ruc" character varying(20), "category" character varying(100), "description" text, "phone" character varying(20), "email" character varying(100), "address" character varying(255), "city" character varying(100), "province" character varying(100), "country" character varying(100), "latitude" numeric(10,7), "longitude" numeric(10,7), "website" character varying(255), "is_active" boolean NOT NULL DEFAULT true, "user_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_245468c5a2914202a3081b1494" UNIQUE ("user_id"), CONSTRAINT "PK_6b031fcd0863e3f6b44230163f9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "testimonies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" text NOT NULL, "rating" integer, "is_approved" boolean NOT NULL DEFAULT false, "user_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_66810cc4e65709c3bb30c5679bd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "group_invitations" ADD "email" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "group_invitations" ADD "username" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "group_invitations" ADD "phone" character varying(20)`);
        await queryRunner.query(`CREATE TYPE "public"."group_invitations_role_enum" AS ENUM('LEADER', 'MEMBER')`);
        await queryRunner.query(`ALTER TABLE "group_invitations" ADD "role" "public"."group_invitations_role_enum" NOT NULL DEFAULT 'MEMBER'`);
        await queryRunner.query(`ALTER TABLE "group_invitations" ADD "reminder_sent_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "group_invitations" ALTER COLUMN "invited_user_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "group_invitations" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."group_invitations_status_enum" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELED', 'EXPIRED')`);
        await queryRunner.query(`ALTER TABLE "group_invitations" ADD "status" "public"."group_invitations_status_enum" NOT NULL DEFAULT 'PENDING'`);
        await queryRunner.query(`ALTER TABLE "group_invitations" DROP COLUMN "expires_at"`);
        await queryRunner.query(`ALTER TABLE "group_invitations" ADD "expires_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "group_invitations" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "group_invitations" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "group_invitations" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "group_invitations" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "group_invitations" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "group_invitations" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "resources" ALTER COLUMN "limit_user" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "resources" ALTER COLUMN "limit_app" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "resources" ALTER COLUMN "used_acount" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "resources" ALTER COLUMN "user_commerce_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "preset_amounts" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "preset_amounts" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "preset_amounts" DROP COLUMN "message"`);
        await queryRunner.query(`ALTER TABLE "preset_amounts" ADD "message" text`);
        await queryRunner.query(`ALTER TABLE "auth_verifications" ALTER COLUMN "username" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "group_invitations" ADD CONSTRAINT "FK_704e91e3040e6f3752baf5b752e" FOREIGN KEY ("invited_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organizations" ADD CONSTRAINT "FK_245468c5a2914202a3081b1494e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "testimonies" ADD CONSTRAINT "FK_987c4eb325a18ebeda68dc39447" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "resources" ADD CONSTRAINT "FK_0cc9aa2f9903c03f430dafc41ed" FOREIGN KEY ("user_commerce_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "preset_amounts" ADD CONSTRAINT "FK_d4317174e0acaeb7860aad8e8d6" FOREIGN KEY ("user_commerce_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "auth_verifications" ADD CONSTRAINT "FK_097d56b6740689c789b83e73b9d" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "amount_to_payment" ADD CONSTRAINT "FK_17fe41504e35ede7a1c52cfae09" FOREIGN KEY ("user_commerce_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "amount_to_payment" DROP CONSTRAINT "FK_17fe41504e35ede7a1c52cfae09"`);
        await queryRunner.query(`ALTER TABLE "auth_verifications" DROP CONSTRAINT "FK_097d56b6740689c789b83e73b9d"`);
        await queryRunner.query(`ALTER TABLE "preset_amounts" DROP CONSTRAINT "FK_d4317174e0acaeb7860aad8e8d6"`);
        await queryRunner.query(`ALTER TABLE "resources" DROP CONSTRAINT "FK_0cc9aa2f9903c03f430dafc41ed"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1"`);
        await queryRunner.query(`ALTER TABLE "testimonies" DROP CONSTRAINT "FK_987c4eb325a18ebeda68dc39447"`);
        await queryRunner.query(`ALTER TABLE "organizations" DROP CONSTRAINT "FK_245468c5a2914202a3081b1494e"`);
        await queryRunner.query(`ALTER TABLE "group_invitations" DROP CONSTRAINT "FK_704e91e3040e6f3752baf5b752e"`);
        await queryRunner.query(`ALTER TABLE "auth_verifications" ALTER COLUMN "username" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "preset_amounts" DROP COLUMN "message"`);
        await queryRunner.query(`ALTER TABLE "preset_amounts" ADD "message" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "preset_amounts" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "preset_amounts" ADD "name" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "resources" ALTER COLUMN "user_commerce_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "resources" ALTER COLUMN "used_acount" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "resources" ALTER COLUMN "limit_app" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "resources" ALTER COLUMN "limit_user" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "group_invitations" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "group_invitations" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "group_invitations" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "group_invitations" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "group_invitations" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "group_invitations" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "group_invitations" DROP COLUMN "expires_at"`);
        await queryRunner.query(`ALTER TABLE "group_invitations" ADD "expires_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "group_invitations" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."group_invitations_status_enum"`);
        await queryRunner.query(`ALTER TABLE "group_invitations" ADD "status" text NOT NULL DEFAULT 'PENDING'`);
        await queryRunner.query(`ALTER TABLE "group_invitations" ALTER COLUMN "invited_user_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "group_invitations" DROP COLUMN "reminder_sent_at"`);
        await queryRunner.query(`ALTER TABLE "group_invitations" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."group_invitations_role_enum"`);
        await queryRunner.query(`ALTER TABLE "group_invitations" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "group_invitations" DROP COLUMN "username"`);
        await queryRunner.query(`ALTER TABLE "group_invitations" DROP COLUMN "email"`);
        await queryRunner.query(`DROP TABLE "testimonies"`);
        await queryRunner.query(`DROP TABLE "organizations"`);
        await queryRunner.query(`ALTER TABLE "group_invitations" ADD CONSTRAINT "UQ_37005828e09a0a0f48e3779c7fd" UNIQUE ("group_id", "invited_user_id")`);
        await queryRunner.query(`ALTER TABLE "amount_to_payment" ADD CONSTRAINT "amount_to_payment_user_commerce_id_fkey" FOREIGN KEY ("user_commerce_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "auth_verifications" ADD CONSTRAINT "fk_auth_verifications_role" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "preset_amounts" ADD CONSTRAINT "preset_amounts_user_commerce_id_fkey" FOREIGN KEY ("user_commerce_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "group_invitations" ADD CONSTRAINT "FK_704e91e3040e6f3752baf5b752e" FOREIGN KEY ("invited_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
