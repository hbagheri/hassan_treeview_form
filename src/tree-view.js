// h-tree -- a small dependency-free hierarchical tree-view with tri-state
// checkboxes. Checking a parent checks every descendant; checking a leaf
// rolls up so ancestors become fully or partially checked.
//
//   import { TreeView } from './src/tree-view.js';
//
//   new TreeView({
//     el: '#tree',
//     data: [{ id: 'docs', text: 'Documents', items: [...] }, ...],
//     selected: ['docs/q1'],
//     onChange: (ids) => console.log(ids),
//   });

export const STATE = Object.freeze({ NONE: 0, ALL: 1, SOME: 2 });

const CLASS_FOR_STATE = { 0: 'not-checked', 1: 'checked', 2: 'semi-checked' };

// ---------------------------------------------------------------------------
// TreeModel - pure data + state-propagation logic. No DOM. Unit-testable.
// ---------------------------------------------------------------------------
export class TreeModel {
    constructor(data, initialSelected = []) {
        this.roots     = [];
        this.nodeMap   = new Map();   // id -> node
        this.parentMap = new Map();   // id -> parent id (or null for roots)
        this.roots = this._build(data, null);
        this._applyInitialSelection(initialSelected);
    }

    _build(items, parentId) {
        const out = [];
        for (const raw of items) {
            const id = raw.id ?? raw.name;
            if (!id) throw new Error('TreeModel: every node needs an id (or name)');
            if (this.nodeMap.has(id)) throw new Error(`TreeModel: duplicate node id "${id}"`);

            const node = {
                id,
                text: raw.text ?? raw.name ?? String(id),
                expanded: Boolean(raw.expanded),
                items: [],
                state: STATE.NONE,
            };
            this.nodeMap.set(id, node);
            this.parentMap.set(id, parentId);

            if (Array.isArray(raw.items) && raw.items.length) {
                node.items = this._build(raw.items, id);
            }
            out.push(node);
        }
        return out;
    }

    _applyInitialSelection(ids) {
        for (const id of ids) {
            const node = this.nodeMap.get(id);
            if (node) node.state = STATE.ALL;
        }
        for (const root of this.roots) this._recomputeFromChildren(root);
    }

    _recomputeFromChildren(node) {
        if (!node.items.length) return node.state;
        let allSet = true, noneSet = true;
        for (const child of node.items) {
            const s = this._recomputeFromChildren(child);
            if (s !== STATE.ALL)  allSet  = false;
            if (s !== STATE.NONE) noneSet = false;
        }
        node.state = allSet ? STATE.ALL : noneSet ? STATE.NONE : STATE.SOME;
        return node.state;
    }

    isLeaf(node) { return node.items.length === 0; }

    /**
     * Toggle a node. Clicking a fully-checked node unchecks the subtree;
     * clicking an unchecked or semi-checked node fully checks the subtree.
     * Ancestors are re-derived from the result.
     */
    toggle(id) {
        const node = this.nodeMap.get(id);
        if (!node) return;
        const next = node.state === STATE.ALL ? STATE.NONE : STATE.ALL;
        this._setSubtree(node, next);
        this._propagateUp(this.parentMap.get(id));
    }

    _setSubtree(node, state) {
        node.state = state;
        for (const child of node.items) this._setSubtree(child, state);
    }

    _propagateUp(id) {
        while (id != null) {
            const node = this.nodeMap.get(id);
            let allSet = true, noneSet = true;
            for (const child of node.items) {
                if (child.state !== STATE.ALL)  allSet  = false;
                if (child.state !== STATE.NONE) noneSet = false;
            }
            node.state = allSet ? STATE.ALL : noneSet ? STATE.NONE : STATE.SOME;
            id = this.parentMap.get(id);
        }
    }

    expand(id, flag = true) {
        const node = this.nodeMap.get(id);
        if (node) node.expanded = Boolean(flag);
    }

