function Tokenizer() {
    // WhiteSpace/LineTerminator as defined in ES5.1 plus Unicode characters in the Space, Separator category.
    this.trimmableCharacter = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u2028\u2029\u3000\uFEFF';

  }

  Tokenizer.prototype.getSentences = function(text){
    if(!text) return [];

    var words = this.tokenizeWithPunct(text);
    var endingWords = words.filter(function(w) {
      var character = w[w.length-1];
      return  character == "." ||
      character == "!" ||
      character == "?";
    });

    var self = this;
    var sentences = [];
    var lastSentence = words[0];
    for(var i = 0; i < words.length; i++)
    {
      var word = words[i];
      lastSentence = lastSentence + " " + word;

      if (endingWords.indexOf(word) != -1) {
        sentences.push(lastSentence);
        lastSentence = "";
      }
    }
    //sentences.push(lastSentence.compact());
    return sentences;
  };


  Tokenizer.prototype.tokenizeAggressive = function(text) {
    return this.clean(text.split(/\W+/));
  };

  Tokenizer.prototype.tokenizeWithPunct = function(text)
  {
    return this.clean(text.match(/\S+/g));
  };

  Tokenizer.prototype.clean = function(array) {
    return array.filter(function(e){return e});
  };

  Tokenizer.prototype.trim = function(text) {
    return this.trimRight(this.trimLeft(text));
  };

  Tokenizer.prototype.trimLeft = function(text) {
    return text.replace('^['+this.trimmableCharacter+']+', '');
  };

  Tokenizer.prototype.trimRight = function(text) {
    return text.replace('['+this.trimmableCharacter+']+$', '');
  };
  
function JsSummarize(options)
{
    'use strict';

    /** @type {Number} This is the ideal sentence length and will give weight to 
    sentences that are close to this length */
    this._idealSentenceLength = 20.0;
    /** @type {Array} This is an array of tokens to exlude when generating sentence value */
    this._excludeList = ["-", " ", ",", ".", "a", "e", "i", "o", "u", "t", "about", "above", "above", "across", "after", "afterwards", "again", "against", "all", "almost", "alone", "along", "already", "also", "although", "always", "am", "among", "amongst", "amoungst", "amount", "an", "and", "another", "any", "anyhow", "anyone", "anything", "anyway", "anywhere", "are", "around", "as", "at", "back", "be", "became", "because", "become", "becomes", "becoming", "been", "before", "beforehand", "behind", "being", "below", "beside", "besides", "between", "beyond", "both", "bottom", "but", "by", "call", "can", "cannot", "can't", "co", "con", "could", "couldn't", "de", "describe", "detail", "did", "do", "done", "down", "due", "during", "each", "eg", "eight", "either", "eleven", "else", "elsewhere", "empty", "enough", "etc", "even", "ever", "every", "everyone", "everything", "everywhere", "except", "few", "fifteen", "fifty", "fill", "find", "fire", "first", "five", "for", "former", "formerly", "forty", "found", "four", "from", "front", "full", "further", "get", "give", "go", "got", "had", "has", "hasnt", "have", "he", "hence", "her", "here", "hereafter", "hereby", "herein", "hereupon", "hers", "herself", "him", "himself", "his", "how", "however", "hundred", "i", "ie", "if", "in", "inc", "indeed", "into", "is", "it", "its", "it's", "itself", "just", "keep", "last", "latter", "latterly", "least", "less", "like", "ltd", "made", "make", "many", "may", "me", "meanwhile", "might", "mill", "mine", "more", "moreover", "most", "mostly", "move", "much", "must", "my", "myself", "name", "namely", "neither", "never", "nevertheless", "new", "next", "nine", "no", "nobody", "none", "noone", "nor", "not", "nothing", "now", "nowhere", "of", "off", "often", "on", "once", "one", "only", "onto", "or", "other", "others", "otherwise", "our", "ours", "ourselves", "out", "over", "own", "part", "people", "per", "perhaps", "please", "put", "rather", "re", "said", "same", "see", "seem", "seemed", "seeming", "seems", "several", "she", "should", "show", "side", "since", "sincere", "six", "sixty", "so", "some", "somehow", "someone", "something", "sometime", "sometimes", "somewhere", "still", "such", "take", "ten", "than", "that", "the", "their", "them", "themselves", "then", "thence", "there", "thereafter", "thereby", "therefore", "therein", "thereupon", "these", "they", "thickv", "thin", "third", "this", "those", "though", "three", "through", "throughout", "thru", "thus", "to", "together", "too", "top", "toward", "towards", "twelve", "twenty", "two", "un", "under", "until", "up", "upon", "us", "use", "very", "via", "want", "was", "we", "well", "were", "what", "whatever", "when", "whence", "whenever", "where", "whereafter", "whereas", "whereby", "wherein", "whereupon", "wherever", "whether", "which", "while", "whither", "who", "whoever", "whole", "whom", "whose", "why", "will", "with", "within", "without", "would", "yet", "you", "your", "yours", "yourself", "yourselves", "the", "reuters", "news", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "mon", "tue", "wed", "thu", "fri", "sat", "sun", "rappler", "rapplercom", "inquirer", "yahoo", "home", "sports", "1", "10", "2012", "sa", "says", "tweet", "pm", "home", "homepage", "sports", "section", "newsinfo", "stories", "story", "photo", "2013", "na", "ng", "ang", "year", "years", "percent", "ko", "ako", "yung", "yun", "2", "3", "4", "5", "6", "7", "8", "9", "0", "time", "january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december", "philippine", "government", "police", "manila"];
    /**
     * This tokenizer is used to tokenize text into words or sentences
     * @type {Tokenizer}
     */
    this._tokenizer = new Tokenizer();

    /** @type {Number} The number of summary sentences to return */
    this._returnCount = 5;

    /** @type {Array} Sentence position value array. Used to score sentence position in text */
    this._positionValueArray = [
        {low:0, high:0.1, score:0.17},
        {low:0.1, high:0.2, score:0.23},
        {low:0.2, high:0.3, score:0.14},
        {low:0.3, high:0.4, score:0.08},
        {low:0.4, high:0.5, score:0.05},
        {low:0.5, high:0.6, score:0.04},
        {low:0.6, high:0.7, score:0.06},
        {low:0.7, high:0.8, score:0.04},
        {low:0.8, high:0.9, score:0.04},
        {low:0.9, high:1.0, score:0.15}
    ];

    if(!options) return;

    this._idealSentenceLength = options.idealSentenceLength || this._idealSentenceLength;
    this._returnCount = options.returnCount || this._returnCount;
    this._excludeList = options.excludeList || this._excludeList;
    this._positionValueArray = options.positionValueArray || this._positionValueArray;
}

