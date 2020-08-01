function ParseError(message){
  this.message = message || "";
  this.name = "ParseError";
};
ParseError.prototype = new Error;

function shellwords(line){
  var words = _.map(line.split(/(\"[^\"]+\")/), function(block){
    var matches = block.match(/^\"(.*)\"$/);
    if (matches){
      return matches[1];
    } else {
      return block.split(/ +/);
    }
  });
  words = _.flatten(words);
  words = _.compact(words);
  if (_.detect(words, function(word){ return word.match(/\"/)})){
    throw new ParseError("Unmatched quote");
  }
  return words;
}
