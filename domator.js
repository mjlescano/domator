'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = domator;

var _isArray = require('is-array');

var _isArray2 = _interopRequireDefault(_isArray);

var _arrayForeach = require('array-foreach');

var _arrayForeach2 = _interopRequireDefault(_arrayForeach);

var _deepmerge = require('deepmerge');

var _deepmerge2 = _interopRequireDefault(_deepmerge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var regexes = {
  tag: /^([a-z0-9\-]+)/,
  id: /^#([a-z0-9\-]+)/,
  className: /^\.([a-z0-9\-]+)/,
  attr: /^\[([a-z\-0-9]+)(?:="([^"]+)")?\]/,
  text: /^\s(.+)/
};

var doc = undefined;

function domator() {
  if (!doc) {
    throw new Error('Need to call domator.setDocument(document) first.');
  }

  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return domator.render(parse(args));
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
  var name = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
  var attrs = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  name = parseName(name);['class', 'className'].forEach(function (key) {
    if (typeof name[key] === 'string') name[key] = [name[key]];
    if (typeof attrs[key] === 'string') attrs[key] = [attrs[key]];
  });

  attrs = (0, _deepmerge2.default)(name, attrs);

  attrs['class'] = (attrs['class'] || []).concat(attrs.className).join(' ');
  if (attrs.className) delete attrs.className;
  if (!attrs['class']) delete attrs['class'];

  var el = doc.createElement(attrs.tag || 'div');
  delete attrs.tag;

  if (attrs.text) {
    el.textContent = attrs.text;
    delete attrs.text;
  }

  for (var prop in attrs) {
    if (attrs.hasOwnProperty(prop)) {
      el.setAttribute(prop, attrs[prop] || prop);
    }
  }return el;
};

domator.render = function render(item) {
  if ((0, _isArray2.default)(item)) {
    var _ret = function () {
      if (item.length === 1) return {
          v: domator.render(item[0])
        };

      var wrapper = doc.createDocumentFragment();

      (0, _arrayForeach2.default)(item, function (item) {
        var el = domator.render(item);
        wrapper.appendChild(el);
      });

      return {
        v: wrapper
      };
    }();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  }

  if (item.tag) item.el = domator.create(item.tag, item.attrs);

  if (item.children) {
    (0, _arrayForeach2.default)(item.children, function (child) {
      item.el.appendChild(domator.render(child));
    });
  }

  return item.el;
};

function parseName(name) {
  var attrs = {};
  var pending = name;

  var m = undefined;
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
  var item = undefined;
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
    } else if ((0, _isArray2.default)(val)) {
      var child = undefined;
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

if (typeof module === 'undefined') {
  if (typeof define === 'function' && define.amd) {
    define([], function () {
      return domator;
    });
  } else if (typeof window !== 'undefined') {
    window.domator = domator;
  }
}