export interface MemoryEntry {
    promptInfo: string;
    seed?: number;
    imageUrl?: string;
}

export type MemoryData = {
    [key: string]: MemoryEntry;
};

let memoryStore: MemoryData = {};

export function getMemory(key: string): MemoryEntry | undefined {
    return memoryStore[key];
}

export function setMemory(key: string, data: MemoryEntry): void {
    memoryStore[key] = { ...data };
}

export function clearMemory() {
    memoryStore = {};
}
  