/** 
 *           File:  jquery.snippets.markdown.js
 *         Author:  Feng Weifeng(jpssff@gmail.com)
 *       Modifier:  Feng Weifeng(jpssff@gmail.com)
 *       Modified:  2011-06-16 13:11:31  
 *    Description:  markdown缩写表
 *      Copyright:  (c) 2011-2021 wifeng.cn
 */
(function(){
    $.snippets('markdown',{
        'a' : '[^!](http://)',
        'h1' : '# ^!',
        'h2' : '## ^!',
        'h3' : '### ^!',
        'h4' : '#### ^!',
        'h5' : '##### ^!',
        'li' : '* ^!',
        'img': '![alt ^!](http://)',
        'em' : '*^!*',
        'strong' : '__^!__'
    });
})(jQuery);

