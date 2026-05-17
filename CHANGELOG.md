# Changelog

All notable changes to this project are documented here.
The format is loosely based on [Keep a Changelog](https://keepachangelog.com/)
and this project follows [Semantic Versioning](https://semver.org/).

## [2.0.0] - 2026-05-17

### Rewritten as a dependency-free ES module

The 1.x jQuery plugin had several silently-broken bugs and shipped 360 KB
of proprietary demo data. This release is a clean rewrite; the API is
**not** call-compatible with 1.x.

### Added

- `src/tree-view.js` -- single ES module exporting `TreeModel` (pure logic)
  and `TreeView` (DOM).
- `test/tree-model.test.js` -- 16 unit tests on propagation logic, runs
  via Node's built-in test runner (no DOM dependency).
- `package.json` (`type: module`).
- Generic filesystem-shaped demo data in `index.html` (was AVA-PBX menu).
- Real `README.md` with API docs, node shape, migration notes.

### Fixed

- API/call mismatch between plugin signature and demo invocation
  (`$.h_tree('h-tree-json',...)` was passing 3 args to a function expecting
  one options object).
- `typeof(x) == undefined` comparisons that were always false.
- `semi_checked` vs `semi-checked` typo that broke the parent state
  rollup logic.
- Inverted display toggle (`(display)?"none":"block"` ran backwards).
- No-op `closest('li').next('ul')` selector that didn't actually find
  the children.
- Semi-checked rollup arithmetic that incorrectly marked a parent fully
  checked when all its children were semi-checked.
- Broken nested CSS pseudo-element (`::before::after`).
- Implicit globals (`treeChild`, `id`, `label`, `mainUl`, ...) leaking
  onto `window`.

### Removed

- jQuery dependency.
- `script.js` (was entirely commented out).
- `h_tree_check.js` (replaced by `src/tree-view.js`).
- 360 KB of AVA-PBX demo data.

## [1.x] - legacy

Initial jQuery plugin. Source preserved in commit `d8a933f` on the GitLab
origin.
