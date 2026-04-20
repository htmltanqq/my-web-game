// Debug shanten calculator
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
let script = scriptMatch[1];
const shantenBlock = script.substring(
    script.indexOf('function canWinArray'),
    script.indexOf('function calcShanten(hand)') + 100
);
eval(shantenBlock);

function tIdx(suit, num) { return suit * 9 + (num - 1); }
function tName(idx) { return ['W','T','S'][Math.floor(idx/9)] + (idx%9+1); }
function countArray(arr, excludeIdx) {
    const len = excludeIdx >= 0 ? arr.length - 1 : arr.length;
    const c = new Int8Array(27);
    for (let i = 0; i < len; i++) c[arr[i]]++;
    return c;
}

// Test: known good hands
// 2w3w4w 5t6t7t 1s2s3s + pair 5s5s = complete win (14 tiles)
const winHand = [
    tIdx(0,2), tIdx(0,3), tIdx(0,4),
    tIdx(1,5), tIdx(1,6), tIdx(1,7),
    tIdx(2,1), tIdx(2,2), tIdx(2,3),
    tIdx(2,5), tIdx(2,5),
    tIdx(0,7), tIdx(0,8), tIdx(0,9),
];
const c = countArray(winHand);
console.log('Win hand canWin:', canWinArray(c));
console.log('Win hand shanten:', _calcShantenCount(c, winHand.length));

// Same hand minus 1 tile (13 tiles) = tenpai
const tenpai = winHand.slice(0, -1);
const ct = countArray(tenpai);
console.log('Tenpai hand shanten(13):', _calcShantenCount(ct, tenpai.length));

// Test: simple 1-shanten
// 2w3w4w 5t6t7t 1s1s 8s9s + 1t2t3t = 1-shanten (need 7t or 4t)
const hand1s = [
    tIdx(0,2), tIdx(0,3), tIdx(0,4),
    tIdx(1,5), tIdx(1,6), tIdx(1,7),
    tIdx(2,1), tIdx(2,1),
    tIdx(2,8), tIdx(2,9),
    tIdx(1,1), tIdx(1,2), tIdx(1,3),
];
const c1 = countArray(hand1s);
console.log('1-shanten hand shanten(13):', _calcShantenCount(c1, hand1s.length));
// Count: 3 mentsu + 1 pair + 1 taatsu(8s9s) + 1 mentsu(1t2t3t)
// pt = 2+2+2+1+2 = 9, bl = 1+1+1+1+1 = 5, cap to 4 blocks: pt = 9-(5-4) = 8
// with jantai: shanten = 8 - 8 - 1 = -1 -> max(0, -1) = 0... 
// Wait that means tenpai not 1-shanten
// Let me recount: 3 mentsu(6pt) + 1 pair(0pt jantai) + 1 taatsu(1pt) + 1 mentsu(2pt) = 9pt 5bl
// cap to 4: 9 - (5-4) = 8pt, shanten = 8 - 8 - 1 = -1
// Hmm, that's wrong. 5 blocks with 4 allowed...

// Actually: we have 13 tiles. 4 mentsu + 1 jantai = 14 needed. 
// With 13 tiles we're at 1-shanten.
// The issue is: 3 complete mentsu + 1 pair + 1 mentsu + 1 taatsu = 5 blocks
// But nM=4, so we can only keep 4 blocks. The worst taatsu gets dropped.
// So pt = 2+2+2+2+1 = 9, bl = 5, capped pt = 9-(5-4) = 8
// shanten = 8 - 8 - 1 = -1, max(0,-1) = 0
// That says tenpai, but this hand IS tenpai (waiting for 7t or 10t doesn't exist, or 4t)

// Wait... 8s9s needs 7s or 10s. 10s doesn't exist. So it's waiting for 7s.
// Actually this IS tenpai! shanten=0 is correct.
// My test case was wrong - it IS tenpai.

