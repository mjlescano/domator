import isArray from 'is-array'
import deepmerge from 'deepmerge'
import { getDocument, setDocument } from './document'
import * as utils from './utils'

/**
 * Default domator export
 */

export default function domator (...args) {
  return render(parse(args))
}

/**
 * Monkey patch to be able to use default and named exports
 */

Object.assign(domator, utils, {setDocument})

function render (items) {
  if (isArray(items)) {
    if (items.length === 1) return renderItem(items[0])

    const wrapper = getDocument().createDocumentFragment()

    items.forEach(function (item) {
      let el = render(item)
      wrapper.appendChild(el)
    })

    return wrapper
  }

  return renderItem(items)
}

function renderItem (item = {}) {
  if (item.selector) {
    const selAttrs = utils.parseSelector(item.selector)
    const attrs = item.attrs

    ;['class', 'className'].forEach((key) => {
      if (selAttrs[key] && attrs[key]) attrs[key] += ` ${selAttrs[key]}`
    })

    item.attrs = deepmerge.all([{}, selAttrs, attrs])
  }

  if (!item.el && item.attrs.tag) {
    item.el = getDocument().createElement(item.attrs.tag)
    delete item.attrs.tag
  }

  if ('text' in item.attrs) {
    if (item.el) {
      item.children.unshift({attrs: {text: item.attrs.text}})
      delete item.attrs.text
    } else {
      return getDocument().createTextNode(item.attrs.text)
    }
  }

  if (item.el) {
    utils.setAttributes(item.el, item.attrs)
  } else {
    item.el = getDocument().createDocumentFragment()
  }

  const children = item.children.map(renderItem)
  utils.setChildren(item.el, children)

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
  var item = {
    attrs: {},
    children: []
  }

  while (args.length) {
    var val = args.shift()

    if (val instanceof getDocument().defaultView.Node) {
      item.el = val
    } else if (typeof val === 'string') {
      item.selector = val
    } else if (isArray(val)) {
      let child
      while ((child = parseNext(val))) item.children.push(child)
    } else if (typeof val === 'object') {
      item.attrs = val
    } else {
      throw new Error('Incorrect value.')
    }

    if (args[0] instanceof getDocument().defaultView.Node) break
    if (typeof args[0] === 'string') break
  }

  return item
}
