import { test } from 'node:test';
import assert  from 'node:assert/strict';
import { TreeModel, STATE } from '../src/tree-view.js';

const sample = () => [
    { id: 'a', text: 'A', items: [
        { id: 'a1', text: 'A1' },
        { id: 'a2', text: 'A2' },
        { id: 'a3', text: 'A3' },
    ]},
    { id: 'b', text: 'B' },
];

test('initial state: nothing selected -> all NONE', () => {
    const m = new TreeModel(sample());
    assert.equal(m.nodeMap.get('a').state,  STATE.NONE);
    assert.equal(m.nodeMap.get('a1').state, STATE.NONE);
    assert.equal(m.nodeMap.get('b').state,  STATE.NONE);
});

test('initial selection: one leaf -> parent SOME', () => {
    const m = new TreeModel(sample(), ['a1']);
    assert.equal(m.nodeMap.get('a').state,  STATE.SOME);
    assert.equal(m.nodeMap.get('a1').state, STATE.ALL);
    assert.equal(m.nodeMap.get('a2').state, STATE.NONE);
});

test('initial selection: all leaves of a branch -> parent ALL', () => {
    const m = new TreeModel(sample(), ['a1', 'a2', 'a3']);
    assert.equal(m.nodeMap.get('a').state, STATE.ALL);
});

test('toggle: unchecked branch -> ALL on entire subtree', () => {
    const m = new TreeModel(sample());
    m.toggle('a');
    assert.equal(m.nodeMap.get('a').state,  STATE.ALL);
    assert.equal(m.nodeMap.get('a1').state, STATE.ALL);
    assert.equal(m.nodeMap.get('a3').state, STATE.ALL);
});

test('toggle: SOME branch -> ALL (fills the partial)', () => {
    const m = new TreeModel(sample(), ['a1']);
    assert.equal(m.nodeMap.get('a').state, STATE.SOME);
    m.toggle('a');
    assert.equal(m.nodeMap.get('a').state,  STATE.ALL);
    assert.equal(m.nodeMap.get('a2').state, STATE.ALL);
});

test('toggle: ALL branch -> NONE', () => {
    const m = new TreeModel(sample(), ['a1', 'a2', 'a3']);
    m.toggle('a');
    assert.equal(m.nodeMap.get('a').state,  STATE.NONE);
    assert.equal(m.nodeMap.get('a1').state, STATE.NONE);
});

test('toggle leaf: uncheck one of all-checked -> parent SOME', () => {
    const m = new TreeModel(sample(), ['a1', 'a2', 'a3']);
    m.toggle('a1');
    assert.equal(m.nodeMap.get('a').state, STATE.SOME);
});

test('toggle leaf: uncheck only checked leaf -> parent NONE', () => {
    const m = new TreeModel(sample(), ['a1']);
    m.toggle('a1');
    assert.equal(m.nodeMap.get('a').state, STATE.NONE);
});

test('propagation rolls up multiple levels', () => {
    const m = new TreeModel([
        { id: 'root', items: [
            { id: 'mid', items: [
                { id: 'leaf1' },
                { id: 'leaf2' },
            ]},
        ]},
    ]);
    m.toggle('leaf1');
    assert.equal(m.nodeMap.get('mid').state,  STATE.SOME);
    assert.equal(m.nodeMap.get('root').state, STATE.SOME);
    m.toggle('leaf2');
    assert.equal(m.nodeMap.get('mid').state,  STATE.ALL);
    assert.equal(m.nodeMap.get('root').state, STATE.ALL);
});

test('selectedLeafIds returns leaves only', () => {
    const m = new TreeModel(sample(), ['a1', 'a3', 'b']);
    const ids = m.selectedLeafIds().sort();
    assert.deepEqual(ids, ['a1', 'a3', 'b']);
});

test('fullyCheckedIds collapses checked branches', () => {
    const m = new TreeModel(sample(), ['a1', 'a2', 'a3', 'b']);
    const ids = m.fullyCheckedIds().sort();
    assert.deepEqual(ids, ['a', 'b']);
});

test('duplicate node id throws', () => {
    assert.throws(
        () => new TreeModel([{ id: 'x' }, { id: 'x' }]),
        /duplicate node id/
    );
});

test('node without id but with name falls back to name', () => {
    const m = new TreeModel([{ name: 'foo', text: 'Foo' }]);
    assert.ok(m.nodeMap.get('foo'));
});

test('node without id or name throws', () => {
    assert.throws(
        () => new TreeModel([{ text: 'no id' }]),
        /needs an id/
    );
});

test('toggle on unknown id is a no-op', () => {
    const m = new TreeModel(sample());
    m.toggle('does-not-exist');
    assert.equal(m.nodeMap.get('a').state, STATE.NONE);
});

test('expand sets flag', () => {
    const m = new TreeModel(sample());
    assert.equal(m.nodeMap.get('a').expanded, false);
    m.expand('a', true);
    assert.equal(m.nodeMap.get('a').expanded, true);
});
