let doc = null

if (typeof window !== 'undefined' && window.document) doc = window.document

export function setDocument (newDoc) {
  doc = newDoc
  return doc
}

export function getDocument () {
  return doc
}
