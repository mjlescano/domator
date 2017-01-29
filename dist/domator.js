(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.domator = factory());
}(this, (function () { 'use strict';

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

var index = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

/**
 * array-foreach
 *   Array#forEach ponyfill for older browsers
 *   (Ponyfill: A polyfill that doesn't overwrite the native method)
 * 
 * https://github.com/twada/array-foreach
 *
 * Copyright (c) 2015-2016 Takuto Wada
 * Licensed under the MIT license.
 *   https://github.com/twada/array-foreach/blob/master/MIT-LICENSE
 */
var index$1 = function forEach (ary, callback, thisArg) {
    if (ary.forEach) {
        ary.forEach(callback, thisArg);
        return;
    }
    for (var i = 0; i < ary.length; i+=1) {
        callback.call(thisArg, ary[i], i, ary);
    }
};

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var index$2 = createCommonjsModule(function (module, exports) {
(function (root, factory) {
    if (typeof undefined === 'function' && undefined.amd) {
        undefined(factory);
    } else {
        module.exports = factory();
    }
}(commonjsGlobal, function () {

return function deepmerge(target, src) {
    var array = Array.isArray(src);
    var dst = array && [] || {};

    if (array) {
        target = target || [];
        dst = dst.concat(target);
        src.forEach(function(e, i) {
            if (typeof dst[i] === 'undefined') {
                dst[i] = e;
            } else if (typeof e === 'object') {
                dst[i] = deepmerge(target[i], e);
            } else {
                if (target.indexOf(e) === -1) {
                    dst.push(e);
                }
            }
        });
    } else {
        if (target && typeof target === 'object') {
            Object.keys(target).forEach(function (key) {
                dst[key] = target[key];
            });
        }
        Object.keys(src).forEach(function (key) {
            if (typeof src[key] !== 'object' || !src[key]) {
                dst[key] = src[key];
            }
            else {
                if (!target[key]) {
                    dst[key] = src[key];
                } else {
                    dst[key] = deepmerge(target[key], src[key]);
                }
            }
        });
    }

    return dst;
}

}));
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var regexes = {
  tag: /^([a-z0-9\-]+)/i,
  id: /^#([a-z0-9\-]+)/i,
  className: /^\.([a-z0-9\-]+)/i,
  attr: /^\[([a-z\-0-9]+)(?:="([^"]+)")?\]/i,
  text: /^\s(.*)/
};

var doc = void 0;

function domator() {
  if (!doc) {
    throw new Error('Need to call domator.setDocument(document) first.');
  }

  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return render(parse(args));
}

domator.setDocument = function setDocument(newDoc) {
  doc = newDoc;
  return domator;
};

domator.toString = function toString(node) {
  var div = doc.createElement('div');
  if ('outerHTML' in div) return node.outerHTML;
  div.appendChild(node.cloneNode(true));
  return div.innerHTML;
};

domator.create = function create() {
  var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  name = parseName(name);['class', 'className'].forEach(function (key) {
    if (typeof name[key] === 'string') name[key] = [name[key]];
    if (typeof attrs[key] === 'string') attrs[key] = [attrs[key]];
  });

  attrs = index$2(name, attrs);

  var el = doc.createElement(attrs.tag || 'div');
  delete attrs.tag;

  if ('text' in attrs) {
    el.textContent = attrs.text;
    delete attrs.text;
  }

  setAttributes(el, attrs);

  return el;
};

function setAttributes(el) {
  var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  attrs['class'] = (attrs['class'] || []).concat(attrs.className).join(' ');
  if (attrs.className) delete attrs.className;
  if (!attrs['class']) delete attrs['class'];

  for (var prop in attrs) {
    if (attrs.hasOwnProperty(prop)) {
      el.setAttribute(prop, attrs[prop] || prop);
    }
  }return el;
}

function render(item) {
  if (index(item)) {
    var _ret = function () {
      if (item.length === 1) return {
          v: render(item[0])
        };

      var wrapper = doc.createDocumentFragment();

      index$1(item, function (item) {
        var el = render(item);
        wrapper.appendChild(el);
      });

      return {
        v: wrapper
      };
    }();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  }

  if (item.tag) {
    item.el = domator.create(item.tag, item.attrs);
  } else {
    setAttributes(item.el, item.attrs);
  }

  if (item.children) {
    index$1(item.children, function (child) {
      item.el.appendChild(render(child));
    });
  }

  return item.el;
}

function parseName(name) {
  var attrs = {};
  var pending = name;

  var m = void 0;
  do {
    m = null;

    if (m = pending.match(regexes.tag)) {
      attrs.tag = m[1];
    } else if (m = pending.match(regexes.id)) {
      attrs.id = m[1];
    } else if (m = pending.match(regexes.className)) {
      if (!attrs.className) attrs.className = [];
      attrs.className.push(m[1]);
    } else if (m = pending.match(regexes.attr)) {
      attrs[m[1]] = m[2];
    }

    if (m) pending = pending.slice(m[0].length);
  } while (m);

  if (pending && (m = pending.match(regexes.text))) {
    attrs.text = m[1];
    pending = pending.slice(m[0].length);
  }

  if (pending) {
    throw new Error('There was an error when parsing element name: "' + name + '"');
  }

  return attrs;
}

function parse(args) {
  var items = [];
  var item = void 0;
  while (item = parseNext(args)) {
    items.push(item);
  }return items;
}

function parseNext(args) {
  if (!args.length) return null;
  var item = { children: [] };

  while (true) {
    var val = args.shift();

    if (val instanceof doc.defaultView.Node) {
      item.el = val;
    } else if (typeof val === 'string') {
      item.tag = val;
    } else if (index(val)) {
      var child = void 0;
      while (child = parseNext(val)) {
        item.children.push(child);
      }
    } else if ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object') {
      item.attrs = val;
    } else {
      throw new Error('Incorrect value.');
    }

    if (!args[0]) break;
    if (args[0] instanceof doc.defaultView.Node) break;
    if (typeof args[0] === 'string') break;
  }

  return item;
}

if (typeof window !== 'undefined' && window.document) {
  domator.setDocument(window.document);
}

return domator;

})));
