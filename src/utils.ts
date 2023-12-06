import { createHash } from "crypto"

export function random(seed: string) {
    const hash = createHash("sha256")
    hash.update(`aoc-li:${seed}`)
    const buffer = hash.digest();
    return buffer.readUInt32LE(0) / 0xffffffff;
}

// Fisher-Yates shuffle
export function shuffle<T>(arr: T[], seed: string) {
    const shuffled = arr;
    for (let i = 0; i < arr.length - 1; i++) {
        var rng = createHash("sha256").update(`${seed}:${i}`).digest().readBigUInt64BE();
        var j = i + Number(rng % BigInt(arr.length - i));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
