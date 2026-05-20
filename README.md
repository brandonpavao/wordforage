# Infinite Connections

A static browser version of a Connections-style word puzzle game, converted from the original Flask and Python version for GitHub Pages hosting.

This version keeps the puzzle data in JSON and moves the game rules into JavaScript, so the project runs with only HTML, CSS, and JS.

## Files

- `index.html`
- `style.css`
- `app.js`
- `puzzles_generated.json`
- `logo.png`

## Local Preview

Run a simple local server from this folder:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Do not test it by double clicking `index.html`, because the browser may block the JSON fetch.

## GitHub Pages

Upload these files to the root of your repo, then enable GitHub Pages from the main branch.
