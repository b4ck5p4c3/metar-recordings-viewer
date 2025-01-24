import { Module } from '@nestjs/common';
import {AppConfigModule} from "./common/config/app-config.module";
import {DatabaseModule} from "./common/database/database.module";
import {LogtoAuthModule} from "./logto-auth/logto-auth.module";
import {AppHttpModule} from "./common/http/app-http.module";
import {RecordingsModule} from "./recordings/recordings.module";
import {FeedModule} from "./feed/feed.module";

@Module({
  imports: [
      AppConfigModule,
      AppHttpModule,

      RecordingsModule,
      FeedModule,

      DatabaseModule,

      LogtoAuthModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
