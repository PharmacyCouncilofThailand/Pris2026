export interface Organizer {
  name: string;
  nameTh: string;
  position: string;
  positionTh: string;
  image: string;
}

export interface Speaker {
  id: number;
  name: string;
  position: string;
  role: string;
  image: string;
}

export interface EventSpeaker {
  name: string;
  role: string;
  roleTh?: string;
  image: string;
}

export interface Event {
  id: number;
  time: string;
  title: string;
  titleTh: string;
  description?: string;
  descriptionTh?: string;
  location: string;
  locationTh: string;
  type: string;
  typeTh: string;
  speakers: EventSpeaker[];
}

export interface ScheduleDay {
  day: string;
  dayTh: string;
  date: string;
  dateTh: string;
  events: Event[];
}
