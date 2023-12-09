import { randomN } from "../utils"

interface Options {
    RACES: number
    TIME_RANGE: [number, number]
}

export const presets: Record<string, Options> = {
    normal: {
        RACES: 4,
        TIME_RANGE: [40, 80],
    },
    large: {
        RACES: 1000,
        TIME_RANGE: [10000, 1600],
    }
}

export function generate({ RACES, TIME_RANGE }: Options) {
    const times = Array.from({ length: RACES }, (_, i) => {
        return randomN(`time:${i}`, ...TIME_RANGE)
    })
    const distances = times.map(time => {
        const max = time ** 2 / 4 - 5
        return randomN(`distance:${time}`, 0, max)
    })

    const bigTime = BigInt(times.join(""))
    const bigDistance = BigInt(distances.join(""))
    console.assert(bigTime ** 2n / 4n - 5n >= bigDistance, "Distance is too close to max distance")

    let timesText = times.map(time => `${time}`)
    let distancesText = distances.map(distance => `${distance}`)
    timesText = timesText.map((time, i) => time.padStart(distancesText[i].length, " "))
    distancesText = distancesText.map((distance, i) => distance.padEnd(timesText[i].length, " "))

    return [
        ["Time:    ", ...timesText].join("  "),
        ["Distance:", ...distancesText].join("  "),
    ].join("\n")
}
