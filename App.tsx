import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  categories,
  characters,
  equipmentLabels,
  type Alignment,
  type CategoryId,
  type Character,
  type EquipmentId,
  type Universe,
} from "./marvelData";
import { dcCharacters } from "./dcData";
import { gearFor, gearItems, gearKindLabels, type GearItem, type GearKind } from "./gear";
import { characterSteps, itemSteps, useNear, useRemoteImage } from "./images";
import { buildBattle, powerScore, type Battle } from "./arena";
import { comicsLibrary } from "./comicsLibrary";
import { generatePanel, getArtEngine, getArtQuality, getGeminiKey, pollinationsPanelUrl, setArtEngine, setArtQuality, setGeminiKey, type ArtEngine, type ArtQuality } from "./aiArt";
import { visualFor } from "./visuals";
import { glossary, heroProfiles, heroQuizQuestions, historyTimeline, quizQuestions, sagas, triviaFacts, type Trait } from "./extras";
import { expandRoster, type ApiHero } from "./expandRoster";

const roster: Character[] = [...characters, ...dcCharacters];
let rosterExpanded = false;

type EquipmentFilter = EquipmentId | "all" | "none";

const heroPhoto = "https://upload.wikimedia.org/wikipedia/commons/9/9d/Exposition_Super-h%C3%A9ros_%26_Cie._L%27art_des_comics_Marvel_2.jpg";
const featuredNames = [
  "Spider-Man", "Iron Man", "Wolverine", "Thor", "Scarlet Witch", "Captain America",
  "Black Panther", "Doctor Strange", "Hulk", "Doctor Doom", "Deadpool", "Storm", "Jean Grey", "Thanos", "Loki", "Venom",
];

const apiNameAliases: Record<string, string> = {
  "Captain America (Sam Wilson)": "Falcon",
  "Ghost-Spider": "Spider-Gwen",
  "The Thing": "Thing",
  "Ms. Marvel": "Ms Marvel",
  "Miles Morales": "Spider-Man (Miles Morales)",
  "Ghost Rider (Robbie Reyes)": "Ghost Rider",
  Flash: "Flash II",
  "Flash (Wally West)": "Flash III",
  "Jay Garrick": "Flash",
  Impulse: "Impulse",
  "Green Lantern (Hal Jordan)": "Green Lantern",
  "Green Lantern (John Stewart)": "John Stewart",
  "Green Lantern (Guy Gardner)": "Guy Gardner",
  "Green Lantern (Kyle Rayner)": "Kyle Rayner",
  "Blue Beetle (Ted Kord)": "Blue Beetle II",
  "Blue Beetle": "Blue Beetle III",
  Robin: "Robin V",
  "Red Robin": "Red Robin",
  Joker: "Joker",
  Spectre: "Spectre",
  "Reverse-Flash": "Professor Zoom",
  "Mr. Freeze": "Mister Freeze",
  Shazam: "Shazam",
  "Wonder Girl": "Donna Troy",
};

const universeLabels: Record<Universe, string> = { marvel: "MARVEL", dc: "DC" };

function normalize(value: string) {
  return value.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function ArrowIcon({ down = false }: { down?: boolean }) {
  return (
    <svg aria-hidden="true" className="icon-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="square">
      {down ? <path d="M12 3v17m-6-6 6 6 6-6" /> : <path d="M5 19 19 5M7 5h12v12" />}
    </svg>
  );
}

function SearchIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></svg>;
}

function BookmarkIcon({ filled = false }: { filled?: boolean }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7"><path d="M5 3.5h14v17l-7-4-7 4z" /></svg>;
}

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reducedMotion ? false : { opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.72, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function CharacterArt({ character, fallback, className = "" }: { character: Character; fallback?: string; className?: string }) {
  const [ref, near] = useNear<HTMLDivElement>();
  const [failed, setFailed] = useState<string[]>([]);
  const official = useMemo(
    () => (character.image ? [character.image, character.image.replace("portrait_uncanny", "standard_xlarge")] : []),
    [character.image],
  );
  const officialDone = official.every((source) => failed.includes(source));
  const remote = useRemoteImage(`char:${character.id}`, () => characterSteps(character), near && officialDone);
  const sources = [...official, remote, fallback].filter((source): source is string => Boolean(source));
  const src = sources.find((source) => !failed.includes(source));

  useEffect(() => setFailed([]), [character.id]);

  return (
    <div ref={ref} className={`character-art art-${character.category} ${className}`}>
      <span className="art-fallback" aria-hidden="true">{character.name.slice(0, 2).toUpperCase()}</span>
      {src && (
        <img
          key={src}
          src={src}
          alt={`Arte de ${character.name}`}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed((current) => [...current, src])}
        />
      )}
      <span className="art-corner" aria-hidden="true">MARVEL / 616</span>
    </div>
  );
}

function ItemImage({ item, className = "" }: { item: GearItem; className?: string }) {
  const [ref, near] = useNear<HTMLSpanElement>("500px");
  const url = useRemoteImage(`item:${item.id}`, () => itemSteps(item), near);
  const [broken, setBroken] = useState(false);
  const showImage = Boolean(url) && !broken;

  return (
    <span ref={ref} className={`item-image ${className}`}>
      <b aria-hidden="true">{item.name.slice(0, 2).toUpperCase()}</b>
      {showImage && <img src={url} alt={item.name} loading="lazy" referrerPolicy="no-referrer" onError={() => setBroken(true)} />}
    </span>
  );
}

function CardGear({ name }: { name: string }) {
  const items = gearFor(name).slice(0, 2);
  if (!items.length) return null;
  return (
    <span className="card-gear" aria-label={`Equipamento: ${items.map((item) => item.name).join(", ")}`}>
      {items.map((item) => (
        <span key={item.id} title={item.name}><ItemImage item={item} /></span>
      ))}
    </span>
  );
}

const hitSfx = ["WHAM!", "POW!", "CRACK!", "THOOM!", "SMASH!"];
const critSfx = ["KRAKOOM!", "KA-BOOM!", "BLAAAM!"];
const missSfx = ["WHOOSH!", "SWISH!", "FFFT!"];

// Direção de arte da IA: ângulos de câmera sorteados por painel.
const cameraAngles = [
  "dynamic low angle shot",
  "dramatic dutch angle",
  "over-the-shoulder shot",
  "wide action shot",
  "close quarters fight framing",
];

const inkPrompts: Record<string, string> = {
  bw: "masterful black and white inked comic book panel, heavy black inks, bold confident brush lines, dramatic chiaroscuro shadows, crosshatching, halftone dots, no color, award-winning noir comic art, highly detailed",
  pulp: "1970s bronze age pulp comic book panel, faded flat colors, visible halftone printing dots, yellowed newsprint texture, retro comic art by classic masters, highly detailed",
  color: "stunning modern american comic book splash art, bold saturated colors, cinematic dramatic lighting, dynamic composition, crisp ink lines, masterpiece quality, ultra detailed",
};

const fidelityNote = "Each character must look exactly like their official comic book appearance with accurate iconic costume, colors, emblem and physique.";

function comicSeed(battle: Battle) {
  let hash = 7;
  battle.events.forEach((event) => {
    for (let index = 0; index < event.text.length; index += 3) {
      hash = (hash * 31 + event.text.charCodeAt(index)) % 2147483647;
    }
  });
  return hash;
}

function describe(person: Character) {
  return `${person.name} from ${person.universe === "dc" ? "DC Comics" : "Marvel Comics"}${visualFor(person)}`;
}

function AIPanel({ prompt, seed, wide = false, alt }: { prompt: string; seed: number; wide?: boolean; alt: string }) {
  const [ref, near] = useNear<HTMLDivElement>("450px");
  const [attempt, setAttempt] = useState(0);
  const [src, setSrc] = useState<string | null>(null);
  const [status, setStatus] = useState<"queue" | "drawing" | "done" | "error">("queue");
  const [engine, setEngine] = useState<"puter" | "gemini" | "horde" | "reserva">("puter");

  useEffect(() => {
    if (!near) return;
    let alive = true;
    setStatus("drawing");
    setSrc(null);
    const panelSeed = seed + attempt * 101;
    generatePanel(prompt, panelSeed, wide)
      .then((result) => {
        if (!alive) return;
        setEngine(result.engine);
        setSrc(result.src);
      })
      .catch(() => {
        if (!alive) return;
        setEngine("reserva");
        setSrc(pollinationsPanelUrl(prompt, panelSeed, wide));
      });
    return () => {
      alive = false;
    };
  }, [prompt, seed, attempt, wide, near]);

  return (
    <div ref={ref} className={`ai-panel${wide ? " ai-wide" : ""}`}>
      {status !== "done" && (
        <div className="ai-panel-state">
          {status === "error" ? (
            <button type="button" onClick={() => setAttempt((current) => current + 1)}>FALHOU — REDESENHAR <span aria-hidden="true">↻</span></button>
          ) : (
            <>
              <span className="ai-pen" aria-hidden="true" />
              <small>{status === "queue" ? "PAINEL NA FILA..." : "DESENHANDO COM IA..."}</small>
            </>
          )}
        </div>
      )}
      {src && (
        <img
          key={src.slice(0, 80)}
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          onLoad={() => setStatus("done")}
          onError={() => {
            if (engine !== "reserva") {
              setEngine("reserva");
              setSrc(pollinationsPanelUrl(prompt, seed + attempt * 101, wide));
            } else setStatus("error");
          }}
          style={{ opacity: status === "done" ? 1 : 0 }}
        />
      )}
      {status === "done" && <span className="ai-engine-tag" aria-hidden="true">{engine.toUpperCase()}</span>}
      <button type="button" className="ai-redraw" title="Gerar outra versão deste painel" aria-label="Gerar outra versão deste painel" onClick={() => setAttempt((current) => current + 1)}>↻</button>
    </div>
  );
}

