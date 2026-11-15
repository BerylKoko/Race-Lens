# Race Lens — Prof. Huang clickable research prototype

**INFO 4900 · Cornell University · November 2026**

Open **`index.html`** in a modern web browser. No build, sign-in, internet connection or dependencies are required for the interface to function. All four files (`index.html`, `styles.css`, `data.js`, `app.js`) must be kept in the same folder.

## What is implemented

- Replays a **2025 Las Vegas Grand Prix** reference event with a working 50-lap slider, play/pause, step controls, and verified *selected* historic position checkpoints (other laps transparently reuse the last verified checkpoint).
- Interactive schematic circuit with selectable driver markers, drag-to-pan, zoom/reset and an all-markers toggle.
- Running order, clickable driver selection, current tyre filters using **All / Soft / Medium / Hard checkboxes**, summaries, stop events and race annotations.
- Integrated **Driver Focus** with driver selector beside heading, optional **Compare** disclosure, paired driver cards, evidence-based comparisons, and explanatory `?` tooltips.
- Qualifying guide defining **Q1/Q2/Q3** distinctly from **S1/S2/S3**; two-driver Q-session chart and round-by-round differences sourced from official FIA qualifying classification.
- Verified *best race sector* comparison for drivers for whom reference data is available (best S1/S2/S3 may come from different laps).
- Clearly labeled **schematic** speed / brake / throttle visual teaching demo; never passed off as actual telemetry.
- Research notes, source links, a participant scenario and observer checklist within the prototype.

## Data honesty and limits

The race history uses **real event data**, but this is not continuous verified timing or car tracking. The circuit geometry and changing driver-marker locations are a **schematic illustration**, *not* actual GPS or car positions. Selected on-track running orders are taken from published FIA lap checkpoints; unselected laps reuse the most recent included checkpoint and label its source lap. Numeric race gaps are shown only for the **specific** checked laps included in `data.js`; other laps say 'Not sampled', not fabricated. Track running order at the chequered flag is distinct from the **amended final classification**, in which Norris and Piastri were later disqualified. Tyre ages are inferred from known pit laps, not measured wear; tyre strategy sourced from an independent historical summary. Qualifying timing and selected race sectors are real numbers. The optional speed trace is purely a teaching sketch; it has arbitrary units.

The design explores whether **progressive disclosure** reduces the burden of interpreting dense F1 timing information. The third, lap-delta-heavy sketch was *not* made the main screen following Prof. Huang's November 2 guidance.

## Test task for Prof. Huang

> You missed the 2025 Las Vegas Grand Prix. Using this interface only: on lap 2, who was ahead—Lewis Hamilton or Charles Leclerc? Which of them made their first pit stop earlier, and on what laps? Then check qualifying: did Hamilton reach Q2, and who set the quicker Q1 lap?

Observer answers: At lap 2, **Leclerc P8** vs **Hamilton P12**. Leclerc first stops on **lap 24**, Hamilton on **lap 29**. Hamilton was eliminated in **Q1** (`1:57.115`); Leclerc's Q1 `1:54.814` was **2.301 seconds** quicker. Encourage think-aloud; log time, wrong turns, and whether explanations are sufficient without external guidance. The *Study notes & test* tab contains a printable/copyable prompt and interactive checklist.

## Data sources

1. [FIA — 2025 Las Vegas Qualifying Classification](https://api.fia.com/events/fia-formula-one-world-championship/season-2025/las-vegas-grand-prix/session-classifications)
2. [FIA — 2025 Las Vegas Pit Stops](https://www.fia.com/events/fia-formula-one-world-championship/season-2025/las-vegas-grand-prix/race-qualification)
3. [FIA — 2025 Las Vegas Race Lap Chart](https://www.fia.com/sites/default/files/2025_22_usa_f1_r0_timing_racelapchart_v01.pdf)
4. [FIA — 2025 Las Vegas Race History Chart](https://www.fia.com/sites/default/files/2025_22_usa_f1_r0_timing_racehistorychart_v01.pdf)
5. [Formula 1 — amended final race result](https://www.formula1.com/en/results/2025/races/1274/las-vegas/race-result)
6. [F1 Tracker — tyre strategy cross-reference](https://f1tracker.app/race/22?season=2025)
7. [Historical F1 sectors — best race sectors](https://en.mclarenf-1.com/2025/gp/1169/)

Independent study prototype; for educational use, not affiliated with Formula 1 or FIA.

**GitHub Pages deployment:** the website loads the four modular files `index.html`, `styles.css`, `data.js` and `app.js`. The downloadable package also provides a single-file standalone HTML alternative.
