//load in methods if using node, otherwise assume
if (typeof module !== "undefined" && module.exports) {
  var nlp = require("../index")
}

// Dummy method for testing under prototype pollution
Object.prototype.dummy = function(){
};

exports["indefinite_article"] = function(test){
  test.deepEqual(nlp.noun("wolf").article(), "a")
  test.deepEqual(nlp.noun("eulogy").article(), "a")
  test.deepEqual(nlp.noun("eater").article(), "an")
  test.deepEqual(nlp.noun("african").article(),"an")
  test.deepEqual(nlp.noun("hour").article(), "an")
  test.deepEqual(nlp.noun("awful").article(), "an")
  test.deepEqual(nlp.noun("utter").article(), "an")
  test.deepEqual(nlp.noun('S.S.L.').article(), "an")
  test.deepEqual(nlp.noun('FBI').article(), "an")
  test.deepEqual(nlp.noun('GHQ').article(), "a")
  test.done()
}

exports["conjugate_future"] = function(test){
  var convert=function(s){
    s=nlp.pos(s).to_future().text()
    return s
  }
  test.deepEqual(convert("he went to the store"), "he will go to the store")
  test.deepEqual(convert("she walked backwards"), "she will walk backwards")
  // test.deepEqual(convert("everyone said he was cool"), "everyone will say he is cool") //hard
  test.deepEqual(convert("he crawls to the back door"), "he will crawl to the back door")
  test.deepEqual(convert("i am slouching forward"), "i will be slouching forward")
  test.deepEqual(convert("i will slouch forward"), "i will slouch forward")//future-future //FIX
  test.done()
}

exports["conjugate_present"] = function(test){
  var convert=function(s){
    s=nlp.pos(s).to_present().text()
    return s
  }
  test.deepEqual(convert("he went to the store"), "he goes to the store")
  test.deepEqual(convert("she walked backwards"), "she walks backwards")
  // test.deepEqual(convert("everyone said he was cool"), "everyone says he was cool") //hard
  test.deepEqual(convert("he will crawl to the back door"), "he crawls to the back door")
  // test.deepEqual(convert("i am slouching forward"), "i slouch forward")  //interesting
  test.deepEqual(convert("he crawls to the back door"), "he crawls to the back door")//present-present
  test.done()
}

exports["conjugate_past"] = function(test){
  var convert=function(s){
    s=nlp.pos(s).to_past().text()
    return s
  }
  test.deepEqual(convert("he goes to the store"), "he went to the store")
  test.deepEqual(convert("she will walk backwards"), "she walked backwards")
  test.deepEqual(convert("everyone says he is cool"), "everyone said he was cool")
  test.deepEqual(convert("he will crawl to the back door"), "he crawled to the back door")
  test.deepEqual(convert("i am slouching forward"), "i was slouching forward")
  test.deepEqual(convert("he went to the store"), "he went to the store") //past-past
  test.done()
}

exports["verb_conjugate"] = function(test){
  var tenses = [
    "present",
    "past",
    "infinitive",
    "gerund",
    "future",
  ]
  function isequal(o1, o2) {
    tenses.forEach(function(t) {
      test.deepEqual(o1[t], o2[t])
    })
  }
  verbs = [
    {  "infinitive": "convolute", "present": "convolutes", "gerund": "convoluting", "past": "convoluted"},
    {  "present": "presents", "gerund": "presenting", "past": "presented", "infinitive": "present"},
    {  "present": "angulates", "gerund": "angulating", "past": "angulated", "infinitive": "angulate"},
    {  "present": "conjures", "gerund": "conjuring", "past": "conjured", "infinitive": "conjure"},
    {  "present": "denounces", "gerund": "denouncing", "past": "denounced", "infinitive": "denounce"},
    {  "present": "watches", "gerund": "watching", "past": "watched", "infinitive": "watch"},
    {  "present": "tingles", "gerund": "tingling", "past": "tingled", "infinitive": "tingle"},
    {  "present": "mortises", "gerund": "mortising", "past": "mortised", "infinitive": "mortise"},
    {  "present": "disguises", "gerund": "disguising", "past": "disguised", "infinitive": "disguise"},
    {  "infinitive": "effect", "gerund": "effecting", "past": "effected", "present": "effects"},
    {  "infinitive": "want", "gerund": "wanting", "past": "wanted", "present": "wants"},
    {  "infinitive": "power", "gerund": "powering", "past": "powered", "present": "powers"},
    {  "infinitive": "overcompensate", "present": "overcompensates", "past": "overcompensated", "gerund": "overcompensating"},
    {  "infinitive": "ice", "present": "ices", "past": "iced", "gerund": "icing"},
    {  "infinitive": "buy", "present": "buys", "past": "bought", "gerund": "buying"},
    {  "infinitive": "flower", "present": "flowers", "past": "flowered", "gerund": "flowering"},
    {  "infinitive": "rage", "present": "rages", "past": "raged", "gerund": "raging"},
    {  "infinitive": "drive", "present": "drives", "past": "drove", "gerund": "driving"},
    {  "infinitive": "foul", "present": "fouls", "past": "fouled", "gerund": "fouling"},
    {  "infinitive": "overthrow", "present": "overthrows", "gerund": "overthrowing", "past": "overthrew"},
    {  "infinitive": "aim",   "present": "aims",   "past": "aimed",   "gerund": "aiming"},
    {  "present": "unifies",   "gerund": "unifying",   "past": "unified",   "infinitive": "unify"},
    {  "present": "addresses",   "gerund": "addressing",   "past": "addressed",   "infinitive": "address"},
    {  "infinitive": "bumble",   "present": "bumbles",   "past": "bumbled",   "gerund": "bumbling"},
    {  "infinitive": "snipe",   "present": "snipes",   "past": "sniped",   "gerund": "sniping"},
    {  "present": "relishes",   "gerund": "relishing",   "past": "relished",   "infinitive": "relish"},
    {  "infinitive": "lengthen",   "gerund": "lengthening",   "past": "lengthened",   "present": "lengthens"},
    {  "infinitive": "farm",   "present": "farms",   "past": "farmed",   "gerund": "farming"}
    // {  "infinitive": "relay",   "gerund": "relaying",   "past": "relayed",   "present": "relays"},//tricky
  ]
  //add future tense
  verbs=verbs.map(function(o){
    o.future="will "+o.infinitive
    return o
  })
  verbs.forEach(function(o) {
    tenses.forEach(function(type){
      var o2 = nlp.verb(o[type]).conjugate()
      isequal(o, o2)
    })
  })
  test.done()
}


