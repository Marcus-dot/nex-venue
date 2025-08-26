export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  creatorId: string;
  creatorName: string;
  attendees: string[];
  createdAt: number;
  currentAgendaItem?: string; // For live agenda tracking
  agendaLastUpdated?: number; // When the agenda was last updated
}