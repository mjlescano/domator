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

var _lodash = require('lodash.merge');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var nameRegex = /(?:([a-z0-9\-]+)|(?:#|\.)([a-z0-9\-]+)|\[([a-z\-0-9]+)(?:="([^"]+)")?\]|=\s?(.+))/g;
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

domator.create = function create(name, attrs) {
  attrs = (0, _lodash2.default)({}, parseName(name), attrs);

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
  var match = name.match(nameRegex);

  if (!match) return attrs;

  (0, _arrayForeach2.default)(match, function (s) {
    var m = undefined;
    if (!attrs.tag && /[a-z]/.test(s[0])) {
      attrs.tag = s;
    } else if (!attrs['class'] && s[0] === '.') {
      attrs['class'] = s.substr(1);
    } else if (!attrs.id && s[0] === '#') {
      attrs.id = s.substr(1);
    } else if (s[0] === '[') {
      m = s.match(/\[([a-z\-0-9]+)(?:="([^"]+)")?\]/);
      attrs[m[1]] = m[2] || m[1];
    } else if (s[0] === '=') {
      m = s.match(/=\s?(.+)/);
      attrs.text = m[1];
    }
  });

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