/**
 * Main function. Will take in the correct text and return an array of sentences
 * in order of importance.
 * 
 * @param  {string} title The title of the text
 * @param  {string} text The long text
 * @param  {object} options The options object used to override parameters
 * @return {array} an array of sentences that summarize the text
 */
JsSummarize.prototype.summarize = function (title, text) {

    if (text.length == 0) return [];

    var sentences = this.splitSentences(text);
    var keywords = this.keywords(text);
    var titleWords = this.splitWords(title)
    var scoredSentences = this.score(sentences, titleWords, keywords);

    //Sort by score, select just the sentences, and return 5 (or whatever is set in options)
    var orderedList = _.chain(scoredSentences)
                        .sortBy("score")
                        .reverse()
                        .pluck("sentence")
                        .take(this._returnCount)
                        .value();

    return orderedList;
},

/**
 * Handles the bulk of the operations. This will score sentences based on
 * shared keywords in the title, amount of high frequencey keywords, ideal length,
 * ideal position, sbs sentence algorithm,and the dbs sentence algorithm;
 * 
 * @param  {array} sentences  The array of sentences that make up the large text
 * @param  {array} titleWords The array of word tokens that make up the text title
 * @param  {array} keywords   The array of high frequency keywords in the text
 * @return {array}            The array of computed summary sentences.
 */
JsSummarize.prototype.score = function (sentences, titleWords, keywords) {

    var scoredSentences = [];

    for(var i = 0; i < sentences.length; i++)
    {
        //Split the sentence into words
        var sentenceWords = this.splitWords(sentences[i]);
        //Score based on shared title words
        var titleFeature = this.titleScore(titleWords, sentenceWords);
        //Score based on sentence length
        var sentenceLength = this.lengthScore(sentenceWords);
        //Score based on sentence position
        var sentencePosition = this.sentencePosition(i+1, sentences.length);
        //Score based on SBS
        var sbsFeature = this.sbs(sentenceWords, keywords);
        //Score based on DBS
        var dbsFeature = this.dbs(sentenceWords, keywords);
        //Calculate frequency
        var frequency = (sbsFeature + dbsFeature) / 2.0 * 10.0;

        //Weighted average of scores from four categores
        var totalScore = (titleFeature*1.5 + frequency*2.0 + sentenceLength*1.0 + sentencePosition*1.0)/4.0;

        scoredSentences.push({sentence:sentences[i],score:totalScore});
    }

    return scoredSentences;
},

