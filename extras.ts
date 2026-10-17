export type EraEntry = { year: string; publisher: "marvel" | "dc" | "ambos"; title: string; text: string };

export const historyTimeline: EraEntry[] = [
  { year: "1938", publisher: "dc", title: "Action Comics #1", text: "O Superman estreia e inventa o conceito de super-herói. A Era de Ouro começa." },
  { year: "1939", publisher: "ambos", title: "Batman e a Timely", text: "O Batman surge na Detective Comics #27; a Timely (futura Marvel) lança Namor e o Tocha Humana original." },
  { year: "1941", publisher: "marvel", title: "Capitão América", text: "Steve Rogers soca o Hitler na capa da Captain America Comics #1, antes mesmo de os EUA entrarem na guerra." },
  { year: "1956", publisher: "dc", title: "A Era de Prata", text: "Barry Allen vira o novo Flash na Showcase #4 e reacende os super-heróis após o declínio do pós-guerra." },
  { year: "1961", publisher: "marvel", title: "O Quarteto Fantástico", text: "Stan Lee e Jack Kirby criam heróis com problemas reais — nasce o Universo Marvel moderno." },
  { year: "1962", publisher: "marvel", title: "O ano impossível", text: "Em doze meses surgem Homem-Aranha, Hulk e Thor. Nenhum ano foi tão fértil." },
  { year: "1963", publisher: "marvel", title: "X-Men e Vingadores", text: "As duas maiores equipes Marvel estreiam no mesmo ano, com Homem de Ferro recém-chegado." },
  { year: "1970", publisher: "dc", title: "Kirby muda de lado", text: "Jack Kirby vai para a DC e cria o Quarto Mundo: Darkseid, Novos Deuses e Apokolips." },
  { year: "1985", publisher: "dc", title: "Crise nas Infinitas Terras", text: "A DC funde seu multiverso num único universo. O conceito de 'evento' nunca mais foi o mesmo." },
  { year: "1986", publisher: "ambos", title: "A era sombria", text: "Watchmen e O Cavaleiro das Trevas provam que quadrinhos são literatura; a Marvel responde com fases adultas." },
  { year: "1992", publisher: "dc", title: "A Morte do Superman", text: "Apocalypse mata o Homem de Aço e o mundo real para nas bancas." },
  { year: "1996", publisher: "ambos", title: "Marvel vs. DC", text: "O crossover oficial coloca os universos para lutar — os fãs votaram nos vencedores." },
  { year: "2000", publisher: "marvel", title: "Universo Ultimate", text: "A Marvel recomeça do zero para novos leitores; dali sairia Miles Morales." },
  { year: "2011", publisher: "dc", title: "Os Novos 52", text: "A DC reinicia todas as suas revistas no #1 após o Flashpoint." },
  { year: "2015", publisher: "marvel", title: "Secret Wars de Hickman", text: "O multiverso Marvel colapsa e renasce; a saga é considerada o ápice dos eventos modernos." },
  { year: "2018", publisher: "ambos", title: "80 anos de lendas", text: "Action Comics chega à edição #1000; a Marvel celebra 80 anos com Marvel Comics #1000 no ano seguinte." },
];

export type SagaEntry = { publisher: "marvel" | "dc"; title: string; year: string; impact: string; essential: string };

