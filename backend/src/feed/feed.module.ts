import {Module} from "@nestjs/common";
import {FeedGateway} from "./feed.gateway";
import {FeedController} from "./feed.controller";

@Module({
    providers: [FeedGateway],
    controllers: [FeedController]
})
export class FeedModule {
}