import { useEffect, useRef, useState } from "react";
import type { Character } from "./marvelData";
import type { GearItem } from "./gear";

const STORAGE_KEY = "marvel-archive-images-v4";
const memory = new Map<string, string>();
const pending = new Map<string, Promise<string>>();

try {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw) {
    Object.entries(JSON.parse(raw) as Record<string, unknown>).forEach(([key, value]) => {
      if (typeof value === "string" && value.startsWith("http")) memory.set(key, value);
    });
  }
} catch {
  /* Storage may be unavailable. */
}

function persist() {
  try {
    const found = Object.fromEntries([...memory.entries()].filter(([, value]) => value));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
  } catch {
    /* Ignore quota or privacy mode errors. */
  }
}

let active = 0;
const waiting: Array<() => void> = [];

function limited<T>(task: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const run = () => {
      active += 1;
      task()
        .then(resolve, reject)
        .finally(() => {
          active -= 1;
          waiting.shift()?.();
        });
    };
    if (active < 5) run();
    else waiting.push(run);
  });
}

type WikiPage = { title: string; index?: number; thumbnail?: { source: string } };
type WikiResponse = { query?: { pages?: WikiPage[] } };

type Wiki = "marvel" | "dc";

export type ImageStep =
  | { title: string; wiki?: Wiki }
  | { query: string; accept: (title: string) => boolean; prefer?: (title: string) => boolean; wiki?: Wiki };

const APIS: Record<Wiki, string> = {
  marvel: "https://marvel.fandom.com/api.php",
  dc: "https://dc.fandom.com/api.php",
};

async function request(extra: Record<string, string>, wiki: Wiki = "marvel"): Promise<WikiPage[]> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    origin: "*",
    prop: "pageimages",
    piprop: "thumbnail",
    pithumbsize: "500",
    ...extra,
  });
  try {
    const response = await fetch(`${APIS[wiki]}?${params.toString()}`);
    if (!response.ok) return [];
    const data = (await response.json()) as WikiResponse;
    return [...(data.query?.pages ?? [])].sort((a, b) => (a.index ?? 99) - (b.index ?? 99));
  } catch {
    return [];
  }
}

async function runStep(step: ImageStep): Promise<string> {
  if ("title" in step) {
    const pages = await limited(() => request({ titles: step.title, redirects: "1" }, step.wiki));
    return pages[0]?.thumbnail?.source ?? "";
  }
  const pages = await limited(() =>
    request({ generator: "search", gsrsearch: step.query, gsrnamespace: "0", gsrlimit: "10" }, step.wiki),
  );
  const hits = pages.filter((page) => page.thumbnail?.source && step.accept(page.title));
  const best = (step.prefer ? hits.find((page) => step.prefer?.(page.title)) : undefined) ?? hits[0];
  return best?.thumbnail?.source ?? "";
}

function loadImage(key: string, buildSteps: () => ImageStep[]): Promise<string> {
  const cached = memory.get(key);
  if (cached !== undefined) return Promise.resolve(cached);
  const running = pending.get(key);
  if (running) return running;

  const promise = (async () => {
    for (const step of buildSteps()) {
      const url = await runStep(step);
      if (url) {
        memory.set(key, url);
        persist();
        return url;
      }
    }
    memory.set(key, "");
    return "";
  })().finally(() => pending.delete(key));

  pending.set(key, promise);
  return promise;
}

