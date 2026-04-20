function tIdx(s, n) { return s * 9 + (n - 1); }
function countArray(arr) {
    const c = new Int8Array(27);
    for (let i = 0; i < arr.length; i++) c[arr[i]]++;
    return c;
}

let totalCalls = 0;
function countMentsuTaatsu(c, n, startIdx) {
    totalCalls++;
    if (totalCalls > 200000) return { m: 0, t: 0 };
    
    let pos = startIdx;
    while (pos < 27 && c[pos] === 0) pos++;
    if (pos >= 27) return { m: 0, t: 0 };
    
    const v = c[pos];
    const num = pos % 9;
    const suit = Math.floor(pos / 9);
    const suitEnd = (suit + 1) * 9;
    let bestM = 0, bestT = 0;
    
    function update(m, t) {
        if (m + t > 4) t = Math.max(0, 4 - m);
        if (m > 4) m = 4;
        if (2 * m + t > 2 * bestM + bestT) { bestM = m; bestT = t; }
    }
    
    if (v >= 3) {
        c[pos] -= 3;
        const r = countMentsuTaatsu(c, n - 3, pos);
        c[pos] += 3;
        update(r.m + 1, r.t);
    }
    
    if (num <= 6 && v >= 1 && pos + 2 < suitEnd && c[pos+1] >= 1 && c[pos+2] >= 1) {
        c[pos]--; c[pos+1]--; c[pos+2]--;
        const r = countMentsuTaatsu(c, n - 3, pos);
        c[pos]++; c[pos+1]++; c[pos+2]++;
        update(r.m + 1, r.t);
    }
    
    if (v >= 2) {
        c[pos] -= 2;
        const r = countMentsuTaatsu(c, n - 2, pos);
        c[pos] += 2;
        update(r.m, r.t + 1);
    }
    
    if (num <= 7 && v >= 1 && pos + 1 < suitEnd && c[pos+1] >= 1) {
        c[pos]--; c[pos+1]--;
        const r = countMentsuTaatsu(c, n - 2, pos);
        c[pos]++; c[pos+1]++;
        update(r.m, r.t + 1);
    }
    
    if (num <= 6 && v >= 1 && pos + 2 < suitEnd && c[pos+2] >= 1) {
        c[pos]--; c[pos+2]--;
        const r = countMentsuTaatsu(c, n - 2, pos);
        c[pos]++; c[pos+2]++;
        update(r.m, r.t + 1);
    }
    
    c[pos]--;
    const rSkip = countMentsuTaatsu(c, n - 1, pos);
    c[pos]++;
    update(rSkip.m, rSkip.t);
    
    return { m: bestM, t: bestT };
}

function calcShanten(c, n) {
    if (n < 3) return 8;
    let minSh = 8;
    for (let i = 0; i < 27; i++) {
        if (c[i] >= 2) {
            c[i] -= 2;
            totalCalls = 0;
            const mt = countMentsuTaatsu(c, n - 2, 0);
            let sh = 8 - 2 * mt.m - mt.t - 1;
            if (sh < 0) sh = 0;
            console.log('  Jantai at ' + i + ' (suit ' + Math.floor(i/9) + ' num ' + (i%9+1) + '): m=' + mt.m + ' t=' + mt.t + ' sh=' + sh + ' calls=' + totalCalls);
            minSh = Math.min(minSh, sh);
            c[i] += 2;
        }
    }
    totalCalls = 0;
    const mt = countMentsuTaatsu(c, n, 0);
    let sh = 8 - 2 * mt.m - mt.t;
    if (sh < 1) sh = 1;
    console.log('  No jantai: m=' + mt.m + ' t=' + mt.t + ' sh=' + sh + ' calls=' + totalCalls);
    minSh = Math.min(minSh, sh);
    return minSh;
}

// Test: 111w 222w 333w 4t
console.log('=== 3trip+1 (10 tiles) ===');
const h1 = [tIdx(0,1),tIdx(0,1),tIdx(0,1),tIdx(0,2),tIdx(0,2),tIdx(0,2),tIdx(0,3),tIdx(0,3),tIdx(0,3),tIdx(1,4)];
const c1 = countArray(h1);
console.log('Counts: W: ' + Array.from(c1).slice(0,9).join(' ') + ' T: ' + Array.from(c1).slice(9,18).join(' '));
console.log('Expected: 0 (waiting for 4t pair → 111w222w333w44t = win)');
console.log('Got:', calcShanten(c1, 10));
console.log('');

