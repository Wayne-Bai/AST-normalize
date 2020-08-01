//## Internal Utilities
// ###Render method
//
// `render(map, type)`
//
// `map` is an object of data to render, `type` can be RGB, HSV or HSL
function render(map, type) {
    var rtn;

    switch(type) {
        case 'hex':
            var rgb = render(map, 'rgb');
            rtn = rgb2hex.apply(this,rgb);
            break;
        default:
            rtn = {};
            var keys;
            if (typeof map != "object") {
                return;
            }
            if (type === "rgb") {
                keys = ["R", "G", "B", "RGB"];
            }
            if (type === "hsv") {
                keys = ["H", "S", "V", "HSV"];
            }
            if (type === "hsl") {
                keys = ["H", "S", "L", "HSL"];
            }
            rtn[keys[0]] = map[0];
            rtn[keys[1]] = map[1];
            rtn[keys[2]] = map[2];
            rtn[keys[3]] = map[0] + " " + map[1] + " " + map[2];
            rtn.a = map;
            break;
    }

    return rtn;
};




// ### Padded Hex method
//
// `paddedHex(number)`
//
// Creates a hexadecimal number, and adds a zero to the beginning if its only one digit.
function paddedHex(n) {
    var hex = ((n < 10) ? "0" : "") + n.toString(16);
    return (hex.length === 1) ? "0" + hex : hex;
};


// ## The Colors methods
// ### rgb2hex method
//
// Change 3 RGB Ints or a single Int to a Hexadecimal color.
//
// `rgb2hex( [multiple Ints: R,G,B] or [single Int: COLOR] )`
function rgb2hex(r, g, b) {
    r = paddedHex(r);
    g = (g !== undefined) ? paddedHex(g) : r;
    b = (b !== undefined) ? paddedHex(b) : r;
    return "#" + r + g + b;
};


// ### hex2rgb method
//
// Change a hexadecimal color string to an RGB color object.
//
// `hex2rgb( "hex color string" ).[obj R, G, B, RGB or a]`
function hex2rgb(h) {
    h = h.replace("#", "");
    if (h.length === 6) {
        return render([parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)], "rgb");
    } else {
        return parseInt(h, 16);
    }
};

