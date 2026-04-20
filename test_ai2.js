// Debug: manually analyze what suitAnalysis returns for 1234567w
function tIdx(s, n) { return s * 9 + (n - 1); }
function countArray(arr, excludeIdx) {
    const len = excludeIdx >= 0 ? arr.length - 1 : arr.length;
    const c = new Int8Array(27);
    for (let i = 0; i < len; i++) c[arr[i]]++;
    return c;
}

const hand = [tIdx(0,1),tIdx(0,2),tIdx(0,3),tIdx(0,4),tIdx(0,5),tIdx(0,6),tIdx(0,7)];
const c = countArray(hand);
console.log('Count array:', Array.from(c).join(' '));
console.log('Wan counts:', c[0],c[1],c[2],c[3],c[4],c[5],c[6],c[7],c[8]);

// Manual analysis of 1234567w:
// Best decomposition for tenpai (no jantai):
//   Option A: 123 mentsu + 456 mentsu + 7 taatsu(pair, wait 7)
//     m=2, t=1, score=5. Need jantai. If 77 pair → jantai → m=2, t=0 → shanten = 8-4-0-1=3. WRONG.
//     Wait... 123 + 456 + 7 = 7 tiles. m=2, t=0 (7 is single, discard). 
//     shanten = 8-4-0-1 = 3... but expected is 1!
//     
//   Actually: 123w 456w 7w = m=2, t=0. But we have 7 tiles.
//   nMentsu = (7-1)/3 = 2 (floor). basePt = 4.
//   shanten = 4 - 2*2 - 0 = 0 with jantai, or 1 without.
//   
//   Wait, my formula uses 8 (= 2*4) not 4. Let me re-check.
//   For 7 tiles: nM = floor((7-1)/3) = 2. basePt = 2*2 = 4.
//   shanten with jantai = 4 - 2*2 - 0 - 1 = -1 → 0
//   But the actual shanten should be 1 (waiting for 7w pair, or 5w/8w to make sequence)
//   
//   Hmm wait - this hand IS tenpai!
//   123 456 + 7: wait for another 7 to make pair → win: 123 456 77
//   OR: 12 34 56 + 7: wait for 3 or 8 or pair
//   So shanten = 0 (tenpai), not 1!
//   
//   Let me re-check... 123 456 7 = need one more tile. 
//   If draw 7: 123 456 77 → 2 mentsu + 1 pair → 8 tiles → 3n+2 with n=2 → WIN!
//   So this IS tenpai. My expected value of 1 was wrong!

// Let me verify: is 1234567w actually tenpai?
// 3n+2 = 7 → n=5/3... not integer. 
// For mahjong win: need 3n+2 = total tiles. 14 → n=4. 
// With 7 tiles: need 7 more to reach 14. Current shanten = 
// Number of tiles needed to replace taatsu with mentsu + add pair.
// Best: 123(m) + 456(m) + 7(taatsu=wait7) = m=2, t=1, j=0
// Need 2 more mentsu + 1 jantai. Currently have 2m + 1t = 3 blocks out of 4.
// So shanten = 4 - 2 - 1 = 1 (without jantai), or 
// If 7 pair as jantai: 123(m) + 456(m) + 7(j) = m=2, j=1, no taatsu.
// Need 2 more mentsu. shanten = 8 - 4 - 1 = 3? That's worse!

// I'm confusing myself. Let me use the DEFINITION:
// shanten = minimum number of tile swaps needed to reach tenpai
// Tenpai = one tile away from win
// Win = 4 mentsu + 1 jantai = 14 tiles

// For 1234567w (7 tiles, need 14):
// Step 1: draw anything good. 7 tiles → discard worst → still 7 tiles.
// Actually, shanten for less than 13 tiles doesn't follow the standard formula.
// Standard shanten is defined for 13-tile hands.

// For 7 tiles: technically shanten = (13 - n) + handShanten
// Where handShanten is the shanten if we imagine 13 tiles with 6 random draws.
// But that's not standard. Standard shanten is for 13-tile hands.

// So let me only test with 13-tile hands!

console.log('\n--- Correct expectations for 13-tile hands ---');
console.log('12345678w + 5 more tiles = 13 tiles total');
// 12345678w 111t 555s = 14 tiles → win
// 1234567w + 6 more = 13 tiles. 1234567w 11t 33t = 13 tiles
// Decompose: W:123(m) + 456(m) + 7(taatsu), T:11(pair as jantai or taatsu), S:33(pair)
// Case: T11=jantai, S33=taatsu, W:123(m)+456(m)+7(taatsu)
//   m=2, t=2. shanten = 8 - 4 - 2 - 1 = 1
// Case: S33=jantai, T11=taatsu, W:123(m)+456(m)+7(taatsu)
//   m=2, t=2. shanten = 8 - 4 - 2 - 1 = 1
// Case: T11=taatsu, S33=taatsu, W:123(m)+456(m)+7(taatsu)... no jantai
//   m=2, t=3. shanten = 8 - 4 - min(3, 4-2) = 8 - 4 - 2 = 2, but min 1
// So best = 1 shanten. Makes sense!

// What about: 12345678w 1t 2t 3t 5s 5s = 13 tiles
// W:123(m)+456(m)+78(taatsu), T:123(m), S:55(pair=jantai)
// m=3, t=1, j=1. shanten = 8 - 6 - 1 - 1 = 0. TENPAI!
// Waiting for: 6w (to make 678 with 78), or 9w (to make 789), or 4w (to make 456→789)... wait
// W:123 456 78 = if draw 6: 123 456 678 = 3 mentsu + 123t + 55s pair = 4 mentsu + 1 pair = WIN!
// If draw 9: 123 456 789 = same
// So YES, tenpai! shanten = 0.

console.log('So 12345678w 123t 55s = 13t tenpai? Should be 0');
const h2 = [tIdx(0,1),tIdx(0,2),tIdx(0,3),tIdx(0,4),tIdx(0,5),tIdx(0,6),tIdx(0,7),tIdx(0,8),
            tIdx(1,1),tIdx(1,2),tIdx(1,3),tIdx(2,5),tIdx(2,5)];
console.log('Hand:', h2.length, 'tiles');

// The key issue: my suitAnalysis memo hash function
// hasJ is tracked via CLOSURE, not via hash key!
// This means the memo will return wrong results when hasJ changes

// Let me verify by instrumenting
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
let script = scriptMatch[1];
const shantenBlock = script.substring(
    script.indexOf('function canWinArray'),
    script.indexOf('function calcShanten(hand)') + 100
);
eval(shantenBlock);

console.log('\nCurrent _calcShantenCount results:');
console.log('12345678w 123t 55s (13t, expect 0):', _calcShantenCount(countArray(h2), h2.length));

// All isolated (13 tiles): each tile is its own, no pairs, no sequences
// Best: nothing. m=0, t=0, no pair. shanten = 8-0-0 = 8 (min 1 without jantai)
// But there ARE no pairs, so we can't have jantai. shanten = 8.
const isolated = [tIdx(0,1),tIdx(0,3),tIdx(0,5),tIdx(0,7),tIdx(0,9),tIdx(1,2),tIdx(1,4),tIdx(1,6),tIdx(1,8),tIdx(2,1),tIdx(2,3),tIdx(2,5),tIdx(2,7)];
console.log('All isolated (13t, expect 8):', _calcShantenCount(countArray(isolated), isolated.length));

// 3trip+1: 111w 222w 333w 4t = 10 tiles, expect 0 (waiting for 4t pair)
const trip = [tIdx(0,1),tIdx(0,1),tIdx(0,1),tIdx(0,2),tIdx(0,2),tIdx(0,2),tIdx(0,3),tIdx(0,3),tIdx(0,3),tIdx(1,4)];
console.log('3trip+1 (10t, expect 0):', _calcShantenCount(countArray(trip), trip.length));

// 123w 456t (6 tiles, expect 2)
const simple = [tIdx(0,1),tIdx(0,2),tIdx(0,3),tIdx(1,4),tIdx(1,5),tIdx(1,6)];
console.log('123w456t (6t, expect 2):', _calcShantenCount(countArray(simple), simple.length));
