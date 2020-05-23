# await-fs
Async await nodejs fs wrapper
Node core fs wrapped functions that return a Promise.

## Installation
`npm install await-fs`

## Usage
Use all the regular async fs functions without callback hell and co:
```javascript
const fs = require('await-fs');
(async () = > {
try{
let json = await fs.readFile('package.json','utf8')
console.log(json)
}catch(err){
console.log(err)
}
})()
```

## Note. 

For constants you may need require('fs')

```javascript
const fs = require('fs');
const aw = require('await-fs');

(async () = > {
try{
let access = await aw.access('/', fs.constants.R_OK | fs.constants.W_OK)
// silently gives nothing - means all is OK
}catch(err){
console.log(err) // access denied
}
})()
```
### Licence

MIT