// With jantai 11w: remaining = 1w 222w 333w 4t = 7 tiles
// 1w discard, 222w(m), 333w(m), 4t(discard) = m=2, t=0. sh = 8-4-0-1 = 3. BAD.
// With jantai 22w: remaining = 111w 2w 333w 4t = 7 tiles
// 111w(m), 2w discard, 333w(m), 4t(discard) = m=2, t=0. sh = 8-4-0-1 = 3. BAD.
// With jantai 33w: same. m=2, t=0, sh=3. BAD.
// No jantai: 111w(m) 222w(m) 333w(m) 4t = m=3, t=0. sh = 8-6 = 2. min 1.
// WAIT! 4t is a SINGLE tile with count 1. It should be "skip/discard".
// After skip: 4t removed, n becomes 9. But 4t is the LAST tile. So after discarding it: m=3, t=0.
// But 3 mentsu + 1 taatsu + 1 jantai = 14 tiles needed.
// We have 10 tiles. 3 mentsu (9 tiles) + 1 remaining tile = need 4 more tiles.
// shanten = 8 - 6 - 0 = 2 (no jantai). min 1.
// But expected is 0 (tenpai, waiting for 4t pair)!

// AH HA! The issue is that 4t should be considered as a taatsu (pair waiting)!
// But count is only 1, so it can't form a pair taatsu.
// However, from the PLAYER's perspective, 4t IS a single tile waiting for another 4t to make a pair (jantai).
// In the jantai loop: c[1*9+3] = c[12] = 1 < 2, so no jantai at 4t position.
// That's correct - we can only use existing pairs as jantai, not single tiles.
// The tenpai is: 111m + 222m + 333m + 4t wait for 4t.
// In the jantai loop, 4t count is 1, so it can't be jantai.
// We need jantai from the wan tiles, but that uses up tiles from triplets.

// The CORRECT decomposition is:
// 111w(m) + 222w(m) + 333w(m) + 4t(wait for 4t pair)
// m=3, no jantai (4t is single), no taatsu.
// shanten = 8 - 6 - 0 = 2 (no jantai → min 1)
// But this hand IS tenpai (shanten 0)!

// The problem: the shanten formula treats jantai as requiring a PAIR already in hand.
// But tenpai means "draw one tile to complete". 111 222 333 + X means:
// draw X → 111 222 333 XX → win.
// In our decomposition: m=3 (already have 3 mentsu), need 1 more mentsu + 1 jantai.
// But we have 10 tiles = 3*3 + 1. The single tile needs to become both a mentsu and a jantai?? No.
// Actually: 10 tiles. Target is 14 = 4*3 + 2.
// Need: 1 more mentsu (3 tiles) + 1 jantai (2 tiles) = 5 tiles from draws.
// But we can only draw and discard, so net need = some draws.
// 
// For tenpai definition: change 1 tile to reach winning form.
// 111 222 333 4: draw 4 → 111 222 333 44 → 3 mentsu + 1 pair = wait, that's only 3 mentsu + 1 jantai = 11 tiles.
// We need 4 mentsu + 1 jantai = 14 tiles. 11 ≠ 14.
// So 111 222 333 44 is NOT a win! It's only 3 mentsu + 1 jantai = 11 tiles, not 4 mentsu + 1 jantai = 14 tiles.

// I was WRONG about the expected value! 
// 111 222 333 4 (10 tiles) is NOT tenpai for standard 4+1 mahjong!
// It's 2-shanten: need 2 more tiles → draw 4 (pair) + draw anything, discard to keep structure → 
// Actually: current mentsu = 3, need 1 more mentsu + 1 jantai.
// Shanten = 8 - 2*3 - 0 - 1 = 1 (with 4t as... wait, we need jantai from somewhere)
// Without jantai: 8 - 6 = 2, min 1.
// With jantai 11w: remaining 222w 333w 4t = 2 mentsu + 0 taatsu. sh = 8 - 4 - 1 = 3.
// Best: no jantai, sh=2. OR with pair 44t... but 4t count is 1.

// So the CORRECT shanten for 111 222 333 4 is... let me think again.
// 10 tiles. 3 complete mentsu (9 tiles) + 1 single.
// Need 4 more tiles (draws). Can draw 4 to make pair → 111 222 333 44 = 11 tiles, 3m + 1j.
// Then need 1 more mentsu (3 tiles) → need 3 more draws. 
// Actually in real mahjong: you draw 1 tile and discard 1 each turn.
// So: draw X, discard Y. Repeat until win or draw.
// Starting from 10 tiles (wait, shouldn't hands be 13 tiles?).

