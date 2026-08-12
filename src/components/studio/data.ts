import portrait from "@/assets/art-portrait.jpg";
import character from "@/assets/art-character.jpg";
import hands from "@/assets/art-hands.jpg";
import landscape from "@/assets/art-landscape.jpg";

export type Artwork = {
  title: string;
  date: string;
  duration: string;
  tags: string[];
  image: string;
};

export const artworks: Artwork[] = [
  {
    title: "Portrait Study #24",
    date: "Aug 11, 2026",
    duration: "2h 34m",
    tags: ["Anatomy", "Face", "Lighting"],
    image: portrait,
  },
  {
    title: "Character Design #18",
    date: "Aug 9, 2026",
    duration: "4h 12m",
    tags: ["Clothing", "Composition", "Color"],
    image: character,
  },
  {
    title: "Hand Construction #61",
    date: "Aug 7, 2026",
    duration: "1h 05m",
    tags: ["Hands", "Anatomy"],
    image: hands,
  },
  {
    title: "Valley Light Study",
    date: "Aug 4, 2026",
    duration: "3h 48m",
    tags: ["Lighting", "Composition", "Color"],
    image: landscape,
  },
];

export type Skill = {
  name: string;
  value: number;
  change: number;
  spark: number[];
};

export const skills: Skill[] = [
  { name: "Anatomy", value: 34, change: 4, spark: [12, 18, 16, 22, 26, 25, 30, 34] },
  { name: "Perspective", value: 21, change: 2, spark: [8, 9, 12, 11, 15, 17, 19, 21] },
  { name: "Lighting", value: 28, change: 6, spark: [6, 10, 13, 14, 19, 22, 24, 28] },
  { name: "Color", value: 42, change: 3, spark: [20, 24, 27, 29, 33, 36, 39, 42] },
  { name: "Composition", value: 19, change: -1, spark: [14, 16, 18, 20, 21, 20, 20, 19] },
  { name: "Faces", value: 51, change: 5, spark: [28, 31, 36, 38, 42, 45, 47, 51] },
  { name: "Hands", value: 17, change: 8, spark: [3, 4, 5, 7, 9, 12, 15, 17] },
  { name: "Clothing", value: 31, change: 2, spark: [16, 18, 20, 23, 25, 27, 29, 31] },
];

export const activity: Record<string, number[]> = {
  "7D": [40, 82, 25, 66, 91, 12, 74],
  "30D": Array.from({ length: 30 }, (_, i) => 25 + Math.round(60 * Math.abs(Math.sin(i / 3.1)))),
  "3M": Array.from({ length: 36 }, (_, i) => 18 + Math.round(70 * Math.abs(Math.sin(i / 4.4 + 1)))),
  "1Y": [42, 38, 51, 47, 63, 58, 72, 66, 81, 74, 88, 96],
  ALL: [12, 20, 26, 31, 28, 44, 39, 55, 61, 58, 74, 69, 83, 79, 92, 97],
};

export const activityLabels: Record<string, string[]> = {
  "7D": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  "30D": ["4 weeks ago", "3 weeks ago", "2 weeks ago", "Last week"],
  "3M": ["June", "July", "August"],
  "1Y": [
    "Sep",
    "Oct",
    "Nov",
    "Dec",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
  ],
  ALL: ["2024", "2025", "2026"],
};
