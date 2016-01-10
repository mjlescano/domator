import isArray from 'is-array'
import forEach from 'array-foreach'
import merge from 'lodash.merge'

const nameRegex = /(?:([a-z0-9\-]+)|(?:#|\.)([a-z0-9\-]+)|\[([a-z\-0-9]+)(?:="([^"]+)")?\]|=\s?(.+))/g
let doc

export default function domator (...args) {
  if (!doc) {
    throw new Error('Need to call domator.setDocument(document) first.')
  }

  return domator.render(parse(args))
}

domator.setDocument = function setDocument (newDoc) {
  doc = newDoc
  return domator
}

domator.toString = function toString (node) {
  const div = doc.createElement('div')
  if ('outerHTML' in div) return node.outerHTML
  div.appendChild(node.cloneNode(true))
  return div.innerHTML
}

domator.create = function create (name, attrs) {
  attrs = merge({}, parseName(name), attrs)

  const el = doc.createElement(attrs.tag || 'div')
  delete attrs.tag

  if (attrs.text) {
    el.textContent = attrs.text
    delete attrs.text
  }

  for (let prop in attrs) if (attrs.hasOwnProperty(prop)) {
    el.setAttribute(prop, attrs[prop] || prop)
  }

  return el
}

domator.render = function render (item) {
  if (isArray(item)) {
    if (item.length === 1) return domator.render(item[0])

    let wrapper = doc.createDocumentFragment()

    forEach(item, function (item) {
      let el = domator.render(item)
      wrapper.appendChild(el)
    })

    return wrapper
  }

  if (item.tag) item.el = domator.create(item.tag, item.attrs)

  if (item.children) {
    forEach(item.children, function (child) {
      item.el.appendChild(domator.render(child))
    })
  }

  return item.el
}

function parseName (name) {
  let attrs = {}
  let match = name.match(nameRegex)

  if (!match) return attrs

  forEach(match, function (s) {
    let m
    if (!attrs.tag && /[a-z]/.test(s[0])) {
      attrs.tag = s
    } else if (!attrs['class'] && s[0] === '.') {
      attrs['class'] = s.substr(1)
    } else if (!attrs.id && s[0] === '#') {
      attrs.id = s.substr(1)
    } else if (s[0] === '[') {
      m = s.match(/\[([a-z\-0-9]+)(?:="([^"]+)")?\]/)
      attrs[m[1]] = m[2] || m[1]
    } else if (s[0] === '=') {
      m = s.match(/=\s?(.+)/)
      attrs.text = m[1]
    }
  })

  return attrs
}

function parse (args) {
  const items = []
  let item
  while ((item = parseNext(args))) items.push(item)
  return items
}

function parseNext (args) {
  if (!args.length) return null
  var item = {children: []}

  while (true) {
    var val = args.shift()

    if (val instanceof doc.defaultView.Node) {
      item.el = val
    } else if (typeof val === 'string') {
      item.tag = val
    } else if (isArray(val)) {
      let child
      while ((child = parseNext(val))) item.children.push(child)
    } else if (typeof val === 'object') {
      item.attrs = val
    } else {
      throw new Error('Incorrect value.')
    }

    if (!args[0]) break
    if (args[0] instanceof doc.defaultView.Node) break
    if (typeof args[0] === 'string') break
  }

  return item
}

if (typeof window !== 'undefined' && window.document) {
  domator.setDocument(window.document)
}

if (typeof module === 'undefined') {
  if (typeof define === 'function' && define.amd) {
    define([], function () {
      return domator
    })
  } else if (typeof window !== 'undefined') {
    window.domator = domator
  }
}
