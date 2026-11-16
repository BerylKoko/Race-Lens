# Race Lens — Prof. Huang clickable research prototype

**INFO 4900 · Cornell University · November 2026**

Open **`index.html`** in a modern web browser. No build, sign-in, internet connection or dependencies are required for the interface to function. All four files (`index.html`, `styles.css`, `data.js`, `app.js`) must be kept in the same folder.

## What is implemented

- Replays a **2025 Las Vegas Grand Prix** reference event with a working 50-lap slider, play/pause, step controls, a jump-to-lap dropdown, and *selected* historic position checkpoints (other laps use the last recorded checkpoint in this reference dataset).
- Interactive schematic circuit with selectable driver markers, drag-to-pan, zoom/reset with all 20 markers visible and selectable.
- Running order, clickable driver selection, current tyre filters using **Soft / Medium / Hard checkboxes**, summaries and pit-stop progress. The checkboxes filter the matching-driver chips; the map and running order always show all 20 entrants.
- Integrated **Driver Focus** with the selector immediately beside its heading and the selected driver's race position beside their name, optional **Compare** disclosure, paired driver cards, compact **S1/S2/S3** sector comparisons (the Q1/Q2/Q3 chart remains in the separate Qualifying tab), evidence-based differences, and short contextual `?` tooltips for tyre compounds, tyre age, race gaps, and pit stops.
- Qualifying guide defining **Q1/Q2/Q3** distinctly from **S1/S2/S3**; two-driver Q-session chart, selectable Q1/Q2/Q3 round highlights, and round-by-round differences sourced from official FIA qualifying classification. Opening it from Driver Focus preserves the chosen pair and offers a direct return to Driver Focus.
- Verified *best race sector* comparison for drivers for whom reference data is available (best S1/S2/S3 may come from different laps).
- Clearly labeled **schematic** speed / brake / throttle visual teaching demo; never passed off as actual telemetry.

## Data honesty and limits

The race history uses **real event data**, but this is not continuous verified timing or car tracking. The circuit geometry and changing driver-marker locations are a **schematic illustration**, *not* actual GPS or car positions. Selected on-track running orders are taken from published FIA lap checkpoints; other laps use the most recent included order; the sample coverage is documented in the source data. Numeric race gaps are shown only for the **specific** checked laps included in `data.js`; other laps say 'Not sampled', not fabricated. Track running order at the chequered flag is distinct from the **amended final classification**, in which Norris and Piastri were later disqualified. Tyre ages are inferred from known pit laps, not measured wear; tyre strategy sourced from an independent historical summary. Qualifying timing and selected race sectors are real numbers. The optional speed trace is purely a teaching sketch; it has arbitrary units.

The design explores whether **progressive disclosure** reduces the burden of interpreting dense F1 timing information. The third, lap-delta-heavy sketch was *not* made the main screen following Prof. Huang's November 2 guidance.

## Test task for Prof. Huang

A short think-aloud task in [`PROFESSOR_TASK.md`](PROFESSOR_TASK.md) covers the integrated Driver Focus comparison, pit-stop `?` help, S1 sector comparison and qualifying Q1/Q2/Q3. An optional second task tests tyre filters, map pan/zoom, and comparing qualifying sessions. The task and observer-only answer key are in `PROFESSOR_TASK.md`, separate from the public-facing interface.

A trace from the **November 2 design feedback** to the implemented screens and verification steps is in [`FEEDBACK_TRACE.md`](FEEDBACK_TRACE.md).

## Data sources

1. [FIA — 2025 Las Vegas Qualifying Classification](https://api.fia.com/events/fia-formula-one-world-championship/season-2025/las-vegas-grand-prix/session-classifications)
2. [FIA — 2025 Las Vegas Pit Stops](https://www.fia.com/events/fia-formula-one-world-championship/season-2025/las-vegas-grand-prix/race-qualification)
3. [FIA — 2025 Las Vegas Race Lap Chart](https://www.fia.com/sites/default/files/2025_22_usa_f1_r0_timing_racelapchart_v01.pdf)
4. [FIA — 2025 Las Vegas Race History Chart](https://www.fia.com/sites/default/files/2025_22_usa_f1_r0_timing_racehistorychart_v01.pdf)
5. [Formula 1 — amended final race result](https://www.formula1.com/en/results/2025/races/1274/las-vegas/race-result)
6. [F1 Tracker — tyre strategy cross-reference](https://f1tracker.app/race/22?season=2025)
7. [Historical F1 sectors — best race sectors](https://en.mclarenf-1.com/2025/gp/1169/)

Independent study prototype; for educational use, not affiliated with Formula 1 or FIA.
