import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLobbyParticipantManagementEvents1788355544805 implements MigrationInterface {
  name = 'AddLobbyParticipantManagementEvents1788355544805';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."lobby_events_type_enum" ADD VALUE 'participant_renamed'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."lobby_events_type_enum" ADD VALUE 'participant_kicked'`,
    );
  }

  public async down(): Promise<void> {
    // Postgres does not support removing a value from an enum type.
    // Reverting would require recreating the type; intentionally left as a no-op.
  }
}
