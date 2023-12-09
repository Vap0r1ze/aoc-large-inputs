/** A list of prime numbers between [min, max) */
export function primesBetween(min: number, max: number) {
    let sieve = 2n ** BigInt(max)
    const maxFactor = BigInt(Math.floor(Math.sqrt(max)))
    for (let i = 2n; i <= maxFactor; i++) {
        if ((sieve & 2n ** i) === 0n) {
            for (let j = i * i; j < max; j += i) {
                sieve |= 2n ** j
            }
        }
    }

    const primes: number[] = []
    for (let i = BigInt(min); i < max; i++) {
        if ((sieve & 2n ** i) === 0n) {
            primes.push(Number(i))
        }
    }
    return primes
}
