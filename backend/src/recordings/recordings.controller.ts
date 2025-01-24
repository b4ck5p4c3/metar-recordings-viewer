import {Controller, Get, HttpException, HttpStatus, Param, Query} from "@nestjs/common";
import {ApiCookieAuth, ApiDefaultResponse, ApiOkResponse, ApiOperation, ApiProperty, ApiTags} from "@nestjs/swagger";
import {ErrorApiResponse} from "../common/api-responses";
import {RecordingsService} from "./recordings.service";
import {getCountAndOffset, getOrderObject} from "../common/utils";
import {Recording} from "../common/database/entities/recording.entity";
import {ConfigService} from "@nestjs/config";
import {WhisperData} from "../common/types";
import {Errors} from "../common/errors";
import {NoAuth} from "../auth/no-auth.decorator";

class RecordingDTO {
    @ApiProperty({format: "uuid"})
    id: string;

    @ApiProperty({format: "date-time"})
    timestamp: string;

    @ApiProperty()
    length: number;

    @ApiProperty({format: "url"})
    url: string;

    @ApiProperty({nullable: true})
    whisperText?: string;

    @ApiProperty({nullable: true})
    processedText?: string;
}

class RecordingsDTO {
    @ApiProperty()
    count: number;

    @ApiProperty({type: [RecordingDTO]})
    recordings: RecordingDTO[]
}

@Controller("recordings")
@ApiTags("recordings")
export class RecordingsController {
    private publicStorageUrlPrefix: string;

    constructor(private recordingsService: RecordingsService, private configService: ConfigService) {
        this.publicStorageUrlPrefix = configService.getOrThrow("PUBLIC_STORAGE_URL_PREFIX");
    }

    mapToDTO(recording: Recording): RecordingDTO {
        return {
            id: recording.id,
            timestamp: recording.timestamp.toISOString(),
            length: recording.length,
            url: `${this.publicStorageUrlPrefix}${recording.storageKey}`,
            whisperText: recording.whisperData ? String((recording.whisperData as WhisperData)?.output?.text) : undefined,
            processedText: recording.processedText
        }
    }

    @Get()
    @ApiOperation({
        summary: "Get all recordings"
    })
    @ApiOkResponse({
        description: "Successful response",
        type: RecordingsDTO
    })
    @ApiDefaultResponse({
        description: "Erroneous response",
        type: ErrorApiResponse
    })
    @NoAuth()
    async findAll(@Query("offset") offset?: string,
                  @Query("count") count?: string,
                  @Query("orderBy") orderBy?: string,
                  @Query("orderDirection") orderDirection?: string): Promise<RecordingsDTO> {
        const recordingsCount = await this.recordingsService.countAll();
        const [realCount, realOffset] = getCountAndOffset(count, offset, 100);

        const orderObject = getOrderObject<Recording>(orderBy, orderDirection,
            {
                timestamp: true
            });

        const recordings = await this.recordingsService.findAll(realOffset,
            realCount, orderObject);

        return {
            count: recordingsCount,
            recordings: recordings.map(recording =>
                this.mapToDTO(recording))
        };
    }

    @Get(":id")
    @ApiOperation({
        summary: "Get recording by id"
    })
    @ApiOkResponse({
        description: "Successful response",
        type: RecordingDTO
    })
    @ApiDefaultResponse({
        description: "Erroneous response",
        type: ErrorApiResponse
    })
    @NoAuth()
    async findById(@Param("id") id: string): Promise<RecordingDTO> {
        const recording = await this.recordingsService.findById(id);
        if (!recording) {
            throw new HttpException(Errors.RECORDING_NOT_FOUND, HttpStatus.NOT_FOUND);
        }

        return this.mapToDTO(recording);
    }
}