export const sagas: SagaEntry[] = [
  { publisher: "marvel", title: "A Saga da Fênix Negra", year: "1980", impact: "Jean Grey consome uma estrela e um júri cósmico exige sua vida. O padrão de tragédia dos X-Men nasce aqui.", essential: "X-Men #129-138" },
  { publisher: "dc", title: "Crise nas Infinitas Terras", year: "1985", impact: "O Anti-Monitor devora realidades; Supergirl e Flash morrem salvando tudo. O multiverso DC é refeito.", essential: "Crisis on Infinite Earths #1-12" },
  { publisher: "marvel", title: "Guerras Secretas", year: "1984", impact: "O Beyonder sequestra heróis e vilões para o Mundo Bélico. O Aranha volta com o traje preto.", essential: "Secret Wars #1-12" },
  { publisher: "dc", title: "A Piada Mortal", year: "1988", impact: "O Coringa tenta provar que um dia ruim enlouquece qualquer um. Barbara Gordon paga o preço.", essential: "Batman: The Killing Joke" },
  { publisher: "marvel", title: "A Manopla do Infinito", year: "1991", impact: "Thanos estala os dedos e apaga metade do universo para impressionar a Morte.", essential: "Infinity Gauntlet #1-6" },
  { publisher: "dc", title: "A Queda do Morcego", year: "1993", impact: "Bane esgota o Batman e quebra sua coluna. Gotham conhece um Cavaleiro mais violento.", essential: "Knightfall" },
  { publisher: "marvel", title: "Guerra Civil", year: "2006", impact: "O registro de heróis racha os Vingadores ao meio. O Aranha revela a identidade ao mundo.", essential: "Civil War #1-7" },
  { publisher: "dc", title: "Crise de Identidade", year: "2004", impact: "Um assassinato entre familiares de heróis expõe segredos sombrios da Liga.", essential: "Identity Crisis #1-7" },
  { publisher: "marvel", title: "Dinastia M", year: "2005", impact: "Wanda reescreve o mundo e três palavras mudam tudo: 'Chega de mutantes'.", essential: "House of M #1-8" },
  { publisher: "dc", title: "A Noite Mais Densa", year: "2009", impact: "Anéis negros ressuscitam heróis mortos como Lanternas Negros. O espectro emocional vai à guerra.", essential: "Blackest Night #1-8" },
  { publisher: "marvel", title: "Guerras Secretas (2015)", year: "2015", impact: "Doom rouba o poder dos Beyonders e vira Deus-Imperador de um mundo-colcha de realidades.", essential: "Secret Wars #1-9" },
  { publisher: "dc", title: "Metal Noturno", year: "2017", impact: "O Multiverso Sombrio invade com Batmen corrompidos — incluindo o Batman Que Ri.", essential: "Dark Nights: Metal #1-6" },
];

export type GlossaryEntry = { term: string; publisher: "marvel" | "dc" | "ambos"; meaning: string };

export const glossary: GlossaryEntry[] = [
  { term: "Terra-616", publisher: "marvel", meaning: "A realidade principal da Marvel nos quadrinhos, onde quase todas as histórias clássicas acontecem." },
  { term: "Prime Earth", publisher: "dc", meaning: "A Terra principal da DC desde os Novos 52, equivalente moderna da antiga New Earth." },
  { term: "Multiverso", publisher: "ambos", meaning: "O conjunto de realidades paralelas. A DC numera Terras (Terra-2, Terra-3); a Marvel também (Terra-1610, Terra-65)." },
  { term: "Força de Aceleração", publisher: "dc", meaning: "Campo de energia extradimensional que dá poder a todos os velocistas, do Flash ao Zoom." },
  { term: "Gene X", publisher: "marvel", meaning: "A mutação genética que desperta poderes na puberdade — a origem dos mutantes e dos X-Men." },
  { term: "Vibranium", publisher: "marvel", meaning: "Metal de Wakanda que absorve vibração e energia. Compõe o escudo do Capitão América." },
  { term: "Adamantium", publisher: "marvel", meaning: "A liga praticamente indestrutível fundida ao esqueleto de Wolverine pelo projeto Arma X." },
  { term: "Metal Nth", publisher: "dc", meaning: "Metal thanagariano que nega gravidade e magia — a matéria-prima das armas do Gavião Negro." },
  { term: "Kryptonita", publisher: "dc", meaning: "Fragmentos radioativos de Krypton, a única fraqueza física clássica do Superman. A verde enfraquece; outras cores têm efeitos bizarros." },
  { term: "Joias do Infinito", publisher: "marvel", meaning: "Seis gemas que controlam Poder, Espaço, Tempo, Mente, Alma e Realidade. Juntas na Manopla, concedem onipotência." },
  { term: "Equação Anti-Vida", publisher: "dc", meaning: "A fórmula matemática que prova a futilidade da esperança e permite dominar toda vontade livre. Obsessão eterna de Darkseid." },
  { term: "Simbionte", publisher: "marvel", meaning: "Organismo alienígena que se funde a um hospedeiro, como Venom e Carnificina. Todos descendem do deus Knull." },
  { term: "Poço de Lázaro", publisher: "dc", meaning: "Piscinas químicas que curam ferimentos e ressuscitam mortos — o segredo da longevidade de Ra's al Ghul." },
  { term: "O Verde", publisher: "dc", meaning: "A força elemental que conecta toda a vida vegetal da Terra, canalizada pelo Monstro do Pântano e Poison Ivy." },
  { term: "Mjolnir", publisher: "marvel", meaning: "O martelo encantado de Thor: só quem for digno pode erguê-lo — regra que já surpreendeu muita gente." },
  { term: "Tropa dos Lanternas", publisher: "dc", meaning: "Polícia espacial movida pelo espectro emocional: verde (vontade), amarelo (medo), vermelho (raiva), azul (esperança), violeta (amor), índigo (compaixão), laranja (avareza)." },
];

