// Fixed shanten calculator - suit boundary check added
function tIdx(s, n) { return s * 9 + (n - 1); }
function countArray(arr, excludeIdx) {
    const len = excludeIdx >= 0 ? arr.length - 1 : arr.length;
    const c = new Int8Array(27);
    for (let i = 0; i < len; i++) c[arr[i]]++;
    return c;
}

function countMentsuTaatsu(c, n, startIdx) {
    let pos = startIdx;
    while (pos < 27 && c[pos] === 0) pos++;
    if (pos >= 27) return { m: 0, t: 0 };
    
    const v = c[pos];
    const suit = Math.floor(pos / 9);
    const suitEnd = (suit + 1) * 9; // exclusive boundary
    const num = pos % 9; // 0-8 within suit
    let bestM = 0, bestT = 0;
    
    function update(m, t) {
        if (m + t > 4) t = Math.max(0, 4 - m);
        if (m > 4) m = 4;
        if (2 * m + t > 2 * bestM + bestT) { bestM = m; bestT = t; }
    }
    
    // 1. Triplet
    if (v >= 3) {
        c[pos] -= 3;
        const r = countMentsuTaatsu(c, n - 3, pos);
        c[pos] += 3;
        update(r.m + 1, r.t);
    }
    
    // 2. Sequence (within same suit, pos+2 < suitEnd)
    if (num <= 6 && v >= 1 && pos + 2 < suitEnd && c[pos+1] >= 1 && c[pos+2] >= 1) {
        c[pos]--; c[pos+1]--; c[pos+2]--;
        const r = countMentsuTaatsu(c, n - 3, pos);
        c[pos]++; c[pos+1]++; c[pos+2]++;
        update(r.m + 1, r.t);
    }
    
    // 3. Pair (taatsu)
    if (v >= 2) {
        c[pos] -= 2;
        const r = countMentsuTaatsu(c, n - 2, pos);
        c[pos] += 2;
        update(r.m, r.t + 1);
    }
    
    // 4. Adjacent taatsu (within same suit)
    if (num <= 7 && v >= 1 && pos + 1 < suitEnd && c[pos+1] >= 1) {
        c[pos]--; c[pos+1]--;
        const r = countMentsuTaatsu(c, n - 2, pos);
        c[pos]++; c[pos+1]++;
        update(r.m, r.t + 1);
    }
    
    // 5. Kanchan taatsu (within same suit)
    if (num <= 6 && v >= 1 && pos + 2 < suitEnd && c[pos+2] >= 1) {
        c[pos]--; c[pos+2]--;
        const r = countMentsuTaatsu(c, n - 2, pos);
        c[pos]++; c[pos+2]++;
        update(r.m, r.t + 1);
    }
    
    // 6. Skip (discard)
    c[pos]--;
    const r = countMentsuTaatsu(c, n - 1, pos);
    c[pos]++;
    update(r.m, r.t);
    
    return { m: bestM, t: bestT };
}

function calcShantenClassic(c, n) {
    if (n < 3) return 8;
    let minSh = 8;
    for (let i = 0; i < 27; i++) {
        if (c[i] >= 2) {
            c[i] -= 2;
            const mt = countMentsuTaatsu(c, n - 2, 0);
            let sh = 8 - 2 * mt.m - mt.t - 1;
            if (sh < 0) sh = 0;
            minSh = Math.min(minSh, sh);
            c[i] += 2;
        }
    }
    const mt = countMentsuTaatsu(c, n, 0);
    let sh = 8 - 2 * mt.m - mt.t;
    if (sh < 1) sh = 1;
    minSh = Math.min(minSh, sh);
    return minSh;
}

function calcShanten(arr) {
    const c = countArray(arr);
    return calcShantenClassic(c, arr.length);
}

