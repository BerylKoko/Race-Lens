# Race Lens — think-aloud test for Prof. Huang

**Course:** Cornell INFO 4900 · Interface Research / November 2026  
**Prototype:** 2025 Las Vegas Grand Prix historical replay  
**Purpose:** Check whether the map-first layout, integrated Driver Focus comparison and contextual explanations help a novice locate and interpret race/qualifying information.

## Primary independent task (7–10 minutes)

Give Prof. Huang the clickable prototype at **Race replay**, lap 2, Hamilton selected. Do **not** point out where the Compare control, tyre filters or qualifying tab are. Ask her to think aloud, explaining what she expects each control to do.

> You missed the 2025 Las Vegas Grand Prix. Using this interface only, go to lap 2 and compare Lewis Hamilton with Charles Leclerc. Who was ahead? Use a question-mark icon to learn what a pit stop means, then work out who made their first stop earlier. In the same comparison, which driver has the faster best Sector 1 time? Finally, open qualifying: did Hamilton reach Q2, and which driver recorded the quicker Q1 time?

### Observer checklist

- [ ] Locates or confirms lap 2 using the replay controls.
- [ ] Finds Driver Focus and changes a driver, if needed, without coaching.
- [ ] Discovers Compare, selects the second driver and interprets the plain-language comparison.
- [ ] Reports Charles Leclerc ahead of Lewis Hamilton at lap 2 (P8 vs P12).
- [ ] Opens a **?** tooltip and understands that a pit stop is pit-lane service, commonly to change tyres.
- [ ] Finds Leclerc's first stop on lap **24** and Hamilton's on lap **29**.
- [ ] Identifies the quicker *best race* S1: Leclerc 26.798s vs Hamilton 26.937s (**0.139s** quicker); understands these bests may come from different laps.
- [ ] Follows the same selected pair into Qualifying & Pace without resetting the drivers.
- [ ] Understands Hamilton did not reach Q2; missing Q2/Q3 times are not zero values.
- [ ] Reads Leclerc Q1 **1:54.814** vs Hamilton Q1 **1:57.115** (**2.301s** quicker).
- [ ] Can distinguish **Q1/Q2/Q3 qualifying sessions** from **S1/S2/S3 lap sectors** without external explanation.

Record total time ______ ; first hesitation ______ ; incorrect click(s) ______ ; tooltip use ______ ; explanation requested ______ ; successful completion? ______ .

## Optional second task: controls and interpretation (3–5 minutes)

> Use the tyre checkboxes to show only drivers on Medium tyres, then show All again. Use a race-event shortcut to move to lap 24, and find Charles Leclerc on the map or running order. Now zoom the track, reset it, and return to qualifying. Select Q2 to highlight it and explain why Hamilton has no time there. What does the speed chart tell you—and what does it **not** claim to measure?

Look for whether tyre filters affect the running order and markers, and whether the distinction between recorded history and schematic visualization is understood.

## Answer key (observer only; do not disclose during task)

At **lap 2**, Leclerc is **P8** and Hamilton **P12**; Leclerc is ahead. Their verified sampled leader gaps are **+13.104s** and **+19.016s**, respectively (a **5.912s** difference). Leclerc first pits lap **24**, Hamilton lap **29**. Leclerc's individual best race-sector 1 is **26.798s** versus Hamilton's **26.937s**, a **0.139s** difference; they need not have been set on the same lap. Hamilton's official qualifying Q1 is **1:57.115** and he does not advance; Leclerc's Q1 is **1:54.814** (**2.301s** faster).

The circuit shape, between-checkpoint animation and speed/brake/throttle chart are *schematic teaching visuals*, not GPS or measured telemetry. Do not score whether the visual motion matches the actual race.

### After-task interview prompts

1. Where did you expect to find the second-driver comparison? Did you find it there?
2. Which number or chart was hardest to interpret? What helped?
3. What do you understand by the difference between qualifying *sessions* and lap *sectors*?
4. What would you move, hide or rename to make the interface clearer for a first-time F1 viewer?

One successful professor walkthrough is formative feedback, **not a validated usability finding**. Record observations and then run tasks with novice participants.
