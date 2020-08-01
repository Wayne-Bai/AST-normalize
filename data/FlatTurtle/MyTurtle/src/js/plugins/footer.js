/*
 * FlatTurtle
 * Footer RSS plugin
 *
 * @author: Jens Segers (jens@irail.be)
 * @author: Michiel Vancoillie (michiel@irail.be)
 * @license: AGPLv3
 */

var Footer = {

    element : null,

    enable : function(source) {
        // destroy previous message
        Footer.destroy();
        log.info("PLUGIN - FOOTER - Enable: " + source);

        if (source.indexOf('http://') == 0 || source.indexOf('//') == 0) {
            $.getScript("//www.google.com/jsapi", function(){
                google.load("feeds", "1", {'callback':function(){
                    var feed = new google.feeds.Feed(source);
                    feed.load(function(result) {
                        if (!result.error) {
                            Footer.element = $('<div id="message" class="scroll-footer"><div class="fade left"></div><div class="fade right"></div><marquee class="text-color"></marquee>');
                            // create content
                            for(var i in result.feed.entries) {
                                Footer.element.find('marquee').append('<span>' + result.feed.entries[i]['title'] + '</span>');
                            }
                            $("footer").append(Footer.element);
                        }else{
                            //what if the feed wasn't retrieved? Nothing?
                        }
                    });

                }});
            });
        } else {
            // create marquee element
            Footer.element = $('<div id="message" class="text-color">' + source + '</div>');
            $("footer").append(Footer.element);
        }
    },

    disable : function() {
        log.info("PLUGIN - FOOTER - Disable");
        // enable marquee style
        if (Footer.element)
            Footer.element.remove();
    },

    destroy : function() {
        Footer.disable();
    }

};