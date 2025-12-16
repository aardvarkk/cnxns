import "./style.css";

const TILES_PER_ROW = 4;
// const WAIT_PER_FAILURE = 2000;
const WAIT_PER_FAILURE = 120_000;

const Difficulty = {
  YELLOW: "yellow",
  GREEN: "green",
  BLUE: "blue",
  PURPLE: "purple",
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
  failures: Date[];
  allowAfter: Date;
  won: boolean;
};

const state: State = {
  tiles: shuffleUnsolved(
    solution.map((group) => ({
      tiles: group.words.map((word) => ({ word })),
      solvedDifficulty: null,
    }))
  ),
  selectedTiles: [],
  failures: [],
  allowAfter: new Date(),
  won: false,
};

function drawSolvedRow(tileRow: TileRow) {
  const solvedRow = document.createElement("div");
  solvedRow.classList.add("solved-row");
  solvedRow.style.backgroundColor = `var(--${tileRow.solvedDifficulty!})`;

  const solutionGroup = solution.find(
    (group) => group.difficulty === tileRow.solvedDifficulty
  )!;

  const name = document.createElement("span");
  name.classList.add("name");
  name.textContent = solutionGroup.name;
  solvedRow.appendChild(name);

  const words = document.createElement("span");
  words.classList.add("words");
  words.textContent = solutionGroup.words.join(", ");
  solvedRow.appendChild(words);

  return solvedRow;
}

function toggleTileSelected(tile: Tile) {
  if (state.selectedTiles.includes(tile)) {
    state.selectedTiles = state.selectedTiles.filter((t) => t !== tile);
  } else if (state.selectedTiles.length < TILES_PER_ROW) {
    state.selectedTiles = [...state.selectedTiles, tile];
  }

  redraw();
}

function drawUnsolvedTile(tile: Tile) {
  const button = document.createElement("button");
  button.id = tile.word;
  button.classList.add("unsolved", "tile");
  if (state.selectedTiles.includes(tile)) {
    button.classList.add("selected");
  }
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

function drawGrid(state: State) {
  const grid = document.createElement("div");
  grid.classList.add("grid");
  state.tiles.forEach((tileRow) => {
    grid.appendChild(drawRow(tileRow));
  });
  return grid;
}

function drawButtons(state: State) {
  const buttonRow = document.createElement("div");
  buttonRow.classList.add("button-row");

  const shuffleButton = document.createElement("button");
  shuffleButton.textContent = "Shuffle";
  shuffleButton.addEventListener("click", () => {
    state.tiles = shuffleUnsolved(state.tiles);
    redraw();
  });
  buttonRow.appendChild(shuffleButton);

  const deselectAllButton = document.createElement("button");
  deselectAllButton.textContent = "Deselect All";
  deselectAllButton.addEventListener("click", () => {
    state.selectedTiles = [];
    redraw();
  });
  buttonRow.appendChild(deselectAllButton);

  const submitButton = document.createElement("button");

  const waiting = new Date() < state.allowAfter;
  submitButton.disabled =
    state.selectedTiles.length !== TILES_PER_ROW || waiting;
  submitButton.id = "submit";
  submitButton.textContent = waiting
    ? `Wrong! Wait ${Math.ceil(
        (state.allowAfter.getTime() - Date.now()) / 60_000
      )} minutes!`
    : "Submit";
  submitButton.addEventListener("click", () => {
    const solutionGroupVals = state.selectedTiles.map((tile) => {
      return solution.find((group) => group.words.includes(tile.word))!
        .difficulty;
    });

    const solvedDifficulty = solutionGroupVals[0];
    if (solutionGroupVals.every((val) => val === solvedDifficulty)) {
      // Take all solved rows
      const newGrid = state.tiles.filter(
        (row) => row.solvedDifficulty !== null
      );

      // Add the new solved row
      newGrid.push({
        tiles: state.selectedTiles.map((tile) => ({ word: tile.word })),
        solvedDifficulty: solvedDifficulty,
      });

      if (newGrid.length === solution.length) {
        state.won = true;
      }

      // Remaining tiles are those which aren't solved and aren't in the just-solved set
      const newUnsolvedTiles = state.tiles
        .flatMap((row) => (row.solvedDifficulty === null ? row.tiles : []))
        .filter((tile) => !state.selectedTiles.includes(tile));

      // Add the new unsolved tiles in rows
      for (let i = 0; i < newUnsolvedTiles.length; i += TILES_PER_ROW) {
        newGrid.push({
          tiles: newUnsolvedTiles.slice(i, i + TILES_PER_ROW),
          solvedDifficulty: null,
        });
      }

      state.tiles = newGrid;
      state.selectedTiles = [];

      redraw();
    } else {
      state.failures.push(new Date());
      const waitTime = state.failures.length * WAIT_PER_FAILURE;
      state.allowAfter = new Date(Date.now() + waitTime);
      setTimeout(() => {
        redraw();
      }, waitTime);
      redraw();
    }
  });
  buttonRow.appendChild(submitButton);

  return buttonRow;
}

function redraw() {
  const app = document.querySelector<HTMLDivElement>("#app")!;

  if (state.won) {
    app.textContent = "You did it! Merry Christmas, Lanclarksters!";
  } else {
    const grid = drawGrid(state);
    const buttons = drawButtons(state);
    app.replaceChildren(grid, buttons);
  }
}

redraw();