function ComicView({ battle, fighterA, fighterB, gearA, gearB, onClose }: { battle: Battle; fighterA: Character; fighterB: Character; gearA?: GearItem | null; gearB?: GearItem | null; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const [inkStyle, setInkStyle] = useState<"bw" | "pulp" | "color">("bw");
  const [apiKey, setApiKey] = useState(() => getGeminiKey());
  const [artQuality, setQualityState] = useState<ArtQuality>(() => getArtQuality());
  const [artEngine, setEngineState] = useState<ArtEngine>(() => getArtEngine());
  const [redrawTick, setRedrawTick] = useState(0);
  const changeQuality = (quality: ArtQuality) => {
    setArtQuality(quality);
    setQualityState(quality);
    setRedrawTick((current) => current + 1);
  };
  const changeEngine = (engine: ArtEngine) => {
    setArtEngine(engine);
    setEngineState(engine);
    setRedrawTick((current) => current + 1);
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const byName = (name?: string) => (name === fighterA.name ? fighterA : name === fighterB.name ? fighterB : null);
  const byTarget = (id?: string) => (id === fighterA.id ? fighterA : id === fighterB.id ? fighterB : null);
  const winner = battle.winnerId === fighterA.id ? fighterA : fighterB;
  const loser = winner === fighterA ? fighterB : fighterA;
  const seed = comicSeed(battle) + redrawTick * 7919;
  const style = `${inkPrompts[inkStyle]}. ${fidelityNote}`;
  const angleAt = (index: number) => cameraAngles[(seed + index * 17) % cameraAngles.length];
  const powerFx = (person: Character) => ` unleashing ${person.powers[0].toLowerCase()}`;
  const gearOf = (person: Character) => (person === fighterA ? gearA : gearB);
  const weaponText = (person: Character) => {
    const item = gearOf(person);
    return item ? `, wielding ${item.query}` : "";
  };

  return (
    <div className="comic-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className={`comic-page comic-style-${inkStyle}`} role="dialog" aria-modal="true" aria-label={`Quadrinho da luta entre ${fighterA.name} e ${fighterB.name}`}>
        <div className="comic-toolbar">
          <span>EDIÇÃO DA ARENA / TRANSCRIÇÃO EXATA</span>
          <div className="comic-style-tabs" role="group" aria-label="Estilo de arte do quadrinho">
            <button type="button" className={inkStyle === "bw" ? "active" : ""} aria-pressed={inkStyle === "bw"} onClick={() => setInkStyle("bw")}>TINTA P&B</button>
            <button type="button" className={inkStyle === "pulp" ? "active" : ""} aria-pressed={inkStyle === "pulp"} onClick={() => setInkStyle("pulp")}>PULP ANOS 70</button>
            <button type="button" className={inkStyle === "color" ? "active" : ""} aria-pressed={inkStyle === "color"} onClick={() => setInkStyle("color")}>CORES</button>
          </div>
          <div className="comic-style-tabs" role="group" aria-label="Motor de IA">
            <button type="button" className={artEngine === "horde" ? "active" : ""} aria-pressed={artEngine === "horde"} onClick={() => changeEngine("horde")} title="AI Horde: rede pública colaborativa, sem limite de uso">IA: HORDE</button>
            <button type="button" className={artEngine === "puter" ? "active" : ""} aria-pressed={artEngine === "puter"} onClick={() => changeEngine("puter")} title="Puter: Nano Banana / FLUX, pode atingir limite">IA: PUTER</button>
            <button type="button" className={artEngine === "reserva" ? "active" : ""} aria-pressed={artEngine === "reserva"} onClick={() => changeEngine("reserva")} title="Pollinations: instantâneo, qualidade básica">IA: TURBO</button>
          </div>
          {artEngine === "puter" && (
            <div className="comic-style-tabs" role="group" aria-label="Qualidade da arte">
              <button type="button" className={artQuality === "max" ? "active" : ""} aria-pressed={artQuality === "max"} onClick={() => changeQuality("max")} title="Nano Banana Pro + FLUX.2 Pro: o melhor traço, um pouco mais lento">MÁXIMA</button>
              <button type="button" className={artQuality === "fast" ? "active" : ""} aria-pressed={artQuality === "fast"} onClick={() => changeQuality("fast")} title="Nano Banana 2: rápido e muito bom">RÁPIDA</button>
            </div>
          )}
          <div>
            <button type="button" onClick={() => window.print()}>IMPRIMIR / PDF</button>
            <button ref={closeRef} type="button" onClick={onClose} aria-label="Fechar quadrinho">×</button>
          </div>
        </div>
        <div className="comic-keybar">
          <label>
            <span>CHAVE GEMINI (OPCIONAL)</span>
            <input
              type="password"
              value={apiKey}
              placeholder="Opcional: chave do Google AI Studio (AIza...)"
              onChange={(event) => {
                setApiKey(event.target.value);
                setGeminiKey(event.target.value);
              }}
            />
          </label>
          <small>Motor atual: {artEngine === "horde" ? "AI Horde — rede pública colaborativa, sem limite de uso (cada painel leva ~20-60s na fila comunitária)" : artEngine === "puter" ? "Puter — modelos topo de linha, mas pode atingir limite diário" : "Turbo — instantâneo, qualidade básica"}. Troque de IA nos botões acima; nenhum exige chave. A chave Gemini é um motor extra opcional.</small>
        </div>
        <header className="comic-cover">
          <span className="comic-brand">ARQUIVO MARVEL × DC APRESENTA</span>
          <h2>{fighterA.name} <em>VS</em> {fighterB.name}</h2>
          <div className="comic-cover-ai">
            <AIPanel
              wide
              seed={seed}
              alt={`Capa: ${fighterA.name} contra ${fighterB.name}`}
              prompt={`epic comic book cover, ${describe(fighterA)}${weaponText(fighterA)} facing off against ${describe(fighterB)}${weaponText(fighterB)}, both in heroic battle poses, lightning crackling between them, gladiator arena colosseum background, ${style}`}
            />
          </div>
          <p className="comic-cover-tag">UMA LUTA. DOIS UNIVERSOS. CADA PAINEL DESENHADO POR IA.</p>
        </header>
        <div className="comic-grid">
          {battle.events.map((event, index) => {
            if (event.kind === "dialogue") {
              const speaker = byName(event.speaker);
              if (!speaker) return null;
              const shouting = event.text.includes("!");
              return (
                <article className="comic-panel panel-dialogue" key={index}>
                  <div className="panel-art">
                    <AIPanel
                      seed={seed + index * 31}
                      alt={`${speaker.name} falando`}
                      prompt={`${angleAt(index)} of ${describe(speaker)}${weaponText(speaker)}, ${shouting ? "shouting defiantly mid-battle, intense furious expression" : "speaking with confident smirk, dramatic pose"}, arena battleground in background, ${style}`}
                    />
                  </div>
                  <div className="balloon"><span className="balloon-speaker">{event.speaker}</span><p>{event.text}</p></div>
                </article>
              );
            }
            if (event.kind === "hit" || event.kind === "crit") {
              const target = byTarget(event.targetId);
              const attacker = target?.id === fighterA.id ? fighterB : fighterA;
              const defender = target ?? (attacker === fighterA ? fighterB : fighterA);
              const sfx = event.kind === "crit" ? critSfx[(seed + index) % critSfx.length] : hitSfx[(seed + index) % hitSfx.length];
              const action = event.kind === "crit"
                ? `${powerFx(attacker)} in a devastating massive blow against ${describe(defender)}, huge explosion of signature power energy, debris flying, shockwave rippling the arena`
                : `${powerFx(attacker)} while striking ${describe(defender)} in fierce combat, powerful impact, motion lines, energy sparks flying`;
              return (
                <article className={`comic-panel panel-action${event.kind === "crit" ? " panel-crit" : ""}`} key={index}>
                  <div className="panel-art">
                    <AIPanel
                      wide={event.kind === "crit"}
                      seed={seed + index * 31}
                      alt={`${attacker.name} atacando ${defender.name}`}
                      prompt={`${event.kind === "crit" ? "explosive splash page" : angleAt(index)}, ${describe(attacker)}${weaponText(attacker)} ${action}, intense superhero battle in a gladiator arena, ${style}`}
                    />
                  </div>
                  <span className={`sfx${event.kind === "crit" ? " sfx-crit" : ""}`} aria-hidden="true">{sfx}</span>
                  {event.damage ? <span className="damage-tag">-{event.damage} ENERGIA{event.kind === "crit" ? " / CRÍTICO" : ""}</span> : null}
                  <p className="comic-caption caption-bottom">{event.text}</p>
                </article>
              );
            }
            if (event.kind === "miss") {
              const dodger = battle.events[index].text.includes(fighterA.name) ? fighterB : fighterA;
              const attacker = dodger === fighterA ? fighterB : fighterA;
              return (
                <article className="comic-panel panel-miss" key={index}>
                  <div className="panel-art">
                    <AIPanel
                      seed={seed + index * 31}
                      alt={`${dodger.name} esquivando`}
                      prompt={`${describe(dodger)} acrobatically dodging an attack from ${describe(attacker)}, leaping away with motion blur, agile evasive movement, speed lines, ${style}`}
                    />
                  </div>
                  <span className="sfx sfx-miss" aria-hidden="true">{missSfx[(seed + index) % missSfx.length]}</span>
                  <p className="comic-caption caption-bottom">{event.text}</p>
                </article>
              );
            }
            if (event.kind === "end") {
              return (
                <article className="comic-panel panel-end" key={index}>
                  <div className="panel-art">
                    <AIPanel
                      wide
                      seed={seed + index * 31}
                      alt={`${winner.name} vitorioso`}
                      prompt={`dramatic low angle shot of ${describe(winner)}${weaponText(winner)} standing victorious and triumphant over defeated ${describe(loser)} lying on the cracked arena floor, dust and smoke, rays of light, epic finale, ${style}`}
                    />
                  </div>
                  <span className="end-banner">VENCEDOR: {winner.name.toUpperCase()}</span>
                  <p className="comic-caption caption-bottom">{event.text}</p>
                </article>
              );
            }
            const isIntro = index < 3;
            const introSubject = battle.events[index].text.includes(fighterB.name) ? fighterB : fighterA;
            return (
              <article className={`comic-panel panel-narration${index === 0 ? " panel-open" : ""}`} key={index}>
                {index === 0 && (
                  <div className="panel-art">
                    <AIPanel
                      wide
                      seed={seed + index * 31}
                      alt="Painel de abertura da luta"
                      prompt={`wide establishing shot, ${describe(fighterA)} and ${describe(fighterB)} facing each other from opposite sides of a massive gladiator arena, roaring crowd in stands, dramatic spotlights, tension before battle, ${style}`}
                    />
                  </div>
                )}
                {index > 0 && isIntro && (
                  <div className="panel-art">
                    <AIPanel
                      seed={seed + index * 31}
                      alt={`Apresentação de ${introSubject.name}`}
                      prompt={`heroic full body shot of ${describe(introSubject)}${weaponText(introSubject)} making a dramatic entrance into a gladiator arena, ${angleAt(index)}, confident powerful stance, ${style}`}
                    />
                  </div>
                )}
                <p className={`comic-caption${index === 0 || isIntro ? " caption-bottom" : ""}`}>{event.text}</p>
              </article>
            );
          })}
        </div>
        <footer className="comic-footer"><span>FIM</span><p>Arte gerada por IA (Pollinations) na hora, painel a painel, a partir do registro exato da luta — legendas, falas e dano são os da simulação. Personagens pertencem a Marvel e DC; os desenhos são interpretações da IA e variam a cada redesenho.</p></footer>
      </div>
    </div>
  );
}

function TriviaBox() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * triviaFacts.length));
  return (
    <div className="trivia-box" data-reveal>
      <span className="trivia-label">VOCÊ SABIA?</span>
      <p aria-live="polite">{triviaFacts[index]}</p>
      <button type="button" onClick={() => setIndex((current) => (current + 1 + Math.floor(Math.random() * (triviaFacts.length - 1))) % triviaFacts.length)}>
        OUTRA CURIOSIDADE <span aria-hidden="true">↻</span>
      </button>
    </div>
  );
}