// Tests
console.log('=== Fixed Shanten Calculator Tests ===');
const tests = [
    { hand: [tIdx(0,2),tIdx(0,3),tIdx(0,4),tIdx(1,5),tIdx(1,6),tIdx(1,7),tIdx(2,1),tIdx(2,2),tIdx(2,3),tIdx(2,5),tIdx(2,5),tIdx(0,7),tIdx(0,8),tIdx(0,9)], expect: 0, label: 'Win 14t' },
    { hand: [tIdx(0,1),tIdx(0,2),tIdx(0,3),tIdx(0,4),tIdx(0,5),tIdx(0,6),tIdx(0,7),tIdx(0,8),tIdx(1,1),tIdx(1,2),tIdx(1,3),tIdx(2,5),tIdx(2,5)], expect: 0, label: 'Tenpai 13t' },
    { hand: [tIdx(0,1),tIdx(0,2),tIdx(0,3),tIdx(0,5),tIdx(0,5),tIdx(1,4),tIdx(1,5),tIdx(1,6),tIdx(2,7),tIdx(2,8),tIdx(2,9),tIdx(2,1),tIdx(2,2)], expect: 0, label: 'Tenpai v2' },
    { hand: [tIdx(0,1),tIdx(0,3),tIdx(0,5),tIdx(0,7),tIdx(0,9),tIdx(1,2),tIdx(1,4),tIdx(1,6),tIdx(1,8),tIdx(2,1),tIdx(2,3),tIdx(2,5),tIdx(2,7)], expect: 8, label: 'All isolated' },
    { hand: [tIdx(0,1),tIdx(0,1),tIdx(0,1),tIdx(0,2),tIdx(0,2),tIdx(0,2),tIdx(0,3),tIdx(0,3),tIdx(0,3),tIdx(1,4)], expect: 0, label: '3trip+1' },
    { hand: [tIdx(0,1),tIdx(0,2),tIdx(0,3),tIdx(1,4),tIdx(1,5),tIdx(1,6)], expect: 2, label: '123w456t' },
    { hand: [tIdx(0,1),tIdx(0,1),tIdx(0,1),tIdx(0,2),tIdx(0,2),tIdx(0,2),tIdx(0,3),tIdx(0,3),tIdx(0,3),tIdx(0,4),tIdx(0,4),tIdx(0,4),tIdx(0,4),tIdx(0,4)], expect: 0, label: 'All wan win' },
    { hand: [tIdx(0,1),tIdx(0,1),tIdx(0,2),tIdx(0,2),tIdx(0,3),tIdx(0,3),tIdx(1,1),tIdx(1,2),tIdx(1,3),tIdx(2,1),tIdx(2,2),tIdx(2,3),tIdx(2,5)], expect: 0, label: 'Pairs+seq tenpai' },
    { hand: [tIdx(0,1),tIdx(0,2),tIdx(0,3),tIdx(1,4),tIdx(1,5),tIdx(1,6),tIdx(2,7)], expect: 3, label: '123w456t7s' },
    // Extra tests
    { hand: [tIdx(0,1),tIdx(0,2),tIdx(0,3),tIdx(1,4),tIdx(1,5),tIdx(1,6),tIdx(2,7),tIdx(2,8),tIdx(2,9),tIdx(1,1)], expect: 1, label: '1-shan 10t' },
    { hand: [tIdx(0,1),tIdx(0,2),tIdx(0,3),tIdx(0,4),tIdx(0,5),tIdx(0,6),tIdx(0,7)], expect: 1, label: '1234567w 7t' },
    { hand: [tIdx(0,1),tIdx(0,2),tIdx(0,3),tIdx(0,4),tIdx(0,5),tIdx(0,6),tIdx(0,7),tIdx(0,8)], expect: 0, label: '12345678w 8t' },
];

let pass = 0;
for (const t of tests) {
    const got = calcShanten(t.hand);
    const ok = got === t.expect;
    if (ok) pass++;
    console.log((ok ? 'PASS' : 'FAIL') + ' ' + t.label + ': got ' + got + ', expect ' + t.expect);
}
console.log('\n' + pass + '/' + tests.length + ' passed');
