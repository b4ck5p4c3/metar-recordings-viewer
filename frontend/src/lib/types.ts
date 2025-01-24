export interface DefaultDialogProps {
    open: boolean;
    onClose: () => void;
}

export interface DynamicRecordingDTO {
    id: string;
    data: {
        timestamp: Date;
        length: number;
        url: string;
        whisperText: string | null;
        processedText: string | null;
    } | null;
    hasWhisperNow: boolean;
}

export interface RecordingUpdateData {
    id: string,
    parsed: boolean
}

export interface RecordingDTO {
    id: string;
    timestamp: string;
    length: number;
    url: string;
    whisperText?: string | null;
    processedText?: string | null;
}