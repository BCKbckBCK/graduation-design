const cryto = require('crypto');

let obj = cryto.createHash('md5');
obj.update('bck12345');


console.log(obj.digest('hex'));