// ### name2hex method
//
// Get the hexadecimal value of an HTML color name. Must be one of the 176 HTML color names as defined by the HTML & CSS standards.
//
// `name2hex ( "color name" )`
function name2hex(n) {
    n = n.toLowerCase();
    var nar = {
        "aliceblue": "#f0f8ff",
        "antiquewhite": "#faebd7",
        "aqua": "#00ffff",
        "aquamarine": "#7fffd4",
        "azure": "#f0ffff",
        "beige": "#f5f5dc",
        "bisque": "#ffe4c4",
        "black": "#000000",
        "blanchedalmond": "#ffebcd",
        "blue": "#0000ff",
        "blueviolet": "#8a2be2",
        "brown": "#a52a2a",
        "burlywood": "#deb887",
        "cadetblue": "#5f9ea0",
        "chartreuse": "#7fff00",
        "chocolate": "#d2691e",
        "coral": "#ff7f50",
        "cornflowerblue": "#6495ed",
        "cornsilk": "#fff8dc",
        "crimson": "#dc143c",
        "cyan": "#00ffff",
        "darkblue": "#00008b",
        "darkcyan": "#008b8b",
        "darkgoldenrod": "#b8860b",
        "darkgray": "#a9a9a9",
        "darkgrey": "#a9a9a9",
        "darkgreen": "#006400",
        "darkkhaki": "#bdb76b",
        "darkmagenta": "#8b008b",
        "darkolivegreen": "#556b2f",
        "darkorange": "#ff8c00",
        "darkorchid": "#9932cc",
        "darkred": "#8b0000",
        "darksalmon": "#e9967a",
        "darkseagreen": "#8fbc8f",
        "darkslateblue": "#483d8b",
        "darkslategray": "#2f4f4f",
        "darkslategrey": "#2f4f4f",
        "darkturquoise": "#00ced1",
        "darkviolet": "#9400d3",
        "deeppink": "#ff1493",
        "deepskyblue": "#00bfff",
        "dimgray": "#696969",
        "dimgrey": "#696969",
        "dodgerblue": "#1e90ff",
        "firebrick": "#b22222",
        "floralwhite": "#fffaf0",
        "forestgreen": "#228b22",
        "fuchsia": "#ff00ff",
        "gainsboro": "#dcdcdc",
        "ghostwhite": "#f8f8ff",
        "gold": "#ffd700",
        "goldenrod": "#daa520",
        "gray": "#808080",
        "grey": "#808080",
        "green": "#008000",
        "greenyellow": "#adff2f",
        "honeydew": "#f0fff0",
        "hotpink": "#ff69b4",
        "indianred": "#cd5c5c",
        "indigo": "#4b0082",
        "ivory": "#fffff0",
        "khaki": "#f0e68c",
        "lavender": "#e6e6fa",
        "lavenderblush": "#fff0f5",
        "lawngreen": "#7cfc00",
        "lemonchiffon": "#fffacd",
        "lightblue": "#add8e6",
        "lightcoral": "#f08080",
        "lightcyan": "#e0ffff",
        "lightgoldenrodyellow": "#fafad2",
        "lightgray": "#d3d3d3",
        "lightgrey": "#d3d3d3",
        "lightgreen": "#90ee90",
        "lightpink": "#ffb6c1",
        "lightsalmon": "#ffa07a",
        "lightseagreen": "#20b2aa",
        "lightskyblue": "#87cefa",
        "lightslategray": "#778899",
        "lightslategrey": "#778899",
        "lightsteelblue": "#b0c4de",
        "lightyellow": "#ffffe0",
        "lime": "#00ff00",
        "limegreen": "#32cd32",
        "linen": "#faf0e6",
        "magenta": "#ff00ff",
        "maroon": "#800000",
        "mediumaquamarine": "#66cdaa",
        "mediumblue": "#0000cd",
        "mediumorchid": "#ba55d3",
        "mediumpurple": "#9370d8",
        "mediumseagreen": "#3cb371",
        "mediumslateblue": "#7b68ee",
        "mediumspringgreen": "#00fa9a",
        "mediumturquoise": "#48d1cc",
        "mediumvioletred": "#c71585",
        "midnightblue": "#191970",
        "mintcream": "#f5fffa",
        "mistyrose": "#ffe4e1",
        "moccasin": "#ffe4b5",
        "navajowhite": "#ffdead",
        "navy": "#000080",
        "oldlace": "#fdf5e6",
        "olive": "#808000",
        "olivedrab": "#6b8e23",
        "orange": "#ffa500",
        "orangered": "#ff4500",
        "orchid": "#da70d6",
        "palegoldenrod": "#eee8aa",
        "palegreen": "#98fb98",
        "paleturquoise": "#afeeee",
        "palevioletred": "#d87093",
        "papayawhip": "#ffefd5",
        "peachpuff": "#ffdab9",
        "peru": "#cd853f",
        "pink": "#ffc0cb",
        "plum": "#dda0dd",
        "powderblue": "#b0e0e6",
        "purple": "#800080",
        "red": "#ff0000",
        "rosybrown": "#bc8f8f",
        "royalblue": "#4169e1",
        "saddlebrown": "#8b4513",
        "salmon": "#fa8072",
        "sandybrown": "#f4a460",
        "seagreen": "#2e8b57",
        "seashell": "#fff5ee",
        "sienna": "#a0522d",
        "silver": "#c0c0c0",
        "skyblue": "#87ceeb",
        "slateblue": "#6a5acd",
        "slategray": "#708090",
        "slategrey": "#708090",
        "snow": "#fffafa",
        "springgreen": "#00ff7f",
        "steelblue": "#4682b4",
        "tan": "#d2b48c",
        "teal": "#008080",
        "thistle": "#d8bfd8",
        "tomato": "#ff6347",
        "turquoise": "#40e0d0",
        "violet": "#ee82ee",
        "wheat": "#f5deb3",
        "white": "#ffffff",
        "whitesmoke": "#f5f5f5",
        "yellow": "#ffff00",
        "yellowgreen": "#9acd32"
    },
        r = nar[n];
    if (r === undefined) {
        console.log('Invalid color name used: ' + n);
        return "#000000";
    }

    return r;
};

// ### complement method
//
// Get the complementary value of multiple types of input colors.
//
// ```complement ( "#ffffff" )
// complement ( [obj R, G, B] or R, G, B )```
module.exports = function (c, g, b) {
    var cval, rtn, returnType;
    if (typeof c == "string" && g === undefined && b === undefined && c.indexOf('#') === -1) {
        c = name2hex(c);
    }
    if (typeof c == "string" && /(#([A-Fa-f0-9]){3}(([A-Fa-f0-9]){3})?)/.test(c)) {
        passedType = 'hex';

        c = c.replace("#", "");
        rtn = "#";
        if (c.length === 6) {
            rtn += paddedHex(255 - hex2rgb(c.substr(0, 2)));
            rtn += paddedHex(255 - hex2rgb(c.substr(2, 2)));
            rtn += paddedHex(255 - hex2rgb(c.substr(4, 2)));
        }
        if (c.length === 3) {
            rtn += paddedHex(255 - hex2rgb(c.substr(0, 1) + c.substr(0, 1)));
            rtn += paddedHex(255 - hex2rgb(c.substr(1, 1) + c.substr(1, 1)));
            rtn += paddedHex(255 - hex2rgb(c.substr(2, 1) + c.substr(2, 1)));
        }
        return rtn;
    } else {
        passedType = 'rgb';

        if (c !== undefined && g !== undefined && b !== undefined) {
            cval = [(255 - c), (255 - g), (255 - b)];
        }
        if (typeof c == "object") {
            cval = [(255 - c[0]), (255 - c[1]), (255 - c[2])];
        }
        return render(cval, passedType);
    }
};
