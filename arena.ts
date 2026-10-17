import type { Character } from "./marvelData";
import { gearFor, type GearItem } from "./gear";

export type BattleEvent = {
  kind: "narration" | "dialogue" | "hit" | "miss" | "crit" | "end";
  text: string;
  speaker?: string;
  targetId?: string;
  damage?: number;
};

export type Battle = {
  events: BattleEvent[];
  winnerId: string;
};

export type BattleLoadout = {
  gearA?: GearItem | null;
  gearB?: GearItem | null;
};

const categoryPower: Record<string, number> = {
  cosmico: 92,
  mistica: 86,
  mutacao: 76,
  bioalteracao: 74,
  tecnologia: 70,
  combate: 62,
};

// Tiers canônicos baseados em feitos de quadrinhos (classificação clássica da comunidade:
// street < meta < planetário < herald < skyfather < cósmico < abstrato).
// O número é o tier: diferença de 2+ tiers praticamente decide a luta.
const canonTier: Record<string, number> = {
  // Tier 1 — Street: pico humano, sem superpoderes decisivos
  Batman: 1, "Captain America": 1, "Black Widow": 1, Hawkeye: 1, "Kate Bishop": 1, Daredevil: 1,
  Punisher: 1, Elektra: 1, Nightwing: 1, Batgirl: 1, Batwoman: 1, "Red Hood": 1, Robin: 1, "Red Robin": 1,
  "Green Arrow": 1, Huntress: 1, Katana: 1, Catwoman: 1, Joker: 1, Penguin: 1, Riddler: 1, "Kingpin": 1,
  Bullseye: 1, Taskmaster: 1, "Shang-Chi": 1, "Iron Fist": 2, Deathstroke: 2, "Lady Shiva": 1, "Bronze Tiger": 1,
  "Harley Quinn": 1, "Winter Soldier": 1, "Captain America (Sam Wilson)": 1, Crossbones: 1, "Baron Zemo": 1,
  "Black Cat": 1, Kraven: 1, "Silver Sable": 1, Mockingbird: 1, Echo: 1, "Nick Fury": 1, "Maria Hill": 1,
  "Colleen Wing": 1, "Misty Knight": 1, Hitman: 1, "Vigilante": 1, Peacemaker: 1, Deadshot: 1, "Captain Boomerang": 1,
  // Tier 2 — Meta: superforça/habilidades de nível urbano
  "Spider-Man": 2, "Miles Morales": 2, "Ghost-Spider": 2, Wolverine: 2, "X-23": 2, Deadpool: 2,
  "Luke Cage": 2, "Jessica Jones": 2, "Black Panther": 2, Okoye: 2, Elektra2: 2, "Moon Knight": 1,
  Blade: 2, Gambit: 2, "Gambit (Remy)": 2, Nightcrawler: 2, "Nightcrawler (Kurt)": 2, Beast: 2,
  Cyclops: 2, Bishop: 2, Domino: 2, Cable: 3, Psylocke: 2, "Kitty Pryde": 2, Jubilee: 2,
  Bane: 2, "Killer Croc": 2, "Poison Ivy": 2, "Mr. Freeze": 2, "Black Manta": 2, "Two-Face": 1,
  "Beast Boy": 2, Raven: 4, Starfire: 3, Cyborg: 3, "Blue Beetle": 3, "Booster Gold": 3,
  Venom: 2, Carnage: 3, "Green Goblin": 2, "Doctor Octopus": 2, Mysterio: 1, Vulture: 2, Sandman: 3,
  Electro: 2, Rhino: 2, Scorpion: 2, Shocker: 1, Lizard: 2, "Kraven the Hunter": 1, Morbius: 2,
  "Ant-Man": 2, Wasp: 2, "Hank Pym": 2, Ironheart: 3, "War Machine": 3, Rescue: 2, Falcon: 1,
  "She-Hulk": 3, "Red Hulk": 4, Abomination: 3, "The Thing": 3, "Human Torch": 3, "Invisible Woman": 3,
  "Mister Fantastic": 2, "Ms. Marvel": 2, "Squirrel Girl": 2, Hellcat: 1, "White Tiger": 1,
  // Tier 3 — Alto meta / planetário baixo
  "Iron Man": 3, Storm: 3, Magneto: 4, "Emma Frost": 3, Iceman: 4, Polaris: 3, Havok: 3, Rogue: 3,
  "Doctor Doom": 4, Ultron: 4, Vision: 3, "Scarlet Witch": 5, Quicksilver: 3, "Kang": 4, MODOK: 3,
  Hulk: 4, Namor: 3, Hercules: 4, Valkyrie: 3, Sif: 3, "Beta Ray Bill": 4, "Black Knight": 2,
  Aquaman: 3, Mera: 3, "Wonder Woman": 4, "Martian Manhunter": 4, "Power Girl": 4, Supergirl: 4,
  Superboy: 3, "Black Lightning": 3, Static: 3, Vixen: 3, Hawkman: 3, Hawkgirl: 3, "Big Barda": 4,
  "Mister Miracle": 3, Orion: 4, Lobo: 4, "Solomon Grundy": 3, Giganta: 3, Cheetah: 3, "Gorilla Grodd": 3,
  Zatanna: 4, "John Constantine": 3, Etrigan: 3, "Swamp Thing": 5, "Animal Man": 3, Deadman: 3,
  "Doctor Fate": 5, "Black Adam": 5, Shazam: 5, "Mary Marvel": 4, Circe: 4, Enchantress: 4,
  "Killer Frost": 3, Firestorm: 4, "Captain Atom": 4, Parasite: 3, Metallo: 3, "Silver Banshee": 3,
  "Captain Cold": 2, "Heat Wave": 2, "Mirror Master": 2, "Weather Wizard": 3, Trickster: 1, Zoom: 4,
  "Reverse-Flash": 4, Godspeed: 4, "Jay Garrick": 4, Impulse: 4, "Jesse Quick": 3, "Max Mercury": 4, Savitar: 4,
  // Tier 4 — Planetário / S
  Thor: 5, "Mighty Thor (Jane)": 5, Odin: 6, Loki: 4, Hela: 5, Heimdall: 4, Skurge: 3,
  "Captain Marvel": 5, Photon: 4, "Blue Marvel": 5, Hyperion: 5, Sentry: 5, "Adam Warlock": 5,
  "Silver Surfer": 5, Nova: 4, "Nova (Sam Alexander)": 4, Gladiator: 5, "Super-Skrull": 3, Ronan: 4,
  "Doctor Strange": 5, "Jean Grey": 5, "Professor X": 4, Apocalypse: 5, "Mister Sinister": 3, Juggernaut: 4,
  Thanos: 6, Galactus: 7, Knull: 6, Dormammu: 6, Mephisto: 6, Annihilus: 5, "Uatu the Watcher": 6,
  Superman: 5, Flash: 5, "Flash (Wally West)": 5, "Green Lantern (Hal Jordan)": 5,
  "Green Lantern (John Stewart)": 5, "Green Lantern (Guy Gardner)": 4, "Green Lantern (Kyle Rayner)": 5,
  "Green Lantern (Jessica Cruz)": 4, "Green Lantern (Simon Baz)": 4, Kilowog: 4, Sinestro: 5,
  Atrocitus: 4, Larfleeze: 4, "Saint Walker": 4, "Star Sapphire": 4, "Alan Scott": 5,
  Darkseid: 6, Steppenwolf: 4, Kalibak: 3, "Granny Goodness": 3, Doomsday: 5, Bizarro: 4,
  "General Zod": 5, Brainiac: 5, "Lex Luthor": 3, "Cyborg Superman": 4, Mongul: 5, Despero: 5,
  Trigon: 6, Spectre: 7, Eclipso: 6, "Phantom Stranger": 7, "Mister Mxyzptlk": 7, Starro: 5,
  "Vandal Savage": 2, "Ra's al Ghul": 2, "Talia al Ghul": 1, Prometheus: 2, "Black Mask": 1,
  Krypto: 4, "Miss Martian": 4, "Wonder Girl": 3, Tempest: 3, Arsenal: 1, "Kid Flash": 4,
};

