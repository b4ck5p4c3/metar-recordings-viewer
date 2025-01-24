import {Controller, Injectable} from "@nestjs/common";
import {MessagePattern, Payload, Transport} from "@nestjs/microservices";
import {FeedGateway} from "./feed.gateway";

interface RecordingUpdateData {
    id: string,
    parsed: boolean
}

@Controller()
export class FeedController {
    constructor(private feedGateway: FeedGateway) {
    }

    @MessagePattern("recording_update")
    onRecordingUpdate(@Payload() data: RecordingUpdateData) {
        this.feedGateway.broadcast(data);
    }
}