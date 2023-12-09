import { createHash } from "crypto"

/** A random float within the range [0, 1) */
export function random(seed: string) {
    const hash = createHash("sha256")
    hash.update(`aoc-li:${seed}`)
    const buffer = hash.digest()
    return buffer.readUInt32LE(0) / (0xFFFFFFFF + 1)
}

/** A random integer within the range [min, max) */
export function randomN(seed: string, min: number, max: number) {
    return Math.floor(random(seed) * (max - min) + min)
}

// Fisher-Yates shuffle
export function shuffle<T>(arr: T[], seed: string) {
    const shuffled = arr
    for (let i = 0; i < arr.length - 1; i++) {
        var rng = createHash("sha256").update(`${seed}:${i}`).digest().readBigUInt64BE()
        var j = i + Number(rng % BigInt(arr.length - i));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}