exports["negation"] = function(test){
  var negate=function(s){
    s=nlp.pos(s).sentences[0].negate().text()
    return s
  }
  // hacks for logic-words
  test.deepEqual(negate("everyone will still be there"), "no one will still be there")
  test.deepEqual(negate("everybody listens to the cbc"), "nobody listens to the cbc")
  test.deepEqual(negate("somebody said it was great"), "nobody said it was great")
  test.deepEqual(negate("i always walk to work"), "i never walk to work")
  test.deepEqual(negate("always the quiet ones"), "never the quiet ones")
  test.deepEqual(negate("i always use the laptop"), "i never use the laptop")
  test.deepEqual(negate("he will always be a fool"), "he won't always be a fool")
  test.deepEqual(negate("he always will be a fool"), "he never will be a fool")
  test.deepEqual(negate("he will john"), "he won't john")
  test.deepEqual(negate("he won't john"), "he will john")
  test.deepEqual(negate("the groom will"), "the groom won't")
  // [infinitive verb] - walk -> don't walk
  test.deepEqual(negate("i say"), "i don't say")
  test.deepEqual(negate("i think everything will be ok"), "i don't think everything will be ok")
  // [future-tense verb] - will->wont
  test.deepEqual(negate("he will go to the store"), "he won't go to the store")
  test.deepEqual(negate("she will watch the movie"), "she won't watch the movie")
  //[present-tense verb] - add 'didn't', conjugate verb
  test.deepEqual(negate("she walks"), "she doesn't walk")
  test.deepEqual(negate("he goes to the store"), "he doesn't go to the store")
  test.deepEqual(negate("she watches the movie"), "she doesn't watch the movie")
  test.deepEqual(negate("she clutches the wheel"), "she doesn't clutch the wheel")
  test.deepEqual(negate("she sells seashells by the seashore"), "she doesn't sell seashells by the seashore")
  test.deepEqual(negate("she still drives to work"), "she still doesn't drive to work")
  //[past-tense verb] - add didn't and conjugate verb
  test.deepEqual(negate("he went to the store"), "he didn't go to the store")
  test.deepEqual(negate("she watched the movie"), "she didn't watch the movie")
  //[gerund verb] - 'walking' -> 'not walking'
  test.deepEqual(negate("walking to toronto"), "not walking to toronto")
  test.deepEqual(negate("smoking in the elevator"), "not smoking in the elevator")
  // [copula] - not
  test.deepEqual(negate("he is an animal"), "he isn't an animal")
  test.deepEqual(negate("tom was a goofball"), "tom wasn't a goofball")
  test.deepEqual(negate("he will be a lion"), "he won't be a lion")
  // already negative
  test.deepEqual(negate("he didn't go to the store"), "he did go to the store")
  test.deepEqual(negate("she didn't watch the movie"), "she did watch the movie")
  test.deepEqual(negate("he will not be a lion"), "he will be a lion")
  // other stuff
  test.deepEqual(negate("he will be the best"), "he won't be the best")
  test.deepEqual(negate("he is the best"), "he isn't the best")
  test.deepEqual(negate("he is walking to toronto"), "he isn't walking to toronto")
  // coumpound sentences
  test.deepEqual(negate("he will be a lion and will be on stage"), "he won't be a lion and will be on stage")
  test.deepEqual(negate("he was a lion and will be on stage"), "he wasn't a lion and will be on stage")
  test.deepEqual(negate("the walk was good and swimming was nice"), "the walk wasn't good and swimming was nice")
  //hard ones
  // test.deepEqual(negate("he will really not be a king"), "he will totally be a king") //this is interesting..
  // test.deepEqual(negate("he will not really be a king"), "he will totally be a king") //this is interesting..
  // test.deepEqual(negate("smoking in the elevator is allowed"), "smoking in the elevator is not allowed") // this is interesting..

  test.done()
}

exports["adjective.to_comparative"] = function(test){
    test.deepEqual(nlp.adjective("quick").conjugate().comparative , "quicker")
    test.deepEqual(nlp.adjective("friendly").conjugate().comparative , "friendlier")
    test.deepEqual(nlp.adjective("stinky").conjugate().comparative , "stinkier")
    test.deepEqual(nlp.adjective("clever").conjugate().comparative , "more clever")
    test.deepEqual(nlp.adjective("caring").conjugate().comparative , "more caring")
    test.done();
};

exports["adjective.to_superlative"] = function(test){
    test.deepEqual(nlp.adjective("quick").conjugate().superlative , "quickest")
    test.deepEqual(nlp.adjective("friendly").conjugate().superlative , "friendliest")
    test.deepEqual(nlp.adjective("caring").conjugate().superlative , "most caring")
    test.done();
};

