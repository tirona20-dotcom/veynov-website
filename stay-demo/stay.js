/* VEYNOV Stay — public, browser-only illustration. No customer records, networking or payment features. */
(() => {
'use strict';
const dateParts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Tirane',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
const part=t=>dateParts.find(p=>p.type===t).value;
const zoneToday=part('year')+'-'+part('month')+'-'+part('day');
const base=new Date(zoneToday+'T12:00:00Z');
const day=n=>new Date(base.getTime()+86400000*n).toISOString().slice(0,10);
const showDate=d=>new Intl.DateTimeFormat('sq-AL',{day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(d+'T12:00:00Z'));
const weekday=d=>new Intl.DateTimeFormat('sq-AL',{weekday:'short',timeZone:'UTC'}).format(new Date(d+'T12:00:00Z'));
const money=(v,c)=>new Intl.NumberFormat('sq-AL',{style:'currency',currency:c,maximumFractionDigits:0}).format(v);
const rooms=[
 {id:'A1',p:'Rezidenca A',c:'EUR',price:84,owner:1},{id:'A2',p:'Rezidenca A',c:'EUR',price:78,owner:1},{id:'A3',p:'Rezidenca A',c:'EUR',price:98,owner:1},{id:'A4',p:'Rezidenca A',c:'EUR',price:88,owner:1},
 {id:'B1',p:'Rezidenca B',c:'ALL',price:6400,owner:2},{id:'B2',p:'Rezidenca B',c:'ALL',price:7200,owner:2},{id:'B3',p:'Rezidenca B',c:'ALL',price:6800,owner:2},{id:'B4',p:'Rezidenca B',c:'ALL',price:7600,owner:2},
 {id:'C1',p:'Rezidenca C',c:'EUR',price:120,owner:3},{id:'C2',p:'Rezidenca C',c:'EUR',price:110,owner:3},{id:'C3',p:'Rezidenca C',c:'EUR',price:92,owner:3},{id:'C4',p:'Rezidenca C',c:'EUR',price:105,owner:3}
];
const r=id=>rooms.find(x=>x.id===id);
const bookings=[];
const add=(id,a,b,source,status='confirmed')=>bookings.push({id:'R'+String(bookings.length+101),room:id,start:day(a),end:day(b),source,status});
add('A1',-3,0,'airbnb');add('A1',0,3,'booking');add('A2',-2,0,'expedia');add('A2',0,5,'airbnb');
add('A3',2,9,'booking');add('A4',-4,1,'expedia');add('B1',-3,0,'booking');add('B1',0,2,'airbnb');
add('B2',-2,4,'booking');add('B3',1,7,'expedia');add('B4',5,10,'airbnb');add('C1',0,28,'airbnb');
add('C2',-5,2,'booking');add('C3',0,3,'airbnb');add('C3',1,4,'booking');add('C4',4,8,'expedia');
add('A3',0,2,'booking','cancelled');
const confirmed=bookings.filter(b=>b.status==='confirmed');
const active=(b,d)=>b.status==='confirmed' && b.start<=d && b.end>d;
const onDay=d=>confirmed.filter(b=>active(b,d));
const arrivals=d=>confirmed.filter(b=>b.start===d);
const leaves=d=>confirmed.filter(b=>b.end===d);
const sameDayRooms=()=>rooms.filter(x=>arrivals(day(0)).some(b=>b.room===x.id)&&leaves(day(0)).some(b=>b.room===x.id));
const collisions=()=>rooms.flatMap(x=>{const xs=confirmed.filter(b=>b.room===x.id);const conflicts=[];for(let i=0;i<xs.length;i++)for(let j=i+1;j<xs.length;j++){if(xs[i].start<xs[j].end&&xs[j].start<xs[i].end)conflicts.push({room:x.id,a:xs[i],b:xs[j]});}return conflicts;});
const spanDays=(a,b)=>Math.max(0,Math.round((new Date(b+'T12:00:00Z')-new Date(a+'T12:00:00Z'))/86400000));
const totals=(bs)=>bs.reduce((acc,b)=>{const x=r(b.room),n=spanDays(b.start,b.end);acc[x.c]=(acc[x.c]||0)+n*x.price;return acc;},{});
const storeKey='veynov-stay-demo-v1';
let completed=[];
try{completed=JSON.parse(sessionStorage.getItem(storeKey)||'[]');if(!Array.isArray(completed))completed=[];}catch{completed=[];}
let current='sot',tour=-1,search='',filter='all';
const app=document.getElementById('app'),nav=document.getElementById('nav');
const badge=s=>'<span class="channel '+s+'">'+({airbnb:'Airbnb',booking:'Booking.com',expedia:'Expedia'}[s]||s)+'</span>';
const header=(eyebrow,title,subtitle,action='')=>'<div class="section-top"><div><p class="eyebrow">'+eyebrow+'</p><h1>'+title+'</h1><p class="sub">'+subtitle+'</p></div>'+action+'</div>';
const panel=(title,body,small='')=>'<section class="panel"><div class="panel-head"><h2>'+title+'</h2><small>'+small+'</small></div>'+body+'</section>';
const tourCopy=[['sot','Shih ditën me një vështrim','Mbërritjet, largimet dhe apartamentet që duhen pastruar.'],['pastrimi','Pastrimi në rendin e duhur','Shëno një apartament si të pastruar — vetëm në këtë shfletues.'],['sot','Kontrolli i rezervimeve','Një përplasje e sajuar te C3 tregon pse kontrolli është i rëndësishëm.'],['pronaret','Çfarë i takon secilit pronar','Shifrat e euros dhe lekut mbeten gjithmonë të ndara.'],['kalendari','Kalendari i të 12 apartamenteve','Shih disponueshmërinë dhe përsërit vizitën nga fillimi.']];
function tourBar(){if(tour<0)return '<div class="tour"><div><strong>Një provë e shkurtër, 5 hapa</strong><p>Shiko rrugën nga mbërritja e mysafirëve deri te kalendari dhe pronarët.</p></div><button type="button" class="btn primary" data-tour="start">Fillo udhëtimin →</button></div>';
const t=tourCopy[tour];return '<div class="tour"><div><strong>Hapi '+(tour+1)+'/5 · '+t[1]+'</strong><p>'+t[2]+'</p></div><div class="actions"><button type="button" class="btn" data-tour="end">Mbyll</button><button type="button" class="btn primary" data-tour="next">'+(tour===4?'Mbaro':'Vazhdo →')+'</button></div></div>';}
function dayItems(bs){return bs.length?bs.map(b=>'<div class="item"><div class="item-main"><span class="unit">'+b.room+'</span><div><strong>'+r(b.room).p+'</strong><p>'+showDate(b.start)+' – '+showDate(b.end)+' · '+b.id+'</p></div></div>'+badge(b.source)+'</div>').join(''):'<div class="empty">Asnjë për këtë ditë.</div>';}
function renderToday(){
const a=arrivals(day(0)),l=leaves(day(0)),t=sameDayRooms(),c=collisions();
return header('Pamja e ditës','Sot, '+showDate(day(0)),'Çfarë po ndodh sot në 12 apartamentet e shembullit.')
+'<div class="kpis"><div class="kpi"><strong>'+a.length+'</strong><span>Mbërrijnë sot</span></div><div class="kpi"><strong>'+l.length+'</strong><span>Largohen sot</span></div><div class="kpi"><strong>'+onDay(day(0)).length+'</strong><span>Qëndrime aktive</span></div><div class="kpi"><strong>'+t.length+'</strong><span>Ndërrime të shpejta</span></div></div>'+tourBar()
+(c.length?'<div class="warn"><strong>⚠ Përplasje e simuluar te '+c.map(x=>x.room).join(', ')+'</strong>Dy rezervime fiktive mbivendosen. Në produktin real një situatë e tillë do të kërkonte verifikim — kjo provë nuk dërgon ndryshime në kanale.</div>':'')
+'<div class="panels"><div>'+panel('Mbërritjet sot',dayItems(a),a.length+' rezervime')+panel('Largimet sot',dayItems(l),l.length+' rezervime')+'</div><div>'+panel('Pastrime që kërkojnë vëmendje',t.length?t.map(x=>'<div class="item"><div class="item-main"><span class="unit">'+x.id+'</span><div><strong>'+x.p+'</strong><p>Dalje dhe hyrje në të njëjtën ditë</p></div></div><span class="tag '+(completed.includes(x.id)?'cancelled':'')+'">'+(completed.includes(x.id)?'U pastrua':'Në pritje')+'</span></div>').join(''):'<div class="empty">Asnjë pastrim urgjent.</div>')+'<div style="padding:0 20px 18px"><button class="btn" data-go="pastrimi">Shiko pastrimet →</button></div>'+'</div></div>';
}
function renderCalendar(){const dates=Array.from({length:14},(_,i)=>day(i));
let rows=rooms.map(x=>'<tr><th class="room-head" scope="row">'+x.id+'<small>'+x.p+' · '+x.c+'</small></th>'+dates.map((date,i)=>{const xs=confirmed.filter(b=>b.room===x.id&&active(b,date));const cls=xs.length>1?'conflict':xs.length?'booked':i===0?'today':'';const ab=xs.length>1?'!':xs.length?(xs[0].start===date?'●':'—'):'';return '<td class="'+cls+'" title="'+x.id+' · '+showDate(date)+' · '+(xs.length>1?'Përplasje fiktive':xs.length?'E zënë':'E lirë')+'"><span class="pillday">'+ab+'</span></td>';}).join('')+'</tr>').join('');
return header('Pamja 14-ditore','Kalendari','Të 12 apartamentet në një pamje. Çdo shënim është i sajuar.')
+tourBar()+panel('Disponueshmëria e shembullit','<div class="table-scroll"><table class="cal"><thead><tr><th class="room-head" scope="col">Apartamenti</th>'+dates.map((date,i)=>'<th class="'+(i===0?'today':'')+'" scope="col">'+weekday(date)+'<br>'+showDate(date)+'</th>').join('')+'</tr></thead><tbody>'+rows+'</tbody></table></div><div class="legend"><span>E zënë</span><span>Mbivendosje fiktive</span><span>Bllokim (shembull)</span></div>','14 ditë')+'<p class="note">Kalendari është vetëm pamje orientuese. Disponueshmëria nuk lidhet me platformat e rezervimeve.</p>';
}
function renderBookings(){let bs=bookings.filter(b=>(filter==='all'||b.status===filter)&&(!search||(b.room+' '+b.id+' '+b.source+' '+r(b.room).p).toLowerCase().includes(search.toLowerCase())));
return header('Lista e rezervimeve','Rezervimet','Rezervime shembull nga Airbnb, Booking.com dhe Expedia.')
+'<div class="tools"><input class="search" id="search-bookings" type="search" placeholder="Kërko apartament ose numër…" value="'+search.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;')+'"><select class="search" id="filter-bookings" aria-label="Filtro rezervimet"><option value="all"'+(filter==='all'?' selected':'')+'>Të gjitha</option><option value="confirmed"'+(filter==='confirmed'?' selected':'')+'>Të konfirmuara</option><option value="cancelled"'+(filter==='cancelled'?' selected':'')+'>Të anuluara</option></select></div>'
+panel('Rezervime fiktive',bs.length?bs.map(b=>{const x=r(b.room);return '<div class="booking"><div class="item-main"><span class="unit">'+x.id+'</span><div><strong>'+b.id+'</strong><p>'+x.p+'</p></div></div><div class="hide-mobile">'+badge(b.source)+'</div><div class="hide-mobile">'+showDate(b.start)+' – '+showDate(b.end)+'</div><div class="hide-mobile"><strong>'+money(x.price*spanDays(b.start,b.end),x.c)+'</strong><p>'+spanDays(b.start,b.end)+' netë</p></div><span class="tag '+(b.status==='cancelled'?'cancelled':'')+'">'+(b.status==='confirmed'?'Konfirmuar':'Anuluar')+'</span></div>'}).join(''):'<div class="empty">Nuk u gjet asnjë rezervim.</div>',bs.length+' rezultate')
+'<p class="note">Të gjithë numrat dhe rezervimet janë të sajuara; nuk ka identitete mysafirësh.</p>';
}
function renderCleaning(){const todays=leaves(day(0));const unique=[...new Set(todays.map(b=>b.room))];const urgent=sameDayRooms().map(x=>x.id);unique.sort((a,b)=>Number(urgent.includes(b))-Number(urgent.includes(a)));return header('Puna e përditshme','Pastrimi','Së pari apartamentet ku mbërrijnë mysafirë të rinj sot.', '<button class="btn" type="button" data-reset-clean>Rivendos pastrimet</button>')+tourBar()+panel('Për t’u pastruar sot',unique.map(id=>{const done=completed.includes(id),u=urgent.includes(id);return '<div class="item"><div class="item-main"><span class="unit">'+id+'</span><div><strong>'+r(id).p+'</strong><p>'+(u?'Mbërrijnë sot · urgjente':'Largim sot')+' · gjendje demo</p></div></div><button class="item-button '+(done?'done':'')+'" data-clean="'+id+'" type="button">'+(done?'✓ U pastrua':'Shëno “U pastrua”')+'</button></div>'}).join(''),unique.length+' apartamente')+'<p class="note">Shënimet ruhen përkohësisht vetëm në shfletuesin tuaj; nuk u dërgohen pastruesve realë.</p>';}
function ownerTotal(owner){const bs=confirmed.filter(b=>r(b.room).owner===owner);const all=totals(bs);return Object.entries(all).map(([c,v])=>({c,gross:v,fee:Math.round(v*.18),clean:bs.filter(b=>r(b.room).c===c).length*(c==='EUR'?18:1800)}));}
function renderOwners(){return header('Pasqyrë orientuese','Pronarët','Shifra të llogaritura nga rezervimet fiktive. Nuk ka pagesa reale.')+tourBar()
+'<div class="owner-grid">'+[1,2,3].map(o=>{const roomsOwned=rooms.filter(x=>x.owner===o);const sums=ownerTotal(o);return '<section class="owner-card"><small>PRONARI '+o+'</small><h3>Pronar '+o+'</h3><p>'+roomsOwned.length+' apartamente · '+roomsOwned[0].p+'</p>'+sums.map(t=>'<p class="secondary">Të ardhura bruto: '+money(t.gross,t.c)+'<br>Tarifë administrimi (18%): '+money(t.fee,t.c)+'<br>Pastrimi: '+money(t.clean,t.c)+'</p><div class="number">'+money(t.gross-t.fee-t.clean,t.c)+'</div><small>Për t’i kaluar pronarit · shembull</small>').join('')+'</section>';}).join('')+'</div><p class="note">Eurot dhe lekët nuk bashkohen dhe nuk konvertohen. Përqindjet dhe tarifat janë vetëm supozime të demonstrimit.</p>';}
function renderMoney(){const bs=confirmed;const sums=totals(bs);return header('Tregues të sajuar','Paratë','Të ardhura të rezervimeve të shembullit, të ndara sipas monedhës.')
+'<div class="money-grid">'+Object.entries(sums).map(([c,sum])=>'<section class="owner-card"><small>TË ARDHURA BRUTO · '+c+'</small><div class="number">'+money(sum,c)+'</div><p>Vetëm rezervimet fiktive të listës. Nuk ka pagesa reale.</p></section>').join('')+'<section class="owner-card"><small>GJENDJA E DEMOS</small><h3>Pa lidhje live</h3><p>As kartë, as pagesa, as fatura dhe as rezervime të vërteta.</p></section></div>'+panel('Sipas kanalit',Array.from(new Set(bs.map(x=>x.source))).map(s=>{const ts=totals(bs.filter(x=>x.source===s));return '<div class="item"><div class="item-main">'+badge(s)+'<div><strong>'+bs.filter(x=>x.source===s).length+' rezervime</strong><p>Monedhat të ndara</p></div></div><strong>'+Object.entries(ts).map(([c,v])=>money(v,c)).join(' · ')+'</strong></div>';}).join(''))+'<p class="note">Këto shifra nuk janë fitime, arkëtime ose raporte të përdorshme financiarisht.</p>';}
function render(){const f={sot:renderToday,kalendari:renderCalendar,rezervimet:renderBookings,pastrimi:renderCleaning,pronaret:renderOwners,parate:renderMoney};app.innerHTML=f[current]();nav.querySelectorAll('[data-view]').forEach(b=>{const on=b.dataset.view===current;b.classList.toggle('active',on);b.setAttribute('aria-current',on?'page':'false');});}
function go(v){if(!['sot','kalendari','rezervimet','pastrimi','pronaret','parate'].includes(v))return;current=v;render();document.getElementById('content').focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
function reset(){completed=[];sessionStorage.removeItem(storeKey);search='';filter='all';tour=-1;go('sot');}
nav.addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(b){tour=-1;go(b.dataset.view);}});
document.getElementById('reset').addEventListener('click',reset);
app.addEventListener('click',e=>{
let b=e.target.closest('[data-go]');if(b){go(b.dataset.go);return;}
b=e.target.closest('[data-clean]');if(b){const id=b.dataset.clean;if(!rooms.some(x=>x.id===id))return;completed=completed.includes(id)?completed.filter(x=>x!==id):[...completed,id];sessionStorage.setItem(storeKey,JSON.stringify(completed));render();return;}
b=e.target.closest('[data-reset-clean]');if(b){completed=[];sessionStorage.removeItem(storeKey);render();return;}
b=e.target.closest('[data-tour]');if(b){if(b.dataset.tour==='start'){tour=0;go(tourCopy[0][0]);}else if(b.dataset.tour==='end'){tour=-1;render();}else if(b.dataset.tour==='next'){tour+=1;if(tour>=tourCopy.length){tour=-1;go('sot');}else go(tourCopy[tour][0]);}}});
app.addEventListener('input',e=>{if(e.target.id==='search-bookings'){const pos=e.target.selectionStart;search=e.target.value;render();const el=document.getElementById('search-bookings');el.focus();el.setSelectionRange(pos,pos);}});
app.addEventListener('change',e=>{if(e.target.id==='filter-bookings'){filter=e.target.value;render();}});
render();
})();