function QuizBlock() {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState({ marvel: 0, dc: 0 });
  const done = step >= quizQuestions.length;
  const winner = score.marvel === score.dc ? "empate" : score.marvel > score.dc ? "marvel" : "dc";

  const answer = (side: "marvel" | "dc") => {
    setScore((current) => ({ ...current, [side]: current[side] + 1 }));
    setStep((current) => current + 1);
  };
  const reset = () => {
    setStep(0);
    setScore({ marvel: 0, dc: 0 });
  };

  return (
    <div className="quiz-card" data-reveal>
      {!done ? (
        <>
          <div className="quiz-progress"><span>PERGUNTA {step + 1} / {quizQuestions.length}</span><div className="quiz-bar"><span style={{ width: `${(step / quizQuestions.length) * 100}%` }} /></div></div>
          <h3>{quizQuestions[step].question}</h3>
          <div className="quiz-options">
            {quizQuestions[step].options.map((option) => (
              <button key={option.text} type="button" onClick={() => answer(option.side)}>{option.text}</button>
            ))}
          </div>
        </>
      ) : (
        <div className={`quiz-result quiz-result-${winner}`}>
          <span>SEU LADO DA BANCA</span>
          <strong>{winner === "empate" ? "OS DOIS UNIVERSOS" : winner === "marvel" ? "VOCÊ É MARVEL" : "VOCÊ É DC"}</strong>
          <p>
            {winner === "marvel"
              ? "Você gosta de heróis humanos, falhos e sarcásticos — o café derramado no uniforme faz parte."
              : winner === "dc"
                ? "Você prefere mitologia moderna: símbolos, esperança e deuses entre nós."
                : "Equilíbrio raro: você lê tudo e julga só pela história. O multiverso agradece."}
          </p>
          <small>MARVEL {score.marvel} × {score.dc} DC</small>
          <button type="button" onClick={reset}>REFAZER O TESTE <span aria-hidden="true">↻</span></button>
        </div>
      )}
    </div>
  );
}

const traitLabels: Record<Trait, string> = {
  lider: "Liderança",
  genio: "Intelecto",
  caos: "Caos",
  sombra: "Sombras",
  coracao: "Coração",
  forca: "Força",
  poder: "Ambição",
};

