import createClient, {Client} from "openapi-fetch";
import type {paths} from "./types";

export function getClient(): Client<paths> {
    return createClient<paths>({
        baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
        credentials: "include"
    })
}

export class UnauthorizedError extends Error {
    constructor(text: string) {
        super(text);
    }
}

interface ResponseWithError<T> {
    error?: {
        statusCode: number;
        message: string;
    };
    data?: T;
}

const errorDescriptions: Record<string, string> = {
    "not-authorized": "Not authorized",
};

function getErrorText(error: {statusCode: number, message: string}): string {
    return errorDescriptions[error.message] ? errorDescriptions[error.message] :
        `${error.statusCode} ${error.message}`;
}

export function R<T extends ResponseWithError<TData>, TData>(response: T): T {
    if (response.error) {
        const error = response.error;
        if (error.statusCode === 401) {
            throw new UnauthorizedError(getErrorText(error));
        }
        throw new Error(getErrorText(error));
    }

    if (!response.data) {
        throw new Error("No response");
    }

    return response;
}