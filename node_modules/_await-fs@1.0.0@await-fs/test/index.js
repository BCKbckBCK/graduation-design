var fs = require('..');
var assert = require('assert');

describe('.readFile()', function(){
  it('should work', function(done){
    (async ()=>{
      var ret = await fs.readFile('test/fixtures/msg.txt','utf8');
      assert('hello world' === ret);
    })();
  })
})
/*
describe('.createReadStream()', function(){
  it('should work', function(done){
    co(function *(){
      var read = fs.createReadStream('test/fixtures/msg.txt');
      assert('hello\n' == (yield read()).toString());
    })(done);
  })
})
*/
/*
describe('others', function(){
  it('should be wrapped', function(done){
    co(function *(){
      var ret = yield fs.stat('test/fixtures/msg.txt');
      assert(ret.size);

      var ret = yield fs.readFile('test/fixtures/msg.txt');
      assert(Buffer.isBuffer(ret));

      var ret = yield fs.readFile('test/fixtures/msg.txt', 'utf8');
      assert('hello\n' == ret);
    })(done);
  })
})
*/
