'use strict';
importScripts('./config.js');
const SHELL='tdn-shell-2.0.0-r2',DATA='tdn-data-2';
const FILES=['./','./index.html','./app.css','./app.js','./config.js','./manifest.webmanifest','./assets/icon-192.png','./assets/icon-512.png','./assets/icon-maskable-512.png','./assets/badge-96.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(SHELL).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('tdn-shell-')&&k!==SHELL).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
  if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).then(response=>{if(response.ok){const clone=response.clone();caches.open(SHELL).then(cache=>cache.put('./index.html',clone));}return response;}).catch(()=>caches.match('./index.html')));return;}
  event.respondWith(fetch(event.request).then(response=>{if(response.ok){const clone=response.clone();caches.open(SHELL).then(cache=>cache.put(event.request,clone));}return response;}).catch(()=>caches.match(event.request)));
});
self.addEventListener('message',event=>{if(event.data?.type==='preferences')event.waitUntil(caches.open(DATA).then(cache=>cache.put(new Request(new URL('./notification-preferences.json',self.location)),new Response(JSON.stringify(event.data.preferences),{headers:{'Content-Type':'application/json'}}))));});
self.addEventListener('push',event=>event.waitUntil((async()=>{
  let preferences={};const response=await caches.match(new URL('./notification-preferences.json',self.location));if(response)preferences=await response.json();
  if(preferences.enabled===false)return;
  const hour=new Date().getHours();if(preferences.quietHours&& (hour>=22||hour<7))return;
  let body='มีข่าวใหม่ในหมวดที่คุณติดตาม เปิดอ่านเรื่องสำคัญรอบวันได้เลย',article=null;
  try{const result=await fetch(self.TDN_CONFIG.api+'?action=snapshot',{cache:'no-store'}).then(r=>r.json());const items=(result.snapshot?.items||[]).filter(it=>(!preferences.categories?.length||preferences.categories.includes(it.category_id))&&(!preferences.importantOnly||it.score>=13));if(items.length){article=items[0];body=article.title_th||article.title;}}catch{/* Empty payload push still gives a useful, honest notification. */}
  await self.registration.showNotification('Thai Daily News',{body,icon:'assets/icon-192.png',badge:'assets/badge-96.png',tag:'tdn-news',renotify:false,data:{url:self.TDN_CONFIG.web+(article?'?article='+article.id:'')},actions:[{action:'read',title:'เปิดอ่านข่าว'}]});
})()));
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil((async()=>{const url=event.notification.data?.url||self.TDN_CONFIG.web;const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const client of windows){if(client.url.startsWith(self.TDN_CONFIG.web)){await client.navigate(url);return client.focus();}}return self.clients.openWindow(url);})());});
