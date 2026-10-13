# CSE451 study site

A local study site for CSE451 Software Engineering (IUB). All eight lectures, with diagrams,
live calculators, quizzes, exam questions with model answers, a formula sheet and a workspace
for the UniRide project.

## Run it

```sh
python3 serve.py          # opens http://127.0.0.1:4510
```

Or open "CSE451 Study Site" from the app launcher, or open `index.html` directly in a browser.

## Files

- `index.html`, `exam.html`, `project.html`
- `lectures/01..08-*.html`: one page per lecture
- `assets/style.css`, `assets/app.js`: shared look and behaviour (nav, quizzes, classifiers, checklists, progress)
- `assets/fonts/`: Hanken Grotesk and IBM Plex Mono, so it works offline

Progress, quiz scores and project notes are saved in the browser (localStorage).
To add a lecture, copy a lecture page, change `data-slug`, and add it to `LECTURES` in `assets/app.js`.