    /** Fully-selected leaf ids -- typical "what did the user pick" answer. */
    selectedLeafIds() {
        const out = [];
        const walk = (node) => {
            if (this.isLeaf(node)) {
                if (node.state === STATE.ALL) out.push(node.id);
            } else {
                for (const c of node.items) walk(c);
            }
        };
        for (const r of this.roots) walk(r);
        return out;
    }

    /**
     * Ids that are fully checked (a fully-checked branch is reported as
     * a single id; its descendants are not enumerated separately).
     */
    fullyCheckedIds() {
        const out = [];
        const walk = (node) => {
            if (node.state === STATE.ALL) out.push(node.id);
            else if (node.state === STATE.SOME) for (const c of node.items) walk(c);
        };
        for (const r of this.roots) walk(r);
        return out;
    }
}

// ---------------------------------------------------------------------------
// TreeView - renders a TreeModel and binds clicks. Browser-only.
// ---------------------------------------------------------------------------
export class TreeView {
    constructor({ el, data, selected = [], onChange } = {}) {
        this.container = typeof el === 'string' ? document.querySelector(el) : el;
        if (!this.container) throw new Error('TreeView: container element not found');
        this.model    = new TreeModel(data, selected);
        this.onChange = typeof onChange === 'function' ? onChange : null;
        this._render();
        this._bind();
    }

    _render() {
        this.container.innerHTML = '';
        this.container.classList.add('h-tree');
        this.container.appendChild(this._renderList(this.model.roots));
    }

    _renderList(nodes) {
        const ul = document.createElement('ul');
        ul.className = 'h-tree__ul';
        for (const node of nodes) ul.appendChild(this._renderNode(node));
        return ul;
    }

    _renderNode(node) {
        const li = document.createElement('li');
        li.className = 'h-tree__li';
        li.dataset.id = node.id;

        const row = document.createElement('div');
        row.className = 'h-tree__row';

        if (!this.model.isLeaf(node)) {
            const tri = document.createElement('span');
            tri.className = 'h-tree__triangle' + (node.expanded ? ' h-tree__triangle--open' : '');
            tri.dataset.role = 'toggle-expand';
            row.appendChild(tri);
        } else {
            const sp = document.createElement('span');
            sp.className = 'h-tree__spacer';
            row.appendChild(sp);
        }

        const label = document.createElement('label');
        label.className = `h-tree__label h-tree__label--${CLASS_FOR_STATE[node.state]}`;
        label.dataset.role = 'toggle-check';
        label.textContent  = node.text;
        row.appendChild(label);

        li.appendChild(row);

        if (!this.model.isLeaf(node)) {
            const childUl = this._renderList(node.items);
            if (!node.expanded) childUl.style.display = 'none';
            li.appendChild(childUl);
        }
        return li;
    }

    _bind() {
        this.container.addEventListener('click', (event) => {
            const target = event.target;
            const role   = target?.dataset?.role;
            const li     = target?.closest?.('li.h-tree__li');
            if (!li || !role) return;
            const id = li.dataset.id;

            if (role === 'toggle-expand') {
                const childUl = li.querySelector(':scope > ul.h-tree__ul');
                if (!childUl) return;
                const willOpen = childUl.style.display === 'none';
                childUl.style.display = willOpen ? 'block' : 'none';
                target.classList.toggle('h-tree__triangle--open', willOpen);
                this.model.expand(id, willOpen);
            } else if (role === 'toggle-check') {
                this.model.toggle(id);
                this._refreshStates();
                if (this.onChange) this.onChange(this.model.selectedLeafIds());
            }
        });
    }

    _refreshStates() {
        for (const li of this.container.querySelectorAll('li.h-tree__li')) {
            const node  = this.model.nodeMap.get(li.dataset.id);
            if (!node) continue;
            const label = li.querySelector(':scope > .h-tree__row > .h-tree__label');
            label.className = `h-tree__label h-tree__label--${CLASS_FOR_STATE[node.state]}`;
        }
    }

    selected() { return this.model.selectedLeafIds(); }
    destroy()  { this.container.innerHTML = ''; }
}
