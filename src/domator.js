import isArray from 'is-array'
import { getDocument } from './document'
import * as utils from './utils'

export {
  toString,
  create,
  setDocument
} from './utils'

export default function domator (...args) {
  return render(parse(args))
}

function render (items) {
  if (isArray(items)) {
    if (items.length === 1) return render(items[0])

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
  if (!item.tag && !item.el) item.tag = 'div'

  if (item.tag) {
    item.el = utils.create(item.tag, item.attrs)
  } else {
    utils.setAttributes(item.el, item.attrs)
  }

  if (item.children) utils.appendChildren(item.el, item.children)

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

  while (args.length) {
    var val = args.shift()

    if (val instanceof getDocument().defaultView.Node) {
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

    if (args[0] instanceof getDocument().defaultView.Node) break
    if (typeof args[0] === 'string') break
  }

  return item
}

export default domator
