//系统
var fs = require('fs');
var path = require('path');

//非系统
var marked = require('./marked');
var $ = require('./helper');
var libDir = __dirname;
var rootDir = path.join(libDir, '../');
var assetsDir = path.join(rootDir, 'assets') + path.sep;
var templateDir = path.join(rootDir, 'template') + path.sep;
var EOL = '\n';
var SUB_SILDE_PLACEHOLDER = '~~NODEPPT%THEO●WANG%NODEPPT%~~';
var M_SUB_SILDE_PLACEHOLDER = marked(SUB_SILDE_PLACEHOLDER);
var templateFile = templateDir + 'markdown.ejs';

var defaultJSON = {
    title: 'nodeppt markdown',
    url: '',
    speaker: '',
    content: '',
    theme: 'moon',
    transition: 'move',
    files: '',
    highlightStyle: 'monokai_sublime'
};

marked.setOptions({
    gfm: true,

    // silent: true,
    tables: true,
    breaks: true,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    langPrefix: ''
});

var emptyFn = function(str) {
    // console.log(str);
};
var parser = function(string, callback, argvObj, queryObj, commonData) {
    if (typeof callback !== 'function') {
        callback = emptyFn;
    }
    var splitReg = /\[slide\s*(.*)\]/ig;
    var slidesSetting = string.match(splitReg) || [];
    var contents = string.split(/\[slide.*\]/i);
    // console.log(contents.length, slidesSetting);
    //第一个是封面
    var cover = contents.shift();
    var json = parseCover(cover);
    json = mix({}, json, commonData);

    var config = require(path.join(libDir, '../package.json'));
    json.nodeppt_version = config.version;
    json.nodeppt_site = config.site;
    json = mix({}, defaultJSON, json, {
        query: mix(queryObj || {}, argvObj || {})
    });

    //优先使用url的参数来控制，使用js来做，不再使用server
    ['theme', 'transition'].forEach(function(v) {
        if (json.query && json.query[v]) {
            json[v] = json.query[v];
        }
    });
    if (json.theme) {
        json.files = [json.files || '', '/css/theme.' + json.theme + '.css'].join(',');
    }

    if (json.files) {
        var files = json.files.split(/\s?,\s?/);
        json.files = files.map(function(v) {
            if (/.js$/i.test(v)) {
                //js文件
                return '<script src="' + v + '"></script>';
            } else if (/.css$/i.test(v)) {
                //css文件
                return '<link rel="stylesheet" href="' + v + '">';
            }
            return v;
        }).join(EOL);
    }
    var slides = [];
    var noteReg = /\[note\]([\s\S]+)\[\/note\]/im;
    var subReg = /\[subslide\]([\s\S]+)\[\/subslide\]/im;
    var subSeparator = /={5,}/;
    contents.forEach(function(v, i) {
        var cfg = slidesSetting[i];
        cfg = cfg.match(/\[slide\s+(.+)\s?\]/);
        var attrs = '';
        if (cfg) {
            attrs = cfg[1];
        }
        var note = noteReg.exec(v);
        if (note) {
            v = v.replace(noteReg, '');
            note = marked(note[1]);
        }
        var subslide = subReg.exec(v);
        var content = [];
        if (subslide) {
            subslide = subslide[1].split(subSeparator)
                .filter(function(v) {
                    return v && v.trim();
                });

            if (subslide.length > 1) {
                v = v.replace(subReg, EOL + SUB_SILDE_PLACEHOLDER + EOL);
                subslide.forEach(function(v, i) {
                    content.push(marked(v));
                });
            } else {
                v = v.replace(subReg, subslide[0]);
            }
        }
        v = v.trim();
        var tContent = '';
        if (v !== SUB_SILDE_PLACEHOLDER) {
            tContent = marked(v);
        }

        slides.push(parse(tContent, content, note, attrs));
    });
    //合并
    json.content = slides.join(EOL);

    //解析
    html = $.renderFile(templateFile, json);
    callback(html);
    return html;
};
parser.parseCover = parseCover;

module.exports = parser;

/**
 * mix
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */

