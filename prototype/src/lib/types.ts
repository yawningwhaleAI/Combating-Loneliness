// Core data model. Each type maps 1:1 to a future database table.

export type Role = "member" | "business" | "admin";

export type InterestId =
  | "fitness"
  | "cafes"
  | "food"
  | "music"
  | "movies"
  | "sports"
  | "art"
  | "boardgames"
  | "networking"
  | "outdoors"
  | "exploring";

export type ActivityId =
  | "coffee"
  | "workshops"
  | "sports"
  | "walks"
  | "food"
  | "film"
  | "games"
  | "networking";

export type Category = "Social" | "Workshops" | "Sports" | "Food" | "Culture" | "Outdoors" | "Community";

export type Budget = 300 | 600 | 1000 | 5000;
export type Environment = "cosy" | "lively" | "outdoors" | "active";
export type Audience = "everyone" | "connections" | "selected";

export interface Hub {
  id: string;
  name: string;
  city: string;
  areas: string[];
}

/** Riya's private free time. Only windows are stored, never a work roster. */
export interface AvailabilityWindow {
  id: string;
  kind: "recurring" | "temporary";
  /** 0 = Monday … 6 = Sunday (recurring) */
  day?: number;
  /** ISO date (temporary) */
  date?: string;
  start: number; // minutes from midnight
  end: number;
  expiresOn?: string; // ISO date, temporary windows only
  audience: Audience;
  selectedIds?: string[];
}

export interface BlockedDate {
  date: string;
  reason: string;
}

export interface Availability {
  windows: AvailabilityWindow[];
  blocked: BlockedDate[];
}

export interface Profile {
  name: string;
  age: number;
  area: string;
  interests: InterestId[];
  activities: ActivityId[];
  budget: Budget;
  groupSize: 4 | 6 | 8;
  environments: Environment[];
  avatar: string;
}

export interface Person {
  id: string;
  name: string;
  age: number;
  area: string;
  avatar: string;
  interests: InterestId[];
  intro: string;
  occupation: string;
  verified: { phone: boolean; workEmail: boolean };
  /** coarse, already-shared free time used for "Free with you" (never a roster) */
  freeLabel: string;
  freeDays: number[];
  /** hidden demo intent: would this person pick Riya in Meet again? */
  picksRiya: boolean;
}

export interface Organiser {
  id: string;
  name: string;
  owner: string;
  type: "business" | "individual";
  verification: "verified" | "pending" | "rejected";
  area: string;
  avatar: string;
  bio: string;
  since: string;
  rating?: number;
  docs: string[];
}

export type ParticipantStatus = "pending" | "provisional" | "confirmed" | "cancelled";

export interface Participant {
  personId: string; // "riya" for the demo member
  status: ParticipantStatus;
  checkedIn: boolean;
  groupId?: string;
}

export interface Group {
  id: string;
  label: string;
  memberIds: string[];
}

export type PlanStatus = "review" | "live" | "rejected" | "cancelled" | "completed";
export type BookingMode = "instant" | "provisional" | "application";

export interface Plan {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: Category;
  activity: ActivityId;
  interests: InterestId[];
  image: string;
  organiserId: string;
  venue: { name: string; area: string; address: string; distanceKm: number; type: string };
  date: string; // ISO date
  start: number; // minutes
  durationMin: number;
  price: number;
  capacity: number;
  groupSize: number | null; // null = no small groups
  mode: BookingMode;
  minParticipants?: number;
  inclusions: string[];
  rules: string[];
  cancellation: string;
  eligibility: string;
  eventLead: { name: string; phone: string };
  participants: Participant[];
  groups: Group[];
  status: PlanStatus;
  rejectionReason?: string;
  createdByDemo?: boolean;
  isNew?: boolean;
  communityHosted?: boolean;
}

export type PaymentMethod = "upi" | "card" | "venue" | "free";
export type RefundStatus = "none" | "processing" | "refunded";

export interface Booking {
  id: string;
  planId: string;
  status: ParticipantStatus | "attended";
  groupId?: string;
  createdAt: string;
  amount: number;
  method: PaymentMethod;
  checkedIn: boolean;
  refund: RefundStatus;
}

export interface Connection {
  personId: string;
  since: string;
  viaPlanId: string;
  viaLabel: string;
}

export interface MeetAgainRecord {
  planId: string;
  picks: string[];
  mutual: string[];
  submittedAt: string;
}

export interface Circle {
  id: string;
  name: string;
  description: string;
  memberIds: string[];
  icon: "coffee" | "mountain" | "dumbbell" | "film";
  rhythm: string;
  createdAt: string;
}

export interface Invitation {
  title: string;
  date: string;
  start: number;
  durationMin: number;
  venue: string;
  price: number;
}

export interface Reply {
  authorId: string;
  text: string;
}

export interface Story {
  id: string;
  authorId: string;
  when: string;
  text: string;
  image?: string;
  invitation?: Invitation;
  likes: number;
  likedByMe: boolean;
  replies: Reply[];
  interested: number;
  interestedByMe: boolean;
  joinedByMe: boolean;
  circleId?: string;
}

export interface GroupMessage {
  id: string;
  planId: string;
  groupId: string;
  authorId: string;
  text: string;
  at: string;
}

export interface Report {
  id: string;
  kind: "user" | "experience";
  targetId: string;
  targetLabel: string;
  reason: string;
  severity: "low" | "medium" | "high";
  status: "open" | "reviewing" | "resolved";
  reporter: string;
  createdAt: string;
  resolution?: string;
}

export interface Settlement {
  planId: string;
  title: string;
  date: string;
  bookings: number;
  attended: number;
  gmv: number;
  commission: number;
  net: number;
  status: "paid" | "scheduled";
}

export interface DemoFlags {
  visitedLanding?: boolean;
  visitedHome?: boolean;
  visitedFree?: boolean;
  viewedGroup?: boolean;
  checkedKabirInvite?: boolean;
  visitedBusiness?: boolean;
  visitedBizBookings?: boolean;
  visitedAnalytics?: boolean;
  visitedAdminReports?: boolean;
}
