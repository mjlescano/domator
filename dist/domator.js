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

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var index$1 = createCommonjsModule(function (module, exports) {
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

var doc = null;

if (typeof window !== 'undefined' && window.document) doc = window.document;

function setDocument(newDoc) {
  doc = newDoc;
  return doc;
}

function getDocument() {
  if (!doc) {
    throw new Error('Need to call domator.setDocument(document) first.');
  }

  return doc;
}

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
var index$2 = function forEach (ary, callback, thisArg) {
    if (ary.forEach) {
        ary.forEach(callback, thisArg);
        return;
    }
    for (var i = 0; i < ary.length; i+=1) {
        callback.call(thisArg, ary[i], i, ary);
    }
};

var regexes = {
  tag: /^([a-z0-9\-]+)/i,
  id: /^#([a-z0-9\-]+)/i,
  className: /^\.([a-z0-9\-]+)/i,
  attr: /^\[([a-z\-0-9]+)(?:="([^"]+)")?\]/i,
  text: /^\s(.*)/
};

function parseSelector() {
  var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'div';

  var attrs = {};
  var pending = selector;

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
    throw new Error('There was an error when parsing element: "' + selector + '"');
  }

  if (!attrs.tag) attrs.tag = 'div';
  if (attrs.className) attrs.className = attrs.className.join(' ');

  return attrs;
}

function create() {
  var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var el = getDocument().createElement(attrs.tag || 'div');
  delete attrs.tag;

  setAttributes(el, attrs);

  return el;
}

function toString(node) {
  var div = getDocument().createElement('div');

  if ('outerHTML' in div) return node.outerHTML;
  div.appendChild(node.cloneNode(true));

  return div.innerHTML;
}

function setAttributes(el) {
  var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (attrs['class'] && attrs.className) {
    attrs['class'] += ' ' + attrs.className;
  } else if (attrs.className) {
    attrs['class'] = attrs.className;
  }

  if (attrs.className) delete attrs.className;
  if (!attrs['class']) delete attrs['class'];

  if ('text' in attrs) {
    el.textContent = attrs.text;
    delete attrs.text;
  }

  for (var prop in attrs) {
    if (attrs.hasOwnProperty(prop)) {
      var val = attrs[prop];

      if (val === undefined || val === null) val = '';

      el.setAttribute(prop, val);
    }
  }return el;
}

function appendChildren(el, children) {
  (function () {
    switch (children.length) {
      case 0:
        break;
      case 1:
        el.appendChild(children[0]);
        break;
      default:
        var wrapper = getDocument().createDocumentFragment();
        index$2(children, function (child) {
          return wrapper.appendChild(child);
        });
        el.appendChild(wrapper);
    }
  })();

  return el;
}

var utils = Object.freeze({
	parseSelector: parseSelector,
	create: create,
	toString: toString,
	setAttributes: setAttributes,
	appendChildren: appendChildren
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

/**
 * Default domator export
 */

function domator() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return render(parse(args));
}

/**
 * Monkey patch to be able to use default and named exports
 */

Object.assign(domator, utils, { setDocument: setDocument });

function render(items) {
  if (index(items)) {
    var _ret = function () {
      if (items.length === 1) return {
          v: renderItem(items[0])
        };

      var wrapper = getDocument().createDocumentFragment();

      items.forEach(function (item) {
        var el = render(item);
        wrapper.appendChild(el);
      });

      return {
        v: wrapper
      };
    }();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  }

  return renderItem(items);
}

function renderItem() {
  var item = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (item.el) {
    setAttributes(item.el, item.attrs);
  } else {
    (function () {
      var selAttrs = parseSelector(item.selector);
      var attrs = item.attrs;['class', 'className'].forEach(function (key) {
        if (selAttrs[key] && attrs[key]) attrs[key] += ' ' + selAttrs[key];
      });

      item.attrs = index$1(selAttrs, attrs);

      item.el = create(item.attrs);
    })();
  }

  if (item.children.length) {
    var children = item.children.map(renderItem);
    appendChildren(item.el, children);
  }

  return item.el;
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
  var item = {
    attrs: {},
    children: []
  };

  while (args.length) {
    var val = args.shift();

    if (val instanceof getDocument().defaultView.Node) {
      item.el = val;
    } else if (typeof val === 'string') {
      item.selector = val;
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

    if (args[0] instanceof getDocument().defaultView.Node) break;
    if (typeof args[0] === 'string') break;
  }

  return item;
}

return domator;

})));