exports["adjective.to_adverb"] = function(test){
    test.deepEqual(nlp.adjective('obligatory').conjugate().adverb , 'obligatorily')
    test.deepEqual(nlp.adjective('extensive').conjugate().adverb , 'extensively')
    test.deepEqual(nlp.adjective('large').conjugate().adverb , 'largely')
    test.deepEqual(nlp.adjective('naive').conjugate().adverb , 'naively')
    test.deepEqual(nlp.adjective('unimaginable').conjugate().adverb , 'unimaginably')
    test.deepEqual(nlp.adjective('unthinkable').conjugate().adverb , 'unthinkably')
    test.deepEqual(nlp.adjective('amiable').conjugate().adverb , 'amiably')
    test.deepEqual(nlp.adjective('affable').conjugate().adverb , 'affably')
    test.deepEqual(nlp.adjective('livid').conjugate().adverb , 'lividly')
    test.deepEqual(nlp.adjective('tentative').conjugate().adverb , 'tentatively')
    test.deepEqual(nlp.adjective('wide').conjugate().adverb , 'widely')
    test.deepEqual(nlp.adjective('impracticable').conjugate().adverb , 'impracticably')
    test.deepEqual(nlp.adjective('gruesome').conjugate().adverb , 'gruesomely')
    test.deepEqual(nlp.adjective('jejune').conjugate().adverb , 'jejunely')
    test.deepEqual(nlp.adjective('immature').conjugate().adverb , 'immaturely')
    test.deepEqual(nlp.adjective('retentive').conjugate().adverb , 'retentively')
    test.deepEqual(nlp.adjective('desperate').conjugate().adverb , 'desperately')
    test.deepEqual(nlp.adjective('recognizable').conjugate().adverb , 'recognizably')
    test.deepEqual(nlp.adjective('close').conjugate().adverb , 'closely')
    test.deepEqual(nlp.adjective('unprofitable').conjugate().adverb , 'unprofitably')
    test.deepEqual(nlp.adjective('vapid').conjugate().adverb , 'vapidly')
    test.deepEqual(nlp.adjective('obscure').conjugate().adverb , 'obscurely')
    test.deepEqual(nlp.adjective('bad').conjugate().adverb , 'badly')
    test.deepEqual(nlp.adjective('indeterminable').conjugate().adverb , 'indeterminably')
    test.deepEqual(nlp.adjective('horrible').conjugate().adverb , 'horribly')
    test.deepEqual(nlp.adjective('shamefaced').conjugate().adverb , 'shamefacedly')
    test.deepEqual(nlp.adjective('suave').conjugate().adverb , 'suavely')
    test.deepEqual(nlp.adjective('ornate').conjugate().adverb , 'ornately')
    test.deepEqual(nlp.adjective('inattentive').conjugate().adverb , 'inattentively')
    test.deepEqual(nlp.adjective('abstracted').conjugate().adverb , 'abstractedly')
    test.deepEqual(nlp.adjective('absentminded').conjugate().adverb , 'absentmindedly')
    test.deepEqual(nlp.adjective('competitive').conjugate().adverb , 'competitively')
    test.deepEqual(nlp.adjective('secure').conjugate().adverb , 'securely')
    test.deepEqual(nlp.adjective('profitable').conjugate().adverb , 'profitably')
    test.deepEqual(nlp.adjective('productive').conjugate().adverb , 'productively')
    test.deepEqual(nlp.adjective('irritable').conjugate().adverb , 'irritably')
    test.deepEqual(nlp.adjective('unfashionable').conjugate().adverb , 'unfashionably')
    test.deepEqual(nlp.adjective('dense').conjugate().adverb , 'densely')
    test.deepEqual(nlp.adjective('visible').conjugate().adverb , 'visibly')
    test.deepEqual(nlp.adjective('noticeable').conjugate().adverb , 'noticeably')
    test.deepEqual(nlp.adjective('observable').conjugate().adverb , 'observably')
    test.deepEqual(nlp.adjective('perceptible').conjugate().adverb , 'perceptibly')
    test.deepEqual(nlp.adjective('inexpressive').conjugate().adverb , 'inexpressively')
    test.deepEqual(nlp.adjective('unproductive').conjugate().adverb , 'unproductively')
    test.deepEqual(nlp.adjective('imaginative').conjugate().adverb , 'imaginatively')
    test.deepEqual(nlp.adjective('incisive').conjugate().adverb , 'incisively')
    test.deepEqual(nlp.adjective('precise').conjugate().adverb , 'precisely')
    test.deepEqual(nlp.adjective('reserved').conjugate().adverb , 'reservedly')
    test.deepEqual(nlp.adjective('effusive').conjugate().adverb , 'effusively')
    test.deepEqual(nlp.adjective('square').conjugate().adverb , 'squarely')
    test.done();
};

