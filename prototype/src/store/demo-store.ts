"use client";

// Single demo store. Persists to localStorage so a refresh never loses the demo.
// Each action maps to one future API call (see README "Upgrade path").

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CIRCLES,
  CONNECTIONS,
  GROUP_MESSAGES,
  KABIR_STORY,
  ORGANISERS,
  PEOPLE,
  PLANS,
  REPORTS,
  RIYA_AVAILABILITY,
  RIYA_BOOKINGS,
  RIYA_DEFAULT,
  STORIES,
} from "@/data/seed";
import { assignGroup, findWindow, timeConflictReason } from "@/lib/matching";
import type {
  Availability,
  AvailabilityWindow,
  Booking,
  Circle,
  Connection,
  DemoFlags,
  GroupMessage,
  MeetAgainRecord,
  Organiser,
  PaymentMethod,
  Plan,
  Profile,
  Report,
  Role,
  Story,
} from "@/lib/types";
import { fmtDate, uid } from "@/lib/utils";

export const START_NOW = "2026-11-04T13:40";

export interface NorthStarEntry {
  planId: string;
  withIds: string[];
}

interface DemoState {
  role: Role;
  onboarded: boolean;
  profile: Profile;
  availability: Availability;
  rosterUpdated: boolean;
  now: string;
  plans: Plan[];
  bookings: Booking[];
  connections: Connection[];
  meetAgain: MeetAgainRecord[];
  circles: Circle[];
  stories: Story[];
  messages: GroupMessage[];
  reports: Report[];
  blocked: string[];
  organisers: Organiser[];
  memberStatus: Record<string, "active" | "suspended">;
  invites: { planId: string; personIds: string[] }[];
  northStar: NorthStarEntry[];
  flags: DemoFlags;
  guideOpen: boolean;
  annotations: boolean;
}

interface DemoActions {
  reset: () => void;
  setRole: (r: Role) => void;
  setFlag: (k: keyof DemoFlags) => void;
  setGuideOpen: (v: boolean) => void;
  setAnnotations: (v: boolean) => void;
  enterAsRiya: () => void;
  completeOnboarding: (p: Profile, a: Availability) => void;
  updateProfile: (p: Partial<Profile>) => void;
  setWindows: (w: AvailabilityWindow[]) => void;
  addWindow: (w: AvailabilityWindow) => void;
  removeWindow: (id: string) => void;
  updateWindow: (id: string, patch: Partial<AvailabilityWindow>) => void;
  applyRosterUpdate: () => void;
  book: (planId: string, method: PaymentMethod) => { booking: Booking; groupId?: string; northStar: boolean };
  cancelBooking: (bookingId: string) => void;
  checkIn: (planId: string) => void;
  finishExperience: (planId: string) => void;
  submitMeetAgain: (planId: string, picks: string[]) => string[];
  createCircle: (name: string, memberIds: string[], icon: Circle["icon"], description: string) => void;
  invite: (planId: string, personIds: string[]) => void;
  likeStory: (id: string) => void;
  replyStory: (id: string, text: string) => void;
  toggleInterested: (id: string) => void;
  checkInvitation: (id: string) => { fits: boolean; reason: string };
  joinInvitation: (id: string) => void;
  postStory: (s: Pick<Story, "text" | "image" | "invitation" | "circleId">) => void;
  sendMessage: (planId: string, groupId: string, text: string) => void;
  report: (r: Omit<Report, "id" | "status" | "createdAt" | "reporter">) => void;
  block: (personId: string) => void;
  unblock: (personId: string) => void;
  createPlan: (p: Plan) => void;
  approveApplication: (planId: string, personId: string) => void;
  declineApplication: (planId: string, personId: string) => void;
  toggleAttendance: (planId: string, personId: string) => void;
  completePlan: (planId: string) => void;
  cancelPlan: (planId: string) => void;
  approvePlan: (planId: string) => void;
  rejectPlan: (planId: string, reason: string) => void;
  setVerification: (orgId: string, v: Organiser["verification"]) => void;
  updateReport: (id: string, status: Report["status"], resolution?: string) => void;
  setMemberStatus: (id: string, s: "active" | "suspended") => void;
  processRefund: (bookingId: string) => void;
}

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

export function initialState(): DemoState {
  return {
    role: "member",
    onboarded: false,
    profile: clone(RIYA_DEFAULT),
    availability: clone(RIYA_AVAILABILITY),
    rosterUpdated: false,
    now: START_NOW,
    plans: clone(PLANS),
    bookings: clone(RIYA_BOOKINGS),
    connections: clone(CONNECTIONS),
    meetAgain: [],
    circles: clone(CIRCLES),
    stories: clone(STORIES),
    messages: clone(GROUP_MESSAGES),
    reports: clone(REPORTS),
    blocked: [],
    organisers: clone(ORGANISERS),
    memberStatus: {},
    invites: [],
    northStar: [],
    flags: {},
    guideOpen: false,
    annotations: true,
  };
}

