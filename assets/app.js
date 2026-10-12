/* VEYNOV R1: static accessible navigation, no analytics/cookies/network */
(()=>{
 const toggle=document.querySelector('.mobile-toggle');
 const nav=document.querySelector('#main-nav');
 if (!toggle||!nav) return;
 const setOpen=(open,focus=false)=>{
   nav.classList.toggle('open',open);
   toggle.setAttribute('aria-expanded',String(open));
   toggle.setAttribute('aria-label',open?'Close menu':'Open menu');
   if(focus) toggle.focus();
 };
 toggle.addEventListener('click',()=>setOpen(!nav.classList.contains('open')));
 nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setOpen(false)));
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav.classList.contains('open'))setOpen(false,true)});
 document.addEventListener('click',event=>{if(nav.classList.contains('open')&&!nav.contains(event.target)&&!toggle.contains(event.target))setOpen(false)});
 window.addEventListener('resize',()=>{if(window.innerWidth>760&&nav.classList.contains('open'))setOpen(false)});
})();
