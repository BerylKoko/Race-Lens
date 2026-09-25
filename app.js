const drivers=[
 {code:'PER',name:'Perez',pos:1,tyre:'Soft'},{code:'VER',name:'Verstappen',pos:2,tyre:'Medium'},{code:'NOR',name:'Norris',pos:3,tyre:'Soft'},{code:'LEC',name:'Leclerc',pos:4,tyre:'Medium'},
 {code:'HAM',name:'Hamilton',pos:5,tyre:'Medium'},{code:'SAI',name:'Sainz',pos:6,tyre:'Medium'},{code:'RUS',name:'Russell',pos:7,tyre:'Hard'},{code:'PIA',name:'Piastri',pos:8,tyre:'Soft'},
 {code:'ALO',name:'Alonso',pos:9,tyre:'Hard'},{code:'GAS',name:'Gasly',pos:10,tyre:'Medium'},{code:'ALB',name:'Albon',pos:11,tyre:'Medium'},{code:'OCO',name:'Ocon',pos:12,tyre:'Hard'},
 {code:'TSU',name:'Tsunoda',pos:13,tyre:'Medium'},{code:'STR',name:'Stroll',pos:14,tyre:'Soft'},{code:'HUL',name:'Hulkenberg',pos:15,tyre:'Hard'},{code:'BOT',name:'Bottas',pos:16,tyre:'Medium'},
 {code:'RIC',name:'Ricciardo',pos:17,tyre:'Medium'},{code:'MAG',name:'Magnussen',pos:18,tyre:'Soft'},{code:'ZHO',name:'Zhou',pos:19,tyre:'Medium'},{code:'SAR',name:'Sargeant',pos:20,tyre:'Hard'}
];
const positions=[[8,4],[23,1],[38,2],[52,1],[66,2],[80,4],[94,14],[97,37],[95,60],[96,82],[84,97],[68,99],[54,98],[47,83],[35,88],[24,96],[10,91],[5,69],[5,43],[4,22]];
const track=document.querySelector('#track');
let selected=drivers[3], timer=null;
function compound(t){return t==='Soft'?'S':t==='Medium'?'M':'H'}
drivers.forEach((d,i)=>{const b=document.createElement('button');b.className='driver'+(d.code==='LEC'?' active':'');b.textContent=d.code;b.style.left=positions[i][0]+'%';b.style.top=positions[i][1]+'%';b.onclick=()=>selectDriver(d,b);track.appendChild(b)});
const sel=document.querySelector('#compareSelect');
function fillSelect(){sel.innerHTML='';drivers.filter(d=>d.code!==selected.code).forEach(d=>{let o=document.createElement('option');o.value=d.code;o.textContent=d.name;sel.appendChild(o)});let preferred=selected.code==='SAI'?'LEC':'SAI'; if([...sel.options].some(o=>o.value===preferred))sel.value=preferred;updateComparison()}
function selectDriver(d,b){selected=d;document.querySelectorAll('.driver').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelector('#drawer').classList.add('open');document.querySelector('#driverName').textContent=d.name;document.querySelector('#driverMeta').textContent=`Position ${d.pos} · ${d.tyre} tyres`;document.querySelector('#focusName').textContent=d.name;document.querySelector('#focusCompound').textContent=compound(d.tyre);document.querySelector('#centerDriver').textContent=d.name;fillSelect();document.querySelector('#drawer').scrollIntoView({behavior:'smooth',block:'start'})}
function updateComparison(){const other=drivers.find(d=>d.code===sel.value)||drivers[5];const lap=+document.querySelector('#lapSlider').value;document.querySelector('#compareName').textContent=other.name;document.querySelector('#compareCompound').textContent=compound(other.tyre);const gap=(Math.abs(selected.pos-other.pos)*1.7 + ((lap*0.13)%1)).toFixed(1);document.querySelector('#gap').textContent=gap+' s';const ahead=selected.pos<other.pos?selected:other;const behind=ahead===selected?other:selected;document.querySelector('#gapText').textContent=`${ahead.name} is ahead of ${behind.name}`;const delta=((lap-2)*0.06).toFixed(1);document.querySelector('#trend').textContent=`Separation ${delta>=0?'increased':'decreased'} by ${Math.abs(delta)} s over ${Math.max(1,lap-1)} laps.`}
function setLap(lap){['lapNow','fieldLap','centerLap','strategyLap','compareLap'].forEach(id=>document.querySelector('#'+id).textContent=lap);const stopped=Math.min(20,Math.max(0,Math.floor((lap-8)/2)));document.querySelector('#stopped').textContent=stopped;document.querySelector('#starting').textContent=20-stopped;updateComparison()}
document.querySelector('#lapSlider').oninput=e=>setLap(+e.target.value);sel.onchange=updateComparison;
document.querySelector('#previewBtn').onclick=()=>{document.querySelector('#lapSlider').value=24;setLap(24)};
document.querySelector('#closeBtn').onclick=()=>document.querySelector('#drawer').classList.remove('open');
document.querySelector('#playBtn').onclick=e=>{if(timer){clearInterval(timer);timer=null;e.target.textContent='Play';return}e.target.textContent='Pause';timer=setInterval(()=>{let s=document.querySelector('#lapSlider');let n=+s.value+1;if(n>50){clearInterval(timer);timer=null;e.target.textContent='Play';return}s.value=n;setLap(n)},650)};
fillSelect();setLap(2);
