import { random, shuffle } from '../utils/random'

interface Options {
    TOTAL_CARDS: number
    MAX_NUM: number
    CARD_SIZE: [number, number]
    WINNERS: [number, number]
}

export const presets: Record<string, Options> = {
    example: {
        TOTAL_CARDS: 6,
        MAX_NUM: 100,
        CARD_SIZE: [5, 8],
        WINNERS: [0, 5],
    },
    normal: {
        TOTAL_CARDS: 200,
        MAX_NUM: 100,
        CARD_SIZE: [10, 25],
        WINNERS: [0, 11],
    },
    large: {
        TOTAL_CARDS: 100000,
        MAX_NUM: 100,
        CARD_SIZE: [10, 25],
        WINNERS: [0, 11],
    },
}

const range = (min: number, max: number) => Array.from({ length: max - min }, (_, i) => i + min)

export function generate({
    TOTAL_CARDS,
    MAX_NUM,
    CARD_SIZE: [WIN_SIZE, DRAW_SIZE],
    WINNERS: [MIN_WINS, MAX_WINS],
}: Options) {
    console.assert(DRAW_SIZE - MIN_WINS + WIN_SIZE <= MAX_NUM, "Not enough numbers to fill cards")
    console.assert((MAX_WINS - 1) <= WIN_SIZE, "Not enough winners to fill cards")

    // TODO: Optimize...? this took 3 minutes for me to run

    let cards: [number[], number[]][] = []
    for (let cardIdx = 0; cardIdx < TOTAL_CARDS; cardIdx++) {
        // NOTE: Using x**(5/2) as an easing function otherwise the card copies get unwieldy
        const winnerCount = Math.floor(random(`winner-count:${cardIdx}`)[0] ** (5 / 2) * (MAX_WINS - MIN_WINS)) + MIN_WINS
        const shuffled = shuffle(range(0, MAX_NUM), `shuffle:${cardIdx}`)
        const wins = shuffled.slice(0, WIN_SIZE)
        const draws = shuffled.slice(winnerCount - DRAW_SIZE)
        const winners = shuffle(wins.slice(), `winners:${cardIdx}`).slice(0, winnerCount)
        draws.push(...winners)
        shuffle(draws, `draws:${cardIdx}:shuffle`)
        cards.push([wins, draws])
    }

    return cards.map(([wins, draws], i) => {
        const numbers = [
            wins.map(n => n.toString().padStart(`${MAX_NUM - 1}`.length, " ")).join(" "),
            draws.map(n => n.toString().padStart(`${MAX_NUM - 1}`.length, " ")).join(" "),
        ].join(" | ")
        return `Card ${(i + 1).toString().padStart(TOTAL_CARDS.toString().length, " ")}: ${numbers}`
    }).join("\n")
}
