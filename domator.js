'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var isArray = _interopDefault(require('is-array'));
var forEach = _interopDefault(require('array-foreach'));
var deepmerge = _interopDefault(require('deepmerge'));

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

  attrs = deepmerge(name, attrs);

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
  if (isArray(item)) {
    var _ret = function () {
      if (item.length === 1) return {
          v: render(item[0])
        };

      var wrapper = doc.createDocumentFragment();

      forEach(item, function (item) {
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
    forEach(item.children, function (child) {
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

    if (!args[0]) break;
    if (args[0] instanceof doc.defaultView.Node) break;
    if (typeof args[0] === 'string') break;
  }

  return item;
}

if (typeof window !== 'undefined' && window.document) {
  domator.setDocument(window.document);
}

module.exports = domator;
