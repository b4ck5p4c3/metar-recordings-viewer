"use client"

import {Separator} from "@/components/ui/separator";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import React, {useCallback, useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {Loader2, Pencil} from "lucide-react";
import {getClient, R, UnauthorizedError} from "@/lib/api/client";
import {useQuery} from "@tanstack/react-query";
import {AUTH_SELF_QUERY_KEY} from "@/lib/cache-tags";
import {useRouter} from "next/navigation";
import logto from "@/static/images/logto.svg";
import Image from "next/image";
import {DynamicRecordingDTO, RecordingDTO, RecordingUpdateData} from "@/lib/types";
import logo from "@/static/images/logo.svg";

function Recording({recording, authorized}: { recording: DynamicRecordingDTO, authorized: boolean }) {
    return <TableRow>
        {
            recording.data ? <><TableCell>{recording.data.timestamp.toLocaleString()}</TableCell>
                <TableCell>
                    <audio controls={true} preload={"none"}>
                        <source
                            src={recording.data.url}
                            type={"application/ogg"}/>
                    </audio>
                </TableCell>
                <TableCell>
                    <div className={"flex flex-row justify-between items-center"}>
                        {recording.hasWhisperNow ? <>
                                <div>{recording.data.processedText ? recording.data.processedText : (recording.data.whisperText ? recording.data.whisperText : "N/A")}</div>
                                {authorized ?
                                    <Button className={`w-8 h-8 p-0`}><Pencil className={"w-6 h-6"}/></Button> : <></>}</> :
                            <Loader2 className={"animate-spin h-8 w-8"}></Loader2>}
                    </div>
                </TableCell></> : <TableCell><Loader2 className={"animate-spin h-8 w-8"}></Loader2></TableCell>
        }
    </TableRow>;
}

export default function RecordingsPage() {
    const client = getClient();

    const [feedState, setFeedState] = useState<"live" | "connecting">("connecting");

    const router = useRouter();

    const selfMemberId = useQuery({
        queryFn: async () => {
            try {
                const response = R(await client.GET("/api/auth/self", {}));
                return response.data!.id;
            } catch (e) {
                if (e instanceof UnauthorizedError) {
                    return null;
                }
                throw e;
            }
        },
        retry: false,
        queryKey: [AUTH_SELF_QUERY_KEY]
    });

    const [recordings, setRecordings] = useState<DynamicRecordingDTO[]>([]);

    let websocket: WebSocket | null = null;

    function processRecordingsData(...data: (RecordingDTO & { hasWhisperNow?: boolean })[]) {
        setRecordings(oldRecordings => {
            const newRecordings: DynamicRecordingDTO[] = [];
            for (const recording of data) {
                const existingRecording = oldRecordings.find(item => item.id === recording.id);
                if (existingRecording) {
                    recording.hasWhisperNow = recording.hasWhisperNow === undefined || recording.hasWhisperNow;
                    if (!existingRecording.data) {
                        existingRecording.data = {
                            timestamp: new Date(recording.timestamp),
                            length: recording.length,
                            url: recording.url,
                            whisperText: recording.whisperText ?? null,
                            processedText: recording.processedText ?? null
                        };
                    }
                    if (recording.hasWhisperNow) {
                        existingRecording.data.whisperText = recording.whisperText ?? null;
                        existingRecording.data.processedText = recording.processedText ?? null;
                        existingRecording.hasWhisperNow = true;

                    }
                } else {
                    newRecordings.push({
                        id: recording.id,
                        data: {
                            timestamp: new Date(recording.timestamp),
                            length: recording.length,
                            url: recording.url,
                            whisperText: recording.whisperText ?? null,
                            processedText: recording.processedText ?? null,
                        },
                        hasWhisperNow: true
                    })
                }
            }
            return [...newRecordings, ...oldRecordings];
        });
    }

    function fetchRecordingData(id: string, hasWhisperNow: boolean) {
        (async () => {
            const response = R(await client.GET("/api/recordings/{id}", {
                params: {
                    path: {
                        id
                    }
                }
            }));

            const recordingData = response.data!;
            processRecordingsData({
                ...recordingData,
                hasWhisperNow
            });
        })();
    }

    function processMessage(data: RecordingUpdateData) {
        setRecordings(oldRecordings => {
            if (data.parsed) {
                fetchRecordingData(data.id, true);
                return oldRecordings;
            }
            const newRecordings: DynamicRecordingDTO[] = [{
                id: data.id,
                data: null,
                hasWhisperNow: false
            }, ...oldRecordings];
            fetchRecordingData(data.id, false);
            while (newRecordings.length > 50) {
                newRecordings.pop();
            }
            return newRecordings;
        });
    }

    const reconnect = useCallback(() => {
        websocket = new WebSocket(`${process.env.NEXT_PUBLIC_API_BASE_URL}feed`);
        websocket.addEventListener("close", () => {
            setTimeout(() => reconnect(), 1000);
        });
        websocket.addEventListener("message", message => {
            const data = JSON.parse(message.data) as RecordingUpdateData;
            processMessage(data);
        });
        websocket.addEventListener("open", () => {
            setFeedState("live");
        });
        setFeedState("connecting");
    }, []);

    useEffect(() => {
        (async () => {
            const recordingsResponse = R(await client.GET("/api/recordings", {
                params: {
                    query: {
                        offset: "0",
                        count: "50",
                        orderBy: "timestamp",
                        orderDirection: "desc"
                    }
                }
            }));

            const recordingsData = recordingsResponse.data!;

            processRecordingsData(...recordingsData.recordings);

            reconnect();
        })();
    }, [client, reconnect]);

    return <div className={"flex flex-col gap-5 w-9/12 m-auto mt-5"}>
        <div className={"flex flex-row justify-between items-center"}>
            <div className={"flex flex-row gap-3 items-center"}>
                <Image src={logo} alt={"logo"} className={"w-12 h-12"}/>
                <div className={"text-2xl font-semibold"}>Metar recordings</div>
            </div>
            <div className={"flex flex-row gap-5 items-center"}>
                <span className={"text-xl"}>Live:</span>
                <audio controls={true} preload={"none"}>
                    <source src={process.env.NEXT_PUBLIC_LIVE_STREAM_URL} type={"application/ogg"}/>
                </audio>
                <div className={"min-w-[200px] flex flex-row justify-end"}>
                    {selfMemberId.data ? "Authorized" : selfMemberId.isPending ?
                        <Loader2 className={"animate-spin h-8 w-8"}></Loader2> : <Button onClick={() => {
                            router.push(process.env.NEXT_PUBLIC_AUTH_URL ?? "/");
                        }} className={"flex gap-2"}>
                            <Image src={logto} alt={"logto"} width={24} height={24}/>
                            <span>Authorize</span>
                        </Button>}
                </div>
            </div>
        </div>
        <Separator/>
        <div className={"flex flex-row justify-between"}>
            <div className={"text-xl"}>Feed:</div>
            <div>{feedState === "live" ? <span className={"font-bold text-red-600"}>Live</span> : "Connecting..."}</div>
        </div>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Recording</TableHead>
                    <TableHead>Transcription</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {recordings.map(recording => <Recording recording={recording} authorized={!!selfMemberId.data}
                                                        key={`${recording.id}-${recording.hasWhisperNow}`}/>)}
            </TableBody>
        </Table>
    </div>
        ;
}
