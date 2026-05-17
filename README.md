# h-tree

[![tests](https://github.com/hbagheri/hassan_treeview_form/actions/workflows/test.yml/badge.svg)](https://github.com/hbagheri/hassan_treeview_form/actions/workflows/test.yml)

A small (~230 lines, zero dependencies) hierarchical tree-view widget with
**tri-state checkboxes** — checking a parent checks every descendant, and
checking a leaf rolls up so ancestors become fully or partially checked.

```html
<link rel="stylesheet" href="styles.css">
<div id="tree"></div>
<script type="module">
    import { TreeView } from './src/tree-view.js';

    new TreeView({
        el: '#tree',
        data: [
            { id: 'docs', text: 'Documents', items: [
                { id: 'docs/q1', text: 'Q1 Report' },
                { id: 'docs/q2', text: 'Q2 Report' },
            ]},
            { id: 'pictures', text: 'Pictures' },
        ],
        selected: ['docs/q1'],
        onChange: (ids) => console.log('checked leaves:', ids),
    });
</script>
```

Open `index.html` for a live demo.

## Why

There are plenty of tree-view libraries, but most pull in a framework
or a kitchen-sink UI kit. This is a single ES module + one CSS file, no
build step, no jQuery.

## Install

Copy `src/tree-view.js` and `styles.css` into your project, or:

```bash
npm install --save  github:hbagheri/hassan_treeview_form
```

then

```js
import { TreeView } from 'h-tree';
```

## API

### `new TreeView(options)`

| Option | Type | Description |
| --- | --- | --- |
| `el` | `HTMLElement \| string` | Container element or CSS selector. **Required.** |
| `data` | `Node[]` | Tree data (see [Node shape](#node-shape)). **Required.** |
| `selected` | `string[]` | Node ids initially checked. Branch ids check the whole subtree. |
| `onChange` | `(ids: string[]) => void` | Called whenever the selection changes; receives the list of fully-checked **leaf** ids. |

Methods:

| | |
| --- | --- |
| `view.selected()` | Array of fully-checked leaf ids. |
| `view.destroy()`  | Clears the container. |

### `TreeModel`

If you want the propagation logic without the DOM (e.g. for tests or
server-side rendering):

```js
import { TreeModel, STATE } from 'h-tree';

const m = new TreeModel(data, ['docs/q1']);
m.toggle('docs');
m.selectedLeafIds();   // -> ['docs/q1', 'docs/q2', ...]
m.fullyCheckedIds();   // -> ['docs']                (collapsed)
m.nodeMap.get('docs').state === STATE.ALL;
```

### Node shape

```js
{
    id:       'unique-id',     // required, must be unique across the whole tree
    text:     'Display label', // optional (falls back to id)
    items:    [ Node, ... ],   // optional children
    expanded: false,           // optional, default false
}
```

`name` is accepted as a fallback for `id` (legacy callers).

## Tri-state behaviour

| User clicks on… | Effect |
| --- | --- |
| Leaf | Toggles its checked state. |
| Branch (currently unchecked or semi-checked) | Fully checks the whole subtree. |
| Branch (currently fully checked) | Unchecks the whole subtree. |
| Any node | Ancestors are recomputed from their children. |

Class names applied to each label: `h-tree__label--checked`,
`h-tree__label--semi-checked`, `h-tree__label--not-checked`. Re-style at will.

## Tests

```bash
npm test
```

Runs the `TreeModel` tests via Node's built-in test runner. No DOM needed.

## Demo locally

```bash
npm run serve   # serves the current directory on http://localhost:8000
```

Then open `http://localhost:8000/` in a browser.

## Project layout

```
src/tree-view.js          # the module (TreeModel + TreeView)
styles.css                # default styles
index.html                # standalone demo
test/tree-model.test.js   # tests (Node's built-in runner)
package.json              # type: module
```

## Migrating from 1.x

The old version was a jQuery plugin (`$.fn.h_tree`) with several bugs that
made the published API silently broken. The 2.x API is not call-compatible:

* Use the `TreeView` class instead of `$('#x').h_tree(...)`.
* Pass a single options object, not separate positional arguments.
* No jQuery dependency.

If you need the old behaviour, the 1.x source is at the GitLab origin
in commit `d8a933f`.

## License

MIT — see `LICENSE`.