console.log('\n--- Recheck Test 2 from before ---');
// W1 W2 W3 W4 T1 T5 T6 T7 S1 S2 S3 S4 S8 S9 = 14 tiles
// Count: W1234, T567, S1234, S89, T1
// W: mentsu 123(2pt) + taatsu 4?(1pt with gap to 5 or adj to 3)... 
// Actually W4 alone is not a taatsu with anything in wan.
// W: 123 mentsu(2pt) + 4 isolated(0pt)
// T: 567 mentsu(2pt) + 1 isolated(0pt) 
// S: 1234 → 123 mentsu(2pt) + 4? isolated... or 234 mentsu + 1 isolated
//    or 123 taatsu + 234 taatsu... complex
// S: 89 taatsu(1pt)
// Total with best split:
// W: 123 mentsu(2pt 1bl), 4 discard(0pt 0bl)  
// T: 567 mentsu(2pt 1bl), 1 discard(0pt 0bl)
// S: 123 mentsu(2pt 1bl), 4 discard(0pt 0bl), 89 taatsu(1pt 1bl)
// Total: pt=7, bl=4
// With jantai... we don't have a pair. 
// No jantai: shanten = 8 - 7 = 1, but min is 1 (forced)
// With jantai: no pair available → invalid
// So shanten = 1! 

// But wait this is 14 tiles. Shanten formula is for 13 tiles (waiting for 14th).
// For 14 tiles, we should check if it's a win.
console.log('Test2 hand(14 tiles):');
const test2 = [
    tIdx(0,1), tIdx(0,2), tIdx(0,3), tIdx(0,4),
    tIdx(1,1), tIdx(1,5), tIdx(1,6), tIdx(1,7),
    tIdx(2,1), tIdx(2,2), tIdx(2,3), tIdx(2,4),
    tIdx(2,8), tIdx(2,9),
];
console.log('  shanten:', _calcShantenCount(countArray(test2), test2.length));

// 13 tile version (remove W4): should be 1-shanten
const test2_13 = test2.filter((t,i) => i !== 3);
console.log('Test2 hand(13 tiles, removed W4):');
console.log('  shanten:', _calcShantenCount(countArray(test2_13), test2_13.length));
// W123, T567, T1, S1234, S89 = 13 tiles
// Best: W123(2pt), T567(2pt), S123 taatsu(1pt), S4? taatsu with S3..S3 is in 123.
// Actually S1234: can split as S123 mentsu(2pt) + S4 discard, or S234 mentsu + S1 discard
// Best: S123 mentsu(2pt) or S234 mentsu(2pt) = same
// S89 taatsu(1pt), T1 discard
// Total: 2+2+2+1 = 7pt, 4bl
// No pair → no jantai → shanten = 8 - 7 = 1 ✓
// OR with pair... no pair. shanten = 1 (forced minimum since no jantai)

console.log('\n--- Key insight test ---');
// Hand: 123m 456p 789s + pair 11s (wrong: this is 14 tiles)
// Let's test 13-tile hands with known shanten values

// Simple: 123w 456t + 78s (9 tiles) = 2-shanten 
const h9 = [tIdx(0,1),tIdx(0,2),tIdx(0,3),tIdx(1,4),tIdx(1,5),tIdx(1,6),tIdx(2,7),tIdx(2,8)];
console.log('9 tiles 123w456t78s: shanten =', _calcShantenCount(countArray(h9), h9.length), '(expect 2)');

// 12 tiles: 123w 456t 789s + 1t = 1-shanten
const h12 = [tIdx(0,1),tIdx(0,2),tIdx(0,3),tIdx(1,4),tIdx(1,5),tIdx(1,6),tIdx(2,7),tIdx(2,8),tIdx(2,9),tIdx(1,1)];
console.log('12 tiles 123w456t789s+1t: shanten =', _calcShantenCount(countArray(h12), h12.length), '(expect 1, needs pair)');

// 13 tiles: 123w 456t 789s + 1t2t = tenpai (waiting for 1t pair or 3t)
const h13 = [tIdx(0,1),tIdx(0,2),tIdx(0,3),tIdx(1,4),tIdx(1,5),tIdx(1,6),tIdx(2,7),tIdx(2,8),tIdx(2,9),tIdx(1,1),tIdx(1,2)];
console.log('13 tiles 123w456t789s+1t2t: shanten =', _calcShantenCount(countArray(h13), h13.length), '(expect 0, tenpai)');
console.log('13 tiles canWin:', canWinArray(countArray(h13)));
