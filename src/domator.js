import isArray from 'is-array'
import forEach from 'array-foreach'
import deepmerge from 'deepmerge'
import { toString, setAttributes, parseSelector } from './utils'

let doc

function domator (...args) {
  if (!doc) {
    throw new Error('Need to call domator.setDocument(document) first.')
  }

  return render(parse(args))
}

domator.setDocument = function setDocument (newDoc) {
  doc = newDoc
  return domator
}

domator.toString = function _toString (node) {
  return toString(node, doc)
}

domator.create = function create (selector = '', attrs = {}) {
  const selAttrs = parseSelector(selector)

  ;['class', 'className'].forEach(key => {
    if (typeof selAttrs[key] === 'string') selAttrs[key] = [selAttrs[key]]
    if (typeof attrs[key] === 'string') attrs[key] = [attrs[key]]
  })

  attrs = deepmerge(selAttrs, attrs)

  const el = doc.createElement(attrs.tag || 'div')
  delete attrs.tag

  if ('text' in attrs) {
    el.textContent = attrs.text
    delete attrs.text
  }

  setAttributes(el, attrs)

  return el
}

function render (item) {
  if (isArray(item)) {
    if (item.length === 1) return render(item[0])

    const wrapper = doc.createDocumentFragment()

    forEach(item, function (item) {
      let el = render(item)
      wrapper.appendChild(el)
    })

    return wrapper
  }

  if (item.tag) {
    item.el = domator.create(item.tag, item.attrs)
  } else {
    setAttributes(item.el, item.attrs)
  }

  if (item.children) {
    forEach(item.children, function (child) {
      item.el.appendChild(render(child))
    })
  }

  return item.el
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

export default domator