export const triviaFacts: string[] = [
  "O Homem-Aranha quase não existiu: o editor achava que ninguém ia querer ler sobre um adolescente herói com problemas de dinheiro.",
  "Stan Lee e Jack Kirby criaram o Quarteto Fantástico depois que a DC fez sucesso com a Liga da Justiça — a concorrência salvou a Marvel.",
  "O martelo do Thor tem uma inscrição: 'Quem for digno, se empunhar este martelo, possuirá o poder de Thor'. O Superman já o ergueu num crossover.",
  "Wolverine quase foi um verme de verdade: o nome 'Wolverine' foi escolhido antes de decidirem que ele seria humano.",
  "O Batman apareceu em mais de 15 mil histórias diferentes — é o personagem com mais publicações da DC.",
  "A Viúva Negra estreou como vilã do Homem de Ferro em 1964, com vestido de gala e sem uniforme.",
  "Darkseid foi inspirado visualmente no ator Jack Palance e conceitualmente em ditadores reais.",
  "O primeiro crossover oficial Marvel × DC foi Superman vs. O Incrível Homem-Aranha, em 1976.",
  "O Coringa não tem origem oficial: em A Piada Mortal, ele mesmo diz preferir que seu passado seja 'de múltipla escolha'.",
  "Kamala Khan, a Ms. Marvel, foi a primeira heroína muçulmana a estrelar uma revista própria da Marvel.",
  "O Flash Wally West já correu tão rápido que ultrapassou a própria morte — literalmente, nos quadrinhos.",
  "O escudo do Capitão América é uma liga única de vibranium e aço que nunca foi reproduzida — nem pelo Stark.",
  "Deadpool sabe que é um personagem de quadrinhos e já leu as próprias revistas dentro das histórias.",
  "A Mulher-Maravilha foi criada por William Moulton Marston, o inventor do detector de mentiras — daí o Laço da Verdade.",
  "Galactus era para aparecer uma única vez em 1966; os fãs adoraram tanto que ele virou força fundamental do universo.",
  "O Lanterna Verde Alan Scott é anterior à Tropa: seu anel é mágico e tem fraqueza contra... madeira.",
  "O Esquadrão Suicida existe desde 1959, mas a versão de vilões presos em missões mortais nasceu em 1987 com John Ostrander.",
  "Venom surgiu de uma ideia enviada por um fã, Randy Schueller, que a Marvel comprou por US$ 220.",
  "O grito da Canário Negro é tão potente nos quadrinhos que já derrubou prédios inteiros.",
  "Thanos foi criado como 'inveja' declarada de Darkseid — o autor Jim Starlin admite a inspiração.",
  "A Garota Esquilo venceu o Thanos em combate direto — e o Uatu, o Vigia, apareceu só para confirmar que era o Thanos real.",
  "O Super-Homem já teve o poder de atirar mini-Supermen arco-íris pelas mãos na Era de Prata. Sério.",
  "Lobo foi criado como paródia do Wolverine e dos anti-heróis violentos dos anos 80 — e virou exatamente o que satirizava.",
  "O Doutor Destino é considerado por muitos autores o maior vilão da Marvel: já roubou o poder de deuses três vezes.",
  "Barbara Gordon passou 23 anos como Oráculo, a maior central de informações dos heróis, antes de voltar a ser Batgirl.",
  "O Arqueiro Verde já foi prefeito de Star City — e perdeu a fortuna mais vezes do que o Batman trocou de Robin.",
  "Kang, o Conquistador, Rama-Tut e o Imortus são a mesma pessoa em momentos diferentes da própria vida.",
  "O Aquaman da Era de Prata falava com peixes; o moderno comanda telepaticamente tudo o que vive no oceano — há diferença.",
  "Os Vingadores se formaram por acaso: Loki tentou incriminar o Hulk e acabou unindo os heróis que o derrotariam.",
  "A Legião dos Super-Heróis vem do século 31 e foi criada antes dos X-Men, inspirando o conceito de equipe jovem.",
];

// Quiz de personalidade: cada resposta pontua traços; o resultado é o personagem com maior afinidade.
export type Trait = "lider" | "genio" | "caos" | "sombra" | "coracao" | "forca" | "poder";

export type HeroQuizQuestion = { question: string; options: Array<{ text: string; traits: Partial<Record<Trait, number>> }> };

