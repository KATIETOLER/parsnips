import { describe, expect, test } from '@jest/globals'
import { match, digit, digits} from './index'
import { sequence, either, many0, many1, take, takeBetween } from './index'

describe('parser', () => {
  describe('match', () => {
    test('matches input that equals target', () => {
      let parser = match('abc')
      expect(parser('abc').success).toBe(true)
    })

    test('matches input that equals target with residual', () => {
      let parser = match('abc')
      expect(parser('abcde').success).toBe(true)
    })

    test('matches input that equals target with correct residual', () => {
      let parser = match('abc')
      expect(parser('abcde').residual).toBe('de')
    })

    test('matches whitespace', () => {
      let parser = match(' ')
      expect(parser(' ').success).toBe(true)
    })
  })

  describe('digit', () => {
    test('matches a single digit', () => {
      let parser = digit
      expect(parser('1').success).toBe(true)
    })

    test('matches the first digit of a larger number', () => {
      let parser = digit
      expect(parser('11').success).toBe(true)
    })

    test('matches the first digit of a larger number with correct residual', () => {
      let parser = digit
      expect(parser('11').residual).toBe('1')
    })

    test('matches 0', () => {
      let parser = digit
      expect(parser('0').success).toBe(true)
    })

    test('does not ignore leading whitespace', () => {
      let parser = digit
      expect(parser(' 1').success).toBe(false)
    })

    test('does not match letters', () => {
      let parser = digit
      expect(parser('a').success).toBe(false)
    })
  })

  describe('digits', () => {
    test('matches multiple digit number', () => {
      let parser = digits
      expect(parser('11').success).toBe(true)
    })

    test('does not match empty string', () => {
      let parser = digits
      expect(parser('').success).toBe(false)
    })

    test('matches 0', () => {
      let parser = digits
      expect(parser('0').success).toBe(true)
    })
  })

  describe('sequence', () => {
    test('two successful parsers in order', () => {
      let parser = sequence(match('a'), match('b'))
      expect(parser('ab').success).toBe(true)
    })

    test('three successful parsers in order', () => {
      let parser = sequence(match('a'), match('b'), match('c'))
      expect(parser('abc').success).toBe(true)
    })

    test('three successful parsers in order with residual input', () => {
      let parser = sequence(match('a'), match('b'), match('c'))
      expect(parser('abcdef').success).toBe(true)
    })

    test('nested sequences', () => {
      let parser = sequence(match('a'), sequence(match('b'), match('c')))
      expect(parser('abc').success).toBe(true)
    })

    test('nested sequences again', () => {
      let parser = sequence(sequence(match('a'), match('b')), match('c'))
      expect(parser('abc').success).toBe(true)
    })

    test('should fail if first parser fails', () => {
      let parser = sequence(match('a'), match('b'))
      expect(parser('zb').success).toBe(false)
    })

    test('should fail if second parser fails', () => {
      let parser = sequence(match('a'), match('b'))
      expect(parser('az').success).toBe(false)
    })

    test('should return full input if first parse fails', () => {
      let parser = sequence(match('a'), match('b'))
      let input = 'zb'
      expect(parser(input).residual).toBe(input)
    })

    test('should return full input if second parse fails', () => {
      let parser = sequence(match('a'), match('b'))
      let input = 'az'
      expect(parser(input).residual).toBe(input)
    })

    test('should fail on empty input if parsers expect input', () => {
      let parser = sequence(match('a'), match('b'))
      let input = ''
      expect(parser(input).success).toBe(false)
    })
  })

  describe('either', () => {
    test('should succeed if first parser succeeds', () => {
      let parser = either(match('a'), match('b'))
      expect(parser('a').success).toBe(true)
    })

    test('should succeed if second parser succeeds', () => {
      let parser = either(match('a'), match('b'))
      expect(parser('b').success).toBe(true)
    })

    test('should succeed if nth parser succeeds', () => {
      let parser = either(match('a'), match('b'), match('c'), match('d'), match('e'))
      expect(parser('d').success).toBe(true)
    })

    test('should succeed if second parser succeeds with residual input', () => {
      let parser = either(match('a'), match('b'))
      expect(parser('bsdjkfh').success).toBe(true)
    })

    test('should fail if no parsers succeed', () => {
      let parser = either(match('a'), match('b'))
      expect(parser('z').success).toBe(false)
    })

    test('should fail if no parsers succeed (lots of parsers)', () => {
      let parser = either(match('a'), match('b'), match('c'), match('d'))
      expect(parser('z').success).toBe(false)
    })

    test('should fail if no input is given', () => {
      let parser = either(match('a'), match('b'), match('c'), match('d'))
      expect(parser('').success).toBe(false)
    })
  })
  
  describe('many0', () => {
    test('should be able to try to parse something until it fails', () => {
      let parser = many0(match('a'))
      expect(parser('a').success).toBe(true)
    })
    test('should be able to try to parse lots of somethings until it fails', () => {
      let parser = many0(match('a'))
      expect(parser('aaaaaaaaaaaaaa').success).toBe(true)
    })
    test('should be able to parse many with residual', () => {
      let parser = many0(match('a'))
      expect(parser('aaaaaaaaaaaaaaasdfasdfs').success).toBe(true)
    })
    test('should be able to parse many and return the correct residual', () => {
      let parser = many0(match('a'))
      expect(parser('aaaaaaaaaaaaaaasdfasdfs').residual).toBe('sdfasdfs')
    })
    test('should succeed even if it cannot parse anything', () => {
      let parser = many0(match('a'))
      expect(parser('dfsdfs').success).toBe(true)
    })
  })

  describe('many1', () => {
    // test('should be able to try to parse something until it fails', () => {
    //   let parser = many0(match('a'))
    //   expect(parser('a').success).toBe(true)
    // })
    // test('should be able to try to parse lots of somethings until it fails', () => {
    //   let parser = many0(match('a'))
    //   expect(parser('aaaaaaaaaaaaaa').success).toBe(true)
    // })
    // test('should be able to parse many with residual', () => {
    //   let parser = many0(match('a'))
    //   expect(parser('aaaaaaaaaaaaaaasdfasdfs').success).toBe(true)
    // })
    // test('should be able to parse many and return the correct residual', () => {
    //   let parser = many0(match('a'))
    //   expect(parser('aaaaaaaaaaaaaaasdfasdfs').residual).toBe('sdfasdfs')
    // })
    // test('should succeed even if it cannot parse anything', () => {
    //   let parser = many0(match('a'))
    //   expect(parser('dfsdfs').success).toBe(true)
    // })
  })

  describe('take', () => {
    test('should be able to take one match', () => {
      let parser = take(1, match('4321'))
      expect(parser('4321asdfasdf').success).toBe(true)
    })
    test('should be able to take one match and return the correct residual', () => {
      let parser = take(1, match('4321'))
      expect(parser('4321asdfasdf').residual).toBe('asdfasdf')
    })
    test('should be able to take two matches', () => {
      let parser = take(2, match('a'))
      expect(parser('aa').success).toBe(true)
    })
    test('should be able to take lots of matches', () => {
      let parser = take(11, match('a'))
      expect(parser('aaaaaaaaaaa').success).toBe(true)
    })
    test('should be able to take three matches despite being able to take more', () => {
      let parser = take(3, match('a'))
      expect(parser('aaaaaaaaaaa').success).toBe(true)
    })
    test('should be able to take three matches despite being able to take more and return residual', () => {
      let parser = take(3, match('a'))
      expect(parser('aaaaaaaaaaa').residual).toBe('aaaaaaaa')
    })
  })
  describe('takeBetween', () => {
    test('should be able to take one match', () => {
      let parser = takeBetween(1, 1, match('4321'))
      expect(parser('4321asdfasdf').success).toBe(true)
    })
    test('should be able to take one match and return the correct residual', () => {
      let parser = takeBetween(1, 1, match('4321'))
      expect(parser('4321asdfasdf').residual).toBe('asdfasdf')
    })
    test('should be able to take two matches', () => {
      let parser = takeBetween(2, 2, match('a'))
      expect(parser('aa').success).toBe(true)
    })
    test('should be able to take lots of matches', () => {
      let parser = takeBetween(11, 11, match('a'))
      expect(parser('aaaaaaaaaaa').success).toBe(true)
    })
    test('should be able to take three matches despite being able to take more', () => {
      let parser = takeBetween(3, 3, match('a'))
      expect(parser('aaaaaaaaaaa').success).toBe(true)
    })
    test('should be able to take three matches despite being able to take more and return residual', () => {
      let parser = takeBetween(3, 3, match('a'))
      expect(parser('aaaaaaaaaaa').residual).toBe('aaaaaaaa')
    })
  })
})


