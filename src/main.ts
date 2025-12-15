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
  selectedTiles: Tile[];
};

const state: State = {
  tiles: shuffleUnsolved(
    solution.map((group) => ({
      tiles: group.words.map((word) => ({ word })),
      solvedDifficulty: null,
    }))
  ),
  selectedTiles: [],
};

function drawSolvedRow(tileRow: TileRow) {
  const row = document.createElement("div");
  row.classList.add("row");
  row.textContent = tileRow.tiles.map((tile) => tile.word).join("");
  return row;
}

function toggleTileSelected(tile: Tile) {
  if (state.selectedTiles.includes(tile)) {
    document.getElementById(tile.word)!.classList.remove("selected");
    state.selectedTiles = state.selectedTiles.filter((t) => t !== tile);
  } else if (state.selectedTiles.length < TILES_PER_ROW) {
    document.getElementById(tile.word)!.classList.add("selected");
    state.selectedTiles = [...state.selectedTiles, tile];
  }
}

function drawUnsolvedTile(tile: Tile) {
  const button = document.createElement("button");
  button.id = tile.word;
  button.classList.add("unsolved");
  button.textContent = tile.word;
  button.addEventListener("click", () => {
    toggleTileSelected(tile);
  });
  return button;
}

function drawRow(tileRow: TileRow) {
  if (tileRow.solvedDifficulty !== null) {
    return drawSolvedRow(tileRow);
  } else {
    const row = document.createElement("div");
    row.classList.add("row");
    tileRow.tiles.forEach((tile) => {
      row.appendChild(drawUnsolvedTile(tile));
    });
    return row;
  }
}

function drawState(state: State) {
  const grid = document.createElement("div");
  grid.classList.add("grid");
  state.tiles.forEach((tileRow) => {
    grid.appendChild(drawRow(tileRow));
  });
  return grid;
}

const app = document.querySelector<HTMLDivElement>("#app")!;
app.replaceChildren(drawState(state));
