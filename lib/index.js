'use strict'

// utilities
const isString  = require('./isString')
const isBoolean = require('./isBoolean')

const {
  maybeEndingChars,
  endingChars,
  spacingChars } = require('./splitSentences')

const Tokenize = function (opts) {

  opts = opts instanceof Object ? opts : {}

  return function (input, func, results) {

    let text = ""
    if (isString(input)) {
      text = input
    } else if (isString(input.text)) {
      text = input.text
    } else {
      throw new Error(`input is not text but ${typeof input} (${input})`)
    }

    // absolute position of each category
    const positions = {
      sentence : 0,
      word     : 0,
      character: 0
    }

    // this is where the magic happens: analysis of a chunk of text
    const mainExtractionAlgorithm = (
      sentence    // the chunk (ie. the actual piece of text)
    ) => {
      if (typeof sentence !== 'string' || sentence === '') { return }
      func({
         // we pass a copy since this we be async
         positions: Object.assign({}, positions),
         sentence : sentence,
         results  : results
      })
    }

    // these variables are used by the sentence splitting algorithm
    let buffer = []
    let isEnding    = false
    let maybeEnding = false

    // important: we use the native UTF-8 character iterator
    for (const character of input) {
      const isMaybeBreakingChar = ~maybeEndingChars.indexOf(character)
      const isBreakingChar      = ~endingChars.indexOf(character)
      const isSpacingChar       = ~spacingChars.indexOf(character)

      const isNotNormal = (isBreakingChar || isSpacingChar || maybeEnding)

      // read the character behind the dot
      if (maybeEnding && isSpacingChar) { // "this is an ending line. "
        maybeEnding = false
        isEnding    = true // true alert!
      } else if (maybeEnding && !isMaybeBreakingChar) { // "this.is.an.email"
        maybeEnding = false // false alert
        isEnding    = false
      }

      // if we are seeing the end of the ending/spacing characters tunnel..
      if (isEnding && !isNotNormal) {

        isEnding    = false
        maybeEnding = false

        mainExtractionAlgorithm(buffer.join(''))

        // update the character index before erasing the buffer
        positions.character += buffer.length
        positions.sentence++
        buffer = []
        buffer.push(character)
        continue
      }

      buffer.push(character)

      // the !, ?, japanese dot.. are truly breaking chars
      if (isBreakingChar) {
        maybeEnding = false
        isEnding = true
      } else if (isMaybeBreakingChar) {
          // The western dot is also used in emails, so it is not a strictly
          // breaking char. Also, the western dot should be ignored if after a
          // single uppercase letter, like in "H. G. Wells."
          maybeEnding = !buffer.join('').match(/ +[A-Z]\.$/)
          isEnding = false
      }
    }

    // let's check the buffer one more time after the loop
    // because even if text doesn't end with a dot, \0 still ends the sentence!
    mainExtractionAlgorithm(buffer.join(''))
    positions.sentence++

    // my word is my word, even if it takes me a long time to give it
    return results
  }
}

module.exports          = Tokenize
module.exports.default  = Tokenize
module.exports.Tokenize = Tokenize