exports["adverb.to_adjective"] = function(test){
    test.deepEqual(nlp.adverb('garishly').conjugate().adjective , 'garish')
    test.deepEqual(nlp.adverb('tediously').conjugate().adjective , 'tedious')
    test.deepEqual(nlp.adverb('frightfully').conjugate().adjective , 'frightful')
    test.deepEqual(nlp.adverb('tortuously').conjugate().adjective , 'tortuous')
    test.deepEqual(nlp.adverb('privately').conjugate().adjective , 'private')
    test.deepEqual(nlp.adverb('unambiguously').conjugate().adjective , 'unambiguous')
    test.deepEqual(nlp.adverb('cortically').conjugate().adjective , 'cortic')
    test.deepEqual(nlp.adverb('biradially').conjugate().adjective , 'biradial')
    test.deepEqual(nlp.adverb('meanly').conjugate().adjective , 'mean')
    test.deepEqual(nlp.adverb('raspingly').conjugate().adjective , 'rasping')
    test.deepEqual(nlp.adverb('comprehensively').conjugate().adjective , 'comprehensive')
    test.deepEqual(nlp.adverb('fervently').conjugate().adjective , 'fervent')
    test.deepEqual(nlp.adverb('nationally').conjugate().adjective , 'national')
    test.deepEqual(nlp.adverb('maternally').conjugate().adjective , 'maternal')
    test.deepEqual(nlp.adverb('flashily').conjugate().adjective , 'flashy')
    test.deepEqual(nlp.adverb('only').conjugate().adjective , 'only')
    test.deepEqual(nlp.adverb('narrowly').conjugate().adjective , 'narrow')
    test.deepEqual(nlp.adverb('blasphemously').conjugate().adjective , 'blasphemous')
    test.deepEqual(nlp.adverb('abortively').conjugate().adjective , 'abortive')
    test.deepEqual(nlp.adverb('inoffensively').conjugate().adjective , 'inoffensive')
    test.deepEqual(nlp.adverb('truly').conjugate().adjective , 'true')
    test.deepEqual(nlp.adverb('gently').conjugate().adjective , 'gent')
    test.deepEqual(nlp.adverb('tolerantly').conjugate().adjective , 'tolerant')
    test.deepEqual(nlp.adverb('enchantingly').conjugate().adjective , 'enchanting')
    test.deepEqual(nlp.adverb('unswervingly').conjugate().adjective , 'unswerving')
    test.deepEqual(nlp.adverb('grubbily').conjugate().adjective , 'grubby')
    test.deepEqual(nlp.adverb('longitudinally').conjugate().adjective , 'longitudinal')
    test.deepEqual(nlp.adverb('thermodynamically').conjugate().adjective , 'thermodynamic')
    test.deepEqual(nlp.adverb('mirthfully').conjugate().adjective , 'mirthful')
    test.deepEqual(nlp.adverb('salaciously').conjugate().adjective , 'salacious')
    test.deepEqual(nlp.adverb('dourly').conjugate().adjective , 'dour')
    test.deepEqual(nlp.adverb('credulously').conjugate().adjective , 'credulous')
    test.deepEqual(nlp.adverb('carefully').conjugate().adjective , 'careful')
    test.deepEqual(nlp.adverb('knowingly').conjugate().adjective , 'knowing')
    test.deepEqual(nlp.adverb('geometrically').conjugate().adjective , 'geometrical')
    test.deepEqual(nlp.adverb('unassailably').conjugate().adjective , 'unassailable')
    test.deepEqual(nlp.adverb('antecedently').conjugate().adjective , 'antecedent')
    test.deepEqual(nlp.adverb('adjectively').conjugate().adjective , 'adjective')
    test.deepEqual(nlp.adverb('hebdomadally').conjugate().adjective , 'hebdomadal')
    test.deepEqual(nlp.adverb('dizzily').conjugate().adjective , 'dizzy')
    test.deepEqual(nlp.adverb('obnoxiously').conjugate().adjective , 'obnoxious')
    test.deepEqual(nlp.adverb('thirstily').conjugate().adjective , 'thirsty')
    test.deepEqual(nlp.adverb('biennially').conjugate().adjective , 'biennial')
    test.deepEqual(nlp.adverb('roguishly').conjugate().adjective , 'roguish')
    test.deepEqual(nlp.adverb('mentally').conjugate().adjective , 'mental')
    test.deepEqual(nlp.adverb('incessantly').conjugate().adjective , 'incessant')
    test.deepEqual(nlp.adverb('intelligently').conjugate().adjective , 'intelligent')
    test.deepEqual(nlp.adverb('perseveringly').conjugate().adjective , 'persevering')
    test.deepEqual(nlp.adverb('namely').conjugate().adjective , 'name')
    test.deepEqual(nlp.adverb('formidably').conjugate().adjective , 'formidable')
    test.done();
};

exports["nlp.sentences"] = function(test){
    test.deepEqual(nlp.sentences('Tony is nice. He lives in Japan.').length , 2)
    test.deepEqual(nlp.sentences('I like that Color').length , 1)
    test.deepEqual(nlp.sentences("Hi there Dr. Joe, the price is 4.59 for N.A.S.A. Ph.Ds. I hope that's fine, etc. and you can attend Feb. 8th. Bye").length , 3)
    test.deepEqual(nlp.sentences("Soviet bonds to be sold in the U.S. market. Everyone wins.").length , 2)
    test.deepEqual(nlp.sentences("Hi there! Everyone wins!").length , 2)
    test.deepEqual(nlp.sentences("Hi there!!! Everyone wins.").length , 2)
    test.deepEqual(nlp.sentences("he bought Yahoo! the company.").length , 1)
    test.done();
};

