import { random, shuffle } from "../utils"

interface Options {
    MAX_VALUE: number
    INITIAL_COUNT: number
    INITIAL_RATIO: number
    MAPPING_HOLES: [number, number]
    MAPPING_COUNT: number
    MAP_STAGES: string[]
}
// The average size of an initial range would be MAX_VALUE / INITIAL_RATIO

const ORIG_MAP_STAGES = "seed soil fertilizer water light temperature humidity location".split(" ")
export const presets: Record<string, Options> = {
    example: {
        MAX_VALUE: 100,
        INITIAL_COUNT: 2,
        INITIAL_RATIO: 10,
        MAPPING_HOLES: [0, 3],
        MAPPING_COUNT: 4,
        MAP_STAGES: ORIG_MAP_STAGES,
    },
    normal: {
        MAX_VALUE: 2**32,
        INITIAL_COUNT: 10,
        INITIAL_RATIO: 30,
        MAPPING_HOLES: [0, 3],
        MAPPING_COUNT: 50,
        MAP_STAGES: ORIG_MAP_STAGES,
    },
    large: {
        MAX_VALUE: 2**32,
        INITIAL_COUNT: 1000,
        INITIAL_RATIO: 10000,
        MAPPING_HOLES: [0, 3],
        MAPPING_COUNT: 10000,
        MAP_STAGES: ORIG_MAP_STAGES,
        // MAP_STAGES: MAP_STAGES.concat(..."pesticide tillage compost irrigation pollination silage density brix germination ph erosion carbon yield".split(" ")),
    },
}

type Mapping = [dest: number, source: number, size: number]

export function generate({
    MAX_VALUE,
    INITIAL_COUNT,
    INITIAL_RATIO,
    MAPPING_HOLES,
    MAPPING_COUNT,
    MAP_STAGES,
}: Options): string {
    console.assert(INITIAL_RATIO >= INITIAL_COUNT, "Initial ratio should be greater than or equal to initial count")

    const initialMidpoints = Array.from({ length: INITIAL_RATIO - 1 }, (_, i) => {
        const value = Math.floor(random(`initial:${i}`) * MAX_VALUE)
        return value
    })
    initialMidpoints.sort((a, b) => a - b)
    console.assert(
        initialMidpoints.every((v, i, a) => a.indexOf(v) === i && v > 0 && v < MAX_VALUE),
        "Midpoints should not touch each other or the (0, MAX_VALUE) bounds"
    )

    const initialSizes = Array.from({ length: INITIAL_RATIO }, (_, i) => {
        const min = i === 0 ? 0 : initialMidpoints[i - 1]
        const max = i === INITIAL_RATIO - 1 ? MAX_VALUE : initialMidpoints[i]
        return max - min
    })
    const initialRanges: [number, number][] = []
    let initialStart = 0
    for (let i = 0; i < initialSizes.length; i++) {
        initialRanges.push([initialStart, initialSizes[i]])
        initialStart += initialSizes[i]
    }

    shuffle(initialRanges, "initial:ranges")
    initialRanges.length = INITIAL_COUNT

    const stages: Mapping[][] = []

    for (let stageIdx = 0; stageIdx < MAP_STAGES.length - 1; stageIdx++) {
        // TODO: Fix midpoints that touch each other or the (0, MAX_VALUE) bounds
        const stageMidpoints = Array.from({ length: MAPPING_COUNT - 1 }, (_, i) => {
            const value = Math.floor(random(`${MAP_STAGES[stageIdx]}:${i}`) * MAX_VALUE)
            return value
        })
        stageMidpoints.sort((a, b) => a - b)
        console.assert(
            stageMidpoints.every((v, i, a) => a.indexOf(v) === i && v > 0 && v < MAX_VALUE),
            "Midpoints should not touch each other or the (0, MAX_VALUE) bounds"
        )

        const mappingSizes = Array.from({ length: MAPPING_COUNT }, (_, i) => {
            const min = i === 0 ? 0 : stageMidpoints[i - 1]
            const max = i === MAPPING_COUNT - 1 ? MAX_VALUE : stageMidpoints[i]
            return max - min
        })

        // TODO: Ensure holes arent touching each other, and that they don't isolate single mappings

        const holeCount = Math.floor(random(`${MAP_STAGES[stageIdx]}:hole-count`) * (MAPPING_HOLES[1] - MAPPING_HOLES[0])) + MAPPING_HOLES[0]
        const mappingIdxHoles = shuffle(mappingSizes.map((_, i) => i), `${MAP_STAGES[stageIdx]}:holes`).slice(0, holeCount)
        mappingIdxHoles.sort((a, b) => a - b)

        const mappingSections: number[][] = []
        for (let holeIdx = 0; holeIdx < mappingIdxHoles.length; holeIdx++) {
            if (holeIdx === 0) mappingSections.push(mappingSizes.slice(0, mappingIdxHoles[holeIdx]))
            else mappingSections.push(mappingSizes.slice(mappingIdxHoles[holeIdx - 1] + 1, mappingIdxHoles[holeIdx]))
            if (holeIdx === mappingIdxHoles.length - 1) mappingSections.push(mappingSizes.slice(mappingIdxHoles[holeIdx] + 1))
        }
        if (mappingIdxHoles.length === 0) mappingSections.push(mappingSizes.slice())

        const mappings: Mapping[] = []
        let source = 0
        let dest = 0
        for (let sectionIdx = 0; sectionIdx < mappingSections.length; sectionIdx++) {
            const section = mappingSections[sectionIdx]
            // TODO: Ensure each element has been shuffled
            const sectionIdxShuffle = shuffle(section.map((_, i) => i), `${MAP_STAGES[stageIdx]}:${sectionIdx}`)

            // Add source and size
            for (let i = 0; i < section.length; i++) {
                mappings.push([0, source, section[i]])
                source += section[i]
            }
            // Add dest
            for (let i = 0; i < section.length; i++) {
                const mappedDest = section[sectionIdxShuffle[i]]
                mappings[mappings.length - section.length + sectionIdxShuffle[i]][0] = dest
                dest += mappedDest
            }

            console.assert(source === dest, "Source and destination offset should be equal after each section")
            // Increment by hole
            if (sectionIdx < mappingSections.length - 1) {
                const holeSize = mappingSizes[mappingIdxHoles[sectionIdx]]
                source += holeSize
                dest += holeSize
            }
        }

        console.assert(source === MAX_VALUE, "Source offset should be equal to MAX_VALUE after all sections")
        console.assert(dest === MAX_VALUE, "Destination offset should be equal to MAX_VALUE after all sections")

        shuffle(mappings, `${MAP_STAGES[stageIdx]}:mappings`)
        stages.push(mappings)
    }

    const initialText = `${MAP_STAGES[0]}s: ${initialRanges.map(r => r.join(" ")).join(" ")}`

    const stageTexts = stages.map((stage, i) => {
        let stageText = `${MAP_STAGES[i]}-to-${MAP_STAGES[i + 1]} map:\n`
        stageText += stage.map(n => n.join(" ")).join("\n")
        return stageText
    })

    return [initialText, ...stageTexts].join("\n\n")
}
