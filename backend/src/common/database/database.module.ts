import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {Recording} from "./entities/recording.entity";

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: "postgres",
                url: configService.getOrThrow("DATABASE_URL"),
                entities: [Recording],
                synchronize: true,
                logging: process.env.NODE_ENV === "development"
            }),
            inject: [ConfigService]
        })
    ]
})
export class DatabaseModule {
}