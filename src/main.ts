import "./style.css";

const TILES_PER_ROW = 4;

const Difficulty = {
  YELLOW: 0,
  GREEN: 1,
  BLUE: 2,
  PURPLE: 3,
} as const;

type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];

type Tile = {
  word: string;
};

type TileRow = {
  tiles: Tile[];
  solvedDifficulty: Difficulty | null;
};

type TileGrid = TileRow[];

type SolutionGroup = {
  name: string;
  words: string[];
  difficulty: Difficulty;
};

const solution: SolutionGroup[] = [
  {
    name: "TARGET OF A SCAM",
    words: ["MARK", "PATSY", "PIGEON", "SAP"],
    difficulty: Difficulty.YELLOW,
  },
  {
    name: "BANDLEADERS",
    words: ["KC", "PRINCE", "SLY", "STING"],
    difficulty: Difficulty.GREEN,
  },
  {
    name: "TWELVE DAYS SINGULARS",
    words: ["HEN", "GOOSE", "PIPER", "RING"],
    difficulty: Difficulty.BLUE,
  },
  {
    name: "ANIMATED FILMS MISSING A LETTER",
    words: ["ELO", "MOAN", "SOL", "U"],
    difficulty: Difficulty.PURPLE,
  },
];

function shuffleUnsolved(tiles: TileGrid): TileGrid {
  const unsolvedTiles = tiles.flatMap((row) =>
    row.solvedDifficulty === null ? row.tiles : []
  );
  const shuffledUnsolvedTiles = unsolvedTiles.sort(() => Math.random() - 0.5);

  return tiles.map((row) => {
    if (row.solvedDifficulty !== null) {
      return row;
    } else {
      return {
        tiles: shuffledUnsolvedTiles.splice(0, TILES_PER_ROW),
        solvedDifficulty: null,
      };
    }
  });
}

type State = {
  tiles: TileGrid;
};

const state: State = {
  tiles: shuffleUnsolved(
    solution.map((group) => ({
      tiles: group.words.map((word) => ({ word })),
      solvedDifficulty: null,
    }))
  ),
};

function drawState(state: State) {
  return `
    <div>
      ${state.tiles
        .map(
          (row) => `
        <div>${row.tiles.map((tile) => tile.word).join(" ")}</div>
      `
        )
        .join("")}
    </div>
  `;
}

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  ${drawState(state)}
`;
