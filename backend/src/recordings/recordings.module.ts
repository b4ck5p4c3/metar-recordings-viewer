import {Module} from "@nestjs/common";
import {RecordingsController} from "./recordings.controller";
import {RecordingsService} from "./recordings.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Recording} from "../common/database/entities/recording.entity";
import {ConfigModule} from "@nestjs/config";

@Module({
    imports: [TypeOrmModule.forFeature([Recording]), ConfigModule],
    providers: [RecordingsService],
    controllers: [RecordingsController]
})
export class RecordingsModule {
}