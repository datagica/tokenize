'use strict'

// utilities
const isString  = require('./isString')
const isBoolean = require('./isBoolean')

const { SeparatorsRegExp, SpaceRegExp }     = require('./separators')
const { sentenceEndingChars, spacingChars } = require('./splitSentences')

const Tokenize = function (opts) {

opts = opts instanceof Object ? opts : {}

const maxEndingLength = 6

const excludePunctuation =
      isBoolean(opts.excludePunctuation)
        ? opts.excludePunctuation
        : true

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
      sentence:  0,
      word:      0,
      character: 0
    }

    // this is where the magic happens: analysis of a chunk of text
    const mainExtractionAlgorithm = (
      sentence    // the chunk (ie. the actual piece of text)
    ) => {
      if (typeof sentence !== 'string' || sentence === '') { return }

      // these regexp should be reviewed / changed maybe
      const words = excludePunctuation
        ? sentence.split(SeparatorsRegExp) // eg. "vegetables!" become "vegetables "
        : sentence.split(SpaceRegExp)      // eg. "vegetables!" become "vegetables!"

      func({
         positions: positions,
         sentence : sentence,
         words    : words,
         results  : results
      })
    }

    // these variables are used by the sentence splitting algorithm
    let buffer = []
    let isEnding = false

    // important: we use the native UTF-8 character iterator
    for (const character of input) {

      // basically tell if a character is a dot or a space, with a twist:
      // we also need to handle line returns, !, ?, non-western punctuation..
      const isBreakingChar = ~sentenceEndingChars.indexOf(character)
      const isSpacingChar = ~spacingChars.indexOf(character)

      // this is how we handle sequences such as "what?!!"
      // basically if we detect a sentence ending character, we continue to read
      // the rest until we detect we are back on a "normal" character path again
      if(isEnding && !(isBreakingChar || isSpacingChar)) {

        isEnding = false

        mainExtractionAlgorithm(buffer.join(''))

        // update the character index before erasing the buffer
        positions.character += buffer.length
        positions.sentence++

        buffer = []
        buffer.push(character)
        continue
      }

      // detect if we have an ending char after somewhat-looking sentence
      // sorry it's a bit vague, because there is no universal and formal
      // description here: eg. "Yes. I am." is two sentences, but "H. G. Wells"
      // is not. Also in Chinese this is even harder to tell that way
      // (no space or uppercase etc)
      if (buffer.length > maxEndingLength && isBreakingChar) {
        isEnding = true
      }

      buffer.push(character)
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
