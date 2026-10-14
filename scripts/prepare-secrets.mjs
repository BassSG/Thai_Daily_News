// Creates the application's persistent identity. Output files are ignored by Git.
import fs from 'node:fs/promises';import crypto from 'node:crypto';import {spawnSync} from 'node:child_process';
await fs.mkdir('.private',{recursive:true});
let credentials;
try{credentials=JSON.parse(await fs.readFile('.private/signing.json','utf8'));}catch{
  credentials={password:crypto.randomBytes(32).toString('base64url'),alias:'tdn-release'};
  await fs.writeFile('.private/signing.json',JSON.stringify(credentials,null,2));
}
const openssl='C:/Program Files/Git/usr/bin/openssl.exe';
try{await fs.access('.private/tdn-release.p12');}catch{
  for(const args of [
    ['req','-x509','-newkey','rsa:3072','-keyout','.private/signing-key.pem','-out','.private/signing-cert.pem','-days','10000','-nodes','-subj','/CN=Thai Daily News/O=BassSG/C=TH'],
    ['pkcs12','-export','-inkey','.private/signing-key.pem','-in','.private/signing-cert.pem','-out','.private/tdn-release.p12','-name',credentials.alias,'-passout','env:TDN_SIGN_PASSWORD']
  ]){const result=spawnSync(openssl,args,{env:{...process.env,TDN_SIGN_PASSWORD:credentials.password},stdio:'pipe'});if(result.status!==0)throw new Error('Signing identity generation failed');}
}
let vapid;
try{vapid=JSON.parse(await fs.readFile('.private/vapid.json','utf8'));}catch{
  const curve=crypto.createECDH('prime256v1');curve.generateKeys();vapid={privateKey:curve.getPrivateKey().toString('base64url'),publicKey:curve.getPublicKey().toString('base64url')};await fs.writeFile('.private/vapid.json',JSON.stringify(vapid,null,2));
}
let bootstrapToken;try{bootstrapToken=(await fs.readFile('.private/bootstrap-token.txt','utf8')).trim();}catch{bootstrapToken=crypto.randomBytes(32).toString('base64url');await fs.writeFile('.private/bootstrap-token.txt',bootstrapToken);}
const tokenHash=crypto.createHash('sha256').update(bootstrapToken).digest('hex');
await fs.writeFile('gas/PrivateBootstrap.js',`function tdBootstrapCommand_(payload){var token=String(payload.token||'');var digest=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,token).map(function(b){return ('0'+(b&255).toString(16)).slice(-2);}).join('');if(digest!==${JSON.stringify(tokenHash)})return {ok:false,error:'Unauthorized'};var p=PropertiesService.getScriptProperties();if(p.getProperty('TD_INSTALL_TOKEN_HASH')===digest)return {ok:true,alreadyInstalled:true};p.setProperties(${JSON.stringify({TD_VAPID_PRIVATE:vapid.privateKey,TD_VAPID_PUBLIC:vapid.publicKey})});var result=setupNewsApplication_();if(result.ok)p.setProperty('TD_INSTALL_TOKEN_HASH',digest);return result;}\n`);
for(const [name,secret] of [['TDN_STORE_PASSWORD',credentials.password],['TDN_KEYSTORE_B64',(await fs.readFile('.private/tdn-release.p12')).toString('base64')]]){
  const result=spawnSync('C:/Program Files/GitHub CLI/gh.exe',['secret','set',name,'--repo','BassSG/Thai_Daily_News'],{input:secret,encoding:'utf8',stdio:['pipe','pipe','pipe']});if(result.status!==0)throw new Error('Could not store signing secret '+name);
}
console.log('Persistent Android signing identity and web-push keys are ready. Private files stay outside Git.');
