let doc = null

if (typeof window !== 'undefined' && window.document) doc = window.document

export function setDocument (newDoc) {
  doc = newDoc
  return doc
}

export function getDocument () {
  if (!doc) {
    throw new Error('Need to call domator.setDocument(document) first.')
  }

  return doc
}
