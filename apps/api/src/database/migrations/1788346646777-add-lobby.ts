import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLobby1788346646777 implements MigrationInterface {
  name = 'AddLobby1788346646777';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."lobbies_mode_enum" AS ENUM('first_lock', 'first_lock_judged', 'queue')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."lobbies_status_enum" AS ENUM('open', 'closed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."lobbies_roundState_enum" AS ENUM('idle', 'armed', 'locked')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."lobby_participants_status_enum" AS ENUM('active', 'timed_out')`,
    );
    await queryRunner.query(`
      CREATE TYPE "public"."lobby_events_type_enum" AS ENUM(
        'participant_joined', 'participant_disconnected', 'participant_reconnected',
        'round_armed', 'round_reset', 'buzz', 'judged_correct', 'judged_incorrect',
        'timeout_set', 'timeouts_reset', 'mode_changed'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "lobbies" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "code" character varying NOT NULL,
        "hostId" uuid NOT NULL,
        "title" character varying NOT NULL,
        "mode" "public"."lobbies_mode_enum" NOT NULL DEFAULT 'first_lock',
        "timeoutSeconds" integer NOT NULL DEFAULT 15,
        "status" "public"."lobbies_status_enum" NOT NULL DEFAULT 'open',
        "roundState" "public"."lobbies_roundState_enum" NOT NULL DEFAULT 'idle',
        "lockedByParticipantId" uuid,
        "roundArmedAt" TIMESTAMPTZ,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "closedAt" TIMESTAMPTZ,
        CONSTRAINT "UQ_lobbies_code" UNIQUE ("code"),
        CONSTRAINT "PK_lobbies_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "lobbies"
      ADD CONSTRAINT "FK_lobbies_host_id"
      FOREIGN KEY ("hostId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE TABLE "lobby_participants" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "lobbyId" uuid NOT NULL,
        "nickname" character varying NOT NULL,
        "status" "public"."lobby_participants_status_enum" NOT NULL DEFAULT 'active',
        "timeoutUntil" TIMESTAMPTZ,
        "joinedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "lastSeenAt" TIMESTAMPTZ,
        CONSTRAINT "PK_lobby_participants_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "lobby_participants"
      ADD CONSTRAINT "FK_lobby_participants_lobby_id"
      FOREIGN KEY ("lobbyId") REFERENCES "lobbies"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_lobby_participants_lobby_nickname"
      ON "lobby_participants" ("lobbyId", lower("nickname"))
    `);

    await queryRunner.query(`
      ALTER TABLE "lobbies"
      ADD CONSTRAINT "FK_lobbies_locked_by_participant_id"
      FOREIGN KEY ("lockedByParticipantId") REFERENCES "lobby_participants"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE TABLE "lobby_events" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "lobbyId" uuid NOT NULL,
        "participantId" uuid,
        "type" "public"."lobby_events_type_enum" NOT NULL,
        "payload" jsonb,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_lobby_events_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "lobby_events"
      ADD CONSTRAINT "FK_lobby_events_lobby_id"
      FOREIGN KEY ("lobbyId") REFERENCES "lobbies"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "lobby_events"
      ADD CONSTRAINT "FK_lobby_events_participant_id"
      FOREIGN KEY ("participantId") REFERENCES "lobby_participants"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "lobby_events" DROP CONSTRAINT "FK_lobby_events_participant_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "lobby_events" DROP CONSTRAINT "FK_lobby_events_lobby_id"`,
    );
    await queryRunner.query(`DROP TABLE "lobby_events"`);

    await queryRunner.query(
      `ALTER TABLE "lobbies" DROP CONSTRAINT "FK_lobbies_locked_by_participant_id"`,
    );

    await queryRunner.query(
      `DROP INDEX "public"."UQ_lobby_participants_lobby_nickname"`,
    );
    await queryRunner.query(
      `ALTER TABLE "lobby_participants" DROP CONSTRAINT "FK_lobby_participants_lobby_id"`,
    );
    await queryRunner.query(`DROP TABLE "lobby_participants"`);

    await queryRunner.query(
      `ALTER TABLE "lobbies" DROP CONSTRAINT "FK_lobbies_host_id"`,
    );
    await queryRunner.query(`DROP TABLE "lobbies"`);

    await queryRunner.query(`DROP TYPE "public"."lobby_events_type_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."lobby_participants_status_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."lobbies_roundState_enum"`);
    await queryRunner.query(`DROP TYPE "public"."lobbies_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."lobbies_mode_enum"`);
  }
}