export function useRemoteImage(key: string, buildSteps: () => ImageStep[], enabled: boolean) {
  const [url, setUrl] = useState<string | undefined>(() => memory.get(key));

  useEffect(() => {
    if (!enabled) return;
    const cached = memory.get(key);
    if (cached !== undefined) {
      setUrl(cached);
      return;
    }
    let alive = true;
    loadImage(key, buildSteps).then((value) => {
      if (alive) setUrl(value);
    });
    return () => {
      alive = false;
    };
    // The steps are derived from the stable key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);

  return url;
}

export function useNear<T extends HTMLElement>(rootMargin = "600px") {
  const ref = useRef<T | null>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || near) return;
    if (!("IntersectionObserver" in window)) {
      setNear(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [near, rootMargin]);

  return [ref, near] as const;
}

const formalNames: Record<string, string> = {
  "Iron Man": "Anthony Stark",
  "Hank Pym": "Henry Pym",
  Rescue: "Virginia Potts",
  Wasp: "Janet Van Dyne",
  "Captain America": "Steven Rogers",
  "Captain America (Sam Wilson)": "Samuel Wilson",
  "Winter Soldier": "James Barnes",
  "Black Widow": "Natalia Romanova",
  Hawkeye: "Clinton Barton",
  Daredevil: "Matthew Murdock",
  Bullseye: "Benjamin Poindexter",
  "Iron Fist": "Daniel Rand",
  "Nick Fury": "Nicholas Fury",
  Taskmaster: "Anthony Masters",
  Mockingbird: "Barbara Morse",
  "Ghost-Spider": "Gwendolyn Stacy",
  "Spider-Man 2099": "Miguel O'Hara",
  Venom: "Edward Brock",
  Hulk: "Robert Banner",
  "Luke Cage": "Carl Lucas",
  "The Thing": "Benjamin Grimm",
  "Invisible Woman": "Susan Storm",
  "Human Torch": "Jonathan Storm",
  Lizard: "Curtis Connors",
  Sandman: "William Baker",
  Electro: "Maxwell Dillon",
  Beast: "Henry McCoy",
  Iceman: "Robert Drake",
  Havok: "Alexander Summers",
  Psylocke: "Elizabeth Braddock",
  Angel: "Warren Worthington",
  Cannonball: "Samuel Guthrie",
  "Multiple Man": "James Madrox",
  Wiccan: "William Kaplan",
  "Ghost Rider": "Johnathon Blaze",
  "Ghost Rider (Robbie Reyes)": "Robbie Reyes",
  "Ms. Marvel": "Kamala Khan",
  "Miles Morales": "Miles Morales",
  Cyclops: "Scott Summers",
  Rogue: "Anna Marie",
  Hercules: "Hercules Panhellenios",
  Valkyrie: "Brunnhilde",
  Odin: "Odin Borson",
  Skurge: "Skurge",
  "America Chavez": "America Chavez",
  Hulkling: "Theodore Altman",
  "Nova (Sam Alexander)": "Samuel Alexander",
  Photon: "Monica Rambeau",
  "Blue Marvel": "Adam Brashear",
  Hyperion: "Marcus Milton",
  "Super-Skrull": "Kl'rt",
  Grandmaster: "En Dwi Gast",
  Collector: "Taneleer Tivan",
  Quicksilver: "Pietro Maximoff",
  Pyro: "St. John Allerdyce",
  Blob: "Frederick Dukes",
  Forge: "Forge",
  Sunfire: "Shiro Yoshida",
  Juggernaut: "Cain Marko",
  "Baron Mordo": "Karl Mordo",
  "The Hood": "Parker Robbins",
  "Man-Thing": "Theodore Sallis",
  Hellstrom: "Daimon Hellstrom",
  Cloak: "Tyrone Johnson",
  Dagger: "Tandy Bowen",
  "Mister Negative": "Martin Li",
  Scorpion: "MacDonald Gargan",
  Shocker: "Herman Schultz",
  Prowler: "Hobie Brown",
  Whiplash: "Anton Vanko (Whiplash)",
  "Crimson Dynamo": "Dmitri Bukharin",
  "Titanium Man": "Boris Bullski",
  "Misty Knight": "Mercedes Knight",
  Darkhawk: "Christopher Powell",
  Quake: "Daisy Johnson",
  "Squirrel Girl": "Doreen Green",
  "Absorbing Man": "Carl Creel",
  Tombstone: "Lonnie Lincoln",
  Klaw: "Ulysses Klaw",
  "Maria Hill": "Maria Hill",
  Hellcat: "Patricia Walker",
  "White Tiger": "Ava Ayala",
  "Baron Zemo": "Helmut Zemo",
  Hammerhead: "Hammerhead Joseph",
};

const dcNames: Record<string, string> = {
  Batman: "Bruce Wayne",
  Superman: "Kal-El",
  "Wonder Woman": "Diana of Themyscira",
  Flash: "Bartholomew Allen",
  "Flash (Wally West)": "Wallace West",
  "Jay Garrick": "Jason Garrick",
  Cyborg: "Victor Stone",
  Aquaman: "Arthur Curry",
  "Martian Manhunter": "J'onn J'onzz",
  Shazam: "William Batson",
  "Black Adam": "Teth-Adam",
  Raven: "Rachel Roth",
  Darkseid: "Uxas",
  Joker: "Joker",
  "Swamp Thing": "Alec Holland",
  Supergirl: "Kara Zor-El",
  Superboy: "Kon-El",
  "Power Girl": "Kara Zor-L",
  "Reverse-Flash": "Eobard Thawne",
  Brainiac: "Vril Dox",
  "Doctor Fate": "Khalid Nassour",
  "Mister Miracle": "Scott Free",
  Starfire: "Koriand'r",
  "Beast Boy": "Garfield Logan",
  Doomsday: "Doomsday",
  Bizarro: "Bizarro",
  Krypto: "Krypto",
  Etrigan: "Etrigan",
  Spectre: "Jim Corrigan",
  Trigon: "Trigon",
  Lobo: "Lobo",
  Amazo: "Amazo",
  "Solomon Grundy": "Cyrus Gold",
  Mongul: "Mongul",
  "Phantom Stranger": "Phantom Stranger",
  "Captain Cold": "Leonard Snart",
  "Heat Wave": "Mick Rory",
  "Mirror Master": "Samuel Scudder",
  "Weather Wizard": "Marco Mardon",
  Trickster: "James Jesse",
  Zoom: "Hunter Zolomon",
  "Abra Kadabra": "Abra Kadabra",
  Penguin: "Oswald Cobblepot",
  Riddler: "Edward Nygma",
  "Mad Hatter": "Jervis Tetch",
  Hush: "Thomas Elliot",
  "Victor Zsasz": "Victor Zsasz",
  Talon: "William Cobb",
  "Alan Scott": "Alan Scott",
  Hourman: "Rex Tyler",
  "Sandman (Wesley Dodds)": "Wesley Dodds",
  "Doctor Mid-Nite": "Charles McNider",
  "Atom Smasher": "Albert Rothstein",
  Tempest: "Garth",
  Arsenal: "Roy Harper",
  "Mister Mxyzptlk": "Mxyzptlk",
  "Silver Banshee": "Siobhan McDougal",
  "Ultra-Humanite": "Ultra-Humanite",
  Giganta: "Doris Zeul",
  Artemis: "Artemis of Bana-Mighdall",
  "Saturn Girl": "Imra Ardeen",
  "Cosmic Boy": "Rokk Krinn",
  "Lightning Lad": "Garth Ranzz",
  Zauriel: "Zauriel",
  "Doctor Light": "Kimiyo Hoshi",
  "Shazam (Freddy Freeman)": "Frederick Freeman",
  Klarion: "Klarion Bleak",
  "Geo-Force": "Brion Markov",
  Despero: "Despero",
  Starro: "Starro",
  Kalibak: "Kalibak",
  "Granny Goodness": "Granny Goodness",
  Eclipso: "Eclipso",
  Ravager: "Rose Wilson",
  Cheshire: "Jade Nguyen",
  "Bronze Tiger": "Benjamin Turner",
  "Kite Man": "Charles Brown",
  "Vandal Savage": "Vandar Adg",
  Prometheus: "Prometheus",
  "Shining Knight": "Justin Arthur",
  Vigilante: "Adrian Chase",
  OMAC: "Kevin Kho",
  "Brother Blood": "Sebastian Blood VIII",
  Larfleeze: "Larfleeze",
  "Saint Walker": "Bro'Dee Walker",
};

export function characterSteps(character: Character): ImageStep[] {
  if (character.universe === "dc") {
    const base = dcNames[character.name] ?? character.identity.split(" e ")[0];
    const names = [...new Set([base, character.name])];
    const steps: ImageStep[] = [];
    names.forEach((name) => {
      steps.push({ title: `${name} (Prime Earth)`, wiki: "dc" });
      steps.push({ title: `${name} (New Earth)`, wiki: "dc" });
      steps.push({ title: name, wiki: "dc" });
    });
    steps.push({
      query: `${base} Prime Earth`,
      accept: (title) => /\((Prime|New) Earth\)$/.test(title),
      wiki: "dc",
    });
    steps.push({ query: `${character.name} Earth`, accept: (title) => /\(.*Earth.*\)$/.test(title), wiki: "dc" });
    return steps;
  }
  const base = formalNames[character.name] ?? character.identity.split(" / ")[0];
  const bases = [...new Set([base, character.name])];
  const steps: ImageStep[] = [];
  bases.forEach((name) => {
    steps.push({ title: `${name} (Earth-616)` });
    steps.push({
      query: `${name} Earth-616`,
      accept: (title) => /\(Earth-616\)$/.test(title),
      prefer: (title) => title.toLowerCase().startsWith(name.toLowerCase()),
    });
  });
  steps.push({ query: `${bases[0]} Earth`, accept: (title) => /\(Earth-\d+\)$/.test(title) });
  return steps;
}

export function itemSteps(item: GearItem): ImageStep[] {
  const pattern = new RegExp(item.match, "i");
  const wiki = item.universe ?? "marvel";
  return [
    { title: item.query, wiki },
    {
      query: item.query,
      accept: (title) => pattern.test(title) && !/\/Gallery$/i.test(title),
      prefer: (title) => !/\(Earth-|\(Prime|\(New Earth/.test(title),
      wiki,
    },
  ];
}