export const heroQuizQuestions: HeroQuizQuestion[] = [
  {
    question: "Seu grupo está em apuros. Qual é o seu primeiro instinto?",
    options: [
      { text: "Assumir o comando e distribuir funções", traits: { lider: 2 } },
      { text: "Analisar tudo e montar um plano em segundos", traits: { genio: 2 } },
      { text: "Partir pra cima primeiro e pensar depois", traits: { forca: 2, caos: 1 } },
      { text: "Sumir nas sombras e resolver sozinho", traits: { sombra: 2 } },
    ],
  },
  {
    question: "O que mais te irrita nas pessoas?",
    options: [
      { text: "Covardia na hora de decidir", traits: { lider: 1, forca: 1 } },
      { text: "Burrice com orgulho", traits: { genio: 2 } },
      { text: "Gente que leva tudo a sério demais", traits: { caos: 2 } },
      { text: "Falsidade e traição", traits: { sombra: 1, coracao: 1 } },
    ],
  },
  {
    question: "Você encontra uma carteira cheia de dinheiro. O que faz?",
    options: [
      { text: "Devolvo na hora, sem pensar duas vezes", traits: { coracao: 2, lider: 1 } },
      { text: "Devolvo... depois de memorizar os dados. Informação é poder", traits: { genio: 1, sombra: 1 } },
      { text: "Depende de quem perdeu", traits: { sombra: 2 } },
      { text: "Fico. O universo me deve", traits: { caos: 1, poder: 2 } },
    ],
  },
  {
    question: "Qual frase soa mais como você?",
    options: [
      { text: "\"Se eu não fizer, ninguém faz direito.\"", traits: { poder: 2, genio: 1 } },
      { text: "\"Ninguém fica para trás.\"", traits: { coracao: 2, lider: 1 } },
      { text: "\"As regras são sugestões.\"", traits: { caos: 2 } },
      { text: "\"Resultados importam mais que métodos.\"", traits: { sombra: 2, poder: 1 } },
    ],
  },
  {
    question: "Seu maior medo secreto:",
    options: [
      { text: "Perder as pessoas que amo", traits: { coracao: 2 } },
      { text: "Perder o controle de mim mesmo", traits: { forca: 2, sombra: 1 } },
      { text: "Ser esquecido ou irrelevante", traits: { poder: 2, caos: 1 } },
      { text: "Falhar com quem confia em mim", traits: { lider: 2 } },
    ],
  },
  {
    question: "Como você reage quando te subestimam?",
    options: [
      { text: "Provo o contrário com trabalho e vitórias", traits: { lider: 1, forca: 1 } },
      { text: "Acho ótimo: subestimado ataca melhor", traits: { sombra: 2 } },
      { text: "Faço piada, mas guardo na memória", traits: { caos: 2 } },
      { text: "Um dia todos vão reconhecer minha grandeza", traits: { poder: 2 } },
    ],
  },
  {
    question: "Se pudesse escolher, seu poder seria...",
    options: [
      { text: "Força bruta incontestável", traits: { forca: 2 } },
      { text: "Uma mente que ninguém alcança", traits: { genio: 2 } },
      { text: "Inspirar as pessoas a serem melhores", traits: { coracao: 1, lider: 2 } },
      { text: "Que todos simplesmente obedeçam", traits: { poder: 2, sombra: 1 } },
    ],
  },
];

// Perfis possíveis: id do personagem no roster + traços dominantes + leitura do perfil.
export type HeroProfile = { characterId: string; name: string; alignment: string; traits: Trait[]; reading: string };