exports["pluralize"] = function(test){
    test.deepEqual(nlp.noun('snake').pluralize() , 'snakes')
    test.deepEqual(nlp.noun('ski').pluralize() , 'skis')
    test.deepEqual(nlp.noun('Barrymore').pluralize() , 'Barrymores')
    test.deepEqual(nlp.noun('witch').pluralize() , 'witches')
    test.deepEqual(nlp.noun('box').pluralize() , 'boxes')
    test.deepEqual(nlp.noun('gas').pluralize() , 'gases')
    test.deepEqual(nlp.noun('kiss').pluralize() , 'kisses')
    test.deepEqual(nlp.noun('index').pluralize() , 'indices')
    test.deepEqual(nlp.noun('appendix').pluralize() , 'appendices')
    test.deepEqual(nlp.noun('criterion').pluralize() , 'criteria')
    test.deepEqual(nlp.noun('berry').pluralize() , 'berries')
    test.deepEqual(nlp.noun('activity').pluralize() , 'activities')
    test.deepEqual(nlp.noun('daisy').pluralize() , 'daisies')
    test.deepEqual(nlp.noun('church').pluralize() , 'churches')
    test.deepEqual(nlp.noun('fox').pluralize() , 'foxes')
    test.deepEqual(nlp.noun('stomach').pluralize() , 'stomachs')
    test.deepEqual(nlp.noun('epoch').pluralize() , 'epochs')
    test.deepEqual(nlp.noun('knife').pluralize() , 'knives')
    test.deepEqual(nlp.noun('half').pluralize() , 'halves')
    test.deepEqual(nlp.noun('scarf').pluralize() , 'scarves')
    test.deepEqual(nlp.noun('chief').pluralize() , 'chiefs')
    test.deepEqual(nlp.noun('spoof').pluralize() , 'spoofs')
    test.deepEqual(nlp.noun('solo').pluralize() , 'solos')
    test.deepEqual(nlp.noun('zero').pluralize() , 'zeros')
    test.deepEqual(nlp.noun('avocado').pluralize() , 'avocados')
    test.deepEqual(nlp.noun('studio').pluralize() , 'studios')
    test.deepEqual(nlp.noun('zoo').pluralize() , 'zoos')
    test.deepEqual(nlp.noun('embryo').pluralize() , 'embryos')
    test.deepEqual(nlp.noun('hero').pluralize() , 'heroes')
    test.deepEqual(nlp.noun('banjo').pluralize() , 'banjos')
    test.deepEqual(nlp.noun('cargo').pluralize() , 'cargos')
    test.deepEqual(nlp.noun('flamingo').pluralize() , 'flamingos')
    test.deepEqual(nlp.noun('fresco').pluralize() , 'frescos')
    test.deepEqual(nlp.noun('ghetto').pluralize() , 'ghettos')
    test.deepEqual(nlp.noun('halo').pluralize() , 'halos')
    test.deepEqual(nlp.noun('mango').pluralize() , 'mangos')
    test.deepEqual(nlp.noun('memento').pluralize() , 'mementos')
    test.deepEqual(nlp.noun('motto').pluralize() , 'mottos')
    test.deepEqual(nlp.noun('tornado').pluralize() , 'tornados')
    test.deepEqual(nlp.noun('tuxedo').pluralize() , 'tuxedos')
    test.deepEqual(nlp.noun('volcano').pluralize() , 'volcanos')
    // test.deepEqual(nlp.noun('bus').pluralize() , 'buses')
    // test.deepEqual(nlp.noun('crisis').pluralize() , 'crises')
    // test.deepEqual(nlp.noun('analysis').pluralize() , 'analyses')
    // test.deepEqual(nlp.noun('neurosis').pluralize() , 'neuroses')
    test.deepEqual(nlp.noun('aircraft').pluralize() , 'aircraft')
    test.deepEqual(nlp.noun('halibut').pluralize() , 'halibut')
    test.deepEqual(nlp.noun('moose').pluralize() , 'moose')
    test.deepEqual(nlp.noun('salmon').pluralize() , 'salmon')
    test.deepEqual(nlp.noun('sheep').pluralize() , 'sheep')
    test.deepEqual(nlp.noun('spacecraft').pluralize() , 'spacecraft')
    test.deepEqual(nlp.noun('tuna').pluralize() , 'tuna')
    test.deepEqual(nlp.noun('trout').pluralize() , 'trout')
    test.deepEqual(nlp.noun('armadillo').pluralize() , 'armadillos')
    test.deepEqual(nlp.noun('auto').pluralize() , 'autos')
    test.deepEqual(nlp.noun('bravo').pluralize() , 'bravos')
    test.deepEqual(nlp.noun('bronco').pluralize() , 'broncos')
    test.deepEqual(nlp.noun('casino').pluralize() , 'casinos')
    test.deepEqual(nlp.noun('combo').pluralize() , 'combos')
    test.deepEqual(nlp.noun('gazebo').pluralize() , 'gazebos')
    test.done();
};

exports["singularize"] = function(test){
    test.deepEqual(nlp.noun('Joneses').singularize() , 'Jones')
    test.deepEqual(nlp.noun('children').singularize() , 'child')
    test.deepEqual(nlp.noun('women').singularize() , 'woman')
    test.deepEqual(nlp.noun('men').singularize() , 'man')
    test.deepEqual(nlp.noun('people').singularize() , 'person')
    test.deepEqual(nlp.noun('geese').singularize() , 'goose')
    test.deepEqual(nlp.noun('mice').singularize() , 'mouse')
    test.deepEqual(nlp.noun('barracks').singularize() , 'barracks')
    test.deepEqual(nlp.noun('deer').singularize() , 'deer')
    test.deepEqual(nlp.noun('nuclei').singularize() , 'nucleus')
    test.deepEqual(nlp.noun('syllabi').singularize() , 'syllabus')
    test.deepEqual(nlp.noun('fungi').singularize() , 'fungus')
    test.deepEqual(nlp.noun('cacti').singularize() , 'cactus')
    test.deepEqual(nlp.noun('theses').singularize() , 'thesis')
    test.deepEqual(nlp.noun('crises').singularize() , 'crisis')
    test.deepEqual(nlp.noun('phenomena').singularize() , 'phenomenon')
    test.deepEqual(nlp.noun('embryos').singularize() , 'embryo')
    test.deepEqual(nlp.noun('frescos').singularize() , 'fresco')
    test.deepEqual(nlp.noun('ghettos').singularize() , 'ghetto')
    test.deepEqual(nlp.noun('halos').singularize() , 'halo')
    test.deepEqual(nlp.noun('mangos').singularize() , 'mango')
    test.deepEqual(nlp.noun('mementos').singularize() , 'memento')
    test.deepEqual(nlp.noun('mottos').singularize() , 'motto')
    test.deepEqual(nlp.noun('tornados').singularize() , 'tornado')
    test.deepEqual(nlp.noun('tuxedos').singularize() , 'tuxedo')
    test.deepEqual(nlp.noun('volcanos').singularize() , 'volcano')
    test.deepEqual(nlp.noun('crises').singularize() , 'crisis')
    test.deepEqual(nlp.noun('analyses').singularize() , 'analysis')
    test.deepEqual(nlp.noun('aircraft').singularize() , 'aircraft')
    test.deepEqual(nlp.noun('bass').singularize() , 'bass')
    test.deepEqual(nlp.noun('bison').singularize() , 'bison')
    test.deepEqual(nlp.noun('fish').singularize() , 'fish')
    test.deepEqual(nlp.noun('fowl').singularize() , 'fowl')
    test.deepEqual(nlp.noun('kilos').singularize() , 'kilo')
    test.deepEqual(nlp.noun('kimonos').singularize() , 'kimono')
    test.deepEqual(nlp.noun('logos').singularize() , 'logo')
    test.deepEqual(nlp.noun('memos').singularize() , 'memo')
    test.deepEqual(nlp.noun('ponchos').singularize() , 'poncho')
    test.deepEqual(nlp.noun('photos').singularize() , 'photo')
    test.deepEqual(nlp.noun('pimentos').singularize() , 'pimento')
    test.deepEqual(nlp.noun('pros').singularize() , 'pro')
    test.deepEqual(nlp.noun('sombreros').singularize() , 'sombrero')
    test.deepEqual(nlp.noun('tacos').singularize() , 'taco')
    test.deepEqual(nlp.noun('memos').singularize() , 'memo')
    test.deepEqual(nlp.noun('torsos').singularize() , 'torso')
    test.deepEqual(nlp.noun('xylophones').singularize() , 'xylophone')
    test.deepEqual(nlp.noun('quintuplets').singularize() , 'quintuplet')
    test.deepEqual(nlp.noun('worrywarts').singularize() , 'worrywart')
    test.deepEqual(nlp.noun('nerds').singularize() , 'nerd')
    test.deepEqual(nlp.noun('lollipops').singularize() , 'lollipop')
    test.deepEqual(nlp.noun('eyebrows').singularize() , 'eyebrow')
    test.done();
};


