"use client";

const CURRENT_MEMBER_ID_LOCAL_STORAGE_KEY = "current-member-id";

export function setCurrentMemberId(id: string): void {
    window.localStorage.setItem(CURRENT_MEMBER_ID_LOCAL_STORAGE_KEY, id);
}

export function unsetCurrentMemberId(): void {
    window.localStorage.removeItem(CURRENT_MEMBER_ID_LOCAL_STORAGE_KEY);
}

export function getCurrentMemberId(): string | null {
    if (!window) {
        return null;
    }
    const memberId = window.localStorage.getItem(CURRENT_MEMBER_ID_LOCAL_STORAGE_KEY);
    if (!memberId) {
        return null;
    }
    return memberId;
}