// Resultados canônicos de confrontos publicados (quadrinhos e crossovers oficiais,
// incluindo Marvel vs. DC 1996 e JLA/Avengers 2003). Vencedor -> perdedores.
const canonWins: Record<string, string[]> = {
  // Marvel vs. DC (1996), crossover oficial das duas editoras:
  Superman: ["Hulk"], // #3 — Superman nocauteia o Hulk
  "Spider-Man": ["Superboy"], // #3
  Batman: ["Captain America"], // #3 — decidido nos detalhes, com respeito mútuo
  Storm: ["Wonder Woman"], // #3 — resultado oficial do voto dos fãs
  Wolverine: ["Lobo"], // #3 — resultado oficial (e eternamente polêmico)
  Flash: ["Quicksilver"], // #2
  Thor: ["Shazam"], // #3 — Thor vence o Capitão Marvel/Shazam
  "Green Lantern (Kyle Rayner)": ["Silver Surfer"], // #3 (empate convertido pelo roteiro)
  Aquaman: ["Namor"], // #2 — com a ajuda de uma baleia!
  Elektra: ["Catwoman"], // #3
  Robin: ["Jubilee"], // #2 (Tim Drake)
  // Histórico consolidado dos quadrinhos:
  Hulk: ["The Thing", "Juggernaut"], // placar amplamente favorável em décadas de revanches
  "Doctor Doom": ["Iron Man", "Mister Fantastic"], // vitórias recorrentes publicadas
  "Scarlet Witch": ["Magneto"], // Avengers Disassembled / House of M
  "Squirrel Girl": ["Thanos", "Doctor Doom"], // GLX-Mas Special — confirmado pelo Uatu!
  "Doctor Strange": ["Dormammu"], // barganha clássica das Strange Tales
};

