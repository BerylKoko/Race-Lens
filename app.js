/* Interactive F1 race replay. Data.js contains historical reference data. */
(() => {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const state = {
        view: 'race',
        lap: 2,
        focused: 'HAM',
        compared: 'LEC',
        showCompare: false,
        qualA: 'NOR',
        qualB: 'VER',
        tyreFilters: new Set(),
        playing: false,
        showAllMarkers: true,
        mapScale: 1,
        panX: 0,
        panY: 0,
        dragging: false,
        selectedSession: 0
    };
    let playTimer = null, dragStart = null, tooltipAnchor = null;
    const extendedGaps = {};
    const shortDriverIds = {
        verstappen: 'VER',
        max_verstappen: 'VER',
        russell: 'RUS',
        antonelli: 'ANT',
        leclerc: 'LEC',
        sainz: 'SAI',
        hadjar: 'HAD',
        hulkenberg: 'HUL',
        hamilton: 'HAM',
        ocon: 'OCO',
        bearman: 'BEA',
        alonso: 'ALO',
        tsunoda: 'TSU',
        gasly: 'GAS',
        lawson: 'LAW',
        colapinto: 'COL',
        albon: 'ALB',
        bortoleto: 'BOR',
        stroll: 'STR',
        norris: 'NOR',
        piastri: 'PIA'
    };
    const firstName = (d) => d.name.split(' ')[0];
    const fmt = (v) => Number(v).toFixed(3);
    const fmtShort = (v) => Number(v).toFixed(1);
    function sec(text) {
        if (!text)
            return null;
        const bits = text.split(':');
        return Number(bits[0]) * 60 + Number(bits[1]);
    }
    function timeString(seconds) {
        const minutes = Math.floor(seconds / 60), left = seconds - minutes * 60;
        return `${minutes}:${left.toFixed(3).padStart(6, '0')}`;
    }
    function driver(code) {
        return BY_CODE[code];
    }
    // Race results, pit stops, tyres and timing helpers.
    function isActive(d, lap = state.lap) {
        if (d.code === 'LAW' || d.code === 'COL')
            return true; // classified a lap down at flag
        return MAX_LAP[d.code] === undefined || lap <= MAX_LAP[d.code];
    }
    function knownCheckpoint(lap) {
        return Math.max(...Object.keys(ORDERS).map(Number).filter(n => n <= lap));
    }
    function runningAt(lap = state.lap) {
        const base = [...ORDERS[knownCheckpoint(lap)]];
        if (lap === 50)
            base.push('LAW', 'COL');
        const extras = DRIVERS.map(d => d.code).filter(code => !base.includes(code));
        return [...base, ...extras].filter((v, i, a) => a.indexOf(v) === i);
    }
    function position(code, lap = state.lap) {
        if (!isActive(driver(code), lap))
            return null;
        const i = runningAt(lap).indexOf(code);
        return i >= 0 ? i + 1 : null;
    }
    function pitList(d, lap = state.lap) {
        return (PIT_STOPS[d.code] || []).filter(n => n <= lap);
    }
    function lastPit(d, lap = state.lap) {
        const list = pitList(d, lap);
        return list[list.length - 1] ?? null;
    }
    function tyreState(d, lap = state.lap) {
        if (!isActive(d, lap))
            return { name: 'Not running', age: null };
        if (!d.startTyre)
            return { name: 'Unknown', age: null };
        const change = d.firstRelevantTyreChange;
        let name = d.startTyre;
        if (change && lap >= change && d.newTyre)
            name = d.newTyre;
        // For multi-stop runners, count age from most recent recorded stop;
        // tyre age is inferred only, never interpreted as measured degradation.
        const newest = lastPit(d, lap);
        const age = newest === null ? lap : lap - newest + 1;
        return { name, age };
    }
    function knownGap(code, lap = state.lap) {
        return GAPS[lap]?.[code] ?? extendedGaps[lap]?.[code] ?? null;
    }
    function formatGap(code, lap = state.lap) {
        const g = knownGap(code, lap);
        return typeof g === 'number' ? (g === 0 ? '0.0s · Leader' : `+${Number(g).toFixed(1)}s`) : g === 'PIT' ? 'In pit lane' : 'Time unavailable';
    }
    function pitText(d, lap = state.lap) {
        if (!isActive(d, lap))
            return d.code === 'STR' ? 'Did not complete lap 1' : 'Retired / finished';
        const list = pitList(d, lap);
        return list.length ? `${list.length} stop${list.length !== 1 ? 's' : ''} · lap ${list.join(', ')}` : 'Not stopped';
    }
    function tyreDisplay(d, lap = state.lap) {
        const t = tyreState(d, lap);
        return t.age ? `${t.name} · ${t.age} lap${t.age === 1 ? '' : 's'}` : t.name;
    }
    // Keep the selected lap and driver in sync across the interface.
    function setView(view) {
        if (!['race', 'qualifying'].includes(view))
            return;
        state.view = view;
        if (view !== 'race')
            pause();
        document.querySelectorAll('.view').forEach(el => {
            const selected = el.id === `${view}View`;
            el.classList.toggle('active', selected);
            el.hidden = !selected;
        });
        document.querySelectorAll('.top-tabs .tab').forEach(tab => {
            const yes = tab.dataset.view === view;
            tab.classList.toggle('active', yes);
            if (yes)
                tab.setAttribute('aria-current', 'page');
            else
                tab.removeAttribute('aria-current');
        });
        if (view === 'qualifying')
            renderQualifying();
        window.scrollTo({ top: 0, behavior: 'auto' });
    }
    function buildSelect(el, selected) {
        el.innerHTML = '';
        for (const d of DRIVERS) {
            const opt = document.createElement('option');
            opt.value = d.code;
            opt.textContent = `${d.name} · ${d.team}`;
            opt.selected = d.code === selected;
            el.append(opt);
        }
    }
    function syncFocusSelects() {
        $('driverSelect').value = state.focused;
        $('focusSelect').value = state.focused;
        $('compareASelect').value = state.focused;
        $('compareBSelect').value = state.compared;
    }
    function focus(code) {
        state.focused = code;
        if (state.compared === code)
            state.compared = code === 'LEC' ? 'HAM' : 'LEC';
        syncFocusSelects();
        renderReplay();
    }
    function setLap(next) {
        state.lap = Math.max(1, Math.min(50, Math.round(next)));
        $('lapSlider').value = state.lap;
        renderReplay();
    }
    function pause() {
        if (playTimer !== null)
            window.clearInterval(playTimer);
        playTimer = null;
        state.playing = false;
        $('playText').textContent = 'Play replay';
        $('playIcon').textContent = '▶';
        $('playBtn').setAttribute('aria-label', 'Play lap replay');
    }
    function play() {
        if (state.playing) {
            pause();
            return;
        }
        if (state.lap === 50)
            setLap(1);
        state.playing = true;
        $('playText').textContent = 'Pause replay';
        $('playIcon').textContent = 'Ⅱ';
        $('playBtn').setAttribute('aria-label', 'Pause lap replay');
        playTimer = window.setInterval(() => {
            if (state.lap >= 50) {
                pause();
                return;
            }
            setLap(state.lap + 1);
        }, 620);
    }
    function filtered(code) {
        return !state.tyreFilters.size || state.tyreFilters.has(tyreState(driver(code)).name);
    }
    // Update the race snapshot and filter results for the chosen lap.
    function renderTyres() {
        const active = DRIVERS.filter(d => isActive(d));
        const counts = {
            Soft: 0,
            Medium: 0,
            Hard: 0,
            Unknown: 0
        };
        active.forEach(d => counts[tyreState(d).name]++);
        $('fieldCount').textContent = `${DRIVERS.length} drivers · ${active.length} still running at lap ${state.lap}`;
        $('tyreSummary').innerHTML = ['Soft', 'Medium', 'Hard'].map(name => {
            const percent = Math.round(counts[name] / (active.length || 1) * 100);
            return `<div class="tyre-line"><span><i class="tyre-dot ${name.toLowerCase()}"></i>${name}</span><b>${counts[name]}</b></div><div class="tyre-bar"><span class="tyre-bar-fill" style="width:${percent}%;background:${name === 'Soft' ? '#f36b8f' : name === 'Medium' ? '#f5d275' : '#ecf3f9'}"></span></div>`;
        }).join('');
        const matches = runningAt().filter(code => isActive(driver(code)) && filtered(code));
        const chips = matches.map(code => `<button class="filter-chip" type="button" data-focus="${code}" title="Focus ${driver(code).name}">${code}</button>`).join('');
        $('filterResults').innerHTML = state.tyreFilters.size ? (chips || '<span class="empty-filter">No drivers match that tyre.</span>') : '<span class="empty-filter">Select Soft, Medium, or Hard to list those drivers.</span>';
        const stopped = DRIVERS.filter(d => pitList(d).length > 0).length;
        $('stoppedCount').textContent = stopped;
    }
    function renderEvent() {
        const current = [...EVENTS].reverse().find(e => e.lap <= state.lap) || EVENTS[0];
        $('eventNote').innerHTML = `<small>RACE NOTE · LAP ${current.lap}</small><strong>${current.title}</strong><p>${current.detail}</p>`;
        document.querySelectorAll('.event-chip').forEach(el => el.classList.toggle('current', Number(el.dataset.lap) === current.lap));
    }
    function renderOrder() {
        const entries = runningAt();
        const cp = knownCheckpoint(state.lap);
        $('runningOrder').innerHTML = entries.map(code => {
            const d = driver(code);
            const p = position(code);
            return `<button class="running-row ${state.focused === code ? 'active' : ''}" type="button" data-focus="${code}" aria-label="Focus ${d.name}${p ? `, position ${p}` : ", retired"}"><span class="pos">${p ? `P${p}` : "OUT"}</span><span class="code" style="border-left:2px solid ${d.color};padding-left:4px">${code}</span><span class="name">${d.name}</span><span class="team-indicator" style="background:${d.color}"></span></button>`;
        }).join('');
        if ($('runningFootnote'))
            $('runningFootnote').textContent = '';
    }
    function moveMarkers() {
        const path = $('trackPath');
        if (!path || !path.getTotalLength)
            return;
        const length = path.getTotalLength();
        const order = runningAt();
        $('markerLayer').innerHTML = '';
        const chosen = order;
        chosen.forEach(code => {
            const d = driver(code);
            const rank = order.indexOf(code);
            // VISUAL ONLY: evenly spaced schematic markers moving along illustrative curve.
            const frac = ((state.lap / 50) * 1.8 + .15 - rank * .021 + 4) % 1;
            const point = path.getPointAtLength(frac * length);
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `driver-marker ${!isActive(d) ? 'retired' : ''} ${code === state.focused ? 'focused' : ''} ${state.showCompare && code === state.compared ? 'compared' : ''}`;
            btn.textContent = code;
            btn.title = `${d.name} · ${isActive(d) ? `P${position(code)}` : "OUT"}`;
            btn.style.left = `${point.x / 10}%`;
            btn.style.top = `${point.y / 6.2}%`;
            btn.dataset.focus = code;
            btn.setAttribute('aria-label', `Focus ${d.name}`);
            $('markerLayer').append(btn);
        });
    }
    // Driver Focus uses the selected driver and lap.
    function renderFocus() {
        const d = driver(state.focused), p = position(d.code), cp = knownCheckpoint(state.lap);
        $('focusName').textContent = d.name;
        $('focusTeam').textContent = d.team;
        $('focusPosition').textContent = p ? `P${p}` : 'OUT';
        $('focusTyre').textContent = tyreDisplay(d);
        $('focusGap').textContent = formatGap(d.code);
        $('focusPit').textContent = pitText(d);
        $('focusLap').textContent = `Lap ${state.lap} / ${RACE.totalLaps}`;
        $('mapDriver').textContent = d.name;
        const ownGap = knownGap(d.code), nextGap = DRIVERS.filter(x => x.code !== d.code && isActive(x)).map(x => knownGap(x.code)).filter(x => typeof x === 'number' && x > 0).sort((a, b) => a - b)[0];
        $('focusInsight').textContent = !isActive(d) ? `${d.name} is out of the race.` :
            ownGap === 0 ? `${d.name} is P1.${typeof nextGap === 'number' ? ` ${fmtShort(nextGap)} seconds ahead of second place.` : ' Gap to leader: 0.0 seconds.'}` :
                typeof ownGap === 'number' ? `${d.name} is P${p} and ${fmtShort(ownGap)} seconds behind the leader.` :
                    `${d.name} is P${p}. Race gap time is unavailable for lap ${state.lap}.`;
        $('compareToggle').setAttribute('aria-expanded', String(state.showCompare));
        $('compareInline').classList.toggle('hidden', !state.showCompare);
        $('compareInline').setAttribute('aria-hidden', String(!state.showCompare));
        if (state.showCompare)
            renderComparison();
    }
    // Compare two drivers using the timing and pit-stop data available.
    function renderComparison() {
        const a = driver(state.focused), b = driver(state.compared);
        $('compareAName').textContent = a.name;
        $('compareBName').textContent = b.name;
        $('compareAPosition').textContent = position(a.code) ? `P${position(a.code)}` : 'OUT';
        $('compareBPosition').textContent = position(b.code) ? `P${position(b.code)}` : 'OUT';
        $('compareATeam').textContent = a.team;
        $('compareBTeam').textContent = b.team;
        $('compareATyre').textContent = tyreDisplay(a);
        $('compareBTyre').textContent = tyreDisplay(b);
        $('compareAGap').textContent = formatGap(a.code);
        $('compareBGap').textContent = formatGap(b.code);
        $('compareAPits').textContent = pitText(a);
        $('compareBPits').textContent = pitText(b);
        const ga = knownGap(a.code), gb = knownGap(b.code), pa = position(a.code), pb = position(b.code);
        const summary = $('compareTakeaway'), trend = $('compareTrend');
        trend.textContent = '';
        if (!pa || !pb) {
            summary.textContent = `One of these drivers is out of the race at lap ${state.lap}.`;
            return;
        }
        if (typeof ga === 'number' && typeof gb === 'number') {
            const ahead = ga < gb ? a : b, behind = ga < gb ? b : a;
            summary.textContent = `${ahead.name} is ${fmtShort(Math.abs(ga - gb))} seconds ahead of ${behind.name}.`;
            const earlier = [...new Set([...Object.keys(GAPS), ...Object.keys(extendedGaps)].map(Number))]
                .filter(l => l < state.lap && l >= state.lap - 6)
                .sort((x, y) => y - x)
                .find(l => typeof knownGap(a.code, l) === 'number' && typeof knownGap(b.code, l) === 'number');
            if (earlier !== undefined) {
                const before = Math.abs(knownGap(a.code, earlier) - knownGap(b.code, earlier)), now = Math.abs(ga - gb), diff = now - before;
                if (Math.abs(diff) > .05)
                    trend.textContent = `The gap has ${diff > 0 ? 'grown' : 'shrunk'} by ${fmtShort(Math.abs(diff))} seconds since lap ${earlier}.`;
            }
        }
        else {
            summary.textContent = `Race time difference is unavailable for lap ${state.lap}.`;
        }
    }
    function renderReplay() {
        for (const id of ['lapNumber', 'snapshotLap', 'fieldLap', 'mapLap'])
            $(id).textContent = state.lap;
        if ($('quickLapSelect'))
            $('quickLapSelect').value = String(state.lap);
        const cp = knownCheckpoint(state.lap);
        $('checkpointNote').textContent = '';
        renderTyres();
        renderOrder();
        moveMarkers();
        renderFocus();
    }
    function setCompare(open) {
        state.showCompare = !!open;
        renderFocus();
        moveMarkers();
        if (open) {
            $('compareInline').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }
    function configureTyres() {
        const inputs = [...document.querySelectorAll('#tyreFilters input')];
        inputs.forEach(inp => inp.addEventListener('change', () => {
            if (inp.checked)
                state.tyreFilters.add(inp.value);
            else
                state.tyreFilters.delete(inp.value);
            inputs.forEach(box => box.checked = state.tyreFilters.has(box.value));
            renderReplay();
        }));
    }
    // Map pan/zoom: independent of analytical timing data.
    function renderMapTransform() {
        $('trackCanvas').style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.mapScale})`;
    }
    function adjustZoom(factor) {
        state.mapScale = Math.min(2.5, Math.max(.75, state.mapScale * factor));
        renderMapTransform();
    }
    // Track movement and zooming are handled separately from race data.
    function setupMap() {
        const viewport = $('trackViewport');
        viewport.addEventListener('pointerdown', e => {
            if (e.target.closest('button'))
                return;
            state.dragging = true;
            dragStart = {
                x: e.clientX,
                y: e.clientY,
                origX: state.panX,
                origY: state.panY
            };
            viewport.classList.add('dragging');
            viewport.setPointerCapture(e.pointerId);
        });
        viewport.addEventListener('pointermove', e => {
            if (!state.dragging || !dragStart)
                return;
            state.panX = dragStart.origX + e.clientX - dragStart.x;
            state.panY = dragStart.origY + e.clientY - dragStart.y;
            renderMapTransform();
        });
        const end = e => {
            state.dragging = false;
            dragStart = null;
            viewport.classList.remove('dragging');
            if (viewport.hasPointerCapture?.(e.pointerId))
                viewport.releasePointerCapture(e.pointerId);
        };
        viewport.addEventListener('pointerup', end);
        viewport.addEventListener('pointercancel', end);
        $('zoomIn').addEventListener('click', () => adjustZoom(1.22));
        $('zoomOut').addEventListener('click', () => adjustZoom(1 / 1.22));
        $('resetMap').addEventListener('click', () => {
            state.mapScale = 1;
            state.panX = 0;
            state.panY = 0;
            renderMapTransform();
        });
        if ($('showAllMarkers'))
            $('showAllMarkers').addEventListener('change', e => {
                state.showAllMarkers = e.target.checked;
                moveMarkers();
            });
    }
    // Native tooltip: hover, focus, tap/click with Escape handling.
    function showTooltip(anchor) {
        if (!anchor?.dataset?.tip)
            return;
        tooltipAnchor = anchor;
        const box = $('tooltip');
        box.textContent = anchor.dataset.tip;
        box.hidden = false;
        const r = anchor.getBoundingClientRect();
        const w = Math.min(320, window.innerWidth - 28);
        let x = r.left + r.width / 2 - w / 2;
        x = Math.max(12, Math.min(x, window.innerWidth - w - 12));
        let y = r.bottom + 9;
        if (y + 120 > window.innerHeight)
            y = Math.max(8, r.top - 130);
        box.style.left = `${x}px`;
        box.style.top = `${y}px`;
        box.style.width = `${w}px`;
    }
    function hideTooltip() {
        if (tooltipAnchor)
            tooltipAnchor = null;
        $('tooltip').hidden = true;
    }
    function setupTooltips() {
        // Event delegation supports tyre help buttons redrawn when the lap changes.
        document.addEventListener('pointerover', event => {
            const help = event.target.closest?.('.help');
            if (help)
                showTooltip(help);
        });
        document.addEventListener('pointerout', event => {
            const help = event.target.closest?.('.help');
            if (help && !help.contains(event.relatedTarget))
                hideTooltip();
        });
        document.addEventListener('focusin', event => {
            const help = event.target.closest?.('.help');
            if (help)
                showTooltip(help);
        });
        document.addEventListener('focusout', event => {
            const help = event.target.closest?.('.help');
            if (help)
                hideTooltip();
        });
        document.addEventListener('click', event => {
            const help = event.target.closest?.('.help');
            if (help) {
                event.preventDefault();
                event.stopPropagation();
                showTooltip(help);
            }
        }, true);
        document.addEventListener('pointerdown', event => {
            if (!event.target.closest?.('.help'))
                hideTooltip();
        });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape')
                hideTooltip();
        });
    }
    // Qualifying chart: show only the sessions each driver reached.
    function drawQualChart(a, b) {
        const svg = $('qualChart'), ns = 'http://www.w3.org/2000/svg';
        svg.innerHTML = '';
        const make = (tag, attrs = {}, textValue) => {
            let el = document.createElementNS(ns, tag);
            Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
            if (textValue !== undefined)
                el.textContent = String(textValue);
            svg.append(el);
            return el;
        };
        const left = 66, right = 606, top = 35, bottom = 264;
        const times = [...a.q, ...b.q].map(sec).filter(v => v !== null);
        if (!times.length) {
            make('text', {
                x: 90,
                y: 130,
                class: 'chart-text'
            }, 'No timing data');
            return;
        }
        const low = Math.floor(Math.min(...times) - 1), high = Math.ceil(Math.max(...times) + 1);
        const y = v => bottom - (v - low) / (high - low) * (bottom - top), x = i => left + (right - left) * i / 2;
        make('rect', {
            x: x(state.selectedSession) - 42,
            y: top - 18,
            width: 84,
            height: bottom - top + 27,
            rx: 9,
            fill: '#244d52',
            opacity: .5
        });
        for (let k = 0; k <= 4; k++) {
            let val = low + (high - low) * (k / 4);
            const py = y(val);
            make('line', {
                x1: left,
                y1: py,
                x2: right,
                y2: py,
                class: 'chart-grid'
            });
            make('text', {
                x: 5,
                y: py + 4,
                class: 'chart-text'
            }, `${val.toFixed(1)}s`);
        }
        ['Q1', 'Q2', 'Q3'].forEach((n, i) => make('text', {
            x: x(i),
            y: bottom + 30,
            'text-anchor': 'middle',
            class: 'chart-text'
        }, n));
        [{ d: a, color: '#73e1d5', index: 0 }, { d: b, color: '#87b8ff', index: 1 }].forEach(({ d, color, index }) => {
            const pts = d.q.map((t, i) => t ? { i, v: sec(t) } : null);
            // Connecting only the sessions in which this driver actually set a time.
            let path = '';
            let previous = null;
            pts.forEach(p => {
                if (!p) {
                    previous = null;
                    return;
                }
                path += (previous ? ' L ' : ' M ') + `${x(p.i)} ${y(p.v)}`;
                previous = p;
            });
            if (path)
                make('path', {
                    d: path,
                    fill: 'none',
                    stroke: color,
                    'stroke-width': 3.5,
                    'stroke-linejoin': 'round'
                });
            pts.forEach(p => {
                if (!p)
                    return;
                make('circle', {
                    cx: x(p.i),
                    cy: y(p.v),
                    r: 6,
                    fill: color,
                    class: 'chart-point'
                });
                // Separate labels when drivers' times fall close together.
                const otherTime = sec((index === 0 ? b : a).q[p.i]);
                const nearOther = otherTime !== null && Math.abs(y(otherTime) - y(p.v)) < 28;
                const labelY = nearOther ? y(p.v) + (index === 0 ? -16 : 23) : y(p.v) - 12;
                make('text', {
                    x: x(p.i),
                    y: labelY,
                    'text-anchor': 'middle',
                    class: 'chart-label'
                }, timeString(p.v));
            });
        });
    }
    // Compare qualifying rounds; drivers who were eliminated have no later times.
    function renderQualifying() {
        const a = driver(state.qualA);
        const b = driver(state.qualB);
        const roundNames = ['Q1', 'Q2', 'Q3'];
        const round = state.selectedSession;

        $('qualSession').value = String(round);
        $('qualLegend').innerHTML =
            `<span><i class="line-swatch" style="background:#73e1d5"></i>${a.name}</span>` +
            `<span><i class="line-swatch" style="background:#87b8ff"></i>${b.name}</span>`;
        $('qualChart').setAttribute('aria-label', `Q1, Q2 and Q3 times for ${a.name} and ${b.name}`);
        drawQualChart(a, b);

        // Fill the three round cards from the same two selected drivers.
        roundNames.forEach((name, i) => {
            const ta = sec(a.q[i]);
            const tb = sec(b.q[i]);
            const card = document.querySelector(`[data-session="${i}"]`);
            const bothHaveTimes = ta !== null && tb !== null;
            let headline;

            if (bothHaveTimes) {
                const faster = ta < tb ? a : tb < ta ? b : null;
                headline = faster ? `${faster.name.split(' ')[0]} ${fmt(Math.abs(ta - tb))}s faster` : 'Same time';
            } else if (ta === null && tb === null) {
                headline = 'Neither reached this round';
            } else {
                headline = `${(ta === null ? a : b).name.split(' ')[0]} eliminated`;
            }

            $(`qual${name}Headline`).textContent = headline;
            $(`qual${name}Times`).textContent = `${a.code}: ${a.q[i] || '—'} · ${b.code}: ${b.q[i] || '—'}`;
            card.classList.toggle('active', i === round);
            card.setAttribute('aria-pressed', String(i === round));
        });

        // Explain the currently selected round in one sentence.
        const timeA = sec(a.q[round]);
        const timeB = sec(b.q[round]);
        const selected = roundNames[round];
        let finding;
        let note;
        if (timeA !== null && timeB !== null) {
            if (timeA === timeB) {
                finding = `${a.name} and ${b.name} set the same time.`;
            } else {
                const quicker = timeA < timeB ? a : b;
                const other = quicker === a ? b : a;
                finding = `${quicker.name} was ${fmt(Math.abs(timeA - timeB))}s faster than ${other.name}.`;
            }
            note = `Both drivers set a time in ${selected}.`;
        } else if (timeA === null && timeB === null) {
            finding = `Neither driver reached ${selected}.`;
            note = 'Choose an earlier round to compare their recorded times.';
        } else {
            const missing = timeA === null ? a : b;
            const present = missing === a ? b : a;
            finding = `${missing.name} was eliminated before ${selected}.`;
            note = `${present.name} recorded ${present.q[round]} in ${selected}.`;
        }

        $('qualOverall').textContent = finding;
        $('qualOverallSub').textContent = `Selected session · ${selected}`;
        $('qualRoundLabel').textContent = selected;
        $('qualFinding').textContent = finding;
        $('qualNameA').textContent = `${a.name} · Driver A`;
        $('qualNameB').textContent = `${b.name} · Driver B`;
        $('qualTimeA').textContent = a.q[round] || 'Eliminated';
        $('qualTimeB').textContent = b.q[round] || 'Eliminated';
        $('qualProgress').textContent = note;
    }
    // Wire up the controls after the page is ready.
    function attachHandlers() {
        document.querySelectorAll('[data-view]').forEach(btn => btn.addEventListener('click', () => setView(btn.dataset.view)));
        $('playBtn').addEventListener('click', play);
        $('lapSlider').addEventListener('input', e => {
            pause();
            setLap(Number(e.target.value));
        });
        $('lapBack').addEventListener('click', () => {
            pause();
            setLap(state.lap - 1);
        });
        $('lapForward').addEventListener('click', () => {
            pause();
            setLap(state.lap + 1);
        });
        const quick = $('quickLapSelect');
        if (quick) {
            quick.addEventListener('change', () => {
                if (quick.value) {
                    pause();
                    setLap(Number(quick.value));
                }
            });
        }
        $('driverSelect').addEventListener('change', e => focus(e.target.value));
        $('focusSelect').addEventListener('change', e => focus(e.target.value));
        $('compareASelect').addEventListener('change', e => focus(e.target.value));
        $('compareBSelect').addEventListener('change', e => {
            state.compared = e.target.value;
            if (state.compared === state.focused) {
                state.compared = state.focused === 'HAM' ? 'LEC' : 'HAM';
                $('compareBSelect').value = state.compared;
            }
            renderComparison();
            moveMarkers();
        });
        $('compareToggle').addEventListener('click', () => setCompare(!state.showCompare));
        $('compareClose').addEventListener('click', () => setCompare(false));
        $('backToFocus').addEventListener('click', () => {
            setView('race');
            $('driverFocus').scrollIntoView({ block: 'start', behavior: 'smooth' });
        });
        document.querySelectorAll('[data-session]').forEach(btn => btn.addEventListener('click', () => {
            state.selectedSession = Number(btn.dataset.session);
            renderQualifying();
        }));
        $('qualSession').addEventListener('change', e => {
            state.selectedSession = Number(e.target.value);
            renderQualifying();
        });
        document.addEventListener('click', e => {
            const btn = e.target.closest('[data-focus]');
            if (btn)
                focus(btn.dataset.focus);
        });
        $('qualA').addEventListener('change', e => {
            state.qualA = e.target.value;
            if (state.qualA === state.qualB) {
                state.qualB = state.qualA === 'NOR' ? 'VER' : 'NOR';
                $('qualB').value = state.qualB;
            }
            renderQualifying();
        });
        $('qualB').addEventListener('change', e => {
            state.qualB = e.target.value;
            if (state.qualB === state.qualA) {
                state.qualB = state.qualA === 'VER' ? 'NOR' : 'VER';
                $('qualB').value = state.qualB;
            }
            renderQualifying();
        });
        configureTyres();
        setupMap();
        setupTooltips();
    }
    // Fill additional lap gaps when historical lap times can be loaded.
    async function loadAllLapGaps() {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 9000);
            let response;
            try {
                response = await fetch(RACE.sources.lapTimes, { signal: controller.signal });
            }
            finally {
                clearTimeout(timeout);
            }
            if (!response.ok)
                return;
            const payload = await response.json();
            const race = payload?.MRData?.RaceTable?.Races?.[0];
            const laps = race?.Laps || race?.laps || [];
            if (laps.length < 45)
                return;
            const cumulative = {};
            for (const row of laps) {
                const lap = Number(row.number);
                if (!Number.isInteger(lap) || lap < 1 || lap > RACE.totalLaps)
                    continue;
                for (const timing of row.Timings || row.timings || []) {
                    const code = shortDriverIds[timing.driverId];
                    const parts = String(timing.time || '').split(':');
                    const seconds = parts.length === 2 ? Number(parts[0]) * 60 + Number(parts[1]) : Number(parts[0]);
                    if (!code || !Number.isFinite(seconds))
                        continue;
                    cumulative[code] = (cumulative[code] || 0) + seconds;
                }
                const leader = cumulative.VER;
                if (leader === undefined)
                    continue;
                extendedGaps[lap] = { VER: 0 };
                for (const [code, sum] of Object.entries(cumulative)) {
                    if (code === 'VER' || !isActive(driver(code), lap))
                        continue;
                    const present = (row.Timings || row.timings || []).some(t => shortDriverIds[t.driverId] === code);
                    if (present)
                        extendedGaps[lap][code] = Math.max(0, Number((sum - leader).toFixed(3)));
                }
            }
            renderReplay();
        }
        catch (err) { /* verified local FIA checkpoints remain available offline */ }
    }
    function init() {
        buildSelect($('driverSelect'), state.focused);
        buildSelect($('focusSelect'), state.focused);
        buildSelect($('compareASelect'), state.focused);
        buildSelect($('compareBSelect'), state.compared);
        buildSelect($('qualA'), state.qualA);
        buildSelect($('qualB'), state.qualB);
        attachHandlers();
        renderReplay();
        renderQualifying();
        setView('race');
        loadAllLapGaps();
        // Make basic checks available to a browser-based test runner.
        window.RaceLensTest = {
            setLap,
            focus,
            setView,
            getState: () => ({ ...state, checkpoint: knownCheckpoint(state.lap) }),
            position,
            tyreState
        };
    }
    if (document.readyState === 'loading')
        document.addEventListener('DOMContentLoaded', init);
    else
        init();
})();
