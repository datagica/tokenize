const maybeEndingChars = [
  // western
  '.'
]

const endingChars = [
  // '\n', <-- NEVER use this

  // western
  '!','?',

  // japanese
  '。', '！','？',

  // arabic
  '؟',

  // hindi
  '|'
]

const spacingChars = [
  // western or generic
  ' ', '\n', '\r','\t',

  // japanese space
  '　'

]

const chunkEndingChars = [
  // western
  ':', ';',

  // japanese and chinese
  '：',

  // arabic
  '،'
]

module.exports = {
  maybeEndingChars: maybeEndingChars,
  endingChars: endingChars,
  spacingChars: spacingChars
}
