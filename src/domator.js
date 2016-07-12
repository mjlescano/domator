import isArray from 'is-array'
import forEach from 'array-foreach'
import deepmerge from 'deepmerge'

const regexes = {
  tag: /^([a-z0-9\-]+)/,
  id: /^#([a-z0-9\-]+)/,
  className: /^\.([a-z0-9\-]+)/,
  attr: /^\[([a-z\-0-9]+)(?:="([^"]+)")?\]/,
  text: /^\s(.+)/
}

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

domator.toString = function toString (node) {
  const div = doc.createElement('div')
  if ('outerHTML' in div) return node.outerHTML
  div.appendChild(node.cloneNode(true))
  return div.innerHTML
}

domator.create = function create (name = '', attrs = {}) {
  name = parseName(name)

  ;['class', 'className'].forEach(key => {
    if (typeof name[key] === 'string') name[key] = [name[key]]
    if (typeof attrs[key] === 'string') attrs[key] = [attrs[key]]
  })

  attrs = deepmerge(name, attrs)

  const el = doc.createElement(attrs.tag || 'div')
  delete attrs.tag

  if (attrs.text) {
    el.textContent = attrs.text
    delete attrs.text
  }

  setAttributes(el, attrs)

  return el
}

function setAttributes (el, attrs = {}) {
  attrs['class'] = (attrs['class'] || []).concat(attrs.className).join(' ')
  if (attrs.className) delete attrs.className
  if (!attrs['class']) delete attrs['class']

  for (let prop in attrs) if (attrs.hasOwnProperty(prop)) {
    el.setAttribute(prop, attrs[prop] || prop)
  }

  return el
}

function render (item) {
  if (isArray(item)) {
    if (item.length === 1) return render(item[0])

    let wrapper = doc.createDocumentFragment()

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

function parseName (name) {
  const attrs = {}
  let pending = name

  let m
  do {
    m = null

    if ((m = pending.match(regexes.tag))) {
      attrs.tag = m[1]
    } else if ((m = pending.match(regexes.id))) {
      attrs.id = m[1]
    } else if ((m = pending.match(regexes.className))) {
      if (!attrs.className) attrs.className = []
      attrs.className.push(m[1])
    } else if ((m = pending.match(regexes.attr))) {
      attrs[m[1]] = m[2]
    }

    if (m) pending = pending.slice(m[0].length)
  } while (m)

  if (pending && (m = pending.match(regexes.text))) {
    attrs.text = m[1]
    pending = pending.slice(m[0].length)
  }

  if (pending) {
    throw new Error(`There was an error when parsing element name: "${name}"`)
  }

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

export default domator
