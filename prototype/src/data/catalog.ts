import type { ActivityId, Category, Environment, InterestId } from "@/lib/types";

export const INTERESTS: { id: InterestId; label: string; short: string }[] = [
  { id: "cafes", label: "Coffee & cafés", short: "coffee" },
  { id: "music", label: "Music", short: "music" },
  { id: "exploring", label: "Exploring new places", short: "exploring new places" },
  { id: "food", label: "Food exploration", short: "food" },
  { id: "movies", label: "Movies", short: "movies" },
  { id: "boardgames", label: "Board games", short: "board games" },
  { id: "fitness", label: "Fitness", short: "fitness" },
  { id: "sports", label: "Sports", short: "sports" },
  { id: "art", label: "Art", short: "art" },
  { id: "networking", label: "Networking", short: "networking" },
  { id: "outdoors", label: "Outdoor activities", short: "the outdoors" },
];

export const interestLabel = (id: InterestId) => INTERESTS.find((i) => i.id === id)?.label ?? id;
export const interestShort = (id: InterestId) => INTERESTS.find((i) => i.id === id)?.short ?? id;

export const ACTIVITIES: { id: ActivityId; label: string; hint: string }[] = [
  { id: "coffee", label: "Coffee meetups", hint: "Small tables, easy conversation" },
  { id: "workshops", label: "Workshops", hint: "Pottery, art, cooking" },
  { id: "sports", label: "Sports & games", hint: "Pickleball, badminton, runs" },
  { id: "games", label: "Board game socials", hint: "Strategy, party games" },
  { id: "food", label: "Food trails", hint: "Tastings and food walks" },
  { id: "film", label: "Film & culture", hint: "Screenings, open mics" },
  { id: "walks", label: "Walks & outdoors", hint: "Parks, trails, photo walks" },
  { id: "networking", label: "Networking", hint: "Freelancers, creators, peers" },
];

export const ENVIRONMENTS: { id: Environment; label: string; hint: string }[] = [
  { id: "cosy", label: "Quiet & cosy", hint: "Cafés, studios, small rooms" },
  { id: "lively", label: "Lively & social", hint: "Bigger groups, more energy" },
  { id: "outdoors", label: "Outdoors", hint: "Parks, trails, open air" },
  { id: "active", label: "Active", hint: "Courts, runs, movement" },
];

export const CATEGORIES: Category[] = ["Social", "Workshops", "Sports", "Food", "Culture", "Outdoors", "Community"];

export const AREAS = ["DLF Phase 4", "Sector 29", "Cyber City", "Golf Course Road", "Sector 54", "Sohna Road", "Sector 46"];

export const HUB = {
  id: "hub_ggn_central",
  name: "Gurugram Central",
  city: "Gurugram",
  areas: AREAS,
};

/** Photography. Each key resolves to a remote photo with a designed fallback if the photo can't load. */
export const IMAGES: Record<string, { url: string; tone: [string, string] }> = {
  coffee: { url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb", tone: ["#3b2a20", "#c58b5c"] },
  cafe: { url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24", tone: ["#2d2622", "#b48a69"] },
  pottery: { url: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261", tone: ["#5a3b2b", "#d79e74"] },
  boardgames: { url: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09", tone: ["#20304f", "#6d8fd6"] },
  pickleball: { url: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8", tone: ["#18402f", "#7dc49a"] },
  run: { url: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3", tone: ["#1d2b44", "#ff8a4c"] },
  openmic: { url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819", tone: ["#24123a", "#c46bd6"] },
  sketch: { url: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b", tone: ["#30243e", "#e0a35f"] },
  food: { url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836", tone: ["#3c1f14", "#e57b45"] },
  networking: { url: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7", tone: ["#1c2a3a", "#7aa5d6"] },
  yoga: { url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b", tone: ["#21402e", "#9bcf8a"] },
  film: { url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba", tone: ["#1b1630", "#e2574c"] },
  hike: { url: "https://images.unsplash.com/photo-1551632811-561732d1e306", tone: ["#283a2a", "#c7b06a"] },
  brunch: { url: "https://images.unsplash.com/photo-1528605248644-14dd04022da1", tone: ["#3a2a1c", "#e5b46c"] },
  photowalk: { url: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d", tone: ["#202a33", "#8fb3c9"] },
  friends: { url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac", tone: ["#3a2433", "#f08a6c"] },
  table: { url: "https://images.unsplash.com/photo-1543269865-cbf427effbad", tone: ["#2c2420", "#d9a173"] },
  laughing: { url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18", tone: ["#2a1f2f", "#f0a06c"] },
  sunrise: { url: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8", tone: ["#2b2140", "#ff9c5b"] },
  badminton: { url: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea", tone: ["#16324a", "#62b0e8"] },
  books: { url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570", tone: ["#33281f", "#c99a62"] },
};

export function imageUrl(key: string, w = 1200) {
  if (key.startsWith("data:") || key.startsWith("http")) return key;
  const img = IMAGES[key];
  return img ? `${img.url}?auto=format&fit=crop&w=${w}&q=75` : "";
}

export function imageTone(key: string): [string, string] {
  return IMAGES[key]?.tone ?? ["#1b2340", "#f2643a"];
}

export const COVER_CHOICES = ["coffee", "cafe", "table", "boardgames", "pottery", "sketch", "food", "film", "yoga", "pickleball", "books", "friends"];

export function avatarUrl(gender: "women" | "men", n: number) {
  return `https://randomuser.me/api/portraits/${gender}/${n}.jpg`;
}
