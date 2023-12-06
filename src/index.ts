import { existsSync, mkdirSync, writeFileSync } from "fs"
import * as day2 from "./02"
import * as day4 from "./04"
import * as day5 from "./05"
import * as day6 from "./06"

const NO_OVERWRITE = process.argv.includes("--no-overwrite")
Math.random = function () {
    throw new Error("Don't use Math.random()! Use random() from 'utils.ts' instead.")
}

const days = {
    "02": day2,
    "04": day4,
    "05": day5,
    "06": day6,
}
for (const [number, day] of Object.entries(days)) {
    mkdirSync(`dist/${number}`, { recursive: true })
    for (const [preset, opts] of Object.entries(day.presets)) {
        if (NO_OVERWRITE && existsSync(`dist/${number}/input_${preset}.txt`)) {
            console.log(`Skipping dist/${number}/input_${preset}.txt`)
            continue
        }
        writeFileSync(`dist/${number}/input_${preset}.txt`, day.generate(opts as never))
        console.log(`Generated dist/${number}/input_${preset}.txt`)
    }
}
