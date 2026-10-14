import { p256 } from '@noble/curves/p256';
import { sha256 } from '@noble/hashes/sha256';
export function sign(messageBytes, privateKeyBytes) {
  return Array.from(p256.sign(sha256(new Uint8Array(messageBytes)), new Uint8Array(privateKeyBytes), {lowS:true,extraEntropy:false}).toCompactRawBytes());
}
