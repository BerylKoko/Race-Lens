# November 2 feedback — implementation trace

This trace compares the three uploaded design sketches and the recovered November 2 Prof. Huang feedback with the implemented prototype. It does not claim to reproduce a verbatim meeting transcript.

| Feedback / intent | Implemented location | How to check |
|---|---|---|
| Base the main view on the first two sketches, not lap-delta-centered sketch three | Race replay: sidebar, central track, running order, Driver Focus underneath | Open Race replay at lap 2 |
| Driver selector **beside the Driver Focus heading** | Driver Focus heading row, next to the text | Change `Hamilton` to `Leclerc` from the heading |
| Compare button reveals second driver **inside Driver Focus** | `+ Compare`, expands directly below focused-driver metrics | Open Compare; select Leclerc as B |
| Compact explanatory difference summary below selected drivers | Race comparison takeaway and trend, not just raw cards | Confirm 5.912s gap at lap 2; sampled data only |
| Contextual **?** tooltips, no separate glossary/index | Replay controls, map navigation, pit stops, gaps, tyres, qualifying chart, sectors, speed chart | Hover/focus/tap help by pit progress and replay |
| Tyre checkbox controls, with Soft and All behavior | Race Snapshot checkboxes: All, Soft, Medium, Hard | Check Medium; reset to All |
| Explain Q1/Q2/Q3 and the effect on main-race starting positions | Qualifying & Pace, knockout explainer cards and grid context | Open Qualifying tab; describe eliminations and pole |
| Keep **sessions Q1/Q2/Q3** distinct from **sectors S1/S2/S3** | Definitions and labels in Qualifying & Pace and inside Compare | Read side-by-side timings and hover ? icons |
| Compare S1/S2/S3 between drivers and show differences | Inline comparison + optional expanded sector bars | Hamilton vs Leclerc: S1 delta 0.139s |
| Compare Q1/Q2/Q3 between drivers and show differences | Inline comparison + selected-session details | Hamilton lacks Q2/Q3; Leclerc Q1 quicker 2.301s |
| Simple Driver A vs Driver B qualifying line chart | Qualifying & Pace session chart, with selectable Q1/Q2/Q3 highlight | Follow a pair from Compare to Qualifying |
| Simple speed graph; deeper telemetry optional | Optional explicitly schematic speed display; Brake/Throttle examples | Observe educational trace; do not mistake it for recorded speed |
| Historical replay, driver tracker and movement | Slider, play/pause, event shortcuts, clickable schematic map, pan/zoom | Move lap 2 to lap 24 and zoom/reset |
| Preserve novice-first progressive disclosure | High-level map first; Compare on demand; detailed chart one click deeper | Complete task without opening unrelated controls |

## Evidence boundaries

Race orders and gaps are verified only at selected FIA reference checkpoints. The UI tells the viewer when it reuses the last recorded checkpoint. Best race sectors are independent bests from an external historical sector source; they cannot be added into a real lap. Speed/brake/throttle curves and track geometry are schematic. This research prototype does not yet provide validated continuous telemetry, and it does not establish causal explanations for tyre wear or pace differences.

## Remaining research obligations — not missing UI controls

- Confirm which parts Prof. Huang wants participants to test and whether the participant interview protocol needs revision.
- Finish the consolidated research folder of interface audit notes, citations, sketches, data-source documentation, and pilot observations for Prof. Huang.
- Test comprehension with novice participants after the professor walkthrough. One person completing the task does not verify usability across novices.
