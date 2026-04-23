---
name: check
description: Mid-session sanity gate for the limedice static site
---

# Quick Check — static site

No build step. This skill runs a lightweight set of checks suited to plain HTML/CSS/JS.

## 1. Preview Server

Check whether a preview server is live and the site responds 200:

```
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:8080/
```

If not running, start one: `python -m http.server 8080` (background).

## 2. Optional Linters

Only if Scott asks, or the diff touches HTML/CSS:

- `npx html-validate index.html`
- `npx stylelint "**/*.css"`

## 3. Design-Token Audit

Scan for raw hex colours outside `colors_and_type.css` (the only file allowed to contain raw hex):

```
grep -n -E '#[0-9A-Fa-f]{3,6}' index.html styles.css main.js | grep -v colors_and_type
```

Any matches → report for replacement with `var(--color-*)` tokens.

## 4. Debug-Leak Audit

```
grep -n -E 'console\.(log|warn|error|debug)' main.js
```

Any matches in production code → report for removal.

## 5. Summary

Report concisely:
- **Server:** up (http://localhost:8080/) / down
- **HTML lint:** OK / N warnings (if run)
- **CSS lint:** OK / N warnings (if run)
- **Raw hex outside tokens:** N occurrences
- **console.*: N occurrences

If anything failed, show only the offending line(s) and suggest a fix.