export const heroProfiles: HeroProfile[] = [
  { characterId: "m-captain-america", name: "Capitão América", alignment: "Herói", traits: ["lider", "coracao"], reading: "Você lidera pelo exemplo e não negocia seus valores. As pessoas te seguem porque confiam — e você jamais as decepciona de propósito." },
  { characterId: "d-superman", name: "Superman", alignment: "Herói", traits: ["coracao", "forca"], reading: "Força imensa, coração maior ainda. Você acredita no melhor das pessoas mesmo quando elas não acreditam." },
  { characterId: "m-iron-man", name: "Homem de Ferro", alignment: "Herói", traits: ["genio", "poder"], reading: "Brilhante, confiante e um pouco convencido — mas quando a coisa aperta, você constrói a saída que ninguém viu." },
  { characterId: "d-batman", name: "Batman", alignment: "Herói", traits: ["sombra", "genio"], reading: "Você observa, planeja e age quando ninguém espera. Confiança se conquista; você dá em doses homeopáticas." },
  { characterId: "d-wonder-woman", name: "Mulher-Maravilha", alignment: "Herói", traits: ["lider", "forca"], reading: "Guerreira e diplomata na mesma medida: você prefere a verdade ao conforto e luta de frente, com honra." },
  { characterId: "m-spider-man", name: "Homem-Aranha", alignment: "Herói", traits: ["coracao", "caos"], reading: "Responsabilidade pesa, mas você carrega com piada pronta. Erra, levanta, tenta de novo — e nunca deixa de ajudar." },
  { characterId: "d-flash", name: "Flash", alignment: "Herói", traits: ["caos", "coracao"], reading: "Otimista em alta velocidade: você resolve rindo, abraça a família escolhida e chega atrasado só pra fazer entrada triunfal." },
  { characterId: "m-storm", name: "Tempestade", alignment: "Herói", traits: ["lider", "poder"], reading: "Presença régia e calma de quem já atravessou tempestades — literalmente. Quando você fala, o ambiente muda." },
  { characterId: "m-wolverine", name: "Wolverine", alignment: "Anti-herói", traits: ["forca", "sombra"], reading: "Casca grossa, lealdade absoluta. Você não procura briga, mas nunca fugiu de uma — e protege os seus com unhas e dentes." },
  { characterId: "m-deadpool", name: "Deadpool", alignment: "Anti-herói", traits: ["caos", "forca"], reading: "Imprevisível, engraçado e mais profundo do que aparenta. As regras existem para você quebrá-las com estilo." },
  { characterId: "d-catwoman", name: "Mulher-Gato", alignment: "Anti-herói", traits: ["sombra", "caos"], reading: "Você anda na linha entre o certo e o conveniente com elegância felina. Ninguém te prende — nem rótulos." },
  { characterId: "d-red-hood", name: "Capuz Vermelho", alignment: "Anti-herói", traits: ["sombra", "forca"], reading: "Você já quebrou — e voltou mais duro. Justiça, pra você, não espera burocracia." },
  { characterId: "m-doctor-doom", name: "Doutor Destino", alignment: "Vilão", traits: ["poder", "genio"], reading: "Você não quer destruir o mundo: quer consertá-lo — contanto que todos reconheçam que só você é capaz. Majestoso e implacável." },
  { characterId: "m-magneto", name: "Magneto", alignment: "Vilão", traits: ["poder", "lider"], reading: "Suas causas são justas, seus métodos... discutíveis. Você já viu o pior do mundo e decidiu nunca mais ser vítima." },
  { characterId: "d-joker", name: "Coringa", alignment: "Vilão", traits: ["caos", "sombra"], reading: "Para você, o mundo é uma piada que só você entendeu. Imprevisível, magnético e sinceramente assustador." },
  { characterId: "d-lex-luthor", name: "Lex Luthor", alignment: "Vilão", traits: ["genio", "sombra"], reading: "A mente mais brilhante da sala — e a primeira a se ofender quando alguém voa mais alto. Ambição é seu superpoder." },
];

export type QuizQuestion = { question: string; options: Array<{ text: string; side: "marvel" | "dc" }> };

export const quizQuestions: QuizQuestion[] = [
  { question: "Seu herói ideal é...", options: [{ text: "Alguém comum que ganhou poderes e erra como todo mundo", side: "marvel" }, { text: "Um símbolo quase mitológico que inspira a humanidade", side: "dc" }] },
  { question: "A cidade perfeita para viver aventuras:", options: [{ text: "Nova York real, com trânsito, aluguel caro e heróis no metrô", side: "marvel" }, { text: "Gotham ou Metrópolis: cidades-símbolo maiores que a vida", side: "dc" }] },
  { question: "O vilão mais interessante é aquele que...", options: [{ text: "Acredita estar certo e quase convence você", side: "marvel" }, { text: "É uma força arquetípica do caos ou da tirania", side: "dc" }] },
  { question: "Poder dos sonhos:", options: [{ text: "Sentido aranha, garras ou um traje que eu mesmo construí", side: "marvel" }, { text: "Velocidade absoluta, anel de vontade ou a força de um deus", side: "dc" }] },
  { question: "Sua equipe ideal:", options: [{ text: "Uma família disfuncional que briga no café da manhã", side: "marvel" }, { text: "Um panteão de lendas reunidas numa mesa de justiça", side: "dc" }] },
  { question: "O tom da história perfeita:", options: [{ text: "Humor, drama pessoal e consequências que ficam", side: "marvel" }, { text: "Épico, mitologia moderna e esperança contra a escuridão", side: "dc" }] },
];