exports["ngram"] = function(test){
    s = nlp.ngram("i really think that we all really think it's all good")
    test.deepEqual(s[1][0].word , 'really think' )
    test.deepEqual(s[1][0].count , 2 )
    test.deepEqual(s[0][0].word , 'really')
    s = nlp.ngram("She sells seashells by the seashore. The shells she sells are surely seashells.")
    test.deepEqual(s[0][0].word , 'she')
    test.done();
};

exports["adj_to_noun"] = function(test){
    test.deepEqual(nlp.adjective("ferocious").conjugate().noun , "ferociousness")
    test.deepEqual(nlp.adjective("fancy").conjugate().noun , "fanciness")
    test.done();
};

exports["dates"] = function(test){
    var dates=[
      ["I got divorced on June 4th 1993, in Miami",  {"month":5,"day":4,"year":1993}],
      ["March 7th-11th 1987",  {"month":2,"day":7,"year":1987}],
      ["June 1st-11th 1999",  {"month":5,"day":1,"year":1999}],
      ["28th of September to 5th of October 2008",  {"month":8,"day":28,"year":2008}],
      ["2nd of January to 5th of October 2008",  {"month":9,"day":5,"year":2008}],
      ["March 7th to june 11th 1987",  {"month":2,"day":7,"year":1987}],
      ["April 17th to september 11th 1981",  {"month":3,"day":17,"year":1981}],
      ["June 1st to June 11th 2014",  {"month":5,"day":1,"year":2014}],
      ["between 13 February and 15 February 1945",  {"month":1,"day":13,"year":1945}],
      ["between March 7th and june 11th 1987",  {"month":2,"day":7,"year":1987}],
      ["March 1st 1987",  {"month":2,"day":1,"year":1987}],
      ["June 22nd 2014",  {"month":5,"day":22,"year":undefined}],
      ["June 22nd 1997",  {"month":5,"day":22,"year":undefined}],
      ["3rd - 5th of March 1969",  {"month":2,"day":3,"year":1969}],
      ["3rd of March 1969",  {"month":2,"day":3,"year":1969}],
      ["2nd of April 1929",  {"month":3,"day":undefined,"year":1929}],
      // ["September 1939 to April 1945",  {"month":undefined,"day":undefined,"year":1939}],
      // ["June 1969 to April 1975",  {"month":undefined,"day":undefined,"year":1969}],
      ["March 1969",  {"month":2,"day":undefined,"year":1969}],
      ["March 18th",  {"month":2,"day":18,"year":undefined}],
      ["August 28th",  {"month":7,"day":28,"year":undefined}],
      ["18th of March",  {"month":2,"day":18,"year":undefined}],
      ["27th of March",  {"month":2,"day":27,"year":undefined}],
      ["2012-2014",  {"month":undefined,"day":undefined,"year":2012}],
      ["1997-1998",  {"month":undefined,"day":undefined,"year":1997}],
      ["1998",  {"month":undefined,"day":undefined,"year":1998}],
      ["1672",  {"month":undefined,"day":undefined,"year":1672}],
      ["2015",  {"month":undefined,"day":undefined,"year":2015}],
      ["january 5th 1998",  {"month":0,"day":5,"year":1998}],

      //edge cases
      // ["2014-1998",  {"month":undefined,"day":undefined,"year":undefined}],
      ["february 10th",  {"month":1,"day":10,"year":undefined}],
      ["february 30th",  {"month":1,"day":undefined,"year":undefined}],
      // ["2103",  {"month":undefined,"day":undefined,"year":undefined}],
      // ["1111",  {"month":undefined,"day":undefined,"year":undefined}],
      ["jan 1921",  {"month":0,"day":undefined,"year":1921}],
      // ["",  {"month":undefined,"day":undefined,"year":undefined}],
    ]
  dates.forEach(function(arr, i){
    var o=nlp.value(arr[0]).date();
    delete o.date_object
    delete o.to
    test.deepEqual(o, arr[1], arr[0])
  })
  test.done();
}

