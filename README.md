# Domator

[![Greenkeeper badge](https://badges.greenkeeper.io/mjlescano/domator.svg)](https://greenkeeper.io/)

Simple DOM elements creation on Javascript, using something like a CSS selector syntax, with only 180 LOC. Also works on server-side.

## Install

```
npm install domator --save
```

## Table of Contents

- [Usage](#usage)
- [Examples](#examples)
- [API](#api)
- [Server side](#server-side-usage)
- [Testing](#tests)

## Usage

### With CommonJS

```javascript
var d = require('domator')
var el = d('p.the-class Hello!') // <p class="the-class">Hello!</p>

document.body.appendChild(el)
```

### Browser
```html
<script src="dist/domator.min.js"></script>
<script>
  ;(function() {
    var el = domator('p.the-class Hello!') // <p class="the-class">Hello!</p>
    
    document.body.appendChild(el)
  })()
</script>
```

## Examples

To create a simple div:
```javascript
var el = d('div') // <div></div>
```

To create a div with 3 `span` childs:
```javascript
var el = d('div', ['span', 'span', 'span'])

/* Produces:
<div>
  <span></span>
  <span></span>
  <span></span>
</div>
*/
```

Can be nested indefinitely:
```javascript
var el = d(
  'div', [
    'div', [
      'div' [
        'span',
        'span',
        'span'
      ]
    ]
  ]
)

/* Produces:
<div>
  <div>
    <div>
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
</div>
*/
```

With custom attributes, text, and className:
```javascript
var el = d('div', {
  'data-custom': 'the-custom-value',
  text: 'Hello!',
  className: 'the-class', // "class" and "className" are the same
  id: 'the-id'
})

/* Produces:
<div class="the-class" id="the-id" data-custom="the-custom-value">
  Hello!
</div>
*/
```

The same as the last one, but, with a slick syntax:
```javascript
var el = d('#the-id.the-class[data-custom="the-custom-value"] Hello!')

/* Produces:
<div class="the-class" id="the-id" data-custom="the-custom-value">
  Hello!
</div>
*/
```

If you dont have a single root element, it creates a [DocumentFragment](https://developer.mozilla.org/docs/Web/API/DocumentFragment) with all of them:
```javascript
var el = d('.one', '.two', '.three')

document.body.appendChild(el)

/* Leaves the <body> with:
<body>
  <div class="one"></div>
  <div class="two"></div>
  <div class="three"></div>
</body>
*/
```

To keep a reference to a child, you can pre-create an element and pass it on to the constructor:
```javascript
var span = d('span.some-child')
var el = d('div.the-parent', [span])

/* Produces:
<div class="the-parent">
  <span class="some-child"></span>
</div>
*/
```

## API

### domator()

Using the `domator()` function you can create any amount of DOM Nodes, with and
infinite amount of children.

```javascript
domator(el, attrs, [children...] [, el, attrs, [children...]]...)
```

### `el`
* Required
* Type: Domator selector or a [`Node Element`](https://developer.mozilla.org/en-US/docs/Web/API/Element).

#### Domator Selector

The domator selector is used to be able to create an element with default values
super easy, all the values are optional. A complete example would be:

```
tag#id.class-name[attr="value"] Hello world!
```

* `tag`
  * Default: `div`
  * Could be any value composed only with letters, numbers, or hyphens (-).
  * Optional: in the case you define an `id`, `class`, or `attr`.
    * e.g.: `.the-class` produces `<div class="the-class"></div>`
* `#id`
  * `id=` of the element.
  * Can only be one `#id` defined.
* `.class-name`
  * `class="class-name"` value to be setted to the element.
  * Multiple values allowed.
    * e.g.: `.one.two` creates `<div class="one two"></div>`
* `[attr="value"]`
  * Custom attribute to set to the element.
  * Multiple values allowed.
  * `"value"` is optional.
    * e.g.: `input[required]` creates `<input required>`
* ` Hello world!`
  * Everything after the whitespace will be added as text content on the element.
  * e.g.: `div Hello world!` creates `<div>Hello world!</div>`

### `attrs`

* Optional
* Type: `object`

Attributes of the element, e.g.:
```javascript
domator('div', {"data-something": "hello"}) // Produces <div data-something="hello"></div>
```

### `children`

* Optional
* Type: `Array`

Array with children elements to be added inside the element. The array receives the same arguments as the `domator(...)` function. e.g.:

```javascript
domator('div.parent', ['span.child']) // Produces: <div class="parent"><span class="child"></span></div>
```

### domator.setDocument(document)

Takes a valid [`Document`](https://developer.mozilla.org/en-US/docs/Web/API/Document) element.
It's needed when used on other environments than the browser, where is no default `window.document`.

### domator.toString(node)

Helper function to convert existing node elements to string.

### domator.create(element, attributes)

Helper function used internally to create elements, takes a [Domator Selector](#domator-selector) and
optionally an `attributes` object.


## Server side usage

To use it on server side, you must set a valid `document` element first:

```javascript
var jsdom = require('jsdom')
var d = require('domator')

d.setDocument(jsdom.jsdom())

var el = d('p.the-class Hello!') // <p class="the-class">Hello!</p>
```

## Tests
```
npm run test
```

## Licence
MIT

## JS Styles
[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)
