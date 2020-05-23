const koa = require('koa');
const Rouuter = require('koa-router');
const static = require('./static');
const session = require('koa-session');
const body = require('koa-better-body');
const path = require('path');
const fs = require("fs");
const database = require('./libs/database');
const ejs = require('koa-ejs');
const config = require('./config');

let server = new koa();
server.listen(config.PORT);
console.log(`server running at ${config.PORT}`);
server.context.db = database;
server.context.config = config;

let router = new Rouuter();


server.use(async(ctx, next) => {
    const HTTP_ROOT = ctx.config.HTTP_ROOT;
    try {
        await next();
        if (!ctx.body) {
            await ctx.render('/www/404', {
                HTTP_ROOT,

            })
        }
    } catch (e) {

        await ctx.render('/www/404', {
            HTTP_ROOT,

        })
    }



})

/*router.use(async(ctx, next) => {
    try {
        await next();
    } catch (e) {
        ctx.throw(500, 'Internal Server Error');
    }

});*/

router.use('/admin', require('./routers/admin'));
router.use('', require('./routers/www'));
static(router);

server.use(body({
    uploadDir: path.resolve(__dirname, './static/upload')
}));

server.keys = fs.readFileSync('./.keys').toString().split('\n');
server.use(session({
    maxAge: 60 * 24 * 60 * 1000,
    renew: true
}, server));

ejs(server, {
    root: path.resolve(__dirname, './template'),
    layout: false,
    viewExt: 'ejs',
    cache: false,
    debug: false,
});
server.use(router.routes());