exports["americanization"] = function(test){
    test.deepEqual(nlp.americanize("synthesise") , "synthesize")
    test.deepEqual(nlp.americanize("synthesised") , "synthesized")
    test.deepEqual(nlp.americanize("synthesises") , "synthesizes")
    test.deepEqual(nlp.americanize("synthesising") , "synthesizing")
    test.deepEqual(nlp.americanize("analyse") , "analyze")
    test.deepEqual(nlp.americanize("analysed") , "analyzed")
    test.deepEqual(nlp.americanize("analysing") , "analyzing")
    test.deepEqual(nlp.americanize("poise") , "poise")
    test.deepEqual(nlp.americanize("poised") , "poised")
    test.deepEqual(nlp.americanize("colour") , "color")
    test.deepEqual(nlp.americanize("honour") , "honor")
    test.deepEqual(nlp.americanize("neighbour") , "neighbor")
    test.deepEqual(nlp.americanize("neighbourly") , "neighborly")
    test.deepEqual(nlp.americanize("savour") , "savor")
    test.deepEqual(nlp.americanize("savourly") , "savorly")
    test.deepEqual(nlp.americanize("favour") , "favor")
    test.deepEqual(nlp.americanize("favourite") , "favorite")
    test.deepEqual(nlp.americanize("theatre") , "theater")
    test.deepEqual(nlp.americanize("theatres") , "theaters")
    test.deepEqual(nlp.americanize("entendre") , "entendre")
    test.deepEqual(nlp.americanize("genre") , "genre")
    test.deepEqual(nlp.americanize("mediocre") , "mediocre")
    test.deepEqual(nlp.americanize("acre") , "acre")
    test.deepEqual(nlp.americanize("acres") , "acres")
    test.deepEqual(nlp.americanize("analogue") , "analog")
    test.deepEqual(nlp.americanize("homologue") , "homolog")
    test.deepEqual(nlp.americanize("anaemia") , "anemia")
    test.deepEqual(nlp.americanize("oestrogen") , "estrogen")
    test.deepEqual(nlp.americanize("ageing") , "aging")
    test.deepEqual(nlp.americanize("useable") , "usable")
    test.deepEqual(nlp.americanize("programme") , "programme")
    test.deepEqual(nlp.americanize("tonne") , "tonne")
    test.deepEqual(nlp.americanize("counsellor") , "counselor")
    test.deepEqual(nlp.americanize("traveller") , "traveler")
    test.deepEqual(nlp.americanize("labelled") , "labeled")
    test.deepEqual(nlp.americanize("cancelled") , "canceled")
    test.deepEqual(nlp.americanize("quarrelled") , "quarreled")
    test.deepEqual(nlp.americanize("signalling") , "signaling")
    test.deepEqual(nlp.americanize("modelling") , "modeling")
    test.deepEqual(nlp.americanize("travelling") , "traveling")
    test.deepEqual(nlp.americanize("willful") , "willful")
    test.deepEqual(nlp.americanize("filling") , "filling")
    test.done();
};

exports["britishization"] = function(test){
    test.deepEqual(nlp.britishize("synthesized") , "synthesised")
    test.done();
};

exports["nlp.syllables"] = function(test){
    test.deepEqual(nlp.syllables("suddenly").length , 3)
    test.deepEqual(nlp.syllables("constipation").length , 4)
    test.deepEqual(nlp.syllables("diabolic").length , 4)
    test.deepEqual(nlp.syllables("fate").length , 1)
    test.deepEqual(nlp.syllables("fated").length , 2)
    test.deepEqual(nlp.syllables("fates").length , 1)
    test.deepEqual(nlp.syllables("genetic").length , 3)
    test.deepEqual(nlp.syllables("deviled").length , 3)
    test.deepEqual(nlp.syllables("imitated").length , 4)
    test.deepEqual(nlp.syllables("horse").length , 1)
    test.done();
};

exports["unicode"] = function(test){
    var obj = {
        percentage: 100
    }
    test.deepEqual(nlp.normalize("The ɋӈїck brown fox juӎÞs over tӊe laζy dog", obj) , "The quick brown fox jumps over the lazy dog")
    test.deepEqual(nlp.normalize("Björk", obj) , "Bjork")
    test.done();
};

exports["nlp.value"] = function(test){
    test.deepEqual(nlp.value("twenty two thousand five hundred").number(), 22500)
    test.deepEqual(nlp.value("two thousand five hundred and sixty").number(), 2560)
    test.deepEqual(nlp.value("a hundred and two").number(), 102)
    test.deepEqual(nlp.value("a hundred").number(), 100)
    test.deepEqual(nlp.value("seven").number(), 7)
    test.deepEqual(nlp.value("seven grand").number(), 7000)
    test.deepEqual(nlp.value("half a million").number(), 500000)
    test.deepEqual(nlp.value("half-million").number(), 500000)
    test.deepEqual(nlp.value("quarter-million").number(), 250000)
    test.deepEqual(nlp.value("a quarter million").number(), 250000)
    test.deepEqual(nlp.value("a quarter-grand").number(), 250)
    test.deepEqual(nlp.value("104").number(), 104)
    test.deepEqual(nlp.value("13 thousand").number(), 13000)
    test.deepEqual(nlp.value("17,983").number(), 17983)
    test.deepEqual(nlp.value("nine hundred").number(), 900)
    test.deepEqual(nlp.value("twenty one hundred").number(), 2100)
    test.deepEqual(nlp.value("twenty one").number(), 21)
    test.deepEqual(nlp.value("seventy two").number(), 72)
    test.deepEqual(nlp.value("two hundred two").number(), 202)
    test.deepEqual(nlp.value("one thousand one").number(), 1001)
    test.deepEqual(nlp.value("minus five hundred").number(), -500)
    test.deepEqual(nlp.value("minus fifteen").number(), -15)
    test.deepEqual(nlp.value("five hundred million").number(), 500000000)
    test.deepEqual(nlp.value("$12.03").number(), 12.03)
    test.deepEqual(nlp.value("$12").number(), 12)
    test.deepEqual(nlp.value("5 hundred").number(), 500)
    test.deepEqual(nlp.value("5.2 thousand").number(), 5200)
    test.deepEqual(nlp.value("million").number(), 1000000)
    test.deepEqual(nlp.value("hundred one").number(), 101)
    test.deepEqual(nlp.value("12:32").number(), null)
    test.deepEqual(nlp.value("123-1231").number(), null)
    test.deepEqual(nlp.value("seven eleven").number(), null)
    test.deepEqual(nlp.value("ten-four").number(), null)
    test.deepEqual(nlp.value("one seven").number(), null)
    test.deepEqual(nlp.value("one ten").number(), null)
    test.deepEqual(nlp.value("one twelve").number(), null)
    test.deepEqual(nlp.value("one thirty").number(), null)
    test.deepEqual(nlp.value("nine fifty").number(), null)
    test.deepEqual(nlp.value("five six").number(), null)
    test.deepEqual(nlp.value("nine seventy").number(), null)
    test.deepEqual(nlp.value("nine two hundred").number(), null)
    test.deepEqual(nlp.value("ten one").number(), null)
    test.deepEqual(nlp.value("twelve one").number(), null)
    test.deepEqual(nlp.value("seventy five two").number(), null)
    test.deepEqual(nlp.value("two hundred three hundred").number(), null)
    test.deepEqual(nlp.value("sixty fifteen hundred").number(), null)
    test.deepEqual(nlp.value("one twenty").number(), null)
    test.deepEqual(nlp.value("twenty five twenty").number(), null)
    test.deepEqual(nlp.value("").number(), null)
    test.deepEqual(nlp.value("minus fifty").number(), -50)
    test.deepEqual(nlp.value("twenty thousand").number(), 20000)
    test.deepEqual(nlp.value("four point six").number(), 4.6)
    test.deepEqual(nlp.value("nine hundred point five").number(), 900.5)
    test.deepEqual(nlp.value("sixteen hundred sixteen point eight").number(), 1616.8)
    test.deepEqual(nlp.value("four point seven nine").number(), 4.79)
    test.deepEqual(nlp.value("four point sixteen").number(), 4.16)
    test.deepEqual(nlp.value("twenty first").number(), 21)
    test.deepEqual(nlp.value("fifty ninth").number(), 59)
    test.deepEqual(nlp.value("nine hundred fiftieth").number(), 950)
    test.done();
};


