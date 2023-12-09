import { primesBetween } from "../utils/numbers"
import { random, randomBits, randomItem, randomN, shuffle } from "../utils/random"

interface Options {
    GHOSTS: number
    INSTR_SIZE: [number, number]
    CYCLE_SIZE: [number, number]
}

export const presets: Record<string, Options> = {
    normal: {
        GHOSTS: 6,
        INSTR_SIZE: [250, 300],
        CYCLE_SIZE: [40, 100],
    },
}

const enum NodeType {
    Start,
    End,
    Normal,
}

let generatorCount = 0
function nodeGenerator() {
    const generatorId = generatorCount++
    let nodeCount = 0
    return function randomNode(type: NodeType) {
        const n = randomN(`node:${generatorId}:${nodeCount++}`, 0, 26 * 26 * 24)
        let digits = [
            n % 26,
            Math.floor(n / 26) % 26,
            Math.floor(n / (26 * 24)) % 24 + 1,
        ]
        if (type === NodeType.Start) digits[2] = 0
        if (type === NodeType.End) digits[2] = 25
        return digits.map(x => String.fromCharCode(x + 65)).join("")
    }
}

export function generate({ GHOSTS, INSTR_SIZE, CYCLE_SIZE }: Options) {
    const randomNode = nodeGenerator()

    const possibleInstrSizes = primesBetween(...INSTR_SIZE)
    const instrSize = randomItem("instr-size", possibleInstrSizes)
    // TODO: carefully craft the instructions to make sure ghosts
    // only hit the end after a multiple of instructions
    const instr = randomBits("instr", instrSize).map(x => x ? "R" : "L").join("")

    const possibleCycleSizes = shuffle(primesBetween(...CYCLE_SIZE), "cycle-sizes")
    const cycleSizes = possibleCycleSizes.slice(0, GHOSTS)

    const nodes = new Set<string>()
    function addNode(factory: () => string) {
        for (let i = 0; i < 100; i++) {
            const node = factory()
            if (!nodes.has(node)) {
                nodes.add(node)
                return node
            }
        }
        throw new Error("Failed to generate node: too many collisions")
    }

    const graph = new Map<string, [string, string]>()
    for (let ghostIdx = 0; ghostIdx < GHOSTS; ghostIdx++) {
        const isFirstGhost = ghostIdx === 0
        const cycleSize = cycleSizes[ghostIdx]
        const startNode = addNode(() => isFirstGhost ? "AAA" : randomNode(NodeType.Start))

        let prevNodes = [startNode]
        for (let i = 0; i < cycleSize; i++) {
            const isEnd = i === cycleSize - 1
            const left = addNode(() => randomNode(NodeType.Normal))
            const right = isEnd
                ? addNode(() => isFirstGhost ? "ZZZ" : randomNode(NodeType.End))
                : addNode(() => randomNode(NodeType.Normal))
            if (isEnd) {
                graph.set(prevNodes[0], [left, left])
                graph.set(prevNodes[1], [left, right])
            }
            else prevNodes.forEach(prevNode => graph.set(prevNode, [left, right]))
            prevNodes = [left, right]
        }

        const [startLeft, startRight] = graph.get(startNode)!
        graph.set(prevNodes[0], [startLeft, startRight])
        graph.set(prevNodes[1], [startRight, startLeft])
    }

    const graphDefs = Array.from(graph.entries()).map(([node, [left, right]]) => (
        `${node} = (${left}, ${right})`
    ))
    shuffle(graphDefs, "graph-defs")
    return `${instr}\n\n${graphDefs.join("\n")}`
}
