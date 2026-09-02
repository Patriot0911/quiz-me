import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { appConfig, authConfig, dbConfig, lobbyConfig } from './config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { LobbyModule } from './modules/lobby/lobby.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, dbConfig, authConfig, lobbyConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('database.host'),
        port: config.get('database.port'),
        username: config.get('database.username'),
        password: config.get('database.password'),
        database: config.get('database.database'),

        autoLoadEntities: true,
        synchronize: config.get('app.env') !== 'production',

        migrations: ['dist/database/migrations/*.js'],
        migrationsRun: true,
      }),
    }),
    AuthModule,
    UsersModule,
    LobbyModule,
  ],
  providers: [],
})
export class AppModule {}
