'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var isArray = _interopDefault(require('is-array'));
var deepmerge = _interopDefault(require('deepmerge'));
var forEach = _interopDefault(require('array-foreach'));

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
        forEach(children, function (child) {
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
  if (isArray(items)) {
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

      item.attrs = deepmerge(selAttrs, attrs);

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
    } else if (isArray(val)) {
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

module.exports = domator;