/**
 * Summation-based selection scoring
 * @param  {array} words    sentence to score
 * @param  {array} keywords list of keywords to score against
 * @return {number}          score
 */
JsSummarize.prototype.sbs = function (words, keywords) {
    if(words.length == 0) return 0;

    var score = 0;
    var contribution = 10;

    for(var i = 0; i < words.length; i++)
    {
        var word = words[i];
        var match = _.find(keywords,{"word":word});
        if(match)
        {
            score += match.score;
        }
    }

    return (1.0 / words.length) * (score/contribution);
},

/**
 * Density-based selection scoring
 * @param  {array} words    sentence to score
 * @param  {array} keywords list of keywords to score against
 * @return {number}          score
 */
JsSummarize.prototype.dbs = function (words, keywords) {
    if(words.length == 0) return 0;
    
    var total = 0;
    var first = null;
    var second = null;
    var keywordsFound = 0;

    for(var i = 0; i < words.length; i++)
    {
        var word = words[i];
        var match = _.find(keywords,{"word":word});
        if(match)
        {
            keywordsFound++;
            var score = match.score;
            if(!first)
            {
                first = {index:i, score:score};
            }
            else{
                second = first;
                first = {index:i, score:score};
                var dif = first.index - second.index;
                total += (first.score*second.score) / (Math.pow(dif,2));
            }
        }
    }

    if(keywordsFound == 0) return 0;
    return (1/(keywordsFound*(keywordsFound+1)))*total;
},

/**
 * Uses tokenizer to split text into word tokens
 * @param  {string} text text to split into tokens
 * @return {array}      An array of words
 */
JsSummarize.prototype.splitWords = function (text) {
    return this._tokenizer.tokenizeAggressive(text.toLowerCase());
},

/**
 * Builds up a list of high frequency words (keywords) used throughout
 * the text. Uses the exclusion list to remove words that do not help the
 * sentence score.
 * 
 * @param  {string} text Full text to parse
 * @return {array}      An array of high frequency keywords
 */
JsSummarize.prototype.keywords = function (text) {

    var splitText = this.splitWords(text);

    var words = _.chain(splitText)
                .difference(this._excludeList)
                .groupBy(function (word) {return word;})
                .map(function(group){
                    var frequency = group.length;
                    var score = (frequency * 1.0 / splitText.length) * 1.5 + 1;
                    return {word:group[0], score:score};
                }).sortBy('score')
                .reverse()
                .take(10)
                .value();

    return words;
},

/**
 * Uses tokenizer to split text into sentences
 *     
 * @param  {string} text Full text to split into sentences
 * @return {array}      The array of sentences
 */ 
JsSummarize.prototype.splitSentences = function (text) {
    return this._tokenizer.getSentences(text);
},

/**
 * Scores a sentence based on the ideal length
 * @param  {array} sentence Sentence word array to score
 * @return {number}          Score based on sentence length
 */
JsSummarize.prototype.lengthScore = function (sentence) {

    return 1 - Math.abs(this._idealSentenceLength - sentence.length) / this._idealSentenceLength;
},

/**
 * Scores a sentence based on shared words with the title
 * 
 * @param  {string} title    Text Title
 * @param  {array} sentence Sentence word array to score
 * @return {number}          Score based on title
 */
JsSummarize.prototype.titleScore = function (title, sentence) {

    if(!title || !sentence) return 0;
    //Remove any words shared with the exclusion list
    var titleWords = _.difference(title, this._excludeList);
    var count = 0;
    for(var i = 0; i < sentence.length; i++)
    {
        var word = sentence[i];
        if(!_.contains(this._excludeList, word) && _.contains(titleWords, word ))
        {
            count++;
        }
    }

    return count === 0? 0 : count/title.length;
},

/**
 * Scores a sentence based on its location in the text. Different sentence
 * positions indicate different probabilities of being an important sentence.
 * 
 * @param  {number} index    Sentence index in array of text sentences
 * @param  {number} numberOfSentences The total number of sentences in the text
 * @return {number}      Scored based on sentence position
 */
JsSummarize.prototype.sentencePosition = function (index, numberOfSentences) {

    var normalized =  index*1.0 / numberOfSentences;

    for(var i = 0; i < this._positionValueArray.length; i++)
    {
        var position = this._positionValueArray[i];
        if(normalized > position.low && normalized <= position.high) return position.score;
    }

    return 0;
} 
