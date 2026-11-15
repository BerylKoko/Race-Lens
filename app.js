/* Race Lens · INFO 4900. Offline-first client-only prototype.
   Data.js contains historical verified data + explicit schematic boundaries. */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const state = {
    view:'race', lap:2, focused:'HAM', compared:'LEC', showCompare:false,
    qualA:'NOR', qualB:'VER', tyreFilters:new Set(['All']), playing:false,
    showAllMarkers:false, mapScale:1, panX:0, panY:0, dragging:false,
    speedMetric:'speed', selectedSession:0
  };
  let playTimer=null, dragStart=null, tooltipAnchor=null;
  const firstName = (d) => d.name.split(' ')[0];
  const fmt = (v) => Number(v).toFixed(3);
  function sec(text) { if (!text) return null; const bits=text.split(':'); return Number(bits[0])*60+Number(bits[1]); }
  function timeString(seconds) { const minutes=Math.floor(seconds/60), left=seconds-minutes*60; return `${minutes}:${left.toFixed(3).padStart(6,'0')}`; }
  function driver(code){return BY_CODE[code]}
  function isActive(d,lap=state.lap) {
    if (d.code==='LAW'||d.code==='COL') return true; // classified a lap down at flag
    return MAX_LAP[d.code]===undefined || lap<=MAX_LAP[d.code];
  }
  function knownCheckpoint(lap){return Math.max(...Object.keys(ORDERS).map(Number).filter(n=>n<=lap))}
  function runningAt(lap=state.lap) {
    let snapshot=ORDERS[knownCheckpoint(lap)].filter(code=>isActive(driver(code),lap));
    if (lap===50) snapshot=[...snapshot,'LAW','COL'].filter((v,i,a)=>a.indexOf(v)===i);
    return snapshot;
  }
  function position(code,lap=state.lap){const i=runningAt(lap).indexOf(code);return i>=0?i+1:null;}
  function pitList(d,lap=state.lap) {return (PIT_STOPS[d.code]||[]).filter(n=>n<=lap);}
  function lastPit(d,lap=state.lap) {const list=pitList(d,lap);return list[list.length-1]??null;}
  function tyreState(d,lap=state.lap){
    if(!isActive(d,lap))return {name:'Not running',age:null};
    if(!d.startTyre) return {name:'Unknown',age:null};
    const change=d.firstRelevantTyreChange;
    let name=d.startTyre;
    if(change&&lap>=change&&d.newTyre)name=d.newTyre;
    // For multi-stop runners, count age from most recent recorded stop;
    // tyre age is inferred only, never interpreted as measured degradation.
    const newest=lastPit(d,lap);
    const age=newest===null?lap:lap-newest+1;
    return {name,age};
  }
  function knownGap(code,lap=state.lap){return GAPS[lap]?.[code]??null;}
  function formatGap(code,lap=state.lap){
    const g=knownGap(code,lap);
    return typeof g==='number'?(g===0?'Leading':`+${fmt(g)}s`):g==='PIT'?'Pitting':'Not sampled';
  }
  function pitText(d,lap=state.lap){
    if(!isActive(d,lap))return d.code==='STR'?'Did not complete lap 1':'Retired / finished';
    const list=pitList(d,lap);return list.length?`${list.length} stop${list.length!==1?'s':''} · lap ${list.join(', ')}`:'Not stopped';
  }
  function tyreDisplay(d,lap=state.lap){const t=tyreState(d,lap);return t.age?`${t.name} · ${t.age} lap${t.age===1?'':'s'}`:t.name;}
  function setView(view){
    if(!['race','qualifying','about'].includes(view))return;
    state.view=view; if(view!=='race')pause();
    document.querySelectorAll('.view').forEach(el=>{const selected=el.id===`${view}View`;el.classList.toggle('active',selected);el.hidden=!selected;});
    document.querySelectorAll('.top-tabs .tab').forEach(tab=>{const yes=tab.dataset.view===view;tab.classList.toggle('active',yes);if(yes)tab.setAttribute('aria-current','page');else tab.removeAttribute('aria-current');});
    if(view==='qualifying')renderQualifying();
    window.scrollTo({top:0,behavior:'auto'});
  }
  function buildSelect(el,selected){el.innerHTML='';for(const d of DRIVERS){const opt=document.createElement('option');opt.value=d.code;opt.textContent=`${d.name} · ${d.team}`;opt.selected=d.code===selected;el.append(opt)}}
  function syncFocusSelects(){ $('driverSelect').value=state.focused;$('focusSelect').value=state.focused;$('compareBSelect').value=state.compared; }
  function focus(code){state.focused=code;if(state.compared===code)state.compared=code==='LEC'?'HAM':'LEC';syncFocusSelects();renderReplay();}
  function setLap(next){state.lap=Math.max(1,Math.min(50,Math.round(next)));$('lapSlider').value=state.lap;renderReplay();}
  function pause(){if(playTimer!==null)window.clearInterval(playTimer);playTimer=null;state.playing=false;$('playText').textContent='Play replay';$('playIcon').textContent='▶';$('playBtn').setAttribute('aria-label','Play lap replay');}
  function play(){if(state.playing){pause();return;}if(state.lap===50)setLap(1);state.playing=true;$('playText').textContent='Pause replay';$('playIcon').textContent='Ⅱ';$('playBtn').setAttribute('aria-label','Pause lap replay');playTimer=window.setInterval(()=>{if(state.lap>=50){pause();return;}setLap(state.lap+1);},620)}
  function filtered(code){if(state.tyreFilters.has('All'))return true;return state.tyreFilters.has(tyreState(driver(code)).name)}
  function renderTyres(){
    const active=DRIVERS.filter(d=>isActive(d));
    const counts={Soft:0,Medium:0,Hard:0,Unknown:0};active.forEach(d=>counts[tyreState(d).name]++);
    $('fieldCount').textContent=`${DRIVERS.length} entered · ${active.length} classified/on track at lap ${state.lap}`;
    $('tyreSummary').innerHTML=['Soft','Medium','Hard'].map(name=>{
      const percent=Math.round(counts[name]/(active.length||1)*100);return `<div class="tyre-line"><span><i class="tyre-dot ${name.toLowerCase()}"></i>${name}</span><b>${counts[name]}</b></div><div class="tyre-bar"><span class="tyre-bar-fill" style="width:${percent}%;background:${name==='Soft'?'#f36b8f':name==='Medium'?'#f5d275':'#ecf3f9'}"></span></div>`;
    }).join('');
    if(counts.Unknown) $('tyreSummary').insertAdjacentHTML('beforeend',`<p class="quiet-small">${counts.Unknown} driver${counts.Unknown===1?' has':'s have'} no verified compound at this lap.</p>`);
    const matches=runningAt().filter(filtered);
    const chips=matches.map(code=>`<button class="filter-chip" type="button" data-focus="${code}" title="Focus ${driver(code).name}">${code}</button>`).join('');
    $('filterResults').innerHTML= chips||'<span class="empty-filter">No matching active drivers in this snapshot.</span>';
    const stopped=DRIVERS.filter(d=>pitList(d).length>0).length;$('stoppedCount').textContent=stopped;
  }
  function renderEvent(){
    const current=[...EVENTS].reverse().find(e=>e.lap<=state.lap)||EVENTS[0];
    $('eventNote').innerHTML=`<small>RACE NOTE · LAP ${current.lap}</small><strong>${current.title}</strong><p>${current.detail}</p>`;
    document.querySelectorAll('.event-chip').forEach(el=>el.classList.toggle('current',Number(el.dataset.lap)===current.lap));
  }
  function renderOrder(){
    const entries=runningAt().filter(filtered);const cp=knownCheckpoint(state.lap);
    $('runningOrder').innerHTML=entries.map(code=>{
      const d=driver(code);const p=position(code);return `<button class="running-row ${state.focused===code?'active':''}" type="button" data-focus="${code}" aria-label="Focus ${d.name}, position ${p}"><span class="pos">P${p}</span><span class="code" style="border-left:2px solid ${d.color};padding-left:4px">${code}</span><span class="name">${d.name}</span><span class="team-indicator" style="background:${d.color}"></span></button>`;
    }).join('')||'<p class="quiet-small">No drivers match the current filter.</p>';
    $('runningFootnote').textContent=`On-track positions at lap ${cp} checkpoint${state.lap===50?' before post-race DSQ':''}. ${state.lap!==cp?'Intermediate laps reuse the last checked order.':''}`;
  }
  function moveMarkers(){
    const path=$('trackPath');if(!path||!path.getTotalLength)return;
    const length=path.getTotalLength();const order=runningAt();
    $('markerLayer').innerHTML='';
    const chosen=order.filter((code,i)=>filtered(code)&&(state.showAllMarkers||i<9||code===state.focused||code===state.compared));
    chosen.forEach(code=>{
      const d=driver(code);const rank=order.indexOf(code);
      // VISUAL ONLY: evenly spaced schematic markers moving along illustrative curve.
      const frac=((state.lap/50)*1.8 + .15 - rank*.021 + 4)%1;
      const point=path.getPointAtLength(frac*length);
      const btn=document.createElement('button');btn.type='button';btn.className=`driver-marker ${code===state.focused?'focused':''} ${state.showCompare&&code===state.compared?'compared':''}`;
      btn.textContent=code;btn.title=`${d.name} · P${rank+1} (schematic marker)`;btn.style.left=`${point.x/10}%`;btn.style.top=`${point.y/6.2}%`;btn.dataset.focus=code;
      btn.setAttribute('aria-label',`Focus ${d.name}`);$('markerLayer').append(btn);
    });
  }
  function renderFocus(){
    const d=driver(state.focused),p=position(d.code),cp=knownCheckpoint(state.lap);
    $('focusName').textContent=d.name;$('focusTeam').textContent=d.team;
    $('focusPosition').textContent=p?`P${p}`:'OUT';
    $('focusTyre').textContent=tyreDisplay(d);
    $('focusGap').textContent=formatGap(d.code);
    $('focusPit').textContent=pitText(d);
    $('focusLap').textContent=`Lap ${state.lap} / ${RACE.totalLaps}`;
    $('mapDriver').textContent=d.name;
    $('focusInsight').textContent= !isActive(d)?`${d.name} is no longer active at this lap. Qualifying times remain available on the next tab.`
      : `At the lap ${cp} verified position checkpoint, ${d.name} is ${p?`P${p}`:'not placed'}. ${d.name==='HAM'&&state.lap>=29?'Hamilton made his first stop at lap 29.':d.name==='LEC'&&state.lap>=24?'Leclerc made his first stop at lap 24.':'Select Compare to put a second driver beside this focus.'}`;
    $('compareToggle').setAttribute('aria-expanded',String(state.showCompare));
    $('compareInline').classList.toggle('hidden',!state.showCompare);
    $('compareInline').setAttribute('aria-hidden',String(!state.showCompare));
    if(state.showCompare)renderComparison();
  }
  function renderComparison(){
    const a=driver(state.focused),b=driver(state.compared),cp=knownCheckpoint(state.lap);
    $('compareAName').textContent=a.name;$('compareADetail').textContent=`P${position(a.code)??'—'} · ${tyreDisplay(a)}`;
    $('compareBDetail').textContent=`P${position(b.code)??'—'} · ${tyreDisplay(b)}`;
    $('compareAPits').textContent=pitText(a);$('compareBPits').textContent=pitText(b);
    const aFirst=(PIT_STOPS[a.code]||[])[0],bFirst=(PIT_STOPS[b.code]||[])[0];
    $('compareStrategy').textContent=typeof aFirst==='number'&&typeof bFirst==='number'?(aFirst===bFirst?`Both first stop on lap ${aFirst}`:`${firstName(a)} L${aFirst} · ${firstName(b)} L${bFirst} (${Math.abs(aFirst-bFirst)} laps apart)`):'Insufficient stop information';
    const pa=position(a.code),pb=position(b.code),gapA=knownGap(a.code),gapB=knownGap(b.code);
    let takeaway='';
    if(!pa||!pb)takeaway=`One of these drivers is not running at lap ${state.lap}. Review an earlier lap.`;
    else if(pa===pb)takeaway=`${a.name} and ${b.name} cannot share a position. Check your selections.`;
    else {
      const ahead=pa<pb?a:b,behind=pa<pb?b:a;
      if(typeof gapA==='number'&&typeof gapB==='number'){
        takeaway=`${ahead.name} is ${fmt(Math.abs(gapA-gapB))} seconds ahead of ${behind.name} at lap ${state.lap}.`;
      } else takeaway=`At the verified lap ${cp} checkpoint, ${ahead.name} is P${Math.min(pa,pb)} and ${behind.name} is P${Math.max(pa,pb)}.`;
    }
    $('compareTakeaway').textContent=takeaway;
    const earlier=Object.keys(GAPS).map(Number).filter(l=>l<state.lap).sort((x,y)=>y-x).find(l=>typeof GAPS[l][a.code]==='number' && typeof GAPS[l][b.code]==='number');
    if(earlier!==undefined && typeof gapA==='number' && typeof gapB==='number'){
      const oldDistance=Math.abs(GAPS[earlier][a.code]-GAPS[earlier][b.code]);
      const newDistance=Math.abs(gapA-gapB),difference=newDistance-oldDistance;
      $('compareTrend').textContent=`Checked time-gap trend: the pair gap has ${Math.abs(difference)<.0005?'stayed level':difference>0?'widened':'narrowed'} by ${fmt(Math.abs(difference))}s since lap ${earlier}.`;
    }else $('compareTrend').textContent='Lap-by-lap time delta not available from the sampled timing checkpoints at this lap.';
    $('compareEvidence').textContent=typeof gapA==='number'&&typeof gapB==='number'?'Timing comparison uses verified FIA gaps to the same race leader at this lap.':`Exact pairwise timing gap not checked for lap ${state.lap}. Position order comes from lap ${cp}; no synthetic time difference is displayed.`;
    renderInlineTiming(a,b);
  }
  function renderInlineTiming(a,b){
    const rows=(kind)=>['Q1','Q2','Q3'].map((round,i)=>{
      const x=sec(a.q[i]),y=sec(b.q[i]);
      const outcome=x!==null&&y!==null ? `${(x<y?a:b).code} faster by ${fmt(Math.abs(x-y))}s` :
        x===null&&y===null ? 'No times recorded for either' : `${x===null?a.code:b.code}: did not qualify for ${round}`;
      return `<div class="inline-timing-row"><b>${round}</b><span>${a.code} ${a.q[i]||'—'} · ${b.code} ${b.q[i]||'—'}</span><strong>${outcome}</strong></div>`;
    });
    $('inlineQualRows').innerHTML=rows().join('');
    const sa=SECTORS[a.code],sb=SECTORS[b.code];
    if(sa&&sb){
      $('inlineSectorRows').innerHTML=[0,1,2].map(i=>{
        const quicker=sa[i]<sb[i]?a:b;
        return `<div class="inline-timing-row"><b>S${i+1}</b><span>${a.code} ${fmt(sa[i])}s · ${b.code} ${fmt(sb[i])}s</span><strong>${quicker.code} faster by ${fmt(Math.abs(sa[i]-sb[i]))}s</strong></div>`;
      }).join('');
    }else $('inlineSectorRows').innerHTML='<p class="quiet-small">Not available for both selected drivers. No sector times inferred.</p>';
    const q1a=sec(a.q[0]),q1b=sec(b.q[0]);
    const q1Line=q1a!==null&&q1b!==null?`In Q1, ${(q1a<q1b?a:b).name} was ${fmt(Math.abs(q1a-q1b))}s quicker.`:'A directly comparable Q1 result is not available.';
    const sectorLine=sa&&sb?`In each driver’s best recorded race S1, ${(sa[0]<sb[0]?a:b).name} was ${fmt(Math.abs(sa[0]-sb[0]))}s quicker.`:'Best race-sector comparison is not available for this pair.';
    $('inlineTimingSummary').textContent=`${q1Line} ${sectorLine} Qualifying sessions and best race sectors are separate measurements.`;
  }
  function renderReplay(){
    for(const id of ['lapNumber','snapshotLap','fieldLap','mapLap'])$(id).textContent=state.lap;
    const cp=knownCheckpoint(state.lap);
    $('checkpointNote').textContent=state.lap===cp?`✓ On-track order verified at lap ${cp} · source: FIA race lap chart`:`ℹ Showing last verified running-order checkpoint: lap ${cp}. Playback markers are schematic.`;
    renderTyres();renderEvent();renderOrder();moveMarkers();renderFocus();
  }
  function setCompare(open){state.showCompare=!!open;renderFocus();moveMarkers();if(open){$('compareInline').scrollIntoView({block:'nearest',behavior:'smooth'});}}
  function configureTyres(){
    const inputs=[...document.querySelectorAll('#tyreFilters input')];
    inputs.forEach(inp=>inp.addEventListener('change',()=>{
      if(inp.value==='All'&&inp.checked){state.tyreFilters=new Set(['All']);}
      else if(inp.value!=='All'&&inp.checked){state.tyreFilters.delete('All');state.tyreFilters.add(inp.value);}
      else{state.tyreFilters.delete(inp.value);if(!state.tyreFilters.size)state.tyreFilters.add('All');}
      inputs.forEach(box=>box.checked=state.tyreFilters.has(box.value));renderReplay();
    }));
  }
  function populateEvents(){
    $('eventShortcuts').innerHTML=EVENTS.map(e=>`<button type="button" class="event-chip" data-lap="${e.lap}" title="${e.detail}">L${e.lap} · ${e.title}</button>`).join('');
  }
  // Map pan/zoom: independent of analytical timing data.
  function renderMapTransform(){ $('trackCanvas').style.transform=`translate(${state.panX}px, ${state.panY}px) scale(${state.mapScale})`; }
  function adjustZoom(factor){state.mapScale=Math.min(2.5,Math.max(.75,state.mapScale*factor));renderMapTransform();}
  function setupMap(){
    const viewport=$('trackViewport');
    viewport.addEventListener('pointerdown',e=>{
      if(e.target.closest('button'))return;
      state.dragging=true;dragStart={x:e.clientX,y:e.clientY,origX:state.panX,origY:state.panY};viewport.classList.add('dragging');viewport.setPointerCapture(e.pointerId);
    });
    viewport.addEventListener('pointermove',e=>{
      if(!state.dragging||!dragStart)return;
      state.panX=dragStart.origX+e.clientX-dragStart.x;state.panY=dragStart.origY+e.clientY-dragStart.y;renderMapTransform();
    });
    const end=e=>{state.dragging=false;dragStart=null;viewport.classList.remove('dragging');if(viewport.hasPointerCapture?.(e.pointerId))viewport.releasePointerCapture(e.pointerId);};
    viewport.addEventListener('pointerup',end);viewport.addEventListener('pointercancel',end);
    $('zoomIn').addEventListener('click',()=>adjustZoom(1.22));$('zoomOut').addEventListener('click',()=>adjustZoom(1/1.22));
    $('resetMap').addEventListener('click',()=>{state.mapScale=1;state.panX=0;state.panY=0;renderMapTransform();});
    $('showAllMarkers').addEventListener('change',e=>{state.showAllMarkers=e.target.checked;moveMarkers();});
  }
  // Native tooltip: hover, focus, tap/click with Escape handling.
  function showTooltip(anchor){if(!anchor?.dataset?.tip)return;tooltipAnchor=anchor;const box=$('tooltip');box.textContent=anchor.dataset.tip;box.hidden=false;const r=anchor.getBoundingClientRect();const w=Math.min(320,window.innerWidth-28);let x=r.left+r.width/2-w/2;x=Math.max(12,Math.min(x,window.innerWidth-w-12));let y=r.bottom+9;if(y+120>window.innerHeight)y=Math.max(8,r.top-130);box.style.left=`${x}px`;box.style.top=`${y}px`;box.style.width=`${w}px`;}
  function hideTooltip(){if(tooltipAnchor)tooltipAnchor=null;$('tooltip').hidden=true;}
  function setupTooltips(){
    document.querySelectorAll('.help').forEach(el=>{
      el.addEventListener('mouseenter',()=>showTooltip(el));el.addEventListener('mouseleave',hideTooltip);
      el.addEventListener('focus',()=>showTooltip(el));el.addEventListener('blur',hideTooltip);
      el.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();showTooltip(el);});
    });
    document.addEventListener('pointerdown',e=>{if(!e.target.closest('.help'))hideTooltip();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){hideTooltip();}});
  }
  function drawQualChart(a,b){
    const svg=$('qualChart'),ns='http://www.w3.org/2000/svg';svg.innerHTML='';
    const make=(tag,attrs={},textValue)=>{let el=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,String(v)));if(textValue!==undefined)el.textContent=String(textValue);svg.append(el);return el;};
    const left=66,right=606,top=35,bottom=264;const times=[...a.q,...b.q].map(sec).filter(v=>v!==null);
    if(!times.length){make('text',{x:90,y:130,class:'chart-text'},'No timing data');return;}
    const low=Math.floor(Math.min(...times)-1),high=Math.ceil(Math.max(...times)+1);
    const y=v=>bottom-(v-low)/(high-low)*(bottom-top),x=i=>left+(right-left)*i/2;
    make('rect',{x:x(state.selectedSession)-42,y:top-18,width:84,height:bottom-top+27,rx:9,fill:'#244d52',opacity:.5});
    for(let k=0;k<=4;k++){let val=low+(high-low)*(k/4);const py=y(val);make('line',{x1:left,y1:py,x2:right,y2:py,class:'chart-grid'});make('text',{x:5,y:py+4,class:'chart-text'},`${val.toFixed(1)}s`);}
    ['Q1','Q2','Q3'].forEach((n,i)=>make('text',{x:x(i),y:bottom+30,'text-anchor':'middle',class:'chart-text'},n));
    [{d:a,color:'#73e1d5'},{d:b,color:'#87b8ff'}].forEach(({d,color})=>{
      const pts=d.q.map((t,i)=>t?{i,v:sec(t)}:null);
      // Connecting only the sessions in which this driver actually set a time.
      let path='';let previous=null;
      pts.forEach(p=>{if(!p){previous=null;return;}path+=(previous?' L ':' M ')+`${x(p.i)} ${y(p.v)}`;previous=p;});
      if(path)make('path',{d:path,fill:'none',stroke:color,'stroke-width':3.5,'stroke-linejoin':'round'});
      pts.forEach(p=>{if(!p)return;make('circle',{cx:x(p.i),cy:y(p.v),r:6,fill:color,class:'chart-point'});make('text',{x:x(p.i),y:y(p.v)-12,'text-anchor':'middle',class:'chart-label'},timeString(p.v));});
    });
  }
  function renderQualifying(){
    const a=driver(state.qualA),b=driver(state.qualB);
    $('qualLegend').innerHTML=`<span><i class="line-swatch" style="background:#73e1d5"></i>${a.name}</span><span><i class="line-swatch" style="background:#87b8ff"></i>${b.name}</span>`;
    $('qualChart').setAttribute('aria-label',`Qualifying sessions for ${a.name} and ${b.name}`);
    drawQualChart(a,b);
    document.querySelectorAll('[data-session]').forEach(btn=>{const selected=Number(btn.dataset.session)===state.selectedSession;btn.classList.toggle('active',selected);btn.setAttribute('aria-pressed',String(selected));});
    const round=['Q1','Q2','Q3'][state.selectedSession];
    const ta=sec(a.q[state.selectedSession]),tb=sec(b.q[state.selectedSession]);
    $('selectedSessionResult').textContent=ta!==null&&tb!==null
      ? `${round}: ${(ta<tb?a:b).name} set a ${fmt(Math.abs(ta-tb))}s faster lap (${a.code}: ${a.q[state.selectedSession]} · ${b.code}: ${b.q[state.selectedSession]}).`
      : ta===null&&tb===null?`${round}: neither selected driver set a time in this round.`
      : `${round}: ${ta===null?a.name:b.name} has no time in this round; ${ta===null?b.name:a.name} recorded ${ta===null?b.q[state.selectedSession]:a.q[state.selectedSession]}. A missing qualifying time is not zero.`;

    $('sessionDetails').innerHTML=['Q1','Q2','Q3'].map((q,i)=>`<div class="session-chip"><strong>${q}</strong><small>${a.code}: ${a.q[i]||'Eliminated'}</small><small>${b.code}: ${b.q[i]||'Eliminated'}</small></div>`).join('');
    const available=[];
    $('qualDifferences').innerHTML=['Q1','Q2','Q3'].map((q,i)=>{
      const ta=sec(a.q[i]),tb=sec(b.q[i]);let result='',detail='';
      if(ta!==null&&tb!==null){const quicker=ta<tb?a:b;const diff=Math.abs(ta-tb);result=`${quicker.name} quicker by ${fmt(diff)}s`;detail=`${a.code}: ${a.q[i]} · ${b.code}: ${b.q[i]}`;available.push({i,quicker,diff});}
      else{result=ta===null&&tb===null?'Neither driver reached this round':`${ta===null?a.name:b.name} did not reach ${q}`;detail=`No head-to-head time comparison in ${q}`;}
      return `<div class="session-result"><small>${q} · ${i===0?'20 runners':i===1?'15 runners':'Top 10'}</small><strong>${result}</strong><span>${detail}</span></div>`;
    }).join('');
    const selectedResult=available.find(item=>item.i===state.selectedSession);
    const selectedName=['Q1','Q2','Q3'][state.selectedSession];
    const earlierShared=available[0];
    $('qualTakeaway').textContent=selectedResult
      ? `In ${selectedName}, ${selectedResult.quicker.name} was ${fmt(selectedResult.diff)}s faster than ${selectedResult.quicker.code===a.code?b.name:a.name}. Explore the full session-by-session comparison below.`
      : earlierShared
        ? `No head-to-head time is available in ${selectedName}. Their earliest shared qualifying round was ${['Q1','Q2','Q3'][earlierShared.i]}, where ${earlierShared.quicker.name} was ${fmt(earlierShared.diff)}s quicker.`
        : `Neither selected driver has a shared qualifying time to compare in ${selectedName}.`;
    const q3Both=a.q[2]&&b.q[2];
    $('qualExplainer').textContent=`${a.name} ${a.q[1]?'advanced to Q2':'was eliminated after Q1'}, while ${b.name} ${b.q[1]?'advanced to Q2':'was eliminated after Q1'}. ${q3Both?'Both reached Q3, where the quickest final-session lap affects the top-ten starting order.':'A missing later time is an elimination, not a slow lap.'} Qualifying is a separate session from Sunday’s race.`;
    renderSectors(a,b);drawSpeed();
  }
  function renderSectors(a,b){
    const sa=SECTORS[a.code],sb=SECTORS[b.code];
    if(!sa||!sb){$('sectorBars').innerHTML='<p class="muted">Best race-sector reference is not available for one of these drivers. Try Norris versus Verstappen or Hamilton versus Leclerc.</p>';$('sectorTakeaway').textContent='No inferred sector split is shown.';return;}
    $('sectorBars').innerHTML=[0,1,2].map(i=>{
      const values=[sa[i],sb[i]],small=Math.min(...values),large=Math.max(...values),pct=v=>Math.max(44,Math.min(98,94-(v-small)*22));
      return `<div class="sector-row"><strong>S${i+1}</strong><div class="sector-lines"><div class="sector-line"><span style="color:#73e1d5">${a.code}</span><div class="bar-bg"><span class="bar-fill" style="background:#73e1d5;width:${pct(sa[i])}%"></span></div><b>${fmt(sa[i])}s</b></div><div class="sector-line"><span style="color:#87b8ff">${b.code}</span><div class="bar-bg"><span class="bar-fill" style="background:#87b8ff;width:${pct(sb[i])}%"></span></div><b>${fmt(sb[i])}s</b></div></div></div>`;
    }).join('');
    const diffs=sa.map((v,i)=>v-sb[i]);const maxI=diffs.map(Math.abs).indexOf(Math.max(...diffs.map(Math.abs)));const leader=diffs[maxI]<0?a:b;
    $('sectorTakeaway').textContent=`Largest difference among the best recorded race sectors: S${maxI+1}, where ${leader.name} was ${fmt(Math.abs(diffs[maxI]))}s quicker. These may be from different laps.`;
  }
  function drawSpeed(){
    const svg=$('speedChart');svg.innerHTML='';const ns='http://www.w3.org/2000/svg';
    const add=(tag,props,text)=>{const el=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(props))el.setAttribute(k,String(v));if(text!==undefined)el.textContent=text;svg.append(el);return el;};
    const metric=state.speedMetric;const L=55,T=25,R=620,B=238;
    for(let k=0;k<=4;k++){let y=T+(B-T)*k/4;add('line',{x1:L,y1:y,x2:R,y2:y,class:'chart-grid'});}
    add('text',{x:L,y:275,class:'chart-text'},'START OF LAP');add('text',{x:R,y:275,'text-anchor':'end',class:'chart-text'},'END OF LAP');
    const vals=(i,alt)=>{const p=i/80;const peak=0.67+0.29*Math.sin(p*Math.PI*6+.7+alt*.1);const corner=0.38*Math.exp(-Math.pow((p-.20)/.045,2))+0.32*Math.exp(-Math.pow((p-.61)/.05,2))+0.22*Math.exp(-Math.pow((p-.83)/.05,2));
      if(metric==='speed')return Math.max(.10,peak-corner+alt*.035);
      if(metric==='brake')return Math.max(.04,Math.min(.95,corner*2.1+alt*.025));
      return Math.max(.10,Math.min(.99,1.05-corner*1.6-(peak<.55?.1:0)+alt*.02));};
    [[0,'#73e1d5'],[1,'#87b8ff']].forEach(([alt,color])=>{
      const points=Array.from({length:81},(_,i)=>{const v=vals(i,alt);return [L+(R-L)*i/80,B-v*(B-T)]});
      const d=points.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
      add('path',{d,stroke:color,'stroke-width':3,fill:'none',opacity:.95});
    });
    add('text',{x:L,y:15,class:'chart-text'},`${metric==='speed'?'SCHEMATIC SPEED':metric==='brake'?'SCHEMATIC BRAKE INPUT':'SCHEMATIC THROTTLE INPUT'} (ARBITRARY UNITS)`);
    add('text',{x:440,y:38,fill:'#73e1d5','font-size':11},'● Example A');add('text',{x:535,y:38,fill:'#87b8ff','font-size':11},'● Example B');
  }
  function setupTask(){
    const task='You missed the 2025 Las Vegas Grand Prix. Using this interface only: go to lap 2 and compare Lewis Hamilton with Charles Leclerc. Who was ahead? Discover what “pit stop” means using the question-mark help, then find which driver stopped first. In the same comparison, which driver had the quicker best Sector 1 time? Finally, explore qualifying: did Hamilton reach Q2, and who was quicker in Q1?';
    $('copyTask').addEventListener('click',async()=>{
      try{await navigator.clipboard.writeText(task);$('copyTask').textContent='Copied participant prompt ✓';}
      catch{const t=document.createElement('textarea');t.value=task;document.body.append(t);t.select();document.execCommand('copy');t.remove();$('copyTask').textContent='Copied participant prompt ✓';}
    });
    $('resetTest').addEventListener('click',()=>{document.querySelectorAll('.test-scoring input[type=checkbox]').forEach(el=>el.checked=false);});
    const names={qualifying:'FIA qualifying',pits:'FIA pit details',lapChart:'FIA lap checkpoints',history:'FIA timing gaps',result:'F1 official result',tyre:'Tyre strategy',sectors:'Best sectors'};
    $('sourceLinks').innerHTML=Object.entries(names).map(([key,name])=>`<a href="${RACE.sources[key]}" target="_blank" rel="noopener noreferrer">${name} ↗</a>`).join('');
  }
  function attachHandlers(){
    document.querySelectorAll('[data-view]').forEach(btn=>btn.addEventListener('click',()=>setView(btn.dataset.view)));
    $('playBtn').addEventListener('click',play);$('lapSlider').addEventListener('input',e=>{pause();setLap(Number(e.target.value));});
    $('lapBack').addEventListener('click',()=>{pause();setLap(state.lap-1);});$('lapForward').addEventListener('click',()=>{pause();setLap(state.lap+1);});
    $('previewBtn').addEventListener('click',()=>{pause();setLap(24);});
    $('eventShortcuts').addEventListener('click',e=>{const btn=e.target.closest('[data-lap]');if(!btn)return;pause();setLap(Number(btn.dataset.lap));});
    $('driverSelect').addEventListener('change',e=>focus(e.target.value));$('focusSelect').addEventListener('change',e=>focus(e.target.value));
    $('compareBSelect').addEventListener('change',e=>{state.compared=e.target.value;if(state.compared===state.focused){state.compared=state.focused==='HAM'?'LEC':'HAM';$('compareBSelect').value=state.compared;}renderComparison();moveMarkers();});
    $('compareToggle').addEventListener('click',()=>setCompare(!state.showCompare));$('compareClose').addEventListener('click',()=>setCompare(false));
    $('explorePairBtn').addEventListener('click',()=>{
      state.qualA=state.focused;state.qualB=state.compared;
      $('qualA').value=state.qualA;$('qualB').value=state.qualB;
      setView('qualifying');
    });
    $('backToFocus').addEventListener('click',()=>{setView('race');$('driverFocus').scrollIntoView({block:'start',behavior:'smooth'});});
    document.querySelectorAll('[data-session]').forEach(btn=>btn.addEventListener('click',()=>{
      state.selectedSession=Number(btn.dataset.session);renderQualifying();
    }));
    document.addEventListener('click',e=>{const btn=e.target.closest('[data-focus]');if(btn)focus(btn.dataset.focus);});
    $('qualA').addEventListener('change',e=>{state.qualA=e.target.value;if(state.qualA===state.qualB){state.qualB=state.qualA==='NOR'?'VER':'NOR';$('qualB').value=state.qualB;}renderQualifying();});
    $('qualB').addEventListener('change',e=>{state.qualB=e.target.value;if(state.qualB===state.qualA){state.qualB=state.qualA==='VER'?'NOR':'VER';$('qualB').value=state.qualB;}renderQualifying();});
    document.querySelectorAll('[data-speed]').forEach(btn=>btn.addEventListener('click',()=>{state.speedMetric=btn.dataset.speed;document.querySelectorAll('[data-speed]').forEach(item=>item.classList.toggle('active',item===btn));drawSpeed();}));
    configureTyres();setupMap();setupTooltips();setupTask();
  }
  function init(){
    populateEvents();buildSelect($('driverSelect'),state.focused);buildSelect($('focusSelect'),state.focused);buildSelect($('compareBSelect'),state.compared);
    buildSelect($('qualA'),state.qualA);buildSelect($('qualB'),state.qualB);
    attachHandlers();renderReplay();renderQualifying();setView('race');
    // Make basic checks available to a browser-based test runner.
    window.RaceLensTest={setLap,focus,setView,getState:()=>({...state,checkpoint:knownCheckpoint(state.lap)}),position,tyreState};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
