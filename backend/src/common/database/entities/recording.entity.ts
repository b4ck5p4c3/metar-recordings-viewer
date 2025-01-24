import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity("recordings", {synchronize: false})
export class Recording {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("timestamp")
    timestamp: Date;

    @Column("integer")
    length: number;

    @Column("text")
    storageKey: string;

    @Column("json", {nullable: true})
    whisperData?: object | null;

    @Column("text", {nullable: true})
    processedText?: string | null;
}