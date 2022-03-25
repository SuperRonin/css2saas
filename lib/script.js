var indentS = '  ';
var openingBracket = '{';
var closingBracket = '}';
var semiColumn = ':';
var eol = ';';
var keepOutsideComments = true;
var keepinsideComments = false;
var removeHacks = false;
var vars = {};
var comments = {};
var dataURLs = {};

function trimColor(str) {
    return str.replace(/#([0-9a-f]{3}|[0-9a-f]{6})\b/ig, function (a) {
        return a.toLowerCase()
    })
}
function log(s) {
    if (console) console.log(s);
}
function tr(s) {
    return trimStr(s.replace(/\t+/, ' '));
}
function trimStr(str) { return str.replace(/(^\s*)|(\s*$)/g, ""); }
function makeMark(num) {
    var str = "";
    str += '\t\t\t\t\t\t\t\t\t\t\t';
    while (num--) {
        str += ' '
    }
    str += '\t\t\t\t\t\t\t\t\t\t\t';
    return str
}

function decodeMark(str) {
    var num = 0;
    str.replace(/ /g, function () {
        num++
    })
    return num
}
const parseCSS = function (s) {
    var least = { children: {} };


    comments = {};
    var i = 1;

    var reg = /@import.*?wxss("|');/g;
    var left = reg[Symbol.matchAll](s); //import语法 TODO font字体
    var right = s.replace(reg, '');
    s = right

    //replace comments with marks;
    s = s.replace(/\/\*[\s\S]*?\*\//gm, function (a) {
        comments[++i] = a;
        return makeMark(i);
    });

    //inside comments to fake declarations;
    s = s.replace(/([^{]+)\{([^}]+)\}/g, function (group, selector, declarations) {

        return selector + '{' + declarations.replace(/\t{10} +\t{10}/g, function (a) {
            a = decodeMark(a);
            return 'comment__-' + a + ': ' + a + ';'
        }) + '}';
    });


    //outside comments to fake selectors;
    s = s.replace(/\t{10} +\t{10}/g, function (a) {
        a = decodeMark(a);
        return '.__comment__-' + a + ' { index: ' + a + ';}'
    });


    dataURLs = {};

    //dataURL to fake url
    s = s.replace(/url\((data:[^\)]+)\)/gm, function (a, dataURL) {
        dataURLs[++i] = dataURL;
        return 'url(__data__' + i + ')';
    })


    s.replace(/([^{]+)\{([^}]+)\}/g, function (group, selector, declarations) {
        var o = {};
        o.source = group;
        o.selector = tr(selector);

        var path = least;

        if (o.selector.indexOf(',') > -1) {
            // Comma: grouped selector, we skip
            var sel = o.selector;
            if (!path.children[sel]) {
                path.children[sel] = { children: {}, declarations: [] };
            }
            path = path.children[sel];
        } else {
            // No comma: we process

            // Fix to prevent special chars to break into parts
            o.selector = o.selector.replace(/\s*([>\+~])\s*/g, ' &$1');
            o.selector = o.selector.replace(/(\w)([:\.])/g, '$1 &$2');

            o.selectorParts = o.selector.split(/[\s]+/);
            for (var i = 0; i < o.selectorParts.length; i++) {
                var sel = o.selectorParts[i];
                // We glue the special chars fix
                sel = sel.replace(/&(.)/g, '& $1 ');
                sel = sel.replace(/& ([:\.]) /g, '&$1');

                if (!path.children[sel]) {
                    path.children[sel] = { children: {}, declarations: [] };
                }
                path = path.children[sel];
            }
        }


        declarations.replace(/([^:;]+):([^;]+)/g, function (decl, prop, val) {

            //remove hacks
            if (removeHacks) {
                decl = decl
                    .replace(/\s*[\*_].*/g, '')
                    .replace(/.*(-webkit-|-o-|-moz-|-ms-|-khtml-|DXImageTransform|\\9|\\0|expression|opacity\s*=).*/g, '')
                if (!trimStr(decl)) {
                    return
                }
            };

            val = trimColor(val);
            if (vars[val]) {
                val = vars[val];
            } else {
                var a = [];
                // $.each(val.split(' '), function () {
                //     a.push(vars[this] || this)
                // });
                var vals = val.split(' ')
                for (const key in vals) {
                    if (Object.hasOwnProperty.call(vals, key)) {
                        const item = val.split(' ')[key];
                        a.push(vars[item] || item)
                    }
                }
                // vals.forEach(function () {
                //     a.push(vars[this] || this)
                // })
                val = a.join(' ');
            }

            var declaration = {
                source: decl,
                property: tr(prop),
                value: tr(val)
            };
            path.declarations.push(declaration);
        });
    });

     s = Array.from(left, (x) => x[0]).join('') + '\n' + exportObject(least);
     return s
}

function getIndent() {
    var s = '';
    for (var i = 0; i < depth; i++) {
        s += indentS;
    }
    return s;
}

var depth = 0;
var s = '';
function exportObject(path) {
    // console.log(path)
    var s = '';
    for (const key in path.children) {
        if (Object.hasOwnProperty.call(path.children, key)) {
            const val = path.children[key];
            // $.each(path.children, function(key, val) {
            if (key.slice(0, 12) == '.__comment__') {
                // keepOutsideComments && (s += getIndent() + comments[val.declarations[0].value] + '\n');
                return
            } else {
                s += getIndent() + key + ' ' + openingBracket + '\n';
            }
            depth++;
            for (var i = 0; i < val.declarations.length; i++) {
                var decl = val.declarations[i];
                if (decl.property.slice(0, 9) == 'comment__') {
                    keepinsideComments && (s += getIndent() + comments[decl.value] + '\n');
                } else {
                    s += getIndent() + decl.property + semiColumn + ' ' + decl.value + eol + '\n';
                }

            }
            s += exportObject(val);
            depth--;
            s += getIndent() + closingBracket + '\n';


            // });
        }
    }

    // Remove blank lines - http://stackoverflow.com/a/4123442
    s = s.replace(/^\s*$[\n\r]{1,}/gm, '');


    s = s.replace(/url\(__data__(\d+)\)/gm, function (a, i) {
        return 'url(' + dataURLs[i] + ')';
    })

    return s;
}

module.exports = {
    parseCSS: parseCSS
}