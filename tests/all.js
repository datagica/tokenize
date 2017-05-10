const chai = require('chai');
chai.use(require('chai-fuzzy'));
const expect = chai.expect;

const Tokenize = require("../lib/index");

describe('@datagica/tokenize', () => {
  it('should work on a basic single sentence', done => {
      expect(
        Tokenize()(
          "This is a test",
          ({ sentence, results }) => results.push(sentence),
          []
        )
      ).to.be.like([
        "This is a test"
        ])
      done()
  })
  it('should work on western sentences', done => {
    const tokenize = Tokenize();
    [
      {
        input: "This is a test. Here is another sentence.",
        output: [
          "This is a test. ",
          "Here is another sentence."
        ]
      },
      {
        input: "自然言語処理の基礎技術にはさまざまなものがある。自然言語処理はその性格上、扱う言語によって大きく処理の異なる部分がある。現在のところ、日本語を処理する基礎技術としては以下のものが主に研究されている。",
        output: [
          "自然言語処理の基礎技術にはさまざまなものがある。",
          "自然言語処理はその性格上、扱う言語によって大きく処理の異なる部分がある。",
          "現在のところ、日本語を処理する基礎技術としては以下のものが主に研究されている。"
        ]
      }
    ].map(({ input, output }) => {
        expect(
          tokenize(input, ({ sentence, results }) => results.push(sentence), [])
        ).to.be.like(output)
    })
    done()
  })

  it('should work on non-western sentences', done => {
    const tokenize = Tokenize();
    [
      {
        input: "句子“我們把香蕉給猴子，因為(牠們)餓了”和“我們把香蕉給猴子，因為(它們)熟透了”有同樣的結構。但是代詞“它們”在第一句中指的是“猴子”，在第二句中指的是“香蕉”。如果不了解猴子和香蕉的屬性，無法區分。(英文的it沒有區分，但在中文裡「牠」和「它」是有區別的，只是代詞在中文裡常常被省略，因此需區別屬性並且標示出來)",
        output: [
          "句子“我們把香蕉給猴子，因為(牠們)餓了”和“我們把香蕉給猴子，因為(它們)熟透了”有同樣的結構。",
          "但是代詞“它們”在第一句中指的是“猴子”，在第二句中指的是“香蕉”。",
          "如果不了解猴子和香蕉的屬性，無法區分。",
          "(英文的it沒有區分，但在中文裡「牠」和「它」是有區別的，只是代詞在中文裡常常被省略，因此需區別屬性並且標示出來)"
        ]
      },
      {
        input: "自然言語処理の基礎技術にはさまざまなものがある。自然言語処理はその性格上、扱う言語によって大きく処理の異なる部分がある。現在のところ、日本語を処理する基礎技術としては以下のものが主に研究されている。",
        output: [
          "自然言語処理の基礎技術にはさまざまなものがある。",
          "自然言語処理はその性格上、扱う言語によって大きく処理の異なる部分がある。",
          "現在のところ、日本語を処理する基礎技術としては以下のものが主に研究されている。"
        ]
      }
    ].map(({ input, output }) => {
        expect(
          tokenize(input, ({ sentence, results }) => results.push(sentence), [])
        ).to.be.like(output)
    })
    done()
  })
})