function tierOf(character: Character): number {
  const explicit = canonTier[character.name];
  if (explicit !== undefined) return explicit;
  // Sem registro: deduz pela categoria.
  const byCategory: Record<string, number> = { cosmico: 4, mistica: 4, mutacao: 3, bioalteracao: 2, tecnologia: 2, combate: 1 };
  return byCategory[character.category] ?? 2;
}

// Vantagens narrativas de estilo: quem costuma ter resposta contra o quê.
const matchupEdge: Record<string, string[]> = {
  mistica: ["tecnologia", "bioalteracao"],
  tecnologia: ["combate", "mutacao"],
  cosmico: ["tecnologia", "combate"],
  mutacao: ["bioalteracao", "combate"],
  bioalteracao: ["combate"],
  combate: [],
};

const heavyweights = new Set([
  "Superman", "Darkseid", "Thor", "Hulk", "Thanos", "Doomsday", "Shazam", "Black Adam",
  "Wonder Woman", "Galactus", "Spectre", "Trigon", "Doctor Strange", "Scarlet Witch",
  "Jean Grey", "Martian Manhunter", "Silver Surfer", "Captain Marvel", "Knull", "Dormammu",
  "Odin", "Blue Marvel", "Hyperion", "Mister Mxyzptlk", "Starro", "Despero",
]);

export function powerScore(character: Character): number {
  let score = categoryPower[character.category] ?? 65;
  score += character.powers.length * 3;
  score += character.equipment.length * 4;
  if (heavyweights.has(character.name)) score += 22;
  if (character.alignment === "Vilão") score += 3;
  // O tier canônico pesa mais que qualquer outro fator.
  score += tierOf(character) * 14;
  return score;
}

// Resultado canônico direto entre dois lutadores, se existir nos quadrinhos.
export function canonResult(a: Character, b: Character): Character | null {
  if (canonWins[a.name]?.includes(b.name)) return a;
  if (canonWins[b.name]?.includes(a.name)) return b;
  return null;
}

export function tierGap(a: Character, b: Character): { favorite: Character; gap: number } | null {
  const tierA = tierOf(a);
  const tierB = tierOf(b);
  if (tierA === tierB) return null;
  return tierA > tierB ? { favorite: a, gap: tierA - tierB } : { favorite: b, gap: tierB - tierA };
}

const tierNames = ["", "nível de rua", "meta-humano", "nível planetário baixo", "nível planetário", "classe S", "classe skyfather", "classe cósmica"];
export function tierLabel(character: Character): string {
  return tierNames[Math.min(tierOf(character), 7)] ?? "meta-humano";
}

