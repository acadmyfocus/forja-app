import type { Character, Universe } from "./marvelData";

// Importa o banco público Superhero API (akabab): todos os personagens
// catalogados de Marvel e DC com retrato, estatísticas e biografia.
export type ApiHero = {
  name: string;
  slug?: string;
  powerstats?: { intelligence?: number; strength?: number; speed?: number; durability?: number; power?: number; combat?: number };
  biography?: {
    fullName?: string;
    aliases?: string[];
    alterEgos?: string;
    publisher?: string;
    firstAppearance?: string;
    alignment?: string;
    placeOfBirth?: string;
  };
  appearance?: { race?: string | null };
  work?: { occupation?: string };
  connections?: { groupAffiliation?: string };
  images?: { md?: string; lg?: string };
};

export function normalizeName(value: string) {
  return value.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const statLabels: Array<[keyof NonNullable<ApiHero["powerstats"]>, string]> = [
  ["intelligence", "Inteligência"],
  ["strength", "Força"],
  ["speed", "Velocidade"],
  ["durability", "Resistência"],
  ["power", "Poder"],
  ["combat", "Combate"],
];

function guessCategory(hero: ApiHero): Character["category"] {
  const race = (hero.appearance?.race ?? "").toLowerCase();
  const occupation = (hero.work?.occupation ?? "").toLowerCase();
  const stats = hero.powerstats ?? {};
  if (/mutant/.test(race)) return "mutacao";
  if (/god|asgard|demi|kryptonian|alien|saiyan|eternal|new god|zen-whoberis|kakarantharaian|luphomoid|frost giant|icthyo|korbinite|strontian|czarnian|ungaran|bolovaxian|tamaran|martian/.test(race)) return "cosmico";
  if (/demon|vampire|zombie|mummy|spirit|ghost|cosmic entity|parademon/.test(race) || /sorcer|magic|occult/.test(occupation)) return "mistica";
  if ((stats.intelligence ?? 0) >= 88 && (stats.strength ?? 0) <= 60) return "tecnologia";
  if ((stats.strength ?? 0) >= 70 || (stats.power ?? 0) >= 80) return "bioalteracao";
  return "combate";
}

function guessAlignment(hero: ApiHero): Character["alignment"] {
  const alignment = hero.biography?.alignment ?? "";
  if (alignment === "bad") return "Vilão";
  if (alignment === "neutral") return "Anti-herói";
  return "Herói";
}

function topPowers(hero: ApiHero): string[] {
  const stats = hero.powerstats ?? {};
  return statLabels
    .map(([key, label]) => ({ label, value: stats[key] ?? 0 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map((entry) => `${entry.label} ${entry.value}`);
}

function cleanTeam(hero: ApiHero): string {
  const group = hero.connections?.groupAffiliation ?? "";
  if (!group || group === "-") return "Nenhuma";
  const first = group.split(/[;,]/)[0].replace(/^(formerly|former)\s+/i, "").trim();
  if (!first || first.length > 42) return "Nenhuma";
  return first;
}

export function expandRoster(data: ApiHero[], existingNames: Set<string>): Character[] {
  const added: Character[] = [];
  const seen = new Set(existingNames);

  data.forEach((hero) => {
    const publisher = hero.biography?.publisher;
    const universe: Universe | null = publisher === "Marvel Comics" ? "marvel" : publisher === "DC Comics" ? "dc" : null;
    if (!universe) return;
    const image = hero.images?.md ?? hero.images?.lg;
    if (!image) return;
    const key = normalizeName(hero.name);
    if (seen.has(key)) return;
    seen.add(key);

    const fullName = hero.biography?.fullName?.trim();
    const race = hero.appearance?.race && hero.appearance.race !== "null" ? hero.appearance.race : null;
    const occupation = hero.work?.occupation && hero.work.occupation !== "-" ? hero.work.occupation.split(/[;,]/)[0].trim() : null;
    const firstAppearance = hero.biography?.firstAppearance && hero.biography.firstAppearance !== "-" ? hero.biography.firstAppearance : null;
    const aliases = (hero.biography?.aliases ?? []).filter((alias) => alias && alias !== "-").slice(0, 3);
    const birth = hero.biography?.placeOfBirth && hero.biography.placeOfBirth !== "-" ? hero.biography.placeOfBirth : null;

    const overviewParts: string[] = [];
    if (fullName && normalizeName(fullName) !== key) overviewParts.push(fullName);
    if (race) overviewParts.push(race);
    if (occupation) overviewParts.push(occupation.toLowerCase());
    const overview = overviewParts.length
      ? `Registro do banco de heróis: ${overviewParts.join(" · ")}.`
      : "Registro importado do banco universal de heróis.";

    const secret = aliases.length
      ? `Também conhecido como: ${aliases.join(", ")}.`
      : birth
        ? `Local de origem registrado: ${birth}.`
        : "Dossiê resumido — os detalhes completos vivem nas HQs.";

    added.push({
      id: `x-${universe}-${normalizeName(hero.slug ?? hero.name).replace(/[^a-z0-9]+/g, "-")}`,
      name: hero.name,
      identity: fullName || hero.name,
      universe,
      category: guessCategory(hero),
      alignment: guessAlignment(hero),
      team: cleanTeam(hero),
      powers: topPowers(hero),
      equipment: [],
      weapons: "Não catalogado",
      armor: "Nenhuma",
      comics: firstAppearance ? [firstAppearance] : ["Ver banco de dados oficial"],
      overview,
      secret,
      image,
    });
  });

  return added.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}
