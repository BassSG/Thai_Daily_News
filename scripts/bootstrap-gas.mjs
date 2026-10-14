import fs from 'node:fs/promises';
const token=(await fs.readFile('.private/bootstrap-token.txt','utf8')).trim();
const response=await fetch('https://script.google.com/macros/s/AKfycbwatsqO1HW7xmIbfJgm6P-4otzfNbvGeVdcVjflwHZxzbDM34o4ul_Fe3Wfy-NuKVlaoQ/exec',{method:'POST',headers:{'Content-Type':'text/plain; charset=utf-8'},body:JSON.stringify({action:'bootstrap',token}),signal:AbortSignal.timeout(120000)});
const text=await response.text();let result;try{result=JSON.parse(text);}catch{throw new Error('GAS bootstrap returned a non-JSON response: HTTP '+response.status);}
console.log(JSON.stringify(result));if(!result.ok)process.exitCode=1;
