import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import fs from 'node:fs';import crypto from 'node:crypto';
test('GAS-compatible VAPID bundle produces a valid ES256 signature without Web Crypto',()=>{
  const context=vm.createContext({Uint8Array,Uint32Array,DataView,ArrayBuffer,BigInt,Date,Math,Number,String,Object,Array,Set,Map});vm.runInContext(fs.readFileSync('gas/Crypto.js','utf8'),context);
  const pair=crypto.generateKeyPairSync('ec',{namedCurve:'prime256v1'}),jwk=pair.privateKey.export({format:'jwk'}),message=Buffer.from('header.claims'),signature=Buffer.from(context.NewsCrypto.sign([...message],[...Buffer.from(jwk.d,'base64url')]));
  assert.equal(signature.length,64);assert.equal(crypto.verify('sha256',message,{key:pair.publicKey,dsaEncoding:'ieee-p1363'},signature),true);
});
