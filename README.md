# Domator

Simple DOM elements creation on Javascript, using [Jade](http://jade-lang.com/) like syntax. Also works on server-side.

## Usage

### With npm

First, install it:
```
npm install domator --save
```

Then, use it:
```javascript
var d = require('domator')
var el = d('p.the-class= Hello!') // <p class="the-class">Hello!</p>
```

### Browser
```html
<script src="dist/domator.min.js"></script>
<script>
  ;(function() {
    var el = domator('p.the-class= Hello!') // <p class="the-class">Hello!</p>

    document.body.appendChild(el)
  })()
</script>
```

### Node.js

To use it on server side, first, you must set a valid `document` element:

```javascript
var jsdom = require('jsdom')
var d = require('domator')

d.setDocument(jsdom.jsdom())

var el = d('p.the-class= Hello!') // <p class="the-class">Hello!</p>
```

## API

### domator()

Using the `domator()` function you can create any amount of DOM Nodes, with and
infinit amount of children.

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
tag#id.class[attr="value"]= Text
```

* `tag`
  * default: `div`
  * could be any value composed only by with letters, numbers and hyphens (-).
* `#id`
  * `id=` to be setted to the element.
  * can only be one `#id` defined.
* `.class`
  * `class=` value to be setted to the element.
  * Multiple values allowed.
  * e.g.: `div.one.two` creates an `<div class="one two"></div>`
* `[attr="value"]`
  * Custom attribute to set to the element.
  * Multiple values allowed.
  * `"value"` is optional.
    * e.g.: `input[required]` creates `<input required>`
* `= Text`
  * Everything after the `= ` will be added as text content on the element.
  * e.g.: `div= Hello world!` creates `<div>Hello world!</div>`

### `attrs`

* Optional
* Type: `object`

Object of attributes to be setted on the element.

### `children`

* Optional
* Type: `Array`

Array with the children to be added to the main element. The array uses the same
interface as the `doomator()` function.

### domator.setDocument(document)

Takes a valid [`Document`](https://developer.mozilla.org/en-US/docs/Web/API/Document) element.
It's needed on other environments that the browser, when there is no a default `window.document`.

### domator.toString(node)

Helper function to convert existing node elements to string.

### domator.create(element, attributes)

Helper function used internally to create elements, takes a [Domator Selector](#domator-selector) and
optionally an `attributes` object.

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
var el = d('#the-id.the-class[data-custom="the-custom-value"]= Hello!')

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

## Tests
```
npm run test
```

## Licence
MIT

## JS Styles
[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)