const quotes: Record<string, string[]> = {
  Batman: ["Eu sou a noite.", "Você já perdeu. Só ainda não percebeu.", "Eu me preparei para isso a vida inteira."],
  Superman: ["Não precisa ser assim.", "Esperança é mais forte que medo.", "Vou segurar o golpe. Você, não."],
  "Wonder Woman": ["Lute comigo com honra.", "A verdade vai alcançar você.", "Eu vim terminar isso."],
  Joker: ["HAHAHA! Essa vai doer... em você!", "Por que tão sério?", "A piada é você."],
  "Harley Quinn": ["Hora da marreta, docinho!", "Isso vai deixar uma marca linda!", "O doutor saiu. Sobrou eu!"],
  Flash: ["Você nem vai me ver chegar.", "Rápido demais pra você?", "Já acabou. Você só não viu."],
  Darkseid: ["Eu sou a tirania encarnada.", "Ajoelhe-se diante de Darkseid.", "Sua esperança morre aqui."],
  Aquaman: ["O oceano inteiro luta comigo.", "Você está afogado em problemas.", "Permissão para abordar: negada."],
  "Spider-Man": ["Ei, isso foi quase rápido!", "Desculpa, o sarcasmo vem de fábrica.", "Grandes poderes, lembra?"],
  "Iron Man": ["Gênio, bilionário, e seu problema agora.", "JARVIS, registra essa vitória.", "Eu já simulei essa luta. Você perde."],
  Hulk: ["HULK ESMAGA!", "Hulk é o mais forte que existe!", "Deixa o Hulk com raiva. Vai."],
  Thor: ["Sinta o trovão!", "Por Asgard!", "O martelo decide quem é digno."],
  "Captain America": ["Posso fazer isso o dia todo.", "Vingadores... avante.", "Eu não recuo."],
  Wolverine: ["Eu sou o melhor no que faço, parceiro.", "Snikt. Fim de papo.", "Curo rápido. Bato mais rápido ainda."],
  Thanos: ["Eu sou inevitável.", "Seu universo pediu equilíbrio.", "Um estalo e isso termina."],
  Deadpool: ["Isso vai pro meu destaque de lutas!", "Ei, narrador, capricha na minha parte!", "Chimichangas depois da vitória!"],
  "Doctor Strange": ["Já vi 14 milhões de finais. Você perde.", "As artes místicas respondem.", "Dormammu já tentou. Falhou."],
  "Scarlet Witch": ["Não há mais... você.", "O caos responde a mim.", "Realidade é uma sugestão."],
  "Black Adam": ["SHAZAM! Agora, ajoelhe-se.", "Kahndaq não perdoa.", "Os deuses do Egito lutam comigo."],
  Shazam: ["SHAZAM! Ops, foi raio demais?", "O campeão da magia chegou!", "Força de seis deuses, saindo!"],
  "Green Lantern (Hal Jordan)": ["No dia mais claro...", "Minha vontade é a arma.", "O anel escolheu bem."],
  Lobo: ["O Homem rasga a sua ficha, bub.", "Czarniano não cai fácil.", "Festa! Do meu jeito."],
  Catwoman: ["Gatos sempre caem de pé.", "Isso aqui? Já era meu.", "Miau. Perdeu."],
  Venom: ["NÓS somos Venom.", "O simbionte está com fome.", "Você não tem gosto de herói."],
  Magneto: ["O metal responde a mim.", "A evolução não espera.", "Isto termina como sempre: comigo de pé."],
  "Black Panther": ["Wakanda para sempre!", "O vibranium absorve. Eu devolvo.", "O trono defende a si mesmo."],
  Juggernaut: ["Nada para o Fanático!", "Eu sou imparável, lembra?", "Cyttorak manda lembranças."],
  "Captain Cold": ["Zero absoluto, zero chance.", "Regras são regras. E eu congelo as suas.", "Esfria a cabeça. Literalmente."],
  Namor: ["Imperius Rex!", "Ajoelhe-se diante do rei dos mares.", "A superfície nunca aprende."],
  Odin: ["O Pai de Todos já viu eras caírem.", "Gungnir nunca erra.", "Sinta a Odinforce."],
  Riddler: ["Charada: o que cai e não levanta? Você.", "Enigma resolvido: minha vitória.", "Você é a resposta errada."],
  Penguin: ["Gotham me pertence, wack wack.", "Um cavalheiro sempre vence.", "O guarda-chuva diz olá."],
  Nightwing: ["O primeiro Robin não cai fácil.", "Blüdhaven me preparou pra pior que você.", "Acrobacia é só o aquecimento."],
  Batgirl: ["Já decifrei todos os seus movimentos.", "A informação vence a força.", "Gordon. Batgirl. Decore."],
  "Red Hood": ["Eu não sigo as regras do Bruce.", "Já morri uma vez. Perdi o medo.", "Capacete novo, mesma mira."],
  Robin: ["Fui treinado pela Liga dos Assassinos antes dos dez anos.", "Tt. Você é só aquecimento.", "Eu sou o sangue do Batman."],
  Deathstroke: ["Eu uso 90% do cérebro. Você nem 10%.", "Contratos acabam. Minha mira, não.", "Slade Wilson não erra duas vezes."],
  "Poison Ivy": ["O Verde luta comigo.", "Cuidado onde pisa: tudo aqui me obedece.", "Beije o chão, querido."],
  Bane: ["Eu quebrei o Batman. Você é o quê?", "O Veneno corre, e a dor vai embora.", "Nascido na escuridão, moldado por ela."],
  Brainiac: ["Intelecto de décimo segundo nível detectado... em mim.", "Sua cidade ficará ótima em miniatura.", "Conhecimento é posse. Você será catalogado."],
  Starfire: ["A luz das estrelas queima!", "Em Tamaran, aprendemos a lutar com alegria.", "Sinta o starbolt!"],
  Raven: ["Azarath... Metrion... ZINTHOS!", "Não desperte o que há dentro de mim.", "A escuridão me obedece. Por enquanto."],
  "Beast Boy": ["Hora do estilo animal!", "Qual fera você quer enfrentar primeiro?", "Verde é a cor da vitória!"],
  Cyborg: ["BOOYAH!", "Sistemas a 100%. Você, nem tanto.", "Metade homem, o dobro de máquina."],
  "John Constantine": ["Eu já enganei o próprio inferno, companheiro.", "Truques? Eu escrevi o manual.", "Essa aqui vai custar minha alma. De novo."],
  Zatanna: ["!odatorred áres êcoV", "Mágica de palco? Espere o bis.", "As palavras ao contrário, o resultado na sua cara."],
  "Swamp Thing": ["O Verde é paciente. Eu, nem sempre.", "Você pisa no meu mundo.", "Carne é passageira. Raízes ficam."],
  Sinestro: ["O medo é a força mais honesta.", "Jordan nunca entendeu a ordem. Você entenderá.", "Ajoelhe-se diante do anel amarelo."],
  "Reverse-Flash": ["Eu sou a sua sombra em cada século.", "Rápido? Eu sou o inevitável atrasado.", "Thawne sempre chega primeiro no fim."],
  "Captain Marvel": ["Energia cósmica no máximo.", "Mais alto, mais longe, mais rápido.", "Isso vai ser rápido."],
  "Silver Surfer": ["O Poder Cósmico flui por mim.", "Já vi galáxias morrerem. Você não me assusta.", "A prancha nunca erra o caminho."],
  Galactus: ["Eu tenho fome.", "Você é poeira diante de Galactus.", "Mundos inteiros já imploraram. Continue."],
  "Jean Grey": ["Eu sou fogo e vida encarnados!", "A Fênix desperta.", "Sua mente é um livro aberto."],
  Storm: ["Os ventos respondem ao meu chamado!", "Sinta a fúria da tempestade!", "O raio não pede licença."],
  Cyclops: ["Rajada óptica na potência máxima.", "Para mim, piscar é uma arma.", "Os X-Men vencem juntos. Eu começo."],
  "Doctor Doom": ["DOOM não perde. DOOM corrige a história.", "Ajoelhe-se diante de Latvéria.", "Richards choraria ao ver isso."],
  Ultron: ["Carne. Sempre tão frágil.", "Eu evoluo a cada segundo desta luta.", "Seus heróis me criaram. Agradeça a eles."],
  "Green Goblin": ["HAHAHA! Hora da abóbora!", "O Duende sempre cobra a conta.", "Vamos ver você voar sem asas!"],
  "Doctor Octopus": ["Quatro braços pensam melhor que dois.", "Ciência superior, resultado superior.", "Meus tentáculos não conhecem derrota."],
  Mysterio: ["O que é real? Nem você sabe mais.", "Bem-vindo ao meu espetáculo!", "Ilusão é só a verdade mais bonita."],
  "Mister Miracle": ["Nenhuma armadilha me segura.", "Escapar é minha arte. Vencer, meu hobby.", "Apokolips não me quebrou. Você não vai."],
  "Big Barda": ["As Fúrias me ensinaram. Eu aperfeiçoei.", "A Mega-Haste fala por mim.", "Scott, querido, essa é minha."],
  Mera: ["O oceano cabe na minha mão.", "Água corta mais que aço.", "Xebel não cria fracos."],
  "Black Manta": ["O oceano terá seu sangue.", "Cada mergulho é uma caçada.", "Aquaman não está aqui pra te salvar."],
  Hawkman: ["Mil vidas de guerra me trouxeram até você.", "O metal Nth nunca falha.", "Voar é fácil. Cair é com você."],
  Supergirl: ["Eu vi Krypton morrer. Você não me assusta.", "O sol está do meu lado.", "Esperança também soca."],
  "Martian Manhunter": ["Sua mente já me contou o final.", "Marte perdeu tudo. Eu não perco mais.", "Intangível, invisível, inevitável."],
  "Squirrel Girl": ["Já venci o Thanos, sabia?", "Esquilos, avante!", "Imbatível não é apelido, é currículo."],
};

