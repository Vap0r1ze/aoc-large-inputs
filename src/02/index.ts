import {random} from "../utils";

interface Options {
  TOTAL_GAMES: number
  ROUND_RANGE: [number, number]
}

export const presets: Record<string, Options> = {
  example: {
    TOTAL_GAMES: 5,
    ROUND_RANGE: [2, 3],
  },
  normal: {
    TOTAL_GAMES: 100,
    ROUND_RANGE: [2, 6],
  },
  large: {
    TOTAL_GAMES: 1_000_000,
    ROUND_RANGE: [20, 50],
  },
}

// This particular variable is influenced by the puzzle instructions. If changed, it may make part 1 solutions
// predictable. There is likely a much better way to determine this, but it kinda sorta works.
const MAX_CUBES_OF_COLOR = 14
const CUBE_COLORS = ["red", "green", "blue"]

function rand(seed: string, min: number, max: number) {
  return Math.floor(random(seed) * (max - min)) + min
}

export function generate({
  TOTAL_GAMES,
  ROUND_RANGE: [MIN_ROUNDS, MAX_ROUNDS],
}: Options): string {
  console.assert(MAX_ROUNDS > MIN_ROUNDS, "Maximum number of rounds must be larger than minimum number of rounds")
  const lines: string[] = []
  for (let gameId = 1; gameId <= TOTAL_GAMES; gameId++) {
    const rounds: string[] = []
    const numRounds = rand(`game:${gameId}`, MIN_ROUNDS, MAX_ROUNDS)
    for (let round = 0; round < numRounds; round++) {
      const cubes = CUBE_COLORS.map(color => ({
        color,
        count: rand(`game:${gameId}::round:${round}::color:${color}`, 0, MAX_CUBES_OF_COLOR)
      })).filter(v => v.count > 0)
      if (cubes.length === 0) {
        // If no cubes were drawn, ideally we'd redo the round, but that unfortunately isn't possible with the seeded
        // random implementation we're using. Instead, we'll just skip this round.
        continue
      }
      rounds.push(cubes.map(v => `${v.count} ${v.color}`).join(", "))
    }
    console.assert(rounds.length > 0, "Each game must have at least one round")
    lines.push(`Game ${gameId}: ${rounds.join("; ")}`)
  }
  return lines.join("\n")
}