exports["nlp.noun.article"] = function(test){
    test.deepEqual(nlp.noun("wolf").article() , "a")
    test.deepEqual(nlp.noun("eulogy").article() , "a")
    test.deepEqual(nlp.noun("eater").article() , "an")
    test.deepEqual(nlp.noun("african").article() , "an")
    test.deepEqual(nlp.noun("houri").article() , "a")
    test.deepEqual(nlp.noun("awful").article() , "an")
    test.deepEqual(nlp.noun("utter").article() , "an")
    test.deepEqual(nlp.noun('S.S.L.').article() , "an")
    test.deepEqual(nlp.noun('FBI').article() , "an")
    test.deepEqual(nlp.noun('GHQ').article() , "a")
    test.done();
};

exports["nlp.tag"] = function(test){
  [
    ////coerce a noun
    ["Tony Hawk walked quickly to the store.", ["NN", "VB", "RB", "IN", "DT", "NN"]],
    ["swim", ["VBP"]],
    ["the swim", ["DT", "NN"]],
    // ["my swim was great", ["PP", "NN"]]
    ["the obviously good swim", ["DT", "RB", "JJ", "NN"]],
    ["spencer kelly", ["NN"]], //looks like an adverb but aint
    //coerce a verb
    ["the big swing", ["DT","JJ","NN"]],
    ["would normally swing", ["MD", "RB", "VBP"]],
    //coerce an adjective
    ["is quietly lkajsfijf", ["CP","RB", "JJ"]],
    // ["schlooking in toronto is scarey and lkasf", ["VBG", "IN", "NN", "CP", "JJ", "CC", "JJ"]]
    ["lkjasdf always walks so very nicely", ["NN", "RB", "VBZ", "RB"]],
    ["lkjasdf always walks in every cafesefirehty", ["NN", "RB", "VBZ", "IN", "DT", "NN"]],
    //coerce a verb
    // ["scared", ["JJ"]]
    ["scared him hard", ["VB", "PRP", "JJ"]],
    //coerce an adverb
    ["he is real", ["PRP", "CP", "JJ"]],
    ["he is real cool", ["PRP", "CP", "RB", "JJ"]],
    ["a pretty, good and nice swim", ["DT", "JJ", "JJ", "CC", "JJ", "NN"]],
    ["a pretty good and nice swim", ["DT", "RB", "JJ", "CC", "JJ", "NN"]],
  ].forEach(function(arr){
    test.deepEqual(nlp.pos(arr[0], {}).sentences[0].tags(), arr[1])
  })
  test.done();
};

exports["nlp.spot"] = function(test){
    var options = {
          gerund: true,
          stick_adjectives: true,
          stick_prepositions: true,
          stick_the: false,
          subnouns: false,
          match_whole: false
      }
    var terms=[
      ["tony hawk walked to Toronto", {}, ["tony hawk", "toronto"]],
      ["natalie portman in black swan was really great", {}, ["natalie portman"]],
      ["nancy reagan was great when she spoke about HIV in Denver", {}, ["nancy reagan", "hiv", "denver"]],
      ["Dr. Conrad Murray recieved a guilty verdict", {}, ["dr conrad murray"]],
      ["i agree with tom hanks and nancy kerrigan", {}, ["tom hanks", "nancy kerrigan"]],
      ["i went strolling in Berlin", {ignore_gerund: true}, ["berlin"]],
      ["smoking all day in the bathtub", {}, []],
      ["I recently watched The Simpsons", {}, ["the simpsons"]],
      ["I especially loved the singing in The Phantom of the Opera", {}, ["the phantom of the opera"] ],
    ]
    terms.forEach(function(arr){
      var spots= nlp.spot(arr[0], options).map(function(a) {
        a=a||{}
        return a.normalised
      })
      test.deepEqual(spots , arr[2])
    })
  test.done();
};
