# Domator

Simple DOM elements creation on Javascript, using something like a CSS selector. Also works on server-side.

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
<div class="the-class" id="the-id" data-some="the-custom-value">
  Hello!
</div>
*/
```

The same as the last one, but, with a slick selector:
```javascript
var el = d('#the-id.the-class[data-custom="the-custom-value"]= Hello!')

/* Produces:
<div class="the-class" id="the-id" data-some="the-custom-value">
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

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)
