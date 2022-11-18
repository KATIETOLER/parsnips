/* ~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~
                            Types 
~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~ */

export type Result = {
    success: boolean,
    value: string,
    residual: string
}

/** 
 * Convenience for creating "failure" results
 */
export const DefaultFailure: (input: string) => Result = (input) => {
    return {
        success: false,
        value: '',
        residual: input 
    }
}

export type Parser = (input: string) => Result

/* ~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~
                          Combinators 
~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~ */

export const sequence = (...parsers: Parser[]) => (input: string): Result => {
    let result = DefaultFailure(input)
    let curInput = input
    let acc = ''
    parsers.every((parser) => {
        result = parser(curInput)
        if (result.success) {
            acc += result.value
            curInput = result.residual
            return true
        } else {
            return false
        }
    })

    if (result.success) {
        return {
            success: true,
            value: acc, 
            residual: input.substring(acc.length)
        }
    } else {
        return DefaultFailure(input)
    }
}

export const tokens = (...parsers: Parser[]) => (input: string): Result => {
    let result = DefaultFailure(input)
    let curInput = input
    let acc = ''
    parsers.every((parser) => {
        result = whitespace(parser)(curInput)
        if (result.success) {
            acc += result.value
            curInput = result.residual
            return true
        } else {
            return false
        }
    })

    if (result.success) {
        return {
            success: true,
            value: acc, 
            residual: input.substring(acc.length)
        }
    } else {
        return DefaultFailure(input)
    }
}

export const either = (...parsers: Parser[]) => (input: string): Result => {
    let result = DefaultFailure(input)
    parsers.every((parser) => {
        result = parser(input)
        return !result.success // if unsuccessful, loop
    })

    return result
}

export const many0 = (parser: Parser) => (input: string): Result => {
    let acc = ''
    let result = parser(input)
    while (result.success) {
        acc += result.value
        result = parser(result.residual)
    }

    return {
        success: true,
        value: acc,
        residual: input.substring(acc.length)
    }
}

export const many1 = (parser: Parser) => (input: string): Result => {
    let result = many0(parser)(input)
    if (result.value.length) {
        return result
    } else {
        return DefaultFailure(input)
    }
}

export const takeBetween = (min: number, max: number, parser: Parser) => (input: string): Result => {
    if (max < min) { return DefaultFailure(input) }
    
    let acc = ''
    let curInput = input
    let count = 0
    while (count < max) {
        let result = parser(curInput)
        if (result.success) { 
            count += 1
            acc += result.value
            curInput = result.residual
        } else {
            break
        }
    }

    if ((min <= count) && (count <= max)) {
        return {
            success: true,
            value: acc,
            residual: input.substring(acc.length) // TODO whitespace accounting 
        }
    } else {
        return DefaultFailure(input)
    }
}

export const take = (num: number, parser: Parser) => takeBetween(num, num, parser)

/* ~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~
                            Parsers 
~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~-=-~ */

export const success: Parser = (input: string) => {
    return {
        success: true,
        value: '',
        residual: input
    }
}

export const fail: Parser = (input: string) => {
    return {
        success: false,
        value: '',
        residual: input
    }
}

export const match = (target: string) => (input: string): Result => {
    if (input.startsWith(target)) {
        return {
            success: true,
            value: target,
            residual: input.substring(target.length)
        }
    } else {
        return DefaultFailure(input)
    }
}

export const optional: (target: string) => Parser = (target) => {
    return either(match(target), success)
}

export const digit = (input: string): Result => {
    let number = (input[0] ?? '').match(/\d/)
    if (number !== null) {
        return {
            success: true,
            value: String(number[0]),
            residual: input.substring(1)
        }
    } else {
        return DefaultFailure(input)
    }
}

export const EOF = (input: string): Result => {
    if (input.length) {
        return DefaultFailure(input)
    } else {
        return {
            success: true,
            value: "",
            residual: ""
        }
    }
}

const leadingWhitespaceChars = (input: string): string => {
    return (input.match(/^\s*/) ?? [''])[0]
}

export const whitespace = (parser: Parser) => (input: string): Result => {
    let whitespace = leadingWhitespaceChars(input)
    let leadingWhitespace = whitespace

    let result = parser(input.substring(leadingWhitespace.length))
    if (result.success) {
        let trailingWhitespace = leadingWhitespaceChars(result.residual)
        return {
            success: true,
            value: leadingWhitespace + result.value + trailingWhitespace,
            residual: result.residual.substring(result.value.length + trailingWhitespace.length)
        }
    } else {
        return result
    }
}

export const digits = many1(digit)

export const letter = (input: string): Result => {
    if (input.length && /[A-Za-z]$/.test(input[0])) {
        return {
            success: true,
            value: input[0],
            residual: input.substring(1)
        }
    } else {
        return DefaultFailure(input)
    }
}

/** 
 * Keeps matching characters that are contained in the the target string.
 * Stops at the first character that is not contained. Fails if no matches
 * could be made.
 * 
 * @param {string} target - the characters we want to match
 * 
 * ```
 * const vowels = 'aeiou' 
 * const parser = any(vowels)
 * parser('audio').success     // true
 * parser('audio').value       // au
 * parser('audio').residual    // dio
 * ```
 */
export const any: (target: string) => Parser = (target) => {
    // TODO: 
    return fail
}

/** 
 * Keeps matching characters that are NOT contained in the the target string.
 * Stops at the first character that is contained in the target. 
 * Fails if no matches could be made.
 * 
 * @param {string} target - the characters we do not want to match
 * 
 * ```
 * const vowels = 'aeiou' 
 * const parser = anyExcept(vowels)
 * parser('snow').success     // true
 * parser('snow').value       // sn
 * parser('snow').residual    // ow
 * ```
 */
export const anyExcept: (target: string) => Parser = (target) => {
    // TODO:
    return fail
}

/** 
 * foo
 * 
 * We want to parse this:
 * [1, 2, 3, 4, 5]
 * 
 * But this is a lot of writing:
 * let elements = many0(digits, match(','))
 * let lastElement = sequence(digits, match(']'))
 * sequence(match('['), elements, lastElement)
 * 
 * And it's error prone. How can we make this one line?
 * const parser = separatedBy(???)
 * 
 * @param {string} target - the characters we do not want to match
 * 
 * ```

 * parser('snow').success     // true
 * parser('snow').value       // sn
 * parser('snow').residual    // ow
 * ```
 */
export const separatedBy: (target: string) => Parser = (target) => {
    // TODO:
    return fail
}

let month = either(
    match("Jan"), match("Feb"), match("Mar"), 
    match("Apr"), match("May"), match("Jun"), 
    match("Jul"), match("Aug"), match("Sep"), 
    match("Oct"), match("Nov"), match("Dec")
)

let day = takeBetween(1, 2, digit)
let year = either(take(2, digit), take(4, digit))
let date = tokens(
    month, day, optional(','), year, EOF
)

console.log(date("Jan 12, 2022").success)
console.log(date("Jan 12, 2022").residual)
console.log(date("Oct 2, 22").success)
console.log(date("Oct 2, 22").residual)
console.log(date("Aug 8 2022").success)
console.log(date("Aug 8 2022").residual)

export const letters = many1(letter)
export const alphanumeric = either(digit, letter)
export const alphanumerics = many1(alphanumeric)
