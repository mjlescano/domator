import deepmerge from 'deepmerge'
import { getDocument } from './document'

const regexes = {
  tag: /^([a-z0-9\-]+)/i,
  id: /^#([a-z0-9\-]+)/i,
  className: /^\.([a-z0-9\-]+)/i,
  attr: /^\[([a-z\-0-9]+)(?:="([^"]+)")?\]/i,
  text: /^\s(.*)/
}

export function parseSelector (selector) {
  const attrs = {}
  let pending = selector

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
    throw new Error(`There was an error when parsing element: "${selector}"`)
  }

  return attrs
}

export function create (selector = '', attrs = {}) {
  const selAttrs = parseSelector(selector)

  ;['class', 'className'].forEach(key => {
    if (typeof selAttrs[key] === 'string') selAttrs[key] = [selAttrs[key]]
    if (typeof attrs[key] === 'string') attrs[key] = [attrs[key]]
  })

  attrs = deepmerge(selAttrs, attrs)

  const el = getDocument().createElement(attrs.tag || 'div')
  delete attrs.tag

  if ('text' in attrs) {
    el.textContent = attrs.text
    delete attrs.text
  }

  setAttributes(el, attrs)

  return el
}

export function toString (node) {
  const div = getDocument().createElement('div')

  if ('outerHTML' in div) return node.outerHTML
  div.appendChild(node.cloneNode(true))

  return div.innerHTML
}

export function setAttributes (el, attrs = {}) {
  attrs['class'] = (attrs['class'] || []).concat(attrs.className).join(' ')

  if (attrs.className) delete attrs.className
  if (!attrs['class']) delete attrs['class']

  for (let prop in attrs) if (attrs.hasOwnProperty(prop)) {
    let val = attrs[prop]

    if (val === undefined || val === null) val = ''

    el.setAttribute(prop, val)
  }

  return el
}

export function appendChildren (el, ...children) {
  switch (children.length) {
    case 0: break
    case 1:
      el.appendChild(children[0])
      break
    default:
      const wrapper = getDocument().createDocumentFragment()
      children.forEach((child) => wrapper.appendChild(child))
      el.appendChild(wrapper)
  }

  return el
}
