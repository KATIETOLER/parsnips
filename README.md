# parsnips

> A parser combinator library for typescript

Parse any text in a natural and understandable way.

```typescript
let street = tokens(digits, whitespace(letters))
let city = letters
let state = take(2, letter)
let zip = take(5, digit)

let address = tokens(street, city, match(','), state, zip)
```

# Why

Parser combinator libraries allow us to parse complex input
using small, easy to understand pieces. Parsers take input and
produce a result that describes whether the parse was successful.

```ts
match('hello') // matches "hello"
alphanumeric() // matches any alphanumeric character
```

Combinators "combine" parsers into new parsers. The combinators
are what allow us to "build" complex parsers out of smaller ones.

```ts
// parses "hello, world!"
sequence(match('hello'), match(', '), match('world!'))

// parses a simply formatted date
// e.g. Oct 29, 2022
let month = either(
	match('Jan'),
	match('Feb'),
	match('Mar'),
	match('Apr'),
	match('May'),
	match('Jun'),
	match('Jul'),
	match('Aug'),
	match('Sep'),
	match('Oct'),
	match('Nov'),
	match('Dec')
)
let day = takeBetween(1, 2, digit)
let year = take(4, digit)

let date = tokens(month, day, match(','), year)
```

Without even knowing how this library works, you could probably
guess the meaning of the code above (whitespace just removes
surrounding whitespace). This is, in part, due to the way parser
combinator libraries mimic the natural grammar of what they are
parsing.

# Parsers

- match
- digit
- digits
- letter
- letters
- alphanumeric
- alphanumerics
- whitespace
- success
- fail
- EOF (end of file)

# Combinators

- sequence
- tokens
- either
- optional
- many0
- many1
- takeBetween
- take

# TODO

[x] >90% test coverage
[ ] any(_) parser (parses any character in given string)
[ ] anyExcept(_) parser (parses any character except those in given string)
[ ] separatedBy(_, _) (parses input separated by given parser)
[x] success() parser (always succeeds and passes back input)
[x] fail() parser (always fails)
[x] optional(parser)
[ ] lookahead(_) parser (runs given parser but does not consume input)
[ ] skipUntil(_) parser (keeps consuming input until given parser succeeds)
[ ] regex(\_) parser
[ ] more informative errors (e.g. show "partial success")
[ ] mechanism for transforming parsed values
[ ] a pattern / interface for creating "rules" and "grammars"
[ ] localization / encoding concerns?
[ ] logging / debugging utils?
[ ] streaming capabilities (don't store entire input in memory)
[ ] file organization
[ ] examples
[ ] docs
[x] license

# License

MIT License
Copyright (c) 2022 Katie Toler