function mix(obj) {
    var i = 1,
        target, key;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    for (; i < arguments.length; i++) {
        target = arguments[i];
        for (key in target) {
            if (hasOwnProperty.call(target, key)) {
                obj[key] = target[key];
            }
        }
    }

    return obj;
}

/**
 * 解析cover的json字符串
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
function parseCover(str) {
    str = str.split(EOL);
    var obj = {};
    var reg = /(\w+)\s?:\s?(.+)/;
    str.forEach(function(val) {
        if (val = reg.exec(val)) {
            obj[val[1]] = val[2];
        }
    });
    return obj;
}

/**
 * 解析 slide内容
 * @param  {Array} contArr   [description]
 * @param  {[type]} note  [description]
 * @param  {[type]} sAttrs 头部属性
 * @return {[type]}       [description]
 */

function parse(content, contArr, note, sAttrs) {

    contArr = contArr.map(function(v) {
        return '<div class="subSlide">' + contentParser(v) + '</div>';
    });
    if (content.trim() === '') {
        //空的，证明全部是subslide
        content = contArr.join(EOL);
    } else {
        content = contentParser(content);
        content = content.replace(M_SUB_SILDE_PLACEHOLDER, contArr.join(EOL));
    }
    //处理备注的内容
    if (note && note.length > 3) {
        note = ['<aside class="note">', '<section>', note, '</section>', '</aside>'].join(EOL);
    } else {
        note = '';
    }
    var tagStart = '<slide class="slide' + (note ? ' hasnote' : '') + '">';

    //处理[slide]的属性
    if (sAttrs) {
        var cls = sAttrs.match(/class=['"]?([^'"]+)['"]?/);
        if (cls) {
            cls = cls[1] + ' slide';
            sAttrs = sAttrs.replace(cls[0], '');
        } else {
            cls = 'slide';
        }
        if (/background/.test(sAttrs) && !/background-/.test(sAttrs) || /background-image/.test(sAttrs)) {
            cls += ' fill';
        }
        tagStart = '<slide class="' + cls + '" ' + sAttrs + '>';
        // console.log(tagStart);
    }
    return tagStart + note + '<section class="slide-wrapper">' + content + '</section></slide>';
}

function contentParser(str) {
    var arr = str.split('<hr>');
    var head = '',
        article = '';

    if (arr.length === 2) {
        head = arr[0];
        article = arr[1];
    } else {
        article = str;
    }
    if (head !== '') {
        head = doAttr(head);
        head = ['<hgroup>', head, '</hgroup>'].join(EOL);
    }

    var noHead = !head;
    var articleAttr;
    article = doAttr(article, true, noHead);

    article = ['<article>', article, '</article>'].join(EOL);
    //处理文章只用h1的情况，作为标题页面
    if (noHead && /<h1>.*<\/h1>/g.test(article)) {

        article = article.replace(/<h1>([^<]+)(\s+\{:\&amp;(.+)\})<\/h1>/m, function(input, text, idinput, attrs) {
            articleAttr = parseAttr(idinput, attrs);
            return '<h1>' + text + '</h1>';
        });
        if (!articleAttr) {
            article = article.replace('<article>', '<article class="flexbox vcenter">');
        } else {
            article = article.replace('<article>', '<article ' + articleAttr + '>');
        }
    } else {

        article = article.replace(/<(\w+)>(\s?\{:(?:\&amp;)?([^\&].+)\})<\/\1>/gm, function(input, tag, idinput, attrs) {
            articleAttr = parseAttr(idinput, attrs);
            return '';
        });
        //特殊处理tb
        article = article.replace(/<(td|p)>(.*)(\s?\{:(?:\&amp;)?([^\&].+)\})<\/\1>/gm, function(input, tag, con, idinput, attrs) {
            var a = parseAttr(idinput, attrs);
            if (con.indexOf('<span') === -1) {
                con = '<span>' + con + '<span>';
            }
            return '<' + tag + ' ' + a + '>' + con + '</' + tag + '>'
        });

        if (articleAttr) {
            article = article.replace('<article>', '<article ' + articleAttr + '>');
        }
    }
    article = article.replace(/<p>\s*<\/p>/, '');
    article = article.replace(/<p>\s*<p>(.*?)<\/p>\s*<\/p>/, function(index, reg) {
        return '<p>' + reg + '</p>';
    });
    return head + article;
}

