import { mkdirSync, writeFileSync } from "fs"
import * as day5 from "./05"

Math.random = function () {
    throw new Error("Don't use Math.random()! Use random() from 'utils.ts' instead.")
}

const days = {
    "05": day5,
}
for (const [number, day] of Object.entries(days)) {
    mkdirSync(`dist/${number}`, { recursive: true })
    for (const [preset, opts] of Object.entries(day.presets)) {
        writeFileSync(`dist/${number}/input_${preset}.txt`, day.generate(opts))
        console.log(`Generated dist/${number}/input_${preset}.txt`)
    }
}