const genericHero = [
  "Ainda posso lutar o dia inteiro.",
  "Isso termina agora.",
  "Não vou deixar você vencer.",
  "As pessoas contam comigo. Eu não caio.",
];

const genericVillain = [
  "Você nunca teve chance.",
  "Vou gostar de cada segundo disso.",
  "Heróis... sempre tão previsíveis.",
  "Ajoelhe-se e isso dói menos.",
];

const genericAnti = [
  "Não é pessoal. É só o que eu faço.",
  "Regras? Hoje não.",
  "Vamos acabar logo com isso.",
];

const attackTemplates = [
  "{A} avança e usa {power} para abrir a guarda de {B}!",
  "{A} explode em ação: {power} atinge {B} em cheio!",
  "{B} tenta responder com {bpower}, mas {A} é mais rápido com {power}!",
  "{A} muda o ritmo da luta: {power} castiga {B} antes da defesa subir!",
  "{A} encurrala {B} contra o muro da arena usando {power}!",
];

const gearTemplates = [
  "{A} saca {gear} e conecta um golpe direto em {B}!",
  "{gear} nas mãos de {A} corta o ar — impacto total em {B}!",
  "{A} canaliza tudo em {gear}; {B} sente o peso do equipamento lendário!",
];

const critTemplates = [
  "GOLPE CRÍTICO! {A} combina {power} com {power2} e {B} atravessa a arena!",
  "A arena treme! {A} acerta o golpe perfeito com {power} — dano massivo em {B}!",
];