function HeroQuiz({ lookup, onOpen }: { lookup: Record<string, string>; onOpen: (person: Character) => void }) {
  const emptyScore: Record<Trait, number> = { lider: 0, genio: 0, caos: 0, sombra: 0, coracao: 0, forca: 0, poder: 0 };
  const [step, setStep] = useState(0);
  const [score, setScore] = useState<Record<Trait, number>>(emptyScore);
  const done = step >= heroQuizQuestions.length;

  const answer = (traits: Partial<Record<Trait, number>>) => {
    setScore((current) => {
      const next = { ...current };
      (Object.entries(traits) as Array<[Trait, number]>).forEach(([trait, value]) => {
        next[trait] += value;
      });
      return next;
    });
    setStep((current) => current + 1);
  };

  const reset = () => {
    setStep(0);
    setScore(emptyScore);
  };

  let result: { profile: (typeof heroProfiles)[number]; person: Character | undefined; top: Trait[] } | null = null;
  if (done) {
    const sortedTraits = (Object.entries(score) as Array<[Trait, number]>).sort((a, b) => b[1] - a[1]);
    const top = sortedTraits.slice(0, 3).map(([trait]) => trait);
    let best = heroProfiles[0];
    let bestValue = -1;
    heroProfiles.forEach((profile) => {
      const value = profile.traits.reduce((sum, trait) => sum + score[trait], 0) * 2 + (top.includes(profile.traits[0]) ? 3 : 0);
      if (value > bestValue) {
        bestValue = value;
        best = profile;
      }
    });
    result = { profile: best, person: roster.find((person) => person.id === best.characterId), top };
  }

  return (
    <div className="quiz-card hero-quiz" data-reveal>
      {!done ? (
        <>
          <div className="quiz-progress"><span>PERGUNTA {step + 1} / {heroQuizQuestions.length}</span><div className="quiz-bar"><span style={{ width: `${(step / heroQuizQuestions.length) * 100}%` }} /></div></div>
          <h3>{heroQuizQuestions[step].question}</h3>
          <div className="quiz-options">
            {heroQuizQuestions[step].options.map((option) => (
              <button key={option.text} type="button" onClick={() => answer(option.traits)}>{option.text}</button>
            ))}
          </div>
        </>
      ) : result && (
        <div className={`hero-quiz-result align-${result.profile.alignment === "Vilão" ? "vilao" : result.profile.alignment === "Anti-herói" ? "anti" : "heroi"}`}>
          <div className="hero-quiz-art">
            {result.person && <CharacterArt character={result.person} fallback={lookup[result.person.id]} />}
            <span className="hero-quiz-badge">{result.profile.alignment.toUpperCase()}</span>
          </div>
          <div className="hero-quiz-copy">
            <span>NO MULTIVERSO, VOCÊ SERIA...</span>
            <strong>{result.profile.name.toUpperCase()}</strong>
            <p>{result.profile.reading}</p>
            <div className="hero-quiz-traits">
              {result.top.map((trait) => <em key={trait}>{traitLabels[trait].toUpperCase()}</em>)}
            </div>
            <div className="hero-quiz-actions">
              {result.person && <button type="button" className="hero-quiz-open" onClick={() => onOpen(result!.person!)}>ABRIR MEU DOSSIÊ <ArrowIcon /></button>}
              <button type="button" className="hero-quiz-again" onClick={reset}>REFAZER <span aria-hidden="true">↻</span></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type BracketRound = Array<{ a: Character; b: Character; winner: Character }>;

function simulateDuel(a: Character, b: Character): Character {
  const scoreA = powerScore(a) + Math.floor(Math.random() * 20);
  const scoreB = powerScore(b) + Math.floor(Math.random() * 20);
  return scoreA >= scoreB ? a : b;
}

const roundNames = ["QUARTAS DE FINAL", "SEMIFINAIS", "GRANDE FINAL"];

// Ritmo da narração: multiplicador sobre os tempos base.
type Pace = "calmo" | "normal" | "rapido";
const paceFactors: Record<Pace, number> = { calmo: 2.1, normal: 1.35, rapido: 0.8 };
const paceLabels: Record<Pace, string> = { calmo: "CALMO", normal: "NORMAL", rapido: "RÁPIDO" };

function PaceControl({ pace, onChange, dark = false }: { pace: Pace; onChange: (pace: Pace) => void; dark?: boolean }) {
  return (
    <div className={`pace-control${dark ? " pace-dark" : ""}`} role="group" aria-label="Velocidade da narração">
      <span>RITMO</span>
      {(Object.keys(paceLabels) as Pace[]).map((option) => (
        <button key={option} type="button" className={pace === option ? "active" : ""} aria-pressed={pace === option} onClick={() => onChange(option)}>
          {paceLabels[option]}
        </button>
      ))}
    </div>
  );
}

type DuelState = {
  roundIndex: number;
  matchIndex: number;
  battle: Battle;
  step: number;
};

function Tournament({ lookup }: { lookup: Record<string, string> }) {
  const reducedMotion = useReducedMotion();
  const [rounds, setRounds] = useState<BracketRound[] | null>(null);
  const [duel, setDuel] = useState<DuelState | null>(null);
  const [revealed, setRevealed] = useState(0); // quantos confrontos já foram exibidos
  const [paused, setPaused] = useState(false);
  const [pace, setPace] = useState<Pace>("normal");
  const factor = paceFactors[pace];
  const logRef = useRef<HTMLOListElement | null>(null);

  const totalMatches = rounds ? rounds.reduce((sum, round) => sum + round.length, 0) : 0;
  const finishedAll = Boolean(rounds) && revealed >= totalMatches && !duel;

  const matchAt = (flatIndex: number) => {
    if (!rounds) return null;
    let remaining = flatIndex;
    for (let roundIndex = 0; roundIndex < rounds.length; roundIndex += 1) {
      if (remaining < rounds[roundIndex].length) return { roundIndex, matchIndex: remaining };
      remaining -= rounds[roundIndex].length;
    }
    return null;
  };

  const run = () => {
    const pool = [...roster].sort(() => Math.random() - 0.5).slice(0, 8);
    const allRounds: BracketRound[] = [];
    let current = pool;
    while (current.length > 1) {
      const round: BracketRound = [];
      const next: Character[] = [];
      for (let index = 0; index < current.length; index += 2) {
        const winner = simulateDuel(current[index], current[index + 1]);
        round.push({ a: current[index], b: current[index + 1], winner });
        next.push(winner);
      }
      allRounds.push(round);
      current = next;
    }
    setRounds(allRounds);
    setRevealed(0);
    setPaused(false);
    setDuel(null);
    // Abre o primeiro confronto narrado.
    const first = allRounds[0][0];
    window.setTimeout(() => {
      setDuel({ roundIndex: 0, matchIndex: 0, battle: buildShortDuel(first.a, first.b, first.winner), step: 0 });
    }, 450);
  };

  // Luta curta: recorta a batalha completa para o ritmo de torneio.
  const buildShortDuel = (a: Character, b: Character, winner: Character): Battle => {
    const full = buildBattle(a, b);
    // Garante o vencedor correto do bracket: regenera até bater (máx. 4 tentativas).
    let battle = full;
    for (let attempt = 0; attempt < 4 && battle.winnerId !== winner.id; attempt += 1) battle = buildBattle(a, b);
    if (battle.winnerId !== winner.id) battle = { ...battle, winnerId: winner.id };
    const hits = battle.events.filter((event) => event.kind === "hit" || event.kind === "crit").slice(0, 3);
    const dialogue = battle.events.find((event) => event.kind === "dialogue");
    const end = battle.events.find((event) => event.kind === "end");
    const events = [
      { kind: "narration" as const, text: `${a.name} (${a.universe === "dc" ? "DC" : "MARVEL"}) contra ${b.name} (${b.universe === "dc" ? "DC" : "MARVEL"}). O gongo soa!` },
      ...(dialogue ? [dialogue] : []),
      ...hits,
      ...(end ? [end] : [{ kind: "end" as const, text: `${winner.name} avança no torneio!` }]),
    ];
    return { events, winnerId: battle.winnerId };
  };

  // Avança a narração do confronto atual.
  useEffect(() => {
    if (!duel || paused) return;
    if (duel.step >= duel.battle.events.length) {
      // Confronto acabou: revela no bracket e agenda o próximo.
      const timer = window.setTimeout(() => {
        setRevealed((current) => current + 1);
        const next = matchAt(revealed + 1);
        if (next && rounds) {
          const match = rounds[next.roundIndex][next.matchIndex];
          setDuel({ roundIndex: next.roundIndex, matchIndex: next.matchIndex, battle: buildShortDuel(match.a, match.b, match.winner), step: 0 });
        } else {
          setDuel(null);
        }
      }, reducedMotion ? 150 : 2400 * factor);
      return () => window.clearTimeout(timer);
    }
    const previous = duel.battle.events[duel.step - 1]?.kind;
    const previousEvent = duel.battle.events[duel.step - 1];
    // Tempo proporcional ao texto: dá para ler antes do próximo evento.
    const readTime = previousEvent ? Math.min(2600, previousEvent.text.length * 34) : 0;
    const base = previous === "hit" || previous === "crit" ? 1900 : previous === "dialogue" ? 1600 : 1400;
    const delay = reducedMotion ? 40 : (base + readTime) * factor;
    const timer = window.setTimeout(() => setDuel((current) => (current ? { ...current, step: current.step + 1 } : current)), duel.step === 0 ? 400 : delay);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duel, paused, reducedMotion, revealed, rounds]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [duel?.step]);

  const skipAll = () => {
    setDuel(null);
    setRevealed(totalMatches);
  };

  const champion = rounds && finishedAll ? rounds[rounds.length - 1][0].winner : null;
  const currentMatch = duel && rounds ? rounds[duel.roundIndex][duel.matchIndex] : null;
  const duelEvents = duel ? duel.battle.events.slice(0, duel.step) : [];
  const duelDone = Boolean(duel) && (duel?.step ?? 0) >= (duel?.battle.events.length ?? 0);

  const duelHp: Record<string, number> = currentMatch ? { [currentMatch.a.id]: 100, [currentMatch.b.id]: 100 } : {};
  duelEvents.forEach((event) => {
    if ((event.kind === "hit" || event.kind === "crit") && event.targetId && event.damage) {
      duelHp[event.targetId] = Math.max(0, (duelHp[event.targetId] ?? 100) - event.damage);
    }
  });

  return (
    <div className="tournament-block" data-reveal>
      <div className="tournament-head">
        <div><span className="eyebrow">8 LUTADORES / 7 LUTAS NARRADAS / MATA-MATA</span><h3>TORNEIO RELÂMPAGO</h3></div>
        <div className="tournament-controls">
          <PaceControl pace={pace} onChange={setPace} />
          {duel && <button type="button" className="tournament-skip" onClick={() => setPaused(!paused)}>{paused ? "CONTINUAR" : "PAUSAR"}</button>}
          {rounds && !finishedAll && <button type="button" className="tournament-skip" onClick={skipAll}>PULAR PARA O RESULTADO</button>}
          <button type="button" className="tournament-run" onClick={run}>{rounds ? "NOVO TORNEIO" : "SORTEAR E COMEÇAR"} <ArrowIcon /></button>
        </div>
      </div>

      {currentMatch && duel && (
        <div className="duel-stage">
          <div className="duel-header"><span>{roundNames[duel.roundIndex]}</span><span>LUTA {revealed + 1} / {totalMatches}</span></div>
          <div className="duel-fighters">
            {[currentMatch.a, currentMatch.b].map((fighter, side) => {
              const lastEvent = duelEvents[duelEvents.length - 1];
              const isHit = (lastEvent?.kind === "hit" || lastEvent?.kind === "crit") && lastEvent.targetId === fighter.id;
              const isLoser = duelDone && duel.battle.winnerId !== fighter.id;
              return (
                <div key={fighter.id} className={`duel-fighter${isLoser ? " duel-loser" : ""}`}>
                  <motion.div
                    className="duel-portrait"
                    animate={!reducedMotion && isHit ? { x: [0, side === 0 ? -9 : 9, 6, -4, 0], filter: ["brightness(1)", "brightness(1.8)", "brightness(1)"] } : {}}
                    transition={{ duration: 0.45 }}
                  >
                    <CharacterArt character={fighter} fallback={lookup[fighter.id]} />
                    {duelDone && duel.battle.winnerId === fighter.id && <span className="duel-winner-tag">VENCEU</span>}
                  </motion.div>
                  <strong>{fighter.name}</strong>
                  <div className="arena-hp duel-hp"><motion.span animate={{ width: `${duelHp[fighter.id] ?? 100}%` }} transition={{ duration: reducedMotion ? 0 : 0.45 }} /></div>
                </div>
              );
            })}
            <span className="duel-vs" aria-hidden="true">VS</span>
          </div>
          <ol className="arena-log duel-log" ref={logRef} aria-live="polite">
            {duelEvents.map((event, index) => (
              <motion.li key={index} className={`arena-event arena-event-${event.kind}`} initial={reducedMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                {event.kind === "dialogue"
                  ? (<><span className="arena-speaker">{event.speaker}</span><p>“{event.text}”</p></>)
                  : (<><span className="arena-speaker">{event.kind === "end" ? "RESULTADO" : event.kind === "crit" ? "IMPACTO" : "NARRADOR"}</span><p>{event.text}</p></>)}
                {(event.kind === "hit" || event.kind === "crit") && event.damage ? <em>{event.kind === "crit" ? "CRÍTICO " : ""}-{event.damage}</em> : null}
              </motion.li>
            ))}
            {!duelDone && <li className="arena-event arena-typing" aria-hidden="true"><span className="arena-speaker">NARRADOR</span><p>...</p></li>}
          </ol>
        </div>
      )}

      {rounds ? (
        <>
          <div className="bracket">
            {rounds.map((round, roundIndex) => {
              const offset = rounds.slice(0, roundIndex).reduce((sum, item) => sum + item.length, 0);
              return (
                <div className="bracket-round" key={roundIndex}>
                  <span className="bracket-round-name">{roundNames[roundIndex] ?? `RODADA ${roundIndex + 1}`}</span>
                  {round.map((match, matchIndex) => {
                    const flat = offset + matchIndex;
                    const decided = flat < revealed;
                    const isLive = duel && duel.roundIndex === roundIndex && duel.matchIndex === matchIndex;
                    return (
                      <div className={`bracket-match${isLive ? " bracket-live" : ""}${!decided && !isLive ? " bracket-pending" : ""}`} key={matchIndex}>
                        {[match.a, match.b].map((fighter) => (
                          <span key={fighter.id} className={`bracket-fighter${decided && match.winner.id === fighter.id ? " bracket-winner" : ""}${decided && match.winner.id !== fighter.id ? " bracket-out" : ""}`}>
                            <b className={fighter.universe === "dc" ? "pub-dc" : "pub-marvel"}>{fighter.universe === "dc" ? "DC" : "MV"}</b>
                            {fighter.name}
                            {isLive && <i className="bracket-live-dot" aria-hidden="true" />}
                          </span>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
          {champion && (
            <motion.div className="tournament-champion" initial={reducedMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="champion-art"><CharacterArt character={champion} fallback={lookup[champion.id]} /></div>
              <div><small>CAMPEÃO DO TORNEIO / {champion.universe === "dc" ? "DC" : "MARVEL"}</small><strong>{champion.name.toUpperCase()}</strong><p>{champion.overview}</p></div>
            </motion.div>
          )}
        </>
      ) : (
        <p className="tournament-empty">Oito nomes sorteados entre os {roster.length} dossiês. Cada uma das 7 lutas é narrada ao vivo — golpes, falas e barras de energia — antes do bracket avançar até o campeão.</p>
      )}
    </div>
  );
}

function Arena({ lookup }: { lookup: Record<string, string> }) {
  const reducedMotion = useReducedMotion();
  const [idA, setIdA] = useState("m-iron-man");
  const [idB, setIdB] = useState("d-batman");
  const [gearIdA, setGearIdA] = useState<string>("auto");
  const [gearIdB, setGearIdB] = useState<string>("auto");
  const [fighterSearchA, setFighterSearchA] = useState("");
  const [fighterSearchB, setFighterSearchB] = useState("");
  const [battle, setBattle] = useState<Battle | null>(null);
  const [step, setStep] = useState(0);
  const [comicOpen, setComicOpen] = useState(false);
  const [pace, setPace] = useState<Pace>("normal");
  const [paused, setPaused] = useState(false);
  const logRef = useRef<HTMLOListElement | null>(null);

  const fighterA = roster.find((person) => person.id === idA) ?? roster[0];
  const fighterB = roster.find((person) => person.id === idB) ?? roster[1];

  const resolveGear = (person: Character, gearId: string): GearItem | null => {
    if (gearId === "none") return null;
    if (gearId === "auto") return gearFor(person.name)[0] ?? null;
    return gearItems.find((item) => item.id === gearId) ?? null;
  };
  const gearA = resolveGear(fighterA, gearIdA);
  const gearB = resolveGear(fighterB, gearIdB);
  const events = battle ? battle.events.slice(0, step) : [];
  const finished = Boolean(battle) && step >= (battle?.events.length ?? 0);

  const hp: Record<string, number> = { [fighterA.id]: 100, [fighterB.id]: 100 };
  events.forEach((event) => {
    if ((event.kind === "hit" || event.kind === "crit") && event.targetId && event.damage) {
      hp[event.targetId] = Math.max(0, (hp[event.targetId] ?? 100) - event.damage);
    }
  });
  const lastEvent = events[events.length - 1];
  const winner = finished && battle ? roster.find((person) => person.id === battle.winnerId) : null;

  useEffect(() => {
    if (!battle || step >= battle.events.length || paused) return;
    const previousEvent = battle.events[step - 1];
    const previous = previousEvent?.kind;
    // Tempo extra proporcional ao tamanho do texto, para dar tempo de ler.
    const readTime = previousEvent ? Math.min(2800, previousEvent.text.length * 34) : 0;
    const base = previous === "hit" || previous === "crit" ? 2000 : previous === "dialogue" ? 1700 : 1500;
    const factor = paceFactors[pace];
    const delay = reducedMotion ? 30 : step === 0 ? 450 : (base + readTime) * factor;
    const timer = window.setTimeout(() => setStep((current) => current + 1), delay);
    return () => window.clearTimeout(timer);
  }, [battle, step, reducedMotion, paused, pace]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [step]);

  const startBattle = () => {
    if (fighterA.id === fighterB.id) return;
    setComicOpen(false);
    setPaused(false);
    setBattle(buildBattle(fighterA, fighterB, { gearA, gearB }));
    setStep(0);
  };

  const surpriseMe = () => {
    const marvelPool = roster.filter((person) => person.universe === "marvel");
    const dcPool = roster.filter((person) => person.universe === "dc");
    const pickFrom = (pool: Character[]) => pool[Math.floor(Math.random() * pool.length)];
    setIdA(pickFrom(marvelPool).id);
    setIdB(pickFrom(dcPool).id);
    setGearIdA("auto");
    setGearIdB("auto");
    setBattle(null);
    setStep(0);
  };

  const selectFighter = (side: "a" | "b", id: string) => {
    if (side === "a") { setIdA(id); setGearIdA("auto"); }
    else { setIdB(id); setGearIdB("auto"); }
    setBattle(null);
    setStep(0);
  };

  const selectGear = (side: "a" | "b", id: string) => {
    if (side === "a") setGearIdA(id);
    else setGearIdB(id);
    setBattle(null);
    setStep(0);
  };

  const fighterOptions = (excludeId: string, query: string, currentId: string) => {
    const normalized = normalize(query.trim());
    const matches = (person: Character) =>
      person.id !== excludeId &&
      (person.id === currentId || !normalized || normalize(`${person.name} ${person.identity} ${person.team}`).includes(normalized));
    return (
      <>
        <optgroup label="MARVEL">
          {roster.filter((person) => person.universe === "marvel" && matches(person)).map((person) => (
            <option key={person.id} value={person.id}>{person.name}</option>
          ))}
        </optgroup>
        <optgroup label="DC">
          {roster.filter((person) => person.universe === "dc" && matches(person)).map((person) => (
            <option key={person.id} value={person.id}>{person.name}</option>
          ))}
        </optgroup>
      </>
    );
  };

  const searchAndPick = (side: "a" | "b", query: string) => {
    if (side === "a") setFighterSearchA(query);
    else setFighterSearchB(query);
    const normalized = normalize(query.trim());
    if (normalized.length < 2) return;
    const otherId = side === "a" ? idB : idA;
    const hit =
      roster.find((person) => person.id !== otherId && normalize(person.name).startsWith(normalized)) ??
      roster.find((person) => person.id !== otherId && normalize(`${person.name} ${person.identity}`).includes(normalized));
    if (hit) selectFighter(side, hit.id);
  };

  const fighterPanel = (person: Character, side: "a" | "b") => {
    const hit = (lastEvent?.kind === "hit" || lastEvent?.kind === "crit") && lastEvent.targetId === person.id;
    const down = finished && battle?.winnerId !== person.id;
    const equipped = side === "a" ? gearA : gearB;
    const gearValue = side === "a" ? gearIdA : gearIdB;
    const ownGear = gearFor(person.name);
    return (
      <div className={`arena-fighter arena-fighter-${side}${down ? " arena-fighter-down" : ""}`}>
        <motion.div
          className="arena-portrait"
          key={`${person.id}-${step}-${hit}`}
          animate={!reducedMotion && hit ? { x: [0, side === "a" ? -11 : 11, 8, -5, 0], filter: ["brightness(1)", "brightness(1.9)", "brightness(1)"] } : {}}
          transition={{ duration: 0.5 }}
        >
          <CharacterArt character={person} fallback={lookup[person.id]} />
          {finished && battle?.winnerId === person.id && <span className="arena-crown">VENCEDOR</span>}
        </motion.div>
        <div className="arena-fighter-meta">
          <small>{universeLabels[person.universe]} / PODER {powerScore(person)}</small>
          <strong>{person.name}</strong>
          <div className="arena-hp" role="img" aria-label={`Energia de ${person.name}: ${hp[person.id]}%`}>
            <motion.span animate={{ width: `${hp[person.id]}%` }} transition={{ duration: reducedMotion ? 0 : 0.5 }} />
          </div>
          <div className="arena-fighter-search">
            <SearchIcon />
            <label className="sr-only" htmlFor={`fighter-search-${side}`}>Buscar lutador {side === "a" ? "1" : "2"} pelo nome</label>
            <input
              id={`fighter-search-${side}`}
              type="search"
              placeholder={`Buscar entre ${roster.length} lutadores...`}
              value={side === "a" ? fighterSearchA : fighterSearchB}
              onChange={(event) => searchAndPick(side, event.target.value)}
            />
            {(side === "a" ? fighterSearchA : fighterSearchB) && (
              <button type="button" aria-label="Limpar busca" onClick={() => (side === "a" ? setFighterSearchA("") : setFighterSearchB(""))}>×</button>
            )}
          </div>
          <label className="arena-select">
            <span className="sr-only">Escolher lutador {side === "a" ? "1" : "2"}</span>
            <select value={person.id} onChange={(event) => selectFighter(side, event.target.value)}>
              {fighterOptions(side === "a" ? idB : idA, side === "a" ? fighterSearchA : fighterSearchB, person.id)}
            </select>
          </label>
          <label className="arena-select arena-gear-select">
            <span className="sr-only">Escolher equipamento do lutador {side === "a" ? "1" : "2"}</span>
            <select value={gearValue} onChange={(event) => selectGear(side, event.target.value)}>
              <option value="auto">{ownGear.length ? `Equipamento próprio (${ownGear[0].name})` : "Sem equipamento próprio"}</option>
              <option value="none">Lutar sem equipamento</option>
              <optgroup label="ARSENAL MARVEL">
                {gearItems.filter((item) => (item.universe ?? "marvel") === "marvel").map((item) => (
                  <option key={item.id} value={item.id}>{item.name} ({item.owners[0]})</option>
                ))}
              </optgroup>
              <optgroup label="ARSENAL DC">
                {gearItems.filter((item) => item.universe === "dc").map((item) => (
                  <option key={item.id} value={item.id}>{item.name} ({item.owners[0]})</option>
                ))}
              </optgroup>
            </select>
          </label>
          {equipped && (
            <div className="arena-equipped">
              <ItemImage item={equipped} />
              <div>
                <small>{equipped.owners.includes(person.name) ? "EQUIPAMENTO PRÓPRIO" : `EMPRESTADO DE ${equipped.owners[0].toUpperCase()}`}</small>
                <strong>{equipped.name}</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <section id="arena" className="arena-fight-section section-space" aria-labelledby="arena-heading">
      <div className="page-container">
        <div className="section-header dark-header"><span>05 / ARENA</span><span>MARVEL × DC / SIMULAÇÃO DE COMBATE</span></div>
        <Reveal className="arena-head">
          <div>
            <p className="eyebrow">O CONFRONTO QUE SÓ EXISTE AQUI</p>
            <h2 id="arena-heading" className="display-heading">QUEM VENCE<br /><em>ESSA LUTA?</em></h2>
          </div>
          <p>Escolha um lutador de cada lado (ou misture universos), aperte o gongo e acompanhe a narração round a round, com provocações e golpe final. O resultado é uma simulação divertida, não uma regra dos quadrinhos.</p>
        </Reveal>

        <div className="arena-stage">
          {fighterPanel(fighterA, "a")}
          <div className="arena-middle">
            <motion.span className="arena-vs" animate={reducedMotion ? {} : { scale: [1, 1.08, 1] }} transition={{ duration: 2.2, repeat: Infinity }}>VS</motion.span>
            <button type="button" className="arena-start" onClick={startBattle} disabled={Boolean(battle) && !finished && !paused}>
              {battle ? (finished ? "LUTAR DE NOVO" : "LUTANDO...") : "COMEÇAR A LUTA"}
            </button>
            {battle && !finished && (
              <button type="button" className="arena-random" onClick={() => setPaused(!paused)}>{paused ? "▶ CONTINUAR" : "⏸ PAUSAR"}</button>
            )}
            <button type="button" className="arena-random" onClick={surpriseMe}>SORTEAR MARVEL × DC</button>
            <PaceControl pace={pace} onChange={setPace} dark />
          </div>
          {fighterPanel(fighterB, "b")}
        </div>

        <div className="arena-log-wrap" aria-live="polite">
          {battle ? (
            <ol className="arena-log" ref={logRef}>
              <AnimatePresence initial={false}>
                {events.map((event, index) => (
                  <motion.li
                    key={index}
                    className={`arena-event arena-event-${event.kind}`}
                    initial={reducedMotion ? false : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    {event.kind === "dialogue" ? (
                      <><span className="arena-speaker">{event.speaker}</span><p>“{event.text}”</p></>
                    ) : (
                      <><span className="arena-speaker">{event.kind === "end" ? "RESULTADO" : event.kind === "crit" ? "IMPACTO" : "NARRADOR"}</span><p>{event.text}</p></>
                    )}
                    {(event.kind === "hit" || event.kind === "crit") && event.damage ? <em>{event.kind === "crit" ? "CRÍTICO " : ""}-{event.damage} ENERGIA</em> : null}
                  </motion.li>
                ))}
              </AnimatePresence>
              {!finished && <li className="arena-event arena-typing" aria-hidden="true"><span className="arena-speaker">NARRADOR</span><p>...</p></li>}
            </ol>
          ) : (
            <div className="arena-placeholder">
              <span>A ARENA ESTÁ VAZIA</span>
              <p>Monte o confronto acima e aperte COMEÇAR A LUTA para ouvir o narrador.</p>
            </div>
          )}
          {winner && (
            <motion.div className="arena-winner" initial={reducedMotion ? false : { opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45 }}>
              <small>CAMPEÃO DA ARENA / {universeLabels[winner.universe]}</small>
              <strong>{winner.name.toUpperCase()}</strong>
              <button type="button" className="comic-generate" onClick={() => setComicOpen(true)}>
                GERAR QUADRINHO DA LUTA <span aria-hidden="true">✦</span>
              </button>
              <small className="comic-generate-note">Transforma esta luta exata — narração, falas e dano — em uma edição em quadrinhos.</small>
            </motion.div>
          )}
        </div>
      </div>
      <AnimatePresence>
        {comicOpen && battle && finished && (
          <motion.div key="comic" initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reducedMotion ? undefined : { opacity: 0 }} transition={{ duration: 0.25 }}>
            <ComicView battle={battle} fighterA={fighterA} fighterB={fighterB} gearA={gearA} gearB={gearB} onClose={() => setComicOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function App() {
  const [search, setSearch] = useState("");
  const [universe, setUniverse] = useState<Universe | "all">("all");
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [alignment, setAlignment] = useState<Alignment | "all">("all");
  const [equipment, setEquipment] = useState<EquipmentFilter>("all");
  const [team, setTeam] = useState("all");
  const [onlySaved, setOnlySaved] = useState(false);
  const [visibleCount, setVisibleCount] = useState(24);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [secretOpen, setSecretOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<CategoryId>("tecnologia");
  const [gearTab, setGearTab] = useState<GearKind | "all">("all");
  const [comicsTab, setComicsTab] = useState<"all" | "marvel" | "dc">("all");
  const [imageLookup, setImageLookup] = useState<Record<string, string>>({});
  const [rosterVersion, setRosterVersion] = useState(0);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem("marvel-archive-saved") ?? "[]");
      return Array.isArray(stored) ? stored.filter((id): id is string => typeof id === "string") : [];
    } catch {
      return [];
    }
  });
  const catalogRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setHeaderScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem("marvel-archive-saved", JSON.stringify(savedIds)); } catch { /* Storage can be unavailable. */ }
  }, [savedIds]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("https://akabab.github.io/superhero-api/api/all.json", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Image catalogue unavailable");
        return response.json() as Promise<ApiHero[]>;
      })
      .then((data) => {
        const marvelByName = new Map<string, string>();
        const dcByName = new Map<string, string>();
        data.forEach((hero) => {
          if (!hero.images?.md) return;
          if (hero.biography?.publisher === "Marvel Comics") marvelByName.set(normalize(hero.name), hero.images.md);
          if (hero.biography?.publisher === "DC Comics") dcByName.set(normalize(hero.name), hero.images.md);
        });
        const next: Record<string, string> = {};
        const curatedNames = new Set<string>();
        roster.forEach((person) => {
          curatedNames.add(normalize(person.name));
          curatedNames.add(normalize(person.identity));
          const pool = person.universe === "dc" ? dcByName : marvelByName;
          const image = pool.get(normalize(apiNameAliases[person.name] ?? person.name));
          if (image) {
            next[person.id] = image;
            // Atualiza a foto principal: retrato direto e confiável.
            if (!person.image) person.image = image;
          }
        });
        // Importa TODOS os demais personagens Marvel/DC do banco universal.
        if (!rosterExpanded) {
          const extra = expandRoster(data, curatedNames);
          roster.push(...extra);
          rosterExpanded = true;
          setRosterVersion((current) => current + 1);
        }
        setImageLookup(next);
      })
      .catch(() => { /* Optional fallback art. */ });
    return () => controller.abort();
  }, []);

  const categoryFor = (id: CategoryId) => categories.find((item) => item.id === id)!;
  const selectedCharacter = roster.find((person) => person.id === selectedId) ?? null;
  const selectedGear = selectedCharacter ? gearFor(selectedCharacter.name) : [];
  const hoveredPerson = roster.find((person) => person.name === categoryFor(hoveredCategory).representative)!;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const teams = useMemo(() => [...new Set(roster.map((person) => person.team).filter((item) => item !== "Nenhuma"))].sort((a, b) => a.localeCompare(b, "pt-BR")), [rosterVersion]);
  const [gearSearch, setGearSearch] = useState("");
  const visibleGear = gearItems.filter((item) => {
    const matchesTab = gearTab === "all" || item.kind === gearTab;
    const query = normalize(gearSearch.trim());
    const matchesQuery = !query || normalize([item.name, item.description, item.comic, ...item.owners].join(" ")).includes(query);
    return matchesTab && matchesQuery;
  });

  useEffect(() => setVisibleCount(24), [search, universe, category, alignment, equipment, team, onlySaved]);

  const filteredCharacters = useMemo(() => {
    const query = normalize(search.trim());
    return [...roster]
      .filter((person) => {
        const gearText = gearFor(person.name).map((item) => item.name).join(" ");
        const matchesText = !query || normalize([
          person.name, person.identity, person.team, person.overview,
          person.weapons, person.armor, gearText, ...person.powers, ...person.comics,
        ].join(" ")).includes(query);
        const matchesEquipment = equipment === "all" ||
          (equipment === "none" ? person.equipment.length === 0 : person.equipment.includes(equipment));
        return matchesText &&
          (universe === "all" || person.universe === universe) &&
          (category === "all" || person.category === category) &&
          (alignment === "all" || person.alignment === alignment) &&
          matchesEquipment &&
          (team === "all" || person.team === team) &&
          (!onlySaved || savedIds.includes(person.id));
      })
      .sort((a, b) => {
        const indexA = featuredNames.indexOf(a.name);
        const indexB = featuredNames.indexOf(b.name);
        if (indexA !== -1 || indexB !== -1) {
          return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
        }
        return a.name.localeCompare(b.name, "pt-BR");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, universe, category, alignment, equipment, team, onlySaved, savedIds, rosterVersion]);

  const openDossier = (person: Character) => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSecretOpen(false);
    setSelectedId(person.id);
  };

  const openOwner = (item: GearItem) => {
    const owner = roster.find((person) => person.name === item.owners[0]);
    if (owner) openDossier(owner);
  };

  const closeDossier = () => {
    setSelectedId(null);
    window.setTimeout(() => previousFocusRef.current?.focus(), 0);
  };

  useEffect(() => {
    if (!selectedId) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDossier();
      }
      if (event.key === "Tab" && dialogRef.current) {
        const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>('button, a[href], input, select, [tabindex]:not([tabindex="-1"])')];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedId]);

  const applyCategory = (nextCategory: CategoryId) => {
    setCategory(nextCategory);
    requestAnimationFrame(() => catalogRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" }));
  };

  const clearFilters = () => {
    setSearch("");
    setUniverse("all");
    setCategory("all");
    setAlignment("all");
    setEquipment("all");
    setTeam("all");
    setOnlySaved(false);
  };

  const toggleSaved = (person: Character) => {
    setSavedIds((current) => current.includes(person.id) ? current.filter((id) => id !== person.id) : [...current, person.id]);
  };

  return (
    <main>
      <header className={`site-header${headerScrolled ? " site-header-scrolled" : ""}`}>
        <a href="#inicio" className="brand" aria-label="Arquivo Marvel e DC, ir para o início"><span>MARVEL×DC</span><small>ARQUIVO DE HERÓIS</small></a>
        <nav aria-label="Navegação principal">
          <a href="#personagens">PERSONAGENS</a>
          <a href="#arsenal">ARSENAL</a>
          <a href="#arena">ARENA</a>
          <a href="#historia">HISTÓRIA</a>
          <a href="#sagas">SAGAS</a>
          <a href="#extras">ZONA DO FÃ</a>
          <a href="#quadrinhos">QUADRINHOS</a>
        </nav>
        <a href="#personagens" className="header-action">EXPLORAR ARQUIVO <ArrowIcon /></a>
      </header>

      <section className="hero" id="inicio" aria-labelledby="hero-heading">
        <div className="hero-image" role="img" aria-label="Fotografia de exposição dedicada à arte dos quadrinhos Marvel" style={{ backgroundImage: `url("${heroPhoto}")` }} />
        <div className="hero-scrim" />
        <div className="hero-content page-container">
          <motion.h1 id="hero-heading" initial={reducedMotion ? false : { opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>MARVEL<span>×</span>DC</motion.h1>
          <motion.div className="hero-lower" initial={reducedMotion ? false : { opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.42 }}>
            <div>
              <p className="eyebrow light">DOIS UNIVERSOS. UM ARQUIVO. UMA ARENA.</p>
              <h2>TODO PODER<br />TEM UMA ORIGEM.</h2>
              <p className="hero-description">{roster.length} dossiês com fotos, armas e armaduras dos dois lados da banca — mais arena narrada, torneio, quadrinhos gerados por IA e zona do fã.</p>
            </div>
            <div className="hero-cta-col">
              <a href="#personagens" className="primary-button">ABRIR O ARQUIVO <ArrowIcon /></a>
              <a href="#arena" className="hero-arena-link">IR DIRETO PARA A ARENA <ArrowIcon /></a>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="universo" className="intro-section section-space">
        <div className="page-container intro-grid">
          <p className="section-index">01 / O UNIVERSO</p>
          <Reveal><h2 className="display-heading">NÃO É SÓ<br /><em>SUPERPODER.</em></h2></Reveal>
          <Reveal delay={0.1} className="intro-description">
            <p>Cada personagem tem uma origem, um arsenal e uma história que muda a cada nova edição. Este arquivo organiza o universo dos quadrinhos por aquilo que realmente define cada dossiê.</p>
            <span>CONTINUIDADE PRINCIPAL E OUTRAS VERSÕES INDICADAS QUANDO RELEVANTE.</span>
          </Reveal>
        </div>
      </section>

      <section id="categorias" className="categories-section section-space" aria-labelledby="categories-heading">
        <div className="page-container">
          <div className="section-header dark-header"><span>02 / CLASSIFICAÇÃO</span><span>ESCOLHA UMA FONTE DE PODER</span></div>
          <Reveal className="categories-title-block"><h2 id="categories-heading" className="display-heading">DE ONDE VEM<br /><em>O PODER?</em></h2><p>Do gene X ao impossível. Entre por uma categoria para filtrar os personagens do arquivo.</p></Reveal>
          <div className="categories-layout">
            <div className="category-list">
              {categories.map((item, index) => (
                <button
                  className={`category-row${hoveredCategory === item.id ? " category-row-active" : ""}`}
                  key={item.id}
                  type="button"
                  onMouseEnter={() => setHoveredCategory(item.id)}
                  onFocus={() => setHoveredCategory(item.id)}
                  onClick={() => applyCategory(item.id)}
                  aria-label={`Explorar ${item.title}: ${roster.filter((person) => person.category === item.id).length} personagens`}
                >
                  <span className="category-number">0{index + 1}</span>
                  <span className="category-text"><strong>{item.title}</strong><small>{item.subtitle}</small></span>
                  <span className="category-count">{roster.filter((person) => person.category === item.id).length.toString().padStart(2, "0")}</span>
                  <ArrowIcon />
                </button>
              ))}
            </div>
            <div className="category-preview" aria-hidden="true">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={hoveredCategory} className="category-preview-inner" initial={reducedMotion ? false : { opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={reducedMotion ? undefined : { opacity: 0 }} transition={{ duration: 0.38 }}>
                  <CharacterArt key={hoveredPerson.id} character={hoveredPerson} fallback={imageLookup[hoveredPerson.id]} />
                </motion.div>
              </AnimatePresence>
              <span className="preview-name">{hoveredPerson.name.toUpperCase()}</span>
              <p>{categoryFor(hoveredCategory).description}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="spotlight-section" aria-labelledby="spotlight-heading">
        <div className="spotlight-visual"><CharacterArt character={characters[0]} fallback={imageLookup[characters[0].id]} /></div>
        <div className="spotlight-copy">
          <Reveal>
            <span className="eyebrow">DOSSIÊ EM DESTAQUE / TECNOLOGIA</span>
            <h2 id="spotlight-heading">A ARMADURA<br />ERA SÓ O<br /><em>COMEÇO.</em></h2>
            <p>Tony Stark não nasceu com poderes. Ele construiu uma saída e, com ela, uma das identidades mais conhecidas dos quadrinhos.</p>
            <button type="button" className="text-action" onClick={() => openDossier(characters[0])}>ABRIR DOSSIÊ: IRON MAN <ArrowIcon /></button>
          </Reveal>
        </div>
      </section>

      <section id="personagens" className="catalog-section section-space" ref={catalogRef} aria-labelledby="catalog-heading">
        <div className="page-container">
          <div className="section-header"><span>03 / ARQUIVOS DE PERSONAGEM</span><span>ORIGENS, PODERES E SEGREDOS</span></div>
          <Reveal className="catalog-title-row"><div><p className="eyebrow">O ACERVO</p><h2 id="catalog-heading" className="display-heading">TODOS OS<br /><em>DOSSIÊS.</em></h2></div><p>Procure um nome, descubra um poder ou investigue um equipamento. Cada ficha mostra o personagem e os itens associados a ele.</p></Reveal>

          <div className="catalog-search-row"><SearchIcon /><label className="sr-only" htmlFor="character-search">Buscar personagens, poderes, quadrinhos ou armas</label><input id="character-search" type="search" placeholder="Buscar personagem, poder, HQ ou equipamento..." value={search} onChange={(event) => setSearch(event.target.value)} /><span>CTRL / FICHA</span></div>

          <div className="universe-tabs" role="group" aria-label="Filtrar por editora">
            {([["all", "OS DOIS UNIVERSOS"], ["marvel", "MARVEL"], ["dc", "DC"]] as const).map(([id, label]) => (
              <button key={id} type="button" className={universe === id ? "active" : ""} aria-pressed={universe === id} onClick={() => setUniverse(id)}>
                {label} <span>{id === "all" ? roster.length : roster.filter((person) => person.universe === id).length}</span>
              </button>
            ))}
          </div>

          <div className="category-tabs" role="group" aria-label="Filtrar por fonte de poder">
            <button type="button" className={category === "all" ? "active" : ""} aria-pressed={category === "all"} onClick={() => setCategory("all")}>TODOS</button>
            {categories.map((item) => <button type="button" key={item.id} className={category === item.id ? "active" : ""} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.title.toUpperCase()}</button>)}
          </div>

          <div className="filter-bar">
            <label><span>ALINHAMENTO</span><select value={alignment} onChange={(event) => setAlignment(event.target.value as Alignment | "all")}><option value="all">Todos</option><option value="Herói">Heróis</option><option value="Vilão">Vilões</option><option value="Anti-herói">Anti-heróis</option></select></label>
            <label><span>EQUIPAMENTO</span><select value={equipment} onChange={(event) => setEquipment(event.target.value as EquipmentFilter)}><option value="all">Todos</option><option value="arma">Armas</option><option value="armadura">Armaduras</option><option value="artefato">Artefatos</option><option value="none">Sem equipamento</option></select></label>
            <label><span>EQUIPE / GRUPO</span><select value={team} onChange={(event) => setTeam(event.target.value)}><option value="all">Todas as equipes</option>{teams.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
            <button className={`saved-filter${onlySaved ? " saved-filter-active" : ""}`} type="button" aria-pressed={onlySaved} onClick={() => setOnlySaved(!onlySaved)}><BookmarkIcon filled={onlySaved} /> SALVOS <span>{savedIds.length}</span></button>
          </div>

          <div className="results-meta" aria-live="polite"><span><strong>{filteredCharacters.length.toString().padStart(3, "0")}</strong> ARQUIVOS ENCONTRADOS</span><button type="button" onClick={clearFilters}>LIMPAR FILTROS <span aria-hidden="true">×</span></button></div>

          {filteredCharacters.length ? (
            <>
              <div className="character-grid">
                {filteredCharacters.slice(0, visibleCount).map((person, index) => (
                  <motion.article key={person.id} className="character-entry" initial={reducedMotion ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.05 }} transition={{ duration: 0.42, delay: (index % 4) * 0.035 }}>
                    <button type="button" className="character-open" onClick={() => openDossier(person)} aria-label={`Abrir dossiê de ${person.name}`}>
                      <div className="card-art">
                        <CharacterArt character={person} fallback={imageLookup[person.id]} />
                        <CardGear name={person.name} />
                        <span className={`uni-badge uni-${person.universe}`}>{universeLabels[person.universe]}</span>
                      </div>
                      <div className="entry-labels"><span>{categoryFor(person.category).title.toUpperCase()}</span><span>{person.universe === "dc" ? "DC" : "ARQ"}-{String(roster.indexOf(person) + 1).padStart(3, "0")}</span></div>
                      <h3>{person.name}</h3><p>{person.identity}</p><span className="entry-open">VER DOSSIÊ <ArrowIcon /></span>
                    </button>
                  </motion.article>
                ))}
              </div>
              {visibleCount < filteredCharacters.length && <div className="load-more-wrap"><button type="button" className="load-more" onClick={() => setVisibleCount((current) => current + 24)}>CARREGAR MAIS ARQUIVOS <span>{Math.min(24, filteredCharacters.length - visibleCount)} PRÓXIMOS</span> <ArrowIcon down /></button></div>}
            </>
          ) : (
            <div className="empty-state"><span>ARQUIVO NÃO ENCONTRADO</span><h3>Nenhuma ficha nesta combinação.</h3><p>Tente outro poder, equipamento ou personagem.</p><button type="button" onClick={clearFilters}>VER TODOS OS DOSSIÊS <ArrowIcon /></button></div>
          )}
        </div>
      </section>

      <section id="arsenal" className="arsenal-section section-space" aria-labelledby="arsenal-heading">
        <div className="page-container">
          <div className="section-header dark-header"><span>04 / EQUIPAMENTOS</span><span>ARMAS, ARMADURAS E ARTEFATOS</span></div>
          <Reveal className="arsenal-head"><h2 id="arsenal-heading" className="display-heading">O PODER TAMBÉM<br /><em>SE CONSTRÓI.</em></h2><p>Os itens mais reconhecidos da Marvel e da DC, com imagem para identificar cada peça. Abra uma entrada para conhecer o dossiê de quem a usa.</p></Reveal>
          <div className="item-tabs" role="group" aria-label="Filtrar equipamentos">
            {([["all", "TODOS"], ["arma", "ARMAS"], ["armadura", "ARMADURAS"], ["artefato", "ARTEFATOS"]] as const).map(([id, label]) => (
              <button key={id} type="button" className={gearTab === id ? "active" : ""} aria-pressed={gearTab === id} onClick={() => setGearTab(id)}>{label} <span>{id === "all" ? gearItems.length : gearItems.filter((item) => item.kind === id).length}</span></button>
            ))}
          </div>
          <div className="gear-search-row">
            <SearchIcon />
            <label className="sr-only" htmlFor="gear-search">Buscar armas, armaduras e artefatos</label>
            <input id="gear-search" type="search" placeholder="Buscar Mjolnir, Batarangue, anel, armadura..." value={gearSearch} onChange={(event) => setGearSearch(event.target.value)} />
            {gearSearch && <button type="button" className="gear-search-clear" onClick={() => setGearSearch("")} aria-label="Limpar busca de equipamentos">×</button>}
          </div>
          {visibleGear.length === 0 && <p className="gear-empty">Nenhum equipamento com esse nome. Tente "martelo", "anel" ou o nome de um personagem.</p>}
          <div className="item-grid">
            {visibleGear.map((item) => (
              <button type="button" className="item-card" key={item.id} onClick={() => openOwner(item)} aria-label={`${item.name}: abrir dossiê de ${item.owners[0]}`}>
                <ItemImage item={item} />
                <span className="item-card-body">
                  <small>{item.universe === "dc" ? "DC" : "MARVEL"} / {gearKindLabels[item.kind].toUpperCase()} / {item.owners[0].toUpperCase()}</small>
                  <strong>{item.name}</strong>
                  <span>{item.description}</span>
                  <em>{item.comic}</em>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <Arena lookup={imageLookup} />

      <section id="historia" className="history-section section-space" aria-labelledby="history-heading">
        <div className="page-container">
          <div className="section-header"><span>06 / LINHA DO TEMPO</span><span>1938 - HOJE / DUAS EDITORAS, UMA HISTÓRIA</span></div>
          <Reveal className="history-head"><div><p className="eyebrow">QUASE UM SÉCULO DE BANCAS</p><h2 id="history-heading" className="display-heading">COMO TUDO<br /><em>COMEÇOU.</em></h2></div><p>Os marcos que construíram os dois universos — da estreia do Superman ao colapso e renascimento dos multiversos.</p></Reveal>
          <ol className="era-list">
            {historyTimeline.map((era, index) => (
              <Reveal key={era.year + era.title} delay={(index % 4) * 0.05}>
                <li className={`era-item era-${era.publisher}`}>
                  <span className="era-year">{era.year}</span>
                  <span className={`era-pub ${era.publisher === "ambos" ? "pub-both" : era.publisher === "dc" ? "pub-dc" : "pub-marvel"}`}>{era.publisher === "ambos" ? "MARVEL × DC" : era.publisher.toUpperCase()}</span>
                  <div><h3>{era.title}</h3><p>{era.text}</p></div>
                </li>
              </Reveal>
            ))}
          </ol>
          <TriviaBox />
        </div>
      </section>

      <section id="sagas" className="sagas-section section-space" aria-labelledby="sagas-heading">
        <div className="page-container">
          <div className="section-header dark-header"><span>07 / EVENTOS ÉPICOS</span><span>AS SAGAS QUE SACUDIRAM OS UNIVERSOS</span></div>
          <Reveal className="sagas-head"><h2 id="sagas-heading" className="display-heading">QUANDO TUDO<br /><em>MUDA.</em></h2><p>Doze eventos que redefiniram seus universos — mortes, reinícios e estalos de dedo. Cada cartão indica a leitura essencial.</p></Reveal>
          <div className="saga-grid">
            {sagas.map((saga, index) => (
              <Reveal key={saga.title} delay={(index % 3) * 0.06}>
                <article className={`saga-card saga-${saga.publisher}`}>
                  <div className="saga-top"><span className={saga.publisher === "dc" ? "pub-dc" : "pub-marvel"}>{saga.publisher.toUpperCase()}</span><span>{saga.year}</span></div>
                  <h3>{saga.title}</h3>
                  <p>{saga.impact}</p>
                  <small>LEITURA ESSENCIAL: {saga.essential}</small>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="extras" className="extras-section section-space" aria-labelledby="extras-heading">
        <div className="page-container">
          <div className="section-header"><span>08 / ZONA DO FÃ</span><span>TORNEIO / QUIZ / GLOSSÁRIO</span></div>
          <Reveal className="extras-head"><div><p className="eyebrow">PARA BRINCAR E APRENDER</p><h2 id="extras-heading" className="display-heading">ZONA<br /><em>DO FÃ.</em></h2></div><p>Descubra quem você seria no multiverso, simule um torneio de oito lutadores, escolha seu lado da banca e domine o vocabulário.</p></Reveal>
          <div className="hero-quiz-wrap">
            <h3 className="extras-subtitle">TESTE DE PERSONALIDADE: QUEM É VOCÊ NO MULTIVERSO?</h3>
            <p className="hero-quiz-note">Sete perguntas medem seus traços — liderança, intelecto, caos, sombras, coração, força e ambição — e revelam seu alter ego entre 16 heróis, anti-heróis e vilões.</p>
            <HeroQuiz lookup={imageLookup} onOpen={openDossier} />
          </div>
          <Tournament lookup={imageLookup} />
          <div className="extras-duo">
            <div className="extras-quiz-col">
              <h3 className="extras-subtitle">MARVEL OU DC: QUAL É O SEU LADO?</h3>
              <QuizBlock />
            </div>
            <div className="extras-glossary-col">
              <h3 className="extras-subtitle">GLOSSÁRIO DO MULTIVERSO</h3>
              <dl className="glossary-list">
                {glossary.map((entry) => (
                  <div className="glossary-item" key={entry.term}>
                    <dt><span className={entry.publisher === "ambos" ? "pub-both" : entry.publisher === "dc" ? "pub-dc" : "pub-marvel"}>{entry.publisher === "ambos" ? "M×DC" : entry.publisher.toUpperCase()}</span>{entry.term}</dt>
                    <dd>{entry.meaning}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section id="quadrinhos" className="comics-section section-space" aria-labelledby="comics-heading">
        <div className="page-container">
          <div className="section-header"><span>09 / BIBLIOTECA DE LEITURA</span><span>MARVEL E DC / ONDE LER DE VERDADE</span></div>
          <Reveal className="comics-head"><div><p className="eyebrow">AS PÁGINAS QUE MUDARAM TUDO</p><h2 id="comics-heading" className="display-heading">ANTES DAS TELAS,<br /><em>AS HQS.</em></h2></div><p>Clássicos dos dois universos disponíveis legalmente no Marvel Unlimited e no DC Universe Infinite. Cada entrada leva à ficha da história; a leitura completa fica na plataforma indicada.</p></Reveal>
          <div className="comics-pub-tabs" role="group" aria-label="Filtrar biblioteca por editora">
            {([["all", "TODAS"], ["marvel", "MARVEL"], ["dc", "DC"]] as const).map(([id, label]) => (
              <button key={id} type="button" className={comicsTab === id ? "active" : ""} aria-pressed={comicsTab === id} onClick={() => setComicsTab(id)}>
                {label} <span>{id === "all" ? comicsLibrary.length : comicsLibrary.filter((comic) => comic.publisher === id).length}</span>
              </button>
            ))}
          </div>
          <div className="comics-list">
            {comicsLibrary.filter((comic) => comicsTab === "all" || comic.publisher === comicsTab).map((comic, index) => (
              <Reveal key={comic.title}>
                <a className="comic-row" href={comic.url} target="_blank" rel="noreferrer" aria-label={`Ver ficha de ${comic.title}`}>
                  <span>{String(index + 1).padStart(2, "0")} / {comic.year} / <b className={comic.publisher === "dc" ? "pub-dc" : "pub-marvel"}>{comic.publisher === "dc" ? "DC" : "MARVEL"}</b></span>
                  <div><h3>{comic.title}</h3><p>{comic.note} <em>Leia em: {comic.platform}.</em></p></div>
                  <strong>{comic.focus.toUpperCase()} <ArrowIcon /></strong>
                </a>
              </Reveal>
            ))}
          </div>
          <div className="comics-links-row">
            <a className="comics-link" href="https://www.marvel.com/unlimited" target="_blank" rel="noreferrer">LER NO MARVEL UNLIMITED <ArrowIcon /></a>
            <a className="comics-link" href="https://www.dcuniverseinfinite.com/" target="_blank" rel="noreferrer">LER NO DC UNIVERSE INFINITE <ArrowIcon /></a>
          </div>
        </div>
      </section>

      <footer className="site-footer"><div className="page-container">
        <div className="footer-main"><span>ARQUIVO DE FÃ / SEM VÍNCULO OFICIAL</span><h2>O UNIVERSO<br /><em>CONTINUA.</em></h2><a href="#inicio">VOLTAR AO INÍCIO <ArrowIcon /></a></div>
        <div className="footer-lower"><p>Guia editorial independente sobre personagens dos quadrinhos Marvel e DC. As "notas reservadas" são curiosidades e spoilers de histórias publicadas, não informações confidenciais reais. A arena é uma simulação de fã: nos quadrinhos, qualquer resultado é possível. Consulte os <a href="https://www.marvel.com/characters" target="_blank" rel="noreferrer">perfis oficiais da Marvel</a> e o <a href="https://www.dc.com/characters" target="_blank" rel="noreferrer">site oficial da DC</a> para continuar pesquisando.</p><div><p>Fotografia da exposição: <a href="https://commons.wikimedia.org/wiki/File:Exposition_Super-h%C3%A9ros_%26_Cie._L%27art_des_comics_Marvel_2.jpg" target="_blank" rel="noreferrer">Cité de la BD / Wikimedia Commons</a> (<a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a>), recortada para o layout.</p><p>Imagens de personagens, armas e armaduras: capas e artes de quadrinhos carregadas do <a href="https://marvel.fandom.com/" target="_blank" rel="noreferrer">Marvel Database</a>, do <a href="https://dc.fandom.com/" target="_blank" rel="noreferrer">DC Database</a> e da <a href="https://akabab.github.io/superhero-api/" target="_blank" rel="noreferrer">Superhero API</a>. Personagens e imagens pertencem aos respectivos titulares.</p></div></div>
        <div className="footer-end"><span>ARQUIVO MARVEL × DC</span><span>FEITO PARA EXPLORAR, NÃO PARA ENCERRAR A HISTÓRIA.</span></div>
      </div></footer>

      <AnimatePresence>
        {selectedCharacter && (
          <motion.div className="drawer-root" key="dossier" initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.28 }}>
            <motion.button className="drawer-backdrop" type="button" aria-label="Fechar dossiê" onClick={closeDossier} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.28 }} />
            <motion.aside ref={dialogRef} className="dossier-panel" role="dialog" aria-modal="true" aria-labelledby="dossier-title" initial={reducedMotion ? false : { x: "100%" }} animate={{ x: 0 }} exit={reducedMotion ? undefined : { x: "100%" }} transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}>
              <div className="dossier-topbar"><span>{universeLabels[selectedCharacter.universe]} / DOSSIÊ {String(roster.indexOf(selectedCharacter) + 1).padStart(3, "0")}</span><button ref={closeButtonRef} type="button" onClick={closeDossier} aria-label="Fechar dossiê">×</button></div>
              <CharacterArt key={selectedCharacter.id} character={selectedCharacter} fallback={imageLookup[selectedCharacter.id]} className="dossier-image" />
              <div className="dossier-content">
                <div className="dossier-kicker"><span>{universeLabels[selectedCharacter.universe]}</span><span>{categoryFor(selectedCharacter.category).title.toUpperCase()}</span><span>{selectedCharacter.alignment.toUpperCase()}</span></div>
                <h2 id="dossier-title">{selectedCharacter.name}</h2>
                <p className="dossier-identity">{selectedCharacter.identity} / {selectedCharacter.team === "Nenhuma" ? "INDEPENDENTE" : selectedCharacter.team}</p>
                <p className="dossier-overview">{selectedCharacter.overview}</p>
                <div className="dossier-section"><h3>01 / PODERES & CAPACIDADES</h3><div className="dossier-powers">{selectedCharacter.powers.map((power, index) => <div key={power}><span>{String(index + 1).padStart(2, "0")}</span><strong>{power}</strong></div>)}</div></div>
                <div className="dossier-section">
                  <h3>02 / ARMAS & ARMADURAS</h3>
                  <div className="gear-grid">
                    <div className="gear-tile">
                      <CharacterArt key={`outfit-${selectedCharacter.id}`} character={selectedCharacter} fallback={imageLookup[selectedCharacter.id]} className="gear-art" />
                      <div className="gear-tile-body"><small>TRAJE / VISUAL</small><strong>{selectedCharacter.armor === "Nenhuma" ? "Visual clássico" : selectedCharacter.armor}</strong><p>Referência visual para identificar o personagem em ação.</p></div>
                    </div>
                    {selectedGear.map((item) => (
                      <div className="gear-tile" key={item.id}>
                        <ItemImage item={item} />
                        <div className="gear-tile-body"><small>{gearKindLabels[item.kind].toUpperCase()}</small><strong>{item.name}</strong><p>{item.description}</p></div>
                      </div>
                    ))}
                  </div>
                  <dl className="dossier-specs"><div><dt>ARSENAL</dt><dd>{selectedCharacter.weapons}</dd></div><div><dt>PROTEÇÃO / ARMADURA</dt><dd>{selectedCharacter.armor}</dd></div><div><dt>TIPO DE EQUIPAMENTO</dt><dd>{selectedCharacter.equipment.length ? selectedCharacter.equipment.map((item) => equipmentLabels[item]).join(" / ") : "Sem equipamento externo"}</dd></div></dl>
                </div>
                <div className="dossier-section"><h3>03 / QUADRINHOS PARA EXPLORAR</h3><div className="dossier-comics">{selectedCharacter.comics.map((comic, index) => <div key={comic}><span>{String(index + 1).padStart(2, "0")}</span><strong>{comic}</strong></div>)}</div></div>
                <div className="classified-section"><div><span>04 / NOTA RESERVADA</span><small>CONTÉM SPOILERS DAS HQS</small></div><button type="button" onClick={() => setSecretOpen(!secretOpen)} aria-expanded={secretOpen}>{secretOpen ? "OCULTAR NOTA" : "REVELAR NOTA"} <span>{secretOpen ? "-" : "+"}</span></button><AnimatePresence>{secretOpen && <motion.p initial={reducedMotion ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={reducedMotion ? undefined : { opacity: 0, height: 0 }} transition={{ duration: 0.32 }}>{selectedCharacter.secret}</motion.p>}</AnimatePresence></div>
                <button className="save-button" type="button" onClick={() => toggleSaved(selectedCharacter)} aria-pressed={savedIds.includes(selectedCharacter.id)}><BookmarkIcon filled={savedIds.includes(selectedCharacter.id)} /> {savedIds.includes(selectedCharacter.id) ? "SALVO NO SEU ARQUIVO" : "SALVAR NO MEU ARQUIVO"}</button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default App;
