export interface AgendaItem {
    id: string;
    eventId: string;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    date: string;
    speaker?: string;
    location?: string;
    category?: 'presentation' | 'break' | 'networking' | 'workshop' | 'panel' | 'keynote' | 'other';
    isBreak?: boolean;
    order: number;
    createdAt: number;
    updatedAt: number;
    createdBy: string; // admin who created this item
    lastEditedBy: string; // admin who last edited this item
}

export interface EventAgenda {
    eventId: string;
    items: AgendaItem[];
    lastUpdated: number;
    isLive: boolean; // whether agenda is currently being presented
    currentItem?: string; // current agenda item ID if live
}