import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
test('switching A to B and back joins the pending request and updates the current reader controls',async()=>{
 const app=fs.readFileSync('app.js','utf8'),start=app.indexOf('  async function summarize('),end=app.indexOf('  function updateSettings()',start),calls=[],pending={},saved={},state={selected:'a'};
 let nodes;const mount=id=>{state.selected=id;nodes={aiResult:{textContent:''},summarizeButton:{disabled:false,hidden:false,innerHTML:''}};};mount('a');
 const ctx=vm.createContext({Map,Promise,state,readingRequests:new Map(),getItem:id=>({id,content_hash:id+'-hash'}),$:selector=>nodes[selector.slice(1)],icon:()=>'',save:(k,v)=>{saved[k]=v;},toast:()=>{},command:body=>{calls.push(body);return new Promise(resolve=>{pending[body.id]=resolve;});}});
 vm.runInContext('this.summarize='+app.slice(start,end).trim(),ctx);
 const a=ctx.summarize('a',true,true);mount('b');const b=ctx.summarize('b',true,true);mount('a');const again=ctx.summarize('a',true,true);assert.equal(calls.length,2);assert.equal(nodes.summarizeButton.disabled,true);
 pending.a({ok:true,summary:'สรุปข่าว A',hash:'a-hash'});await Promise.all([a,again]);assert.equal(nodes.aiResult.textContent,'สรุปข่าว A');assert.equal(nodes.summarizeButton.disabled,false);assert.equal(nodes.summarizeButton.hidden,true);
 pending.b({ok:true,summary:'สรุปข่าว B',hash:'b-hash'});await b;assert.equal(nodes.aiResult.textContent,'สรุปข่าว A');assert.equal(saved['tdn.summary.b'].text,'สรุปข่าว B');
});
