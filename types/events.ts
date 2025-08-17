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
}