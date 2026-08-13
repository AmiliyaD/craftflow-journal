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
