import { MigrationInterface, QueryRunner } from 'typeorm';
import dotenv from 'dotenv';
import { PasswordService } from 'src/modules/auth/services/password.service';
import { Role } from 'src/modules/users/enums/role.enum';

dotenv.config();

const { INIT_EMAIL, INIT_PASSWORD } = process.env;

export class SeedAdmin1735000000001 implements MigrationInterface {
  name = '1735000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const passwordService = new PasswordService();
    const passwordHash = await passwordService.hash(INIT_PASSWORD as string);

    await queryRunner.manager.insert('users', {
      email: INIT_EMAIL,
      fullName: 'Administrator',
      password: passwordHash,
      role: Role.ADMIN,
    });
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "users" WHERE email = '${INIT_EMAIL}'`,
    );
  }
}
