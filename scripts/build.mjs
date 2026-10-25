import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {build} from 'esbuild';
import {Script} from 'node:vm';
const root=process.cwd();
const {version}=JSON.parse(await fs.readFile('package.json','utf8'));
if(!/^\d+\.\d+\.\d+$/.test(version))throw new Error('Expected a stable semantic release version');
const [major,minor,patch]=version.split('.').map(Number),versionCode=major*10000+minor*100+patch;
async function sync(file,update){const original=await fs.readFile(file,'utf8'),next=update(original);if(next!==original)await fs.writeFile(file,next);}
await sync('config.js',s=>s.replace(/version:'[^']+'/,`version:'${version}'`));
await sync('gas/Server.js',s=>s.replace(/TD_VERSION='[^']+'/,`TD_VERSION='${version}'`));
await sync('index.html',s=>s.replace(/((?:app\.css|app\.js|config\.js|reading-policy\.js)\?v=)[\d.]+/g,(_,prefix)=>prefix+version));
await sync('service-worker.js',s=>s.replace(/tdn-shell-[\d.]+/g,'tdn-shell-'+version).replace(/((?:app\.css|app\.js|config\.js|reading-policy\.js)\?v=)[\d.]+/g,(_,prefix)=>prefix+version));
await sync('android/app/build.gradle',s=>s.replace(/versionCode \d+/,`versionCode ${versionCode}`).replace(/versionName '[^']+'/ ,`versionName '${version}'`));
await sync('.github/workflows/android.yml',s=>s.replace(/Thai-Daily-News-[\d.]+\.apk/g,`Thai-Daily-News-${version}.apk`));
await fs.mkdir('assets',{recursive:true});
for(const size of [96,192,512])await sharp('assets/logo-master.png').resize(size,size).png().toFile(`assets/icon-${size}.png`);
await fs.copyFile('assets/icon-192.png','assets/brand-mark.png');
await sharp('assets/logo-master.png').resize(512,512).png().toFile('assets/icon-maskable-512.png');
// Android status-bar icon is a purpose-built monochrome newspaper glyph.
const badge='<svg width="96" height="96" xmlns="http://www.w3.org/2000/svg"><path fill="white" d="M20 14h56v68H20zm10 12v7h36v-7zm0 16v18h14V42zm22 0v6h14v-6zm0 12v6h14v-6zM30 68v5h36v-5z" fill-rule="evenodd"/></svg>';
await sharp(Buffer.from(badge)).png().toFile('assets/badge-96.png');
await build({entryPoints:['scripts/crypto-entry.js'],bundle:true,format:'iife',globalName:'NewsCrypto',platform:'browser',target:'es2020',outfile:'gas/Crypto.js',minify:true,legalComments:'eof'});
let html=await fs.readFile('index.html','utf8');
const css=await fs.readFile('app.css','utf8'),js=await fs.readFile('app.js','utf8'),config=await fs.readFile('config.js','utf8'),policy=await fs.readFile('reading-policy.js','utf8');
html=html.replace(/<link rel="stylesheet" href="app\.css(?:\?[^\"]*)?">/,()=>'<style>'+css+'</style>').replace(/<script src="config\.js(?:\?[^\"]*)?"><\/script><script src="reading-policy\.js(?:\?[^\"]*)?"><\/script><script src="app\.js(?:\?[^\"]*)?" defer><\/script>/,()=>'<script>'+config+'\n'+policy+'\n'+js.replace(/<\/script/gi,'<\\/script')+'</script>').replaceAll('src="assets/','src="https://basssg.github.io/Thai_Daily_News/assets/').replaceAll('href="assets/','href="https://basssg.github.io/Thai_Daily_News/assets/').replace('href="manifest.webmanifest"','href="https://basssg.github.io/Thai_Daily_News/manifest.webmanifest"');
if(/src="(?:config|app|reading-policy)\.js/.test(html))throw new Error('GAS application scripts were not embedded');
for(const script of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new Script(script[1],{filename:'gas/index.html'});
await fs.writeFile('gas/index.html',html);
const webRoot='android/app/src/main/assets/web';
await fs.mkdir(path.join(webRoot,'assets'),{recursive:true});
for(const file of ['index.html','app.css','app.js','reading-policy.js','config.js','manifest.webmanifest'])await fs.copyFile(file,path.join(webRoot,file));
for(const file of ['icon-192.png','icon-512.png','brand-mark.png','badge-96.png'])await fs.copyFile('assets/'+file,path.join(webRoot,'assets',file));
for(const [density,size] of [['mdpi',48],['hdpi',72],['xhdpi',96],['xxhdpi',144],['xxxhdpi',192]]){
  const dir=`android/app/src/main/res/mipmap-${density}`;await fs.mkdir(dir,{recursive:true});await sharp('assets/logo-master.png').resize(size,size).png().toFile(dir+'/ic_launcher.png');
}
await fs.mkdir('android/app/src/main/res/drawable-nodpi',{recursive:true});
await sharp('assets/logo-master.png').resize(432,432).png().toFile('android/app/src/main/res/drawable-nodpi/logo.png');
console.log('Built GAS page, crypto bundle, PWA icons and packaged Android assets.');
