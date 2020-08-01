var markdown = require('markdown');

exports.render = function(content){
    content = content.toString();
    return markdown.parse(content);
}
