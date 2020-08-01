'use strict';

var _ = require('underscore');
var sanitizeHtml = require('sanitize-html');
var url = require('url');

module.exports = sanitizeHtmlConfigured;

var allowedHtmlTags = [
    'a', 'abbr', 'acronym',
    'b', 'blockquote', 'br',
    'caption', 'cite', 'code', 'col', 'colgroup',
    'dd', 'del', 'div', 'dl', 'dt',
    'em', 'figcaption', 'figure',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hgroup', 'hr',
    'i', 'iframe', 'img', 'ins',
    'li',
    'mark',
    'ol',
    'p', 'pre',
    'q',
    's', 'small', 'span', 'strike', 'strong', 'sub', 'sup',
    'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'time', 'tr', 'tt',
    'u', 'ul'
];

var allowedHtmlAttributes = {
    a: ['href', 'title'],
    abbr: ['title'],
    del: ['cite', 'datetime'],
    iframe: ['height', 'src', 'width'],
    img: ['alt', 'height', 'src', 'title', 'width'],
    ins: ['cite', 'datetime'],
    q: ['cite'],
    time: ['datetime'],
    td: ['colspan', 'headers', 'rowspan'],
    th: ['colspan', 'headers', 'rowspan']
};

var htmlTransforms = {
    acronym: 'abbr',
    strike: 's',
};

function filter (frame) {
    if (frame.tag === 'img' && !frame.attribs.src) {
        return true;
    }
}

function sanitizeHtmlConfigured (html, postUrl) {
    var baseUrl = getBaseUrl(postUrl);
    var baseUrlTransforms = {
        a: buildBaseUrlTransform('href', baseUrl),
        img: buildBaseUrlTransform('src', baseUrl),
        iframe: buildBaseUrlTransform('src', baseUrl)
    };
    return sanitizeHtml(html, {
        allowedTags: allowedHtmlTags,
        allowedAttributes: allowedHtmlAttributes,
        transformTags: _.extend({}, baseUrlTransforms, htmlTransforms),
        exclusiveFilter: filter
    });
}

function getBaseUrl (fullUrl) {
    var parsedUrl = url.parse(fullUrl);
    return url.format({
        auth: parsedUrl.auth,
        protocol: parsedUrl.protocol,
        host: parsedUrl.host,
    });
}

function buildBaseUrlTransform (attr, baseUrl) {
    return function (tag, attribs) {
        if (attribs[attr] && attribs[attr].indexOf('/') === 0) {
            attribs = _.extend({}, attribs);
            attribs[attr] = baseUrl + attribs[attr];
        }
        return {
            tagName: tag,
            attribs: attribs
        };
    };
}
