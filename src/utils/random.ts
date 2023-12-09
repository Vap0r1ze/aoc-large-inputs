import { createHash } from "crypto"

/** 64 random bytes */
export function randomBytes(seed: string) {
    const hash = createHash("sha512")
    hash.update(`aoc-li:${seed}`)
    return hash.digest()
}
/** 16 random floats between `[0, 1)` */
export function random(seed: string) {
    const hash = createHash("sha512")
    hash.update(`aoc-li:${seed}`)
    const buffer = randomBytes(seed)
    return Array.from({ length: buffer.length / 4 }, (_, i) => (
        buffer.readUInt32LE(i * 4) / (0xFFFFFFFF + 1)
    ))
}

/** A random integer between `[min, max)` */
export function randomN(seed: string, min: number, max: number) {
    return Math.floor(random(seed)[0] * (max - min) + min)
}
/** A sequence of `length` random integers between `[min, max)` */
export function randomSeq(seed: string, length: number, min: number, max: number) {
    const seq: number[] = []
    for (let i = 0; i < Math.ceil(length / 16); i++) {
        seq.push(...random(`${seed}:${i}`).map(x => Math.floor(x * (max - min) + min)))
    }
    seq.length = length
    return seq
}
export function randomBits(seed: string, length: number) {
    const seq = Array<boolean>(length).fill(false)
    for (let i = 0; i < Math.ceil(length / 512); i++) {
        const buffer = randomBytes(`${seed}:${i}`)
        for (let j = 0; j < 512; j++) {
            seq[i * 512 + j] = Boolean(buffer.readUInt8(Math.floor(j / 8)) & (1 << (j % 8)))
        }
    }
    seq.length = length
    return seq
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
