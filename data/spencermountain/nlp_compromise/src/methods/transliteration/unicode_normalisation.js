// a hugely-ignorant, and widely subjective transliteration of latin, cryllic, greek unicode characters to english ascii.
//http://en.wikipedia.org/wiki/List_of_Unicode_characters
//https://docs.google.com/spreadsheet/ccc?key=0Ah46z755j7cVdFRDM1A2YVpwa1ZYWlpJM2pQZ003M0E
var normalize = (function() {

  var data = [
    ["²", "2"],
    ["ƻ", "2"],
    ["³", "3"],
    ["Ʒ", "3"],
    ["Ƹ", "3"],
    ["ƹ", "3"],
    ["ƺ", "3"],
    ["Ǯ", "3"],
    ["ǯ", "3"],
    ["З", "3"],
    ["Ҙ", "3"],
    ["ҙ", "3"],
    ["Ӟ", "3"],
    ["ӟ", "3"],
    ["Ӡ", "3"],
    ["ӡ", "3"],
    ["Ȝ", "3"],
    ["ȝ", "3"],
    ["Ƽ", "5"],
    ["ƽ", "5"],
    ["Ȣ", "8"],
    ["ȣ", "8"],
    ["¡", "!"],
    ["¿", "?"],
    ["Ɂ", "?"],
    ["ɂ", "?"],
    ["ª", "a"],
    ["À", "a"],
    ["Á", "a"],
    ["Â", "a"],
    ["Ã", "a"],
    ["Ä", "a"],
    ["Å", "a"],
    ["à", "a"],
    ["á", "a"],
    ["â", "a"],
    ["ã", "a"],
    ["ä", "a"],
    ["å", "a"],
    ["Ā", "a"],
    ["ā", "a"],
    ["Ă", "a"],
    ["ă", "a"],
    ["Ą", "a"],
    ["ą", "a"],
    ["Ǎ", "a"],
    ["ǎ", "a"],
    ["Ǟ", "a"],
    ["ǟ", "a"],
    ["Ǡ", "a"],
    ["ǡ", "a"],
    ["Ǻ", "a"],
    ["ǻ", "a"],
    ["Ȁ", "a"],
    ["ȁ", "a"],
    ["Ȃ", "a"],
    ["ȃ", "a"],
    ["Ȧ", "a"],
    ["ȧ", "a"],
    ["Ⱥ", "a"],
    ["Ά", "a"],
    ["Α", "a"],
    ["Δ", "a"],
    ["Λ", "a"],
    ["ά", "a"],
    ["α", "a"],
    ["λ", "a"],
    ["А", "a"],
    ["Д", "a"],
    ["а", "a"],
    ["д", "a"],
    ["Ѧ", "a"],
    ["ѧ", "a"],
    ["Ӑ", "a"],
    ["ӑ", "a"],
    ["Ӓ", "a"],
    ["ӓ", "a"],
    ["ƛ", "a"],
    ["Ʌ", "a"],
    ["ß", "b"],
    ["þ", "b"],
    ["ƀ", "b"],
    ["Ɓ", "b"],
    ["Ƃ", "b"],
    ["ƃ", "b"],
    ["Ƅ", "b"],
    ["ƅ", "b"],
    ["Ƀ", "b"],
    ["Β", "b"],
    ["β", "b"],
    ["ϐ", "b"],
    ["Ϧ", "b"],
    ["Б", "b"],
    ["В", "b"],
    ["Ъ", "b"],
    ["Ь", "b"],
    ["б", "b"],
    ["в", "b"],
    ["ъ", "b"],
    ["ь", "b"],
    ["Ѣ", "b"],
    ["ѣ", "b"],
    ["Ҍ", "b"],
    ["ҍ", "b"],
    ["Ҕ", "b"],
    ["ҕ", "b"],
    ["ƥ", "b"],
    ["ƾ", "b"],
    ["¢", "c"],
    ["©", "c"],
    ["Ç", "c"],
    ["ç", "c"],
    ["Ć", "c"],
    ["ć", "c"],
    ["Ĉ", "c"],
    ["ĉ", "c"],
    ["Ċ", "c"],
    ["ċ", "c"],
    ["Č", "c"],
    ["č", "c"],
    ["Ɔ", "c"],
    ["Ƈ", "c"],
    ["ƈ", "c"],
    ["Ȼ", "c"],
    ["ȼ", "c"],
    ["ͻ", "c"],
    ["ͼ", "c"],
    ["ͽ", "c"],
    ["ϲ", "c"],
    ["Ϲ", "c"],
    ["Ͻ", "c"],
    ["Ͼ", "c"],
    ["Ͽ", "c"],
    ["Є", "c"],
    ["С", "c"],
    ["с", "c"],
    ["є", "c"],
    ["Ҁ", "c"],
    ["ҁ", "c"],
    ["Ҫ", "c"],
    ["ҫ", "c"],
    ["Ð", "d"],
    ["Ď", "d"],
    ["ď", "d"],
    ["Đ", "d"],
    ["đ", "d"],
    ["Ɖ", "d"],
    ["Ɗ", "d"],
    ["ȡ", "d"],
    ["Ƌ", "d"],
    ["ƌ", "d"],
    ["Ƿ", "d"],
    ["È", "e"],
    ["É", "e"],
    ["Ê", "e"],
    ["Ë", "e"],
    ["è", "e"],
    ["é", "e"],
    ["ê", "e"],
    ["ë", "e"],
    ["Ē", "e"],
    ["ē", "e"],
    ["Ĕ", "e"],
    ["ĕ", "e"],
    ["Ė", "e"],
    ["ė", "e"],
    ["Ę", "e"],
    ["ę", "e"],
    ["Ě", "e"],
    ["ě", "e"],
    ["Ǝ", "e"],
    ["Ə", "e"],
    ["Ɛ", "e"],
    ["ǝ", "e"],
    ["Ȅ", "e"],
    ["ȅ", "e"],
    ["Ȇ", "e"],
    ["ȇ", "e"],
    ["Ȩ", "e"],
    ["ȩ", "e"],
    ["Ɇ", "e"],
    ["ɇ", "e"],
    ["Έ", "e"],
    ["Ε", "e"],
    ["Ξ", "e"],
    ["Σ", "e"],
    ["έ", "e"],
    ["ε", "e"],
    ["ξ", "e"],
    ["ϱ", "e"],
    ["ϵ", "e"],
    ["϶", "e"],
    ["Ѐ", "e"],
    ["Ё", "e"],
    ["Е", "e"],
    ["Э", "e"],
    ["е", "e"],
    ["ѐ", "e"],
    ["ё", "e"],
    ["Ҽ", "e"],
    ["ҽ", "e"],
    ["Ҿ", "e"],
    ["ҿ", "e"],
    ["Ӗ", "e"],
    ["ӗ", "e"],
    ["Ә", "e"],
    ["ә", "e"],
    ["Ӛ", "e"],
    ["ӛ", "e"],
    ["Ӭ", "e"],
    ["ӭ", "e"],
    ["Ƒ", "f"],
    ["ƒ", "f"],
    ["Ϝ", "f"],
    ["ϝ", "f"],
    ["Ӻ", "f"],
    ["ӻ", "f"],
    ["Ĝ", "g"],
    ["ĝ", "g"],
    ["Ğ", "g"],
    ["ğ", "g"],
    ["Ġ", "g"],
    ["ġ", "g"],
    ["Ģ", "g"],
    ["ģ", "g"],
    ["Ɠ", "g"],
    ["Ǥ", "g"],
    ["ǥ", "g"],
    ["Ǧ", "g"],
    ["ǧ", "g"],
    ["Ǵ", "g"],
    ["ǵ", "g"],
    ["Ĥ", "h"],
    ["ĥ", "h"],
    ["Ħ", "h"],
    ["ħ", "h"],
    ["ƕ", "h"],
    ["Ƕ", "h"],
    ["Ȟ", "h"],
    ["ȟ", "h"],
    ["Ή", "h"],
    ["Η", "h"],
    ["Ђ", "h"],
    ["Њ", "h"],
    ["Ћ", "h"],
    ["Н", "h"],
    ["н", "h"],
    ["ђ", "h"],
    ["ћ", "h"],
    ["Ң", "h"],
    ["ң", "h"],
    ["Ҥ", "h"],
    ["ҥ", "h"],
    ["Һ", "h"],
    ["һ", "h"],
    ["Ӊ", "h"],
    ["ӊ", "h"],
    ["Ì", "I"],
    ["Í", "I"],
    ["Î", "I"],
    ["Ï", "I"],
    ["ì", "i"],
    ["í", "i"],
    ["î", "i"],
    ["ï", "i"],
    ["Ĩ", "i"],
    ["ĩ", "i"],
    ["Ī", "i"],
    ["ī", "i"],
    ["Ĭ", "i"],
    ["ĭ", "i"],
    ["Į", "i"],
    ["į", "i"],
    ["İ", "i"],
    ["ı", "i"],
    ["Ɩ", "i"],
    ["Ɨ", "i"],
    ["Ȉ", "i"],
    ["ȉ", "i"],
    ["Ȋ", "i"],
    ["ȋ", "i"],
    ["Ί", "i"],
    ["ΐ", "i"],
    ["Ϊ", "i"],
    ["ί", "i"],
    ["ι", "i"],
    ["ϊ", "i"],
    ["І", "i"],
    ["Ї", "i"],
    ["і", "i"],
    ["ї", "i"],
    ["Ĵ", "j"],
    ["ĵ", "j"],
    ["ǰ", "j"],
    ["ȷ", "j"],
    ["Ɉ", "j"],
    ["ɉ", "j"],
    ["ϳ", "j"],
    ["Ј", "j"],
    ["ј", "j"],
    ["Ķ", "k"],
    ["ķ", "k"],
    ["ĸ", "k"],
    ["Ƙ", "k"],
    ["ƙ", "k"],
    ["Ǩ", "k"],
    ["ǩ", "k"],
    ["Κ", "k"],
    ["κ", "k"],
    ["Ќ", "k"],
    ["Ж", "k"],
    ["К", "k"],
    ["ж", "k"],
    ["к", "k"],
    ["ќ", "k"],
    ["Қ", "k"],
    ["қ", "k"],
    ["Ҝ", "k"],
    ["ҝ", "k"],
    ["Ҟ", "k"],
    ["ҟ", "k"],
    ["Ҡ", "k"],
    ["ҡ", "k"],
    ["Ĺ", "l"],
    ["ĺ", "l"],
    ["Ļ", "l"],
    ["ļ", "l"],
    ["Ľ", "l"],
    ["ľ", "l"],
    ["Ŀ", "l"],
    ["ŀ", "l"],
    ["Ł", "l"],
    ["ł", "l"],
    ["ƚ", "l"],
    ["ƪ", "l"],
    ["ǀ", "l"],
    ["Ǐ", "l"],
    ["ǐ", "l"],
    ["ȴ", "l"],
    ["Ƚ", "l"],
    ["Ι", "l"],
    ["Ӏ", "l"],
    ["ӏ", "l"],
    ["Μ", "m"],
    ["Ϻ", "m"],
    ["ϻ", "m"],
    ["М", "m"],
    ["м", "m"],
    ["Ӎ", "m"],
    ["ӎ", "m"],
    ["Ñ", "n"],
    ["ñ", "n"],
    ["Ń", "n"],
    ["ń", "n"],
    ["Ņ", "n"],
    ["ņ", "n"],
    ["Ň", "n"],
    ["ň", "n"],
    ["ŉ", "n"],
    ["Ŋ", "n"],
    ["ŋ", "n"],
    ["Ɲ", "n"],
    ["ƞ", "n"],
    ["Ǹ", "n"],
    ["ǹ", "n"],
    ["Ƞ", "n"],
    ["ȵ", "n"],
    ["Ν", "n"],
    ["Π", "n"],
    ["ή", "n"],
    ["η", "n"],
    ["Ϟ", "n"],
    ["Ѝ", "n"],
    ["И", "n"],
    ["Й", "n"],
    ["Л", "n"],
    ["П", "n"],
    ["и", "n"],
    ["й", "n"],
    ["л", "n"],
    ["п", "n"],
    ["ѝ", "n"],
    ["Ҋ", "n"],
    ["ҋ", "n"],
    ["Ӆ", "n"],
    ["ӆ", "n"],
    ["Ӣ", "n"],
    ["ӣ", "n"],
    ["Ӥ", "n"],
    ["ӥ", "n"],
    ["π", "n"],
    ["Ò", "o"],
    ["Ó", "o"],
    ["Ô", "o"],
    ["Õ", "o"],
    ["Ö", "o"],
    ["Ø", "o"],
    ["ð", "o"],
    ["ò", "o"],
    ["ó", "o"],
    ["ô", "o"],
    ["õ", "o"],
    ["ö", "o"],
    ["ø", "o"],
    ["Ō", "o"],
    ["ō", "o"],
    ["Ŏ", "o"],
    ["ŏ", "o"],
    ["Ő", "o"],
    ["ő", "o"],
    ["Ɵ", "o"],
    ["Ơ", "o"],
    ["ơ", "o"],
    ["Ǒ", "o"],
    ["ǒ", "o"],
    ["Ǫ", "o"],
    ["ǫ", "o"],
    ["Ǭ", "o"],
    ["ǭ", "o"],
    ["Ǿ", "o"],
    ["ǿ", "o"],
    ["Ȍ", "o"],
    ["ȍ", "o"],
    ["Ȏ", "o"],
    ["ȏ", "o"],
    ["Ȫ", "o"],
    ["ȫ", "o"],
    ["Ȭ", "o"],
    ["ȭ", "o"],
    ["Ȯ", "o"],
    ["ȯ", "o"],
    ["Ȱ", "o"],
    ["ȱ", "o"],
    ["Ό", "o"],
    ["Θ", "o"],
    ["Ο", "o"],
    ["Φ", "o"],
    ["Ω", "o"],
    ["δ", "o"],
    ["θ", "o"],
    ["ο", "o"],
    ["σ", "o"],
    ["ό", "o"],
    ["ϕ", "o"],
    ["Ϙ", "o"],
    ["ϙ", "o"],
    ["Ϭ", "o"],
    ["ϭ", "o"],
    ["ϴ", "o"],
    ["О", "o"],
    ["Ф", "o"],
    ["о", "o"],
    ["Ѳ", "o"],
    ["ѳ", "o"],
    ["Ѻ", "o"],
    ["ѻ", "o"],
    ["Ѽ", "o"],
    ["ѽ", "o"],
    ["Ӧ", "o"],
    ["ӧ", "o"],
    ["Ө", "o"],
    ["ө", "o"],
    ["Ӫ", "o"],
    ["ӫ", "o"],
    ["¤", "o"],
    ["ƍ", "o"],
    ["Ώ", "o"],
    ["Ƥ", "p"],
    ["ƿ", "p"],
    ["Ρ", "p"],
    ["ρ", "p"],
    ["Ϸ", "p"],
    ["ϸ", "p"],
    ["ϼ", "p"],
    ["Р", "p"],
    ["р", "p"],
    ["Ҏ", "p"],
    ["ҏ", "p"],
    ["Þ", "p"],
    ["Ɋ", "q"],
    ["ɋ", "q"],
    ["Ŕ", "r"],
    ["ŕ", "r"],
    ["Ŗ", "r"],
    ["ŗ", "r"],
    ["Ř", "r"],
    ["ř", "r"],
    ["Ʀ", "r"],
    ["Ȑ", "r"],
    ["ȑ", "r"],
    ["Ȓ", "r"],
    ["ȓ", "r"],
    ["Ɍ", "r"],
    ["ɍ", "r"],
    ["Ѓ", "r"],
    ["Г", "r"],
    ["Я", "r"],
    ["г", "r"],
    ["я", "r"],
    ["ѓ", "r"],
    ["Ґ", "r"],
    ["ґ", "r"],
    ["Ғ", "r"],
    ["ғ", "r"],
    ["Ӷ", "r"],
    ["ӷ", "r"],
    ["ſ", "r"],
    ["Ś", "s"],
    ["ś", "s"],
    ["Ŝ", "s"],
    ["ŝ", "s"],
    ["Ş", "s"],
    ["ş", "s"],
    ["Š", "s"],
    ["š", "s"],
    ["Ƨ", "s"],
    ["ƨ", "s"],
    ["Ș", "s"],
    ["ș", "s"],
    ["ȿ", "s"],
    ["ς", "s"],
    ["Ϛ", "s"],
    ["ϛ", "s"],
    ["ϟ", "s"],
    ["Ϩ", "s"],
    ["ϩ", "s"],
    ["Ѕ", "s"],
    ["ѕ", "s"],
    ["Ţ", "t"],
    ["ţ", "t"],
    ["Ť", "t"],
    ["ť", "t"],
    ["Ŧ", "t"],
    ["ŧ", "t"],
    ["ƫ", "t"],
    ["Ƭ", "t"],
    ["ƭ", "t"],
    ["Ʈ", "t"],
    ["Ț", "t"],
    ["ț", "t"],
    ["ȶ", "t"],
    ["Ⱦ", "t"],
    ["Γ", "t"],
    ["Τ", "t"],
    ["τ", "t"],
    ["Ϯ", "t"],
    ["ϯ", "t"],
    ["Т", "t"],
    ["т", "t"],
    ["҂", "t"],
    ["Ҭ", "t"],
    ["ҭ", "t"],
    ["µ", "u"],
    ["Ù", "u"],
    ["Ú", "u"],
    ["Û", "u"],
    ["Ü", "u"],
    ["ù", "u"],
    ["ú", "u"],
    ["û", "u"],
    ["ü", "u"],
    ["Ũ", "u"],
    ["ũ", "u"],
    ["Ū", "u"],
    ["ū", "u"],
    ["Ŭ", "u"],
    ["ŭ", "u"],
    ["Ů", "u"],
    ["ů", "u"],
    ["Ű", "u"],
    ["ű", "u"],
    ["Ų", "u"],
    ["ų", "u"],
    ["Ư", "u"],
    ["ư", "u"],
    ["Ʊ", "u"],
    ["Ʋ", "u"],
    ["Ǔ", "u"],
    ["ǔ", "u"],
    ["Ǖ", "u"],
    ["ǖ", "u"],
    ["Ǘ", "u"],
    ["ǘ", "u"],
    ["Ǚ", "u"],
    ["ǚ", "u"],
    ["Ǜ", "u"],
    ["ǜ", "u"],
    ["Ȕ", "u"],
    ["ȕ", "u"],
    ["Ȗ", "u"],
    ["ȗ", "u"],
    ["Ʉ", "u"],
    ["ΰ", "u"],
    ["μ", "u"],
    ["υ", "u"],
    ["ϋ", "u"],
    ["ύ", "u"],
    ["ϑ", "u"],
    ["Џ", "u"],
    ["Ц", "u"],
    ["Ч", "u"],
    ["ц", "u"],
    ["џ", "u"],
    ["Ҵ", "u"],
    ["ҵ", "u"],
    ["Ҷ", "u"],
    ["ҷ", "u"],
    ["Ҹ", "u"],
    ["ҹ", "u"],
    ["Ӌ", "u"],
    ["ӌ", "u"],
    ["Ӈ", "u"],
    ["ӈ", "u"],
    ["Ɣ", "v"],
    ["ν", "v"],
    ["Ѵ", "v"],
    ["ѵ", "v"],
    ["Ѷ", "v"],
    ["ѷ", "v"],
    ["Ŵ", "w"],
    ["ŵ", "w"],
    ["Ɯ", "w"],
    ["ω", "w"],
    ["ώ", "w"],
    ["ϖ", "w"],
    ["Ϣ", "w"],
    ["ϣ", "w"],
    ["Ш", "w"],
    ["Щ", "w"],
    ["ш", "w"],
    ["щ", "w"],
    ["ѡ", "w"],
    ["ѿ", "w"],
    ["×", "x"],
    ["Χ", "x"],
    ["χ", "x"],
    ["ϗ", "x"],
    ["ϰ", "x"],
    ["Х", "x"],
    ["х", "x"],
    ["Ҳ", "x"],
    ["ҳ", "x"],
    ["Ӽ", "x"],
    ["ӽ", "x"],
    ["Ӿ", "x"],
    ["ӿ", "x"],
    ["¥", "y"],
    ["Ý", "y"],
    ["ý", "y"],
    ["ÿ", "y"],
    ["Ŷ", "y"],
    ["ŷ", "y"],
    ["Ÿ", "y"],
    ["Ƴ", "y"],
    ["ƴ", "y"],
    ["Ȳ", "y"],
    ["ȳ", "y"],
    ["Ɏ", "y"],
    ["ɏ", "y"],
    ["Ύ", "y"],
    ["Υ", "y"],
    ["Ψ", "y"],
    ["Ϋ", "y"],
    ["γ", "y"],
    ["ψ", "y"],
    ["ϒ", "y"],
    ["ϓ", "y"],
    ["ϔ", "y"],
    ["Ў", "y"],
    ["У", "y"],
    ["у", "y"],
    ["ч", "y"],
    ["ў", "y"],
    ["Ѱ", "y"],
    ["ѱ", "y"],
    ["Ү", "y"],
    ["ү", "y"],
    ["Ұ", "y"],
    ["ұ", "y"],
    ["Ӯ", "y"],
    ["ӯ", "y"],
    ["Ӱ", "y"],
    ["ӱ", "y"],
    ["Ӳ", "y"],
    ["ӳ", "y"],
    ["Ź", "z"],
    ["ź", "z"],
    ["Ż", "z"],
    ["ż", "z"],
    ["Ž", "z"],
    ["ž", "z"],
    ["Ʃ", "z"],
    ["Ƶ", "z"],
    ["ƶ", "z"],
    ["Ȥ", "z"],
    ["ȥ", "z"],
    ["ɀ", "z"],
    ["Ζ", "z"],
    ["ζ", "z"]
  ]

  //convert to two hashes
  var normaler = {}
  var greek = {}
  data.forEach(function(arr) {
    normaler[arr[0]] = arr[1]
    greek[arr[1]] = arr[0]
  })

  var normalize = function(str, options) {
    options = options || {}
    options.percentage = options.percentage || 50
    var arr = str.split('').map(function(s) {
      var r = Math.random() * 100
      if (normaler[s] && r < options.percentage) {
        return normaler[s] || s
      } else {
        return s
      }
    })
    return arr.join('')
  }

  var denormalize = function(str, options) {
    options = options || {}
    options.percentage = options.percentage || 50
    var arr = str.split('').map(function(s) {
      var r = Math.random() * 100
      if (greek[s] && r < options.percentage) {
        return greek[s] || s
      } else {
        return s
      }
    })
    return arr.join('')
  }

  var obj = {
    normalize: normalize,
    denormalize: denormalize
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = obj;
  }
  return obj
})()

// s = "ӳžŽżźŹźӳžŽżźŹźӳžŽżźŹźӳžŽżźŹźӳžŽżźŹź"
// s = "Björk"
// console.log(normalize.normalize(s, {
//   percentage: 50
// }))

// s = "The quick brown fox jumps over the lazy dog"
// console.log(normalize.denormalize(s, {
//   percentage: 20
// }))