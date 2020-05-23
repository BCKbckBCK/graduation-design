const Router = require('koa-router');
let router = new Router();
router.get('/', async ctx => {
    let catalogs = await ctx.db.query('SELECT * FROM catalog_table');
    let banners = await ctx.db.query('SELECT * FROM banner_table');
    let articles = await ctx.db.query('SELECT * FROM article_table  ORDER BY created_time  DESC LIMIT 10');
    let articles1 = await ctx.db.query('SELECT * FROM article_table  ORDER BY comment  DESC LIMIT 6');
    let articles2 = await ctx.db.query('SELECT * FROM article_table');
    let date = new Date();
    let a = date.getTime();
    let date1 = new Date(2019, 12, 12);
    let b = date1.getTime();
    let c = Math.floor((a - b) / 86400000);
    session = ctx.session['user'];
    const HTTP_ROOT = ctx.config.HTTP_ROOT;
    await ctx.render('www/index', {
        session,
        articles2,
        c,
        articles1,
        articles,
        banners,
        catalogs,
        HTTP_ROOT
    });
});
router.get('/list/:id', async ctx => {
    let { id } = ctx.params;
    let datas = await ctx.db.query('SELECT * FROM catalog_table WHERE ID=?', [id]);
    let data = datas[0];
    let catalog = data.title;
    const HTTP_ROOT = ctx.config.HTTP_ROOT;
    let articles = await ctx.db.query('SELECT * FROM article_table WHERE catalog_ID=?', [id]);
    let articles1 = await ctx.db.query('SELECT * FROM article_table ORDER BY comment DESC LIMIT 5');






    let date = new Date();
    let a = date.getTime();
    let date1 = new Date(2019, 12, 12);
    let b = date1.getTime();
    let c = Math.floor((a - b) / 86400000);


    await ctx.render('www/list', {
        articles1,
        c,
        data,
        articles,
        catalog,
        HTTP_ROOT,
    });

});
router.get('/articledisplay/:id', async ctx => {

    const { HTTP_ROOT } = ctx.config;

    let { id } = ctx.params;
    let articles = await ctx.db.query('SELECT * FROM article_table WHERE ID=?', [id]);
    let article = articles[0];
    let catalogs = await ctx.db.query('SELECT * FROM catalog_table ');

    let datas = await ctx.db.query('SELECT * FROM catalog_table WHERE ID=?', [article.catalog_ID]);
    let articles2 = await ctx.db.query('SELECT * FROM article_table');

    let articles1 = await ctx.db.query('SELECT * FROM article_table ORDER BY comment DESC LIMIT 5');

    let comments = await ctx.db.query('SELECT * FROM comment_table WHERE article_ID=?', [id]);
    let arry = {
        view: `${article.view}`
    }


    let views = arry.view;
    let views1 = parseInt(views);
    let views2 = views1 + 1;
    await ctx.db.query('UPDATE article_table SET view=? WHERE ID=?', [views2, id]);



    let data = datas[0];
    let date = new Date();
    let a = date.getTime();
    let date1 = new Date(2019, 12, 12);
    let b = date1.getTime();
    let c = Math.floor((a - b) / 86400000);
    let number = 1;




    await ctx.render('www/article', {
        number,
        comments,
        articles2,
        articles1,
        c,
        data,
        views2,

        catalogs,

        article,
        HTTP_ROOT,
        errmsg: ctx.query.errmsg,



    });
});
router.get('/login', async ctx => {
    const HTTP_ROOT = ctx.config.HTTP_ROOT;

    await ctx.render('www/login', {
        HTTP_ROOT,
        errmsg: ctx.query.errmsg,
    })



})
router.post('/login', async ctx => {
    const HTTP_ROOT = ctx.config.HTTP_ROOT;

    let { username, password1 } = ctx.request.fields;

    let users = await ctx.db.query('SELECT * FROM user_table WHERE name=?', [username]);
    user = users[0];



    if (!user) {

        await ctx.redirect(`${HTTP_ROOT}/login?errmsg=${encodeURIComponent('用户不存在！')}`);



    } else {
        if (user.password != password1) {


            await ctx.redirect(`${HTTP_ROOT}/login?errmsg=${encodeURIComponent('密码错误！')}`);


        } else {
            ctx.session['user'] = user.name;

            await ctx.redirect(`${HTTP_ROOT}`);


        }


    }



});
router.get('/register', async ctx => {
    const HTTP_ROOT = ctx.config.HTTP_ROOT;

    await ctx.render('www/register', {
        HTTP_ROOT,
        errmsg: ctx.query.errmsg,
    });
})
router.post('/register', async ctx => {
    const HTTP_ROOT = ctx.config.HTTP_ROOT;
    let { username, password, password1 } = ctx.request.fields;
    let name1 = await ctx.db.query('SELECT * FROM user_table WHERE name=?', [username]);

    if (name1.length == 0) {
        if (password != password1) {
            await ctx.redirect(`${HTTP_ROOT}/register/?errmsg=${encodeURIComponent('两次密码不一致')}`)
        } else {
            await ctx.db.query('INSERT INTO user_table (name,password) VALUES(?,?)', [username, password]);
            await ctx.redirect(`${HTTP_ROOT}/register/?errmsg=${encodeURIComponent('success')}`);
        }
    } else {
        await ctx.redirect(`${HTTP_ROOT}/register/?errmsg=${encodeURIComponent('用户名已存在')}`)
    }




})
router.post('/search', async ctx => {
    const HTTP_ROOT = ctx.config.HTTP_ROOT;

    if (!ctx.session['user']) {

        await ctx.redirect(`${HTTP_ROOT}/login?errmsg=${encodeURIComponent('没有登录，不能使用搜索功能！')}`);
    }

    let { keyword } = ctx.request.fields;
    let articles = await ctx.db.query(`SELECT * FROM article_table WHERE summary LIKE "%${keyword}%" `);
    let articles1 = await ctx.db.query('SELECT * FROM article_table ORDER BY comment DESC LIMIT 10');

    let date = new Date();
    let a = date.getTime();
    let date1 = new Date(2019, 12, 12);
    let b = date1.getTime();
    let c = Math.floor((a - b) / 86400000);

    await ctx.render('www/search', {
        articles,
        articles1,
        HTTP_ROOT,
        c,


    })





});
router.post('/comment/:id', async ctx => {
    const HTTP_ROOT = ctx.config.HTTP_ROOT;

    if (!ctx.session['user']) {

        await ctx.redirect(`${HTTP_ROOT}/login?errmsg=${encodeURIComponent('没有登录，不能评论！')}`);
    } else {


        let { id } = ctx.params;
        let { name1, comment } = ctx.request.fields;
        let date = new Date();
        let user = await ctx.db.query('SELECT * FROM user_table WHERE name=?', [name1]);

        if (user.length == 0) {
            await ctx.redirect(`${HTTP_ROOT}/articledisplay/${id}?errmsg=${encodeURIComponent('123')}`);


        } else {
            let comments = await ctx.db.query('SELECT * FROM article_table WHERE ID=?', [id]);
            comments1 = comments[0];
            let comment1 = comments1.comment;
            comment1 = comment1 + 1;
            await ctx.db.query('UPDATE article_table SET comment=? WHERE ID=?', [comment1, id]);



            await ctx.db.query('INSERT INTO comment_table (article_ID,nickname,content,date) VALUES (?,?,?,?)', [id, name1, comment, date]);


            await ctx.redirect(`${HTTP_ROOT}/articledisplay/${id}`);
        }
    }


})
router.get('/quit', async ctx => {
    const HTTP_ROOT = ctx.config.HTTP_ROOT;
    ctx.session['user'] = null;
    await ctx.redirect(`${HTTP_ROOT}/`);

})

module.exports = router.routes();