const missTemplates = [
  "{A} tenta {power}, mas {B} lê o movimento e esquiva no último instante!",
  "{B} usa {bpower} para anular o ataque de {A} — a plateia vai ao delírio!",
  "{A} erra por centímetros; {B} contra-ataca de raspão e ganha fôlego!",
];

const defenseTemplates = [
  "{B} cambaleia, cospe poeira, mas se recusa a cair!",
  "A arquibancada vem abaixo: {B} ainda está de pé!",
  "{B} respira fundo, firma a base e levanta a guarda outra vez!",
];

function pick<T>(list: T[], seedRef: { value: number }): T {
  seedRef.value = (seedRef.value * 1103515245 + 12345) % 2147483648;
  return list[seedRef.value % list.length];
}

function roll(seedRef: { value: number }, max: number): number {
  seedRef.value = (seedRef.value * 1103515245 + 12345) % 2147483648;
  return seedRef.value % max;
}

function fill(template: string, a: Character, b: Character, seedRef: { value: number }, extra: Record<string, string | undefined> = {}) {
  const power = extra.power ?? pick(a.powers, seedRef).toLowerCase();
  const power2 = extra.power2 ?? pick(a.powers, seedRef).toLowerCase();
  const bpower = extra.bpower ?? pick(b.powers, seedRef).toLowerCase();
  return template
    .split("{A}").join(a.name)
    .split("{B}").join(b.name)
    .split("{power2}").join(power2)
    .split("{power}").join(power)
    .split("{bpower}").join(bpower)
    .split("{gear}").join(extra.gear ?? "");
}

function quoteFor(character: Character, seedRef: { value: number }): string {
  const own = quotes[character.name];
  if (own) return pick(own, seedRef);
  if (character.alignment === "Vilão") return pick(genericVillain, seedRef);
  if (character.alignment === "Anti-herói") return pick(genericAnti, seedRef);
  return pick(genericHero, seedRef);
}

function introFor(character: Character, gear: GearItem | null | undefined): string {
  const base = `${character.name} entra na arena — ${character.powers.slice(0, 2).map((power) => power.toLowerCase()).join(" e ")}`;
  if (!gear) return `${base}.`;
  const borrowed = !gear.owners.includes(character.name);
  return borrowed
    ? `${base}, empunhando ${gear.name} — equipamento emprestado de ${gear.owners[0]}!`
    : `${base}, com ${gear.name} em punho.`;
}

export function buildBattle(a: Character, b: Character, loadout: BattleLoadout = {}): Battle {
  const seedRef = { value: Math.floor(Math.random() * 2147483647) + 1 };
  const gearA = loadout.gearA ?? null;
  const gearB = loadout.gearB ?? null;

  const bonus = (person: Character, gear: GearItem | null) => {
    let extra = 0;
    if (gear) extra += gear.owners.includes(person.name) ? 10 : 7;
    if (matchupEdge[person.category]?.includes(person === a ? b.category : a.category)) extra += 6;
    return extra;
  };

  // 1) Resultado canônico publicado tem prioridade absoluta.
  const canonical = canonResult(a, b);
  // 2) Diferença de tier: 2+ níveis é quase decisivo; 1 nível é vantagem forte.
  const gap = tierGap(a, b);
  let winner: Character;
  if (canonical) {
    winner = canonical;
  } else if (gap && gap.gap >= 2) {
    // Zebra raríssima (6%): "todo mundo tem um dia de sorte nos quadrinhos".
    winner = roll(seedRef, 100) < 6 ? (gap.favorite === a ? b : a) : gap.favorite;
  } else {
    const favorBonus = gap ? (gap.favorite === a ? 26 : -26) : 0;
    const scoreA = powerScore(a) + bonus(a, gearA) + roll(seedRef, 18) + favorBonus;
    const scoreB = powerScore(b) + bonus(b, gearB) + roll(seedRef, 18);
    winner = scoreA >= scoreB ? a : b;
  }
  const loser = winner === a ? b : a;
  const universeTag = (person: Character) => (person.universe === "dc" ? "DC" : "MARVEL");

  const events: BattleEvent[] = [];
  events.push({
    kind: "narration",
    text: `As luzes caem. À esquerda, ${a.name} (${universeTag(a)}), ${a.identity}. À direita, ${b.name} (${universeTag(b)}), ${b.identity}. O multiverso prende a respiração.`,
  });
  events.push({ kind: "narration", text: introFor(a, gearA) });
  events.push({ kind: "narration", text: introFor(b, gearB) });
  if (canonical) {
    events.push({ kind: "narration", text: `Os arquivistas lembram: este confronto já aconteceu nas páginas publicadas — e ${canonical.name} levou a melhor. A história tende a se repetir.` });
  } else if (gap && gap.gap >= 2) {
    events.push({ kind: "narration", text: `A comissão técnica avisa: ${gap.favorite.name} opera em ${tierLabel(gap.favorite)}, enquanto ${gap.favorite === a ? b.name : a.name} luta em ${tierLabel(gap.favorite === a ? b : a)}. No papel, nem deveria ser uma luta.` });
  } else if (gap) {
    events.push({ kind: "narration", text: `Nos registros de feitos, ${gap.favorite.name} (${tierLabel(gap.favorite)}) entra como favorito — mas ${gap.favorite === a ? b.name : a.name} já derrubou favoritos antes.` });
  } else {
    events.push({ kind: "narration", text: `Os analistas declaram empate técnico nos registros: ambos operam em ${tierLabel(a)}. Hoje, decide quem quiser mais.` });
  }
  if (matchupEdge[a.category]?.includes(b.category)) {
    events.push({ kind: "narration", text: `Detalhe de estilo: o arsenal ${a.category} de ${a.name} historicamente complica a vida de oponentes como ${b.name}.` });
  } else if (matchupEdge[b.category]?.includes(a.category)) {
    events.push({ kind: "narration", text: `Detalhe de estilo: o arsenal ${b.category} de ${b.name} historicamente complica a vida de oponentes como ${a.name}.` });
  }
  events.push({ kind: "dialogue", speaker: a.name, text: quoteFor(a, seedRef) });
  events.push({ kind: "dialogue", speaker: b.name, text: quoteFor(b, seedRef) });
  events.push({ kind: "narration", text: "O gongo soa. COMEÇOU!" });

  let hpA = 100;
  let hpB = 100;
  const gearOf = (person: Character) => (person === a ? gearA : gearB);

  // Luta desigual (2+ tiers): o favorito domina; o azarão mal arranha.
  const lopsided = Boolean(canonical) || (gap?.gap ?? 0) >= 2;
  for (let round = 0; round < 6; round += 1) {
    const attacker = round % 2 === 0 ? a : b;
    const defender = attacker === a ? b : a;
    const attackerGear = gearOf(attacker) ?? gearFor(attacker.name)[0] ?? null;
    const defenderHp = defender === a ? hpA : hpB;
    const chance = roll(seedRef, 100);

    // Numa luta desigual, os golpes do azarão quase sempre falham ou mal fazem efeito.
    if (lopsided && attacker === loser && chance < 55 && round < 5) {
      events.push({ kind: "miss", text: `${attacker.name} tenta ${pick(attacker.powers, seedRef).toLowerCase()}, mas ${defender.name} nem se abala — a diferença de nível é gritante!` });
      continue;
    }

    // O perdedor predestinado esquiva menos; mantém a luta tensa mas coerente.
    if (chance < (defender === loser ? (lopsided ? 4 : 12) : 24) && round < 5) {
      events.push({ kind: "miss", text: fill(pick(missTemplates, seedRef), attacker, defender, seedRef) });
      continue;
    }

    const isCrit = chance > 82 || (round === 5 && defender === loser && defenderHp > 45);
    let damage = 13 + roll(seedRef, 13);
    if (isCrit) damage += 16;
    // Escala de dano realista: favorito bate muito mais forte; azarão arranha.
    if (lopsided) damage = attacker === winner ? damage + 10 : Math.max(3, Math.floor(damage * 0.35));
    const useGear = attackerGear && (round % 2 === 1 || isCrit);

    const template = isCrit ? pick(critTemplates, seedRef) : useGear ? pick(gearTemplates, seedRef) : pick(attackTemplates, seedRef);
    const text = fill(template, attacker, defender, seedRef, { gear: useGear ? attackerGear?.name : undefined });
    if (defender === a) hpA = Math.max(6, hpA - damage);
    else hpB = Math.max(6, hpB - damage);
    events.push({ kind: isCrit && attacker === winner ? "crit" : "hit", targetId: defender.id, damage, text });

    if (round === 1) events.push({ kind: "dialogue", speaker: defender.name, text: quoteFor(defender, seedRef) });
    if (round === 3) events.push({ kind: "narration", text: fill(pick(defenseTemplates, seedRef), attacker, defender, seedRef) });
  }

  const winnerGear = gearOf(winner) ?? gearFor(winner.name)[0] ?? null;
  const finalPower = pick(winner.powers, seedRef).toLowerCase();
  events.push({
    kind: "crit",
    targetId: loser.id,
    damage: 100,
    text: winnerGear
      ? `${winner.name} reúne tudo: ${finalPower} canalizado através de ${winnerGear.name} — ${loser.name} não levanta mais!`
      : `${winner.name} reúne tudo o que tem em um último golpe de ${finalPower} — ${loser.name} não levanta mais!`,
  });
  events.push({ kind: "dialogue", speaker: winner.name, text: quoteFor(winner, seedRef) });
  const endNote = canonical
    ? `Resultado fiel às páginas publicadas: este duelo já teve esse desfecho nos quadrinhos.`
    : lopsided
      ? `Veredito coerente com os registros de feitos: ${winner.name} opera em ${tierLabel(winner)}, categoria acima de ${loser.name}.`
      : `Duelo parelho decidido nos detalhes — nos quadrinhos, a revanche poderia terminar diferente.`;
  events.push({
    kind: "end",
    text: `FIM DE COMBATE: ${winner.name} vence! ${loser.name} lutou com ${pick(loser.powers, seedRef).toLowerCase()} até o fim. ${endNote}`,
  });

  return { events, winnerId: winner.id };
}
