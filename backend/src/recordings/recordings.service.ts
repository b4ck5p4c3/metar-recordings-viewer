import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Recording} from "../common/database/entities/recording.entity";
import {EntityManager, FindOptionsOrder, Repository} from "typeorm";

@Injectable()
export class RecordingsService {
    constructor(@InjectRepository(Recording) private recordingRepository: Repository<Recording>) {
    }

    async findAll(offset: number, count: number,
                  orderBy: FindOptionsOrder<Recording>): Promise<Recording[]> {
        return await this.recordingRepository.find({
            skip: offset,
            take: count,
            order: orderBy
        });
    }

    async findById(id: string): Promise<Recording | null> {
        return await this.recordingRepository.findOne({
            where: {
                id
            }
        });
    }

    async countAll(): Promise<number> {
        return await this.recordingRepository.count();
    }

    for(manager: EntityManager): RecordingsService {
        return new RecordingsService(manager.getRepository(Recording));
    }

    async transaction<T>(transactionFn: (manager: EntityManager) => Promise<T>): Promise<T> {
        return await this.recordingRepository.manager.transaction(transactionFn);
    }
}