// OH WAIT. Standard mahjong hands are 13 tiles. This is a 10-tile hand.
// The shanten formula 8 - 2m - t - j is for 13-tile hands!
// For 10-tile hands, we'd need to adjust.
// But in our simulation, hands can be any size (during gameplay, before all draws).

// Actually, the shanten formula is ALWAYS relative to a 14-tile win:
// shanten = minimum draws needed (net) to reach tenpai.
// For 10 tiles: we need 4 more tiles. If we draw 4 useful tiles and form 4m+1j, that's tenpai.
// With 3 existing mentsu: need 1 more mentsu + 1 jantai = 5 tiles worth of structure.
// Currently have 3m(6pt) + 0t. Need 2pt + 1t + 1j = 3 more "points".
// shanten = 8 - 6 - 0 = 2 (without j) or 8 - 6 - 0 - 1 = 1 (with j).
// Best with j: use 11w as pair(jantai). Remaining: 1w + 222w + 333w + 4t = 2m + 1 discarded + 1 discarded.
// m=2, t=0. sh = 8 - 4 - 0 - 1 = 3. Worse!
// So best is: no jantai, sh = 2. min(2, 1) → sh = 1.
// Correct answer is 1 (NOT 0)!

// I had the WRONG expected value! 3trip+1 for 10 tiles is 1-shanten, not 0.
// For 13 tiles: 111w 222w 333w 4t + XXX = wait, that's only 10 tiles, need 3 more.
// If we add 3 random tiles: 111 222 333 4 + X Y Z
// Best case: 111 222 333 4 + 44 X (draw pair for 4) = 12 tiles, still need 2 more.
// Hmm this is getting complicated. The point is: the shanten formula is always relative to 14-tile win.

// For practical purposes: in our mahjong game, AI evaluates hands after drawing (14 tiles)
// or before drawing (13 tiles). At 13 tiles, tenpai = draw 1 to win.
// At 14 tiles, check if it's a win.

// The key test should be 13-tile hands. Let me verify with correct expectations.

console.log('=== 13-tile hands ===');
// 111w 222w 333w 44t 5s5s = 13 tiles. 3m + 1j(55s). Need 1 more mentsu.
// 4t wait: draw 4t → 111 222 333 444t 55s = 4m + 1j = WIN!
// So shanten = 0 (tenpai, waiting for 3t or 4t or 5t to make sequence with 44t, or draw 4t for triplet)
// Wait: 44t can become: 444(m) waiting 4t, or 34(m) or 45(m) with adjacent.
// Actually: 44t is a pair. Can be jantai or taatsu.
// As jantai: remaining 111 222 333 = 3m, need 1m. sh = 8-6-0-1 = 1.
// But 44t is a pair taatsu (wait for 3t,4t,5t). 
// Best: 55s=jantai, 111(m) 222(m) 333(m) 44(taatsu). m=3, t=1, j=1. sh=8-6-1-1=0. TENPAI!
const h13a = [tIdx(0,1),tIdx(0,1),tIdx(0,1),tIdx(0,2),tIdx(0,2),tIdx(0,2),tIdx(0,3),tIdx(0,3),tIdx(0,3),tIdx(1,4),tIdx(1,4),tIdx(2,5),tIdx(2,5)];
const c13a = countArray(h13a);
console.log('111w222w333w44t55s (13t, expect 0):', calcShanten(c13a, 13));

// 111w 222w 333w 4t 5s5s = 13 tiles
// Best: 55s=j, 111(m)222(m)333(m)4t(skip). m=3, t=0, j=1. sh=8-6-0-1=1.
// OR: 11w(j), 1w+222(m)+333(m)=2m, 4t(skip)+5s5s(t)=1t. m=2,t=1,j=1. sh=8-4-1-1=2. Worse.
// Best sh=1.
const h13b = [tIdx(0,1),tIdx(0,1),tIdx(0,1),tIdx(0,2),tIdx(0,2),tIdx(0,2),tIdx(0,3),tIdx(0,3),tIdx(0,3),tIdx(1,4),tIdx(2,5),tIdx(2,5)];
const c13b = countArray(h13b);
console.log('111w222w333w4t55s (13t, expect 1):', calcShanten(c13b, 13));