/**
 * 替换属性
 * @param  {[type]}  str       [description]
 * @param  {Boolean} isArticle [description]
 * @param  {[type]}  noHead    [description]
 * @return {[type]}            [description]
 */
function doAttr(str, isArticle, noHead) {
    //input:## Title {:.build width="200px"}
    //output: <h2 class="build" width="200px">Title</h2>

    str = str.replace(/<(\w+)([^>]*)>([^<]+)(\s+\{:([^\&].+)\})<\/\1>/gm, function(input, tag, pre, text, idinput, attrs) {
        var attr = parseAttr(idinput, attrs);
        attr = mergeAttr(pre, attr);
        return '<' + tag + ' ' + attr + '>' + text + '</' + tag + '>';
    });
    str = str.replace(/<(\w+)>([^<]+)<(\w+)>(.+)(\s+\{:\&amp;(.+)\})/mg, function(input, parentTag, parentText, childTag, childText, idinput, attrs) {
        var attr = parseAttr(idinput, attrs);
        return '<' + parentTag + ' ' + attr + '>' + parentText + '<' + childTag + '>' + childText;
    });

    return str;
}

/**
 * 合并attr
 * @param  {string} oldAttr 老属性
 * @param  {string} newAttr 新属性
 * @return {[type]}         [description]
 */
function mergeAttr(oldAttr, newAttr) {
    if (!oldAttr) {
        return newAttr;
    }
    if (!newAttr) {
        return oldAttr;
    }
    //合并class style
    var oldAttrs = String(oldAttr).split(/\s+/);
    var newAttrs = String(newAttr).split(/\s+/);
    var old = {},
        inew = {};
    var back = [];
    oldAttrs.forEach(function(a) {
        var v = a.split('=');
        v[0] = v[0].toLowerCase();
        if (v[0] === 'class' || v[0] === 'style') {
            old[v[0]] = v[1].slice(1, -1).trim();
        } else {
            back.push(a);
        }
    });
    newAttrs.forEach(function(a) {
        var v = a.split('=');
        v[0] = v[0].toLowerCase();
        if (v[0] === 'class' || v[0] === 'style') {
            inew[v[0]] = v[1].slice(1, -1).trim();
        } else {
            back.push(a);
        }
    });
    ['class', 'style'].forEach(function(v) {
        //两个都存在，则合并之
        switch (v) {
            case 'class':
                back.push('class="' + [old[v] || '', inew[v] || ''].join(' ').trim() + '"');
                break;
            case 'style':
                back.push('style="' + [old[v] || '', inew[v] || ''].join(';') + '"');
                break;
        }
    });
    return back.join(' ');
}

/**
 * 解析自定义属性
 * @param  {[type]} idinput [description]
 * @param  {[type]} attrs   [description]
 * @return {[type]}         [description]
 */
function parseAttr(idinput, attrs) {
    attrs = attrs.split(/\s+/);
    // console.log(attrs);
    var attrArr = [];
    var idArr = [],
        classArr = [];
    attrs.forEach(function(attr) {
        if (!!~attr.indexOf('=')) {
            attrArr.push(attr);
        } else if (attr) {
            var ids = attr.split(/[#|.]/);
            // console.log(attr);
            ids.forEach(function(v) {
                if (v !== '') {
                    (new RegExp('\\#' + v)).test(idinput) && idArr.push(v);
                    (new RegExp('\\.' + v)).test(idinput) && classArr.push(v);
                }
            });
        }
    });

    var attr = '';
    var arr = [];
    if (idArr.length > 0) {
        arr.push('id="' + idArr.join(' ') + '"');

    }
    if (classArr.length > 0) {
        arr.push('class="' + classArr.join(' ') + '"');
    }
    if (attrArr.length > 0) {
        arr.push(attrArr.join(' '));

    }
    attr = arr.join(' ').replace(/&#39;/g, '\'')
        .replace(/&quot;/g, '"')
        .replace(/&gt;/g, '>')
        .replace(/&lt;/g, '<')
        .replace(/&amp;/g, '&');
    return attr;
}

///test
// var str = fs.readFileSync('ppts/demo.md').toString();

// parser(str);