function endTimestamp(plan: Plan) {
  const end = plan.start + plan.durationMin + 15;
  const h = String(Math.floor(end / 60)).padStart(2, "0");
  const m = String(end % 60).padStart(2, "0");
  return `${plan.date}T${h}:${m}`;
}

export const useDemo = create<DemoState & DemoActions>()(
  persist(
    (set, get) => ({
      ...initialState(),

      reset: () => set({ ...initialState() }),
      setRole: (role) => set({ role }),
      setFlag: (k) => {
        if (get().flags[k]) return;
        set((s) => ({ flags: { ...s.flags, [k]: true } }));
      },
      setGuideOpen: (guideOpen) => set({ guideOpen }),
      setAnnotations: (annotations) => set({ annotations }),
      enterAsRiya: () => set({ onboarded: true, role: "member" }),

      completeOnboarding: (profile, availability) => set({ profile, availability, onboarded: true, role: "member" }),
      updateProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
      setWindows: (windows) => set((s) => ({ availability: { ...s.availability, windows } })),
      addWindow: (w) => set((s) => ({ availability: { ...s.availability, windows: [...s.availability.windows, w] } })),
      removeWindow: (id) => set((s) => ({ availability: { ...s.availability, windows: s.availability.windows.filter((w) => w.id !== id) } })),
      updateWindow: (id, patch) =>
        set((s) => ({ availability: { ...s.availability, windows: s.availability.windows.map((w) => (w.id === id ? { ...w, ...patch } : w)) } })),

      applyRosterUpdate: () =>
        set((s) => {
          if (s.rosterUpdated) return {};
          return {
            rosterUpdated: true,
            now: s.now < "2026-11-04T19:30" ? "2026-11-04T19:30" : s.now,
            availability: {
              blocked: [...s.availability.blocked, { date: "2026-11-05", reason: "Roster update: on shift" }],
              windows: [
                ...s.availability.windows,
                { id: "w_fri_temp", kind: "temporary", date: "2026-11-06", start: 16 * 60, end: 21 * 60, expiresOn: "2026-11-06", audience: "connections" },
              ],
            },
          };
        }),

      book: (planId, method) => {
        const s = get();
        const plan = s.plans.find((p) => p.id === planId)!;
        const active = plan.participants.filter((p) => p.status !== "cancelled");
        let status: "pending" | "provisional" | "confirmed" = "confirmed";
        if (plan.mode === "application") status = "pending";
        if (plan.mode === "provisional") status = active.length + 1 >= (plan.minParticipants ?? 0) ? "confirmed" : "provisional";

        let groups = plan.groups;
        let groupId: string | undefined;
        if (status !== "pending" && plan.groupSize) {
          const r = assignGroup(plan, s.profile.interests, PEOPLE, s.connections);
          groups = r.groups;
          groupId = r.groupId;
        }
        const booking: Booking = {
          id: uid("bk"),
          planId,
          status,
          groupId,
          createdAt: fmtDate(s.now.split("T")[0]),
          amount: plan.price,
          method: plan.price === 0 ? "free" : method,
          checkedIn: false,
          refund: "none",
        };
        const participants = [
          ...plan.participants.filter((p) => p.personId !== "riya"),
          { personId: "riya", status: status as "pending" | "provisional" | "confirmed", checkedIn: false, groupId },
        ];
        // Reaching the minimum confirms everyone who was provisional.
        const promoted = status === "confirmed" && plan.mode === "provisional" ? participants.map((p) => (p.status === "provisional" ? { ...p, status: "confirmed" as const } : p)) : participants;

        const connectedIds = s.connections.map((c) => c.personId);
        const groupMembers = groupId ? groups.find((g) => g.id === groupId)?.memberIds ?? [] : active.map((p) => p.personId);
        const withIds = groupMembers.filter((id) => connectedIds.includes(id));
        const qualifies = status !== "pending" && withIds.length > 0;

        set({
          plans: s.plans.map((p) => (p.id === planId ? { ...p, participants: promoted, groups } : p)),
          bookings: [...s.bookings.filter((b) => b.planId !== planId || b.status === "cancelled"), booking],
          northStar: qualifies ? [...s.northStar.filter((n) => n.planId !== planId), { planId, withIds }] : s.northStar,
        });
        return { booking, groupId, northStar: qualifies };
      },

      cancelBooking: (bookingId) =>
        set((s) => {
          const b = s.bookings.find((x) => x.id === bookingId);
          if (!b) return {};
          return {
            bookings: s.bookings.map((x) => (x.id === bookingId ? { ...x, status: "cancelled", refund: x.amount > 0 ? "processing" : "none" } : x)),
            plans: s.plans.map((p) =>
              p.id === b.planId
                ? {
                    ...p,
                    participants: p.participants.map((pt) => (pt.personId === "riya" ? { ...pt, status: "cancelled" } : pt)),
                    groups: p.groups.map((g) => ({ ...g, memberIds: g.memberIds.filter((m) => m !== "riya") })),
                  }
                : p,
            ),
            northStar: s.northStar.filter((n) => n.planId !== b.planId),
          };
        }),

      checkIn: (planId) =>
        set((s) => ({
          bookings: s.bookings.map((b) => (b.planId === planId && b.status !== "cancelled" ? { ...b, checkedIn: true } : b)),
          plans: s.plans.map((p) => (p.id === planId ? { ...p, participants: p.participants.map((pt) => (pt.personId === "riya" ? { ...pt, checkedIn: true } : pt)) } : p)),
        })),

      finishExperience: (planId) =>
        set((s) => {
          const plan = s.plans.find((p) => p.id === planId)!;
          const end = endTimestamp(plan);
          return {
            now: end > s.now ? end : s.now,
            bookings: s.bookings.map((b) => (b.planId === planId && b.status !== "cancelled" ? { ...b, status: "attended", checkedIn: true } : b)),
            plans: s.plans.map((p) =>
              p.id === planId
                ? { ...p, status: "completed", participants: p.participants.map((pt) => (pt.status === "confirmed" ? { ...pt, checkedIn: true } : pt)) }
                : p,
            ),
          };
        }),

      submitMeetAgain: (planId, picks) => {
        const s = get();
        const plan = s.plans.find((p) => p.id === planId)!;
        const mutual = picks.filter((id) => PEOPLE.find((p) => p.id === id)?.picksRiya);
        const fresh = mutual.filter((id) => !s.connections.some((c) => c.personId === id));
        const newConnections: Connection[] = fresh.map((personId) => ({
          personId,
          since: fmtDate(plan.date),
          viaPlanId: planId,
          viaLabel: plan.title,
        }));
        const addKabir = fresh.includes("kabir") && !s.stories.some((st) => st.id === KABIR_STORY.id);
        set({
          meetAgain: [...s.meetAgain.filter((m) => m.planId !== planId), { planId, picks, mutual, submittedAt: s.now }],
          connections: [...s.connections, ...newConnections],
          stories: addKabir ? [clone(KABIR_STORY), ...s.stories] : s.stories,
        });
        return mutual;
      },

      createCircle: (name, memberIds, icon, description) =>
        set((s) => ({
          circles: [{ id: uid("c"), name, memberIds, icon, description, rhythm: "Flexible, around everyone's free windows", createdAt: fmtDate(s.now.split("T")[0]) }, ...s.circles],
        })),

      invite: (planId, personIds) =>
        set((s) => ({ invites: [...s.invites.filter((i) => i.planId !== planId), { planId, personIds }] })),

      likeStory: (id) =>
        set((s) => ({ stories: s.stories.map((st) => (st.id === id ? { ...st, likedByMe: !st.likedByMe, likes: st.likes + (st.likedByMe ? -1 : 1) } : st)) })),
      replyStory: (id, text) =>
        set((s) => ({ stories: s.stories.map((st) => (st.id === id ? { ...st, replies: [...st.replies, { authorId: "riya", text }] } : st)) })),
      toggleInterested: (id) =>
        set((s) => ({
          stories: s.stories.map((st) => (st.id === id ? { ...st, interestedByMe: !st.interestedByMe, interested: st.interested + (st.interestedByMe ? -1 : 1) } : st)),
        })),
      checkInvitation: (id) => {
        const s = get();
        const st = s.stories.find((x) => x.id === id);
        if (id === KABIR_STORY.id) get().setFlag("checkedKabirInvite");
        if (!st?.invitation) return { fits: false, reason: "No invitation" };
        const { date, start, durationMin } = st.invitation;
        const w = findWindow(s.availability, date, start, durationMin);
        return w ? { fits: true, reason: "Fits your free time" } : { fits: false, reason: timeConflictReason(s.availability, date, start) };
      },
      joinInvitation: (id) =>
        set((s) => ({ stories: s.stories.map((st) => (st.id === id ? { ...st, joinedByMe: true, interestedByMe: true, interested: st.interested + (st.interestedByMe ? 0 : 1) } : st)) })),
      postStory: (story) =>
        set((s) => ({
          stories: [{ id: uid("s"), authorId: "riya", when: "just now", likes: 0, likedByMe: false, replies: [], interested: 0, interestedByMe: false, joinedByMe: false, ...story }, ...s.stories],
        })),
      sendMessage: (planId, groupId, text) =>
        set((s) => ({ messages: [...s.messages, { id: uid("m"), planId, groupId, authorId: "riya", text, at: "now" }] })),

      report: (r) =>
        set((s) => ({ reports: [{ ...r, id: uid("r"), status: "open", createdAt: fmtDate(s.now.split("T")[0]), reporter: "Riya" }, ...s.reports] })),
      block: (personId) => set((s) => ({ blocked: [...new Set([...s.blocked, personId])] })),
      unblock: (personId) => set((s) => ({ blocked: s.blocked.filter((b) => b !== personId) })),

      createPlan: (plan) => set((s) => ({ plans: [plan, ...s.plans] })),
      approveApplication: (planId, personId) =>
        set((s) => {
          const plan = s.plans.find((p) => p.id === planId)!;
          let groups = plan.groups;
          let groupId: string | undefined;
          if (personId === "riya" && plan.groupSize) {
            const r = assignGroup(plan, s.profile.interests, PEOPLE, s.connections);
            groups = r.groups;
            groupId = r.groupId;
          }
          return {
            plans: s.plans.map((p) =>
              p.id === planId ? { ...p, groups, participants: p.participants.map((pt) => (pt.personId === personId ? { ...pt, status: "confirmed", groupId: groupId ?? pt.groupId } : pt)) } : p,
            ),
            bookings: personId === "riya" ? s.bookings.map((b) => (b.planId === planId && b.status === "pending" ? { ...b, status: "confirmed", groupId } : b)) : s.bookings,
          };
        }),
      declineApplication: (planId, personId) =>
        set((s) => ({
          plans: s.plans.map((p) => (p.id === planId ? { ...p, participants: p.participants.map((pt) => (pt.personId === personId ? { ...pt, status: "cancelled" } : pt)) } : p)),
          bookings: personId === "riya" ? s.bookings.map((b) => (b.planId === planId && b.status === "pending" ? { ...b, status: "cancelled", refund: b.amount ? "processing" : "none" } : b)) : s.bookings,
        })),
      toggleAttendance: (planId, personId) =>
        set((s) => ({
          plans: s.plans.map((p) => (p.id === planId ? { ...p, participants: p.participants.map((pt) => (pt.personId === personId ? { ...pt, checkedIn: !pt.checkedIn } : pt)) } : p)),
        })),
      completePlan: (planId) => set((s) => ({ plans: s.plans.map((p) => (p.id === planId ? { ...p, status: "completed" } : p)) })),
      cancelPlan: (planId) =>
        set((s) => ({
          plans: s.plans.map((p) => (p.id === planId ? { ...p, status: "cancelled", participants: p.participants.map((pt) => ({ ...pt, status: "cancelled" })) } : p)),
          bookings: s.bookings.map((b) => (b.planId === planId && b.status !== "cancelled" ? { ...b, status: "cancelled", refund: b.amount ? "processing" : "none" } : b)),
        })),

      approvePlan: (planId) => set((s) => ({ plans: s.plans.map((p) => (p.id === planId ? { ...p, status: "live", isNew: true, rejectionReason: undefined } : p)) })),
      rejectPlan: (planId, reason) => set((s) => ({ plans: s.plans.map((p) => (p.id === planId ? { ...p, status: "rejected", rejectionReason: reason } : p)) })),
      setVerification: (orgId, v) => set((s) => ({ organisers: s.organisers.map((o) => (o.id === orgId ? { ...o, verification: v } : o)) })),
      updateReport: (id, status, resolution) => set((s) => ({ reports: s.reports.map((r) => (r.id === id ? { ...r, status, resolution: resolution ?? r.resolution } : r)) })),
      setMemberStatus: (id, st) => set((s) => ({ memberStatus: { ...s.memberStatus, [id]: st } })),
      processRefund: (bookingId) => set((s) => ({ bookings: s.bookings.map((b) => (b.id === bookingId ? { ...b, refund: "refunded" } : b)) })),
    }),
    { name: "after-hours-demo-v1", version: 1 },
  ),
);

/** True once localStorage has been read. Screens show a skeleton until then. */
export function useHydrated() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (useDemo.persist.hasHydrated()) setOk(true);
    const unsub = useDemo.persist.onFinishHydration(() => setOk(true));
    return unsub;
  }, []);
  return ok;
}

export const personById = (id: string) => PEOPLE.find((p) => p.id === id);
