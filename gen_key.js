const fs = require('fs');

let KEY_LEN = 1024;
let KEY_COUNT = 2048;
let CHAR = '1234567890pouiytrewqqasdfhkkkl;nbvxzrtyu!@##$%^^&&**(()_+}{<>?';
let ary = [];

for (let i = 0; i < KEY_COUNT; i++) {

    let key = '';
    for (let j = 0; j < KEY_LEN; j++) {
        key += CHAR[Math.floor(Math.random() * CHAR.length)];

    }
    ary.push(key);
};
fs.writeFileSync('.keys', ary.join('\n'));