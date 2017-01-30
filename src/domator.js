import isArray from 'is-array'
import forEach from 'array-foreach'
import * as utils from './utils'

let doc

export default function domator (...args) {
  if (!doc) {
    throw new Error('Need to call domator.setDocument(document) first.')
  }

  return render(parse(args))
}

export function setDocument (newDoc) {
  doc = newDoc
  return domator
}

export function toString (...args) {
  return utils.toString(doc, ...args)
}

export function create (...args) {
  return utils.create(doc, ...args)
}

function render (items) {
  if (isArray(items)) {
    if (items.length === 1) return render(items[0])

    const wrapper = doc.createDocumentFragment()

    forEach(items, function (item) {
      let el = render(item)
      wrapper.appendChild(el)
    })

    return wrapper
  }

  return renderItem(items)
}

function renderItem (item = {}) {
  if (!item.tag && !item.el) item.tag = 'div'

  if (item.tag) {
    item.el = utils.create(doc, item.tag, item.attrs)
  } else {
    utils.setAttributes(doc, item.el, item.attrs)
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
