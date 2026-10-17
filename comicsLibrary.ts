export type ComicEntry = {
  publisher: "marvel" | "dc";
  title: string;
  year: string;
  note: string;
  focus: string;
  url: string;
  platform: string;
};

// Clássicos realmente disponíveis para leitura legal.
// Links apontam para páginas estáveis (artigos e plataformas oficiais), evitando URLs de edição que quebram.
export const comicsLibrary: ComicEntry[] = [
  { publisher: "marvel", title: "Amazing Fantasy #15", year: "1962", note: "A origem do Homem-Aranha: a picada, o uniforme e a lição sobre responsabilidade.", focus: "Spider-Man", url: "https://www.marvel.com/comics/issue/16926/amazing_fantasy_1962_15", platform: "Marvel Unlimited" },
  { publisher: "marvel", title: "Fantastic Four #1", year: "1961", note: "O voo que criou a Marvel moderna e sua primeira família.", focus: "Origens", url: "https://www.marvel.com/comics/issue/12894/fantastic_four_1961_1", platform: "Marvel Unlimited" },
  { publisher: "marvel", title: "The Avengers #1", year: "1963", note: "Loki provoca, e os heróis mais poderosos da Terra se unem.", focus: "Vingadores", url: "https://www.marvel.com/comics/issue/6951/avengers_1963_1", platform: "Marvel Unlimited" },
  { publisher: "marvel", title: "Giant-Size X-Men #1", year: "1975", note: "Tempestade, Colossus, Noturno e Wolverine redefinem os mutantes.", focus: "X-Men", url: "https://www.marvel.com/comics/issue/8797/giant-size_x-men_1975_1", platform: "Marvel Unlimited" },
  { publisher: "marvel", title: "A Saga da Fênix Negra", year: "1980", note: "Jean Grey, o poder absoluto e o preço que os X-Men pagam por amá-la.", focus: "X-Men", url: "https://en.wikipedia.org/wiki/The_Dark_Phoenix_Saga", platform: "Marvel Unlimited" },
  { publisher: "marvel", title: "A Última Caçada de Kraven", year: "1987", note: "Kraven enterra o Aranha para provar que é melhor do que ele.", focus: "Spider-Man", url: "https://en.wikipedia.org/wiki/Kraven%27s_Last_Hunt", platform: "Marvel Unlimited" },
  { publisher: "marvel", title: "Demolidor: A Queda de Murdock", year: "1986", note: "O Rei do Crime descobre a identidade de Matt e desmonta sua vida.", focus: "Demolidor", url: "https://en.wikipedia.org/wiki/Daredevil:_Born_Again", platform: "Marvel Unlimited" },
  { publisher: "marvel", title: "Secret Wars #1", year: "1984", note: "Heróis e vilões sequestrados para o Mundo Bélico pelo Beyonder.", focus: "Evento", url: "https://www.marvel.com/comics/issue/10580/secret_wars_1984_1", platform: "Marvel Unlimited" },
  { publisher: "marvel", title: "The Infinity Gauntlet #1", year: "1991", note: "Thanos estala os dedos e metade do universo desaparece.", focus: "Cósmico", url: "https://www.marvel.com/comics/issue/9286/infinity_gauntlet_1991_1", platform: "Marvel Unlimited" },
  { publisher: "marvel", title: "House of M #1", year: "2005", note: "Wanda reescreve a realidade: 'Chega de mutantes'.", focus: "Evento", url: "https://www.marvel.com/comics/issue/2092/house_of_m_2005_1", platform: "Marvel Unlimited" },
  { publisher: "marvel", title: "Civil War #1", year: "2006", note: "Homem de Ferro contra Capitão América: o registro divide os heróis.", focus: "Evento", url: "https://www.marvel.com/comics/issue/4216/civil_war_2006_1", platform: "Marvel Unlimited" },
  { publisher: "marvel", title: "Planeta Hulk", year: "2006", note: "Exilado no espaço, Hulk vira gladiador e depois rei de Sakaar.", focus: "Hulk", url: "https://en.wikipedia.org/wiki/Planet_Hulk", platform: "Marvel Unlimited" },
  { publisher: "marvel", title: "O Imortal Hulk", year: "2018", note: "Terror e gama: a fase mais assustadora do Golias Esmeralda.", focus: "Hulk", url: "https://en.wikipedia.org/wiki/The_Immortal_Hulk", platform: "Marvel Unlimited" },
  { publisher: "marvel", title: "Ultimate Spider-Man #1", year: "2000", note: "A origem de Peter recontada para novos leitores — porta de entrada perfeita.", focus: "Spider-Man", url: "https://en.wikipedia.org/wiki/Ultimate_Spider-Man", platform: "Marvel Unlimited" },
  { publisher: "marvel", title: "House of X / Powers of X", year: "2019", note: "Krakoa: a reinvenção mutante que mudou tudo de novo.", focus: "X-Men", url: "https://en.wikipedia.org/wiki/House_of_X_and_Powers_of_X", platform: "Marvel Unlimited" },
  { publisher: "dc", title: "Action Comics #1", year: "1938", note: "O primeiro voo (ou salto) do Superman e o nascimento do gênero.", focus: "Superman", url: "https://en.wikipedia.org/wiki/Action_Comics_1", platform: "DC Universe Infinite" },
  { publisher: "dc", title: "Detective Comics #27", year: "1939", note: "O caso do sindicato químico: a estreia do Batman.", focus: "Batman", url: "https://en.wikipedia.org/wiki/Detective_Comics_27", platform: "DC Universe Infinite" },
  { publisher: "dc", title: "Batman: Ano Um", year: "1987", note: "Frank Miller reconta o primeiro ano de Bruce Wayne em Gotham.", focus: "Batman", url: "https://en.wikipedia.org/wiki/Batman:_Year_One", platform: "DC Universe Infinite" },
  { publisher: "dc", title: "A Piada Mortal", year: "1988", note: "Coringa, Barbara Gordon e um dia terrível que mudou a DC.", focus: "Batman", url: "https://en.wikipedia.org/wiki/Batman:_The_Killing_Joke", platform: "DC Universe Infinite" },
  { publisher: "dc", title: "O Cavaleiro das Trevas", year: "1986", note: "Bruce Wayne aposentado volta à capa em um futuro brutal.", focus: "Batman", url: "https://en.wikipedia.org/wiki/The_Dark_Knight_Returns", platform: "DC Universe Infinite" },
  { publisher: "dc", title: "Crise nas Infinitas Terras", year: "1985", note: "O Multiverso inteiro em guerra — e as mortes que definiram uma era.", focus: "Evento", url: "https://en.wikipedia.org/wiki/Crisis_on_Infinite_Earths", platform: "DC Universe Infinite" },
  { publisher: "dc", title: "A Morte do Superman", year: "1992", note: "Apocalypse chega e o mundo para: o dia em que o Superman caiu.", focus: "Superman", url: "https://en.wikipedia.org/wiki/The_Death_of_Superman", platform: "DC Universe Infinite" },
  { publisher: "dc", title: "Reino do Amanhã", year: "1996", note: "Alex Ross pinta o futuro da DC em guerra de gerações.", focus: "Evento", url: "https://en.wikipedia.org/wiki/Kingdom_Come_(comics)", platform: "DC Universe Infinite" },
  { publisher: "dc", title: "Wonder Woman: Ano Um", year: "2016", note: "Diana deixa Themyscira e descobre o mundo dos homens.", focus: "Wonder Woman", url: "https://en.wikipedia.org/wiki/Wonder_Woman:_Year_One", platform: "DC Universe Infinite" },
  { publisher: "dc", title: "Flash: Renascimento", year: "2009", note: "Barry Allen volta dos mortos e a Força de Aceleração é redefinida.", focus: "Flash", url: "https://en.wikipedia.org/wiki/The_Flash:_Rebirth", platform: "DC Universe Infinite" },
  { publisher: "dc", title: "Flashpoint", year: "2011", note: "Barry salva a mãe e quebra a linha do tempo inteira.", focus: "Evento", url: "https://en.wikipedia.org/wiki/Flashpoint_(comics)", platform: "DC Universe Infinite" },
  { publisher: "dc", title: "Green Lantern: A Guerra da Corporação Sinestro", year: "2007", note: "Sinestro monta seu exército do medo contra os Lanternas.", focus: "Lanterna Verde", url: "https://en.wikipedia.org/wiki/Sinestro_Corps_War", platform: "DC Universe Infinite" },
  { publisher: "dc", title: "A Noite Mais Densa", year: "2009", note: "Anéis negros ressuscitam os mortos e todo o espectro vai à guerra.", focus: "Lanterna Verde", url: "https://en.wikipedia.org/wiki/Blackest_Night", platform: "DC Universe Infinite" },
  { publisher: "dc", title: "Novos Titãs: O Contrato de Judas", year: "1984", note: "Terra, Deathstroke e a traição que marcou os Titãs para sempre.", focus: "Titãs", url: "https://en.wikipedia.org/wiki/The_Judas_Contract", platform: "DC Universe Infinite" },
  { publisher: "dc", title: "Liga da Justiça: Torre de Babel", year: "2000", note: "Os planos secretos do Batman contra a própria Liga caem em mãos erradas.", focus: "Liga da Justiça", url: "https://en.wikipedia.org/wiki/JLA:_Tower_of_Babel", platform: "DC Universe Infinite" },
];
