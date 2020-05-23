const Router = require('koa-router');
const fs = require('await-fs');
const _fs = require('fs');
const path = require('path');
const common = require('../../common');
const config = require('../../config');
const session = require('koa-session');
let router = new Router();
router.get('/login', async ctx => {
    await ctx.render('/admin/login', { errmsg: ctx.query.errmsg, HTTP_ROOT: ctx.config.HTTP_ROOT });
});
router.post('/login', async ctx => {
    let { username, password } = ctx.request.fields;
    let admins = JSON.parse((await fs.readFile(
        path.resolve(__dirname, '../../admins.json')
    )).toString());

    function findAdmin(username) {
        let a = null;
        admins.forEach(admin => {
            if (admin.username == username)
                a = admin;
        });
        return a;
    }
    let admin = findAdmin(username);
    if (!admin) {
        ctx.redirect(`${config.HTTP_ROOT}/admin/login?errmsg=${encodeURIComponent('用户不存在')}`);
    } else if (admin.password != common.md5(password)) {
        ctx.redirect(`${config.HTTP_ROOT}/admin/login?errmsg=${encodeURIComponent('密码不对')}`);
    } else {
        ctx.session['admin'] = username;
        ctx.redirect(`${ctx.config.HTTP_ROOT}/admin/`);
    };
});
router.all("*", async(ctx, next) => {
    if (ctx.session['admin']) {
        await next();
    } else {
        ctx.redirect(`${ctx.config.HTTP_ROOT}/admin/login`);
    }
});
router.get('/', async ctx => {
    let { HTTP_ROOT } = ctx.config;
    ctx.redirect(`${HTTP_ROOT}/admin/banner`);
})
router.get('/banner', async(ctx, next) => {
    const HTTP_ROOT = ctx.config.HTTP_ROOT;
    const table = 'banner_table';
    let datas = await ctx.db.query(`SELECT * FROM ${table}`);
    await ctx.render('admin/view', {
        action: `${HTTP_ROOT}/admin/banner`,
        HTTP_ROOT,
        datas,
        fields: [
            { title: '标题', name: 'title', type: 'text' },
            { title: '图片', name: 'src', type: 'file' },
            { title: '链接', name: 'href', type: 'text' },
            { title: '序号', name: 'serial', type: 'number' }
        ]
    });
});
router.post('/banner', async ctx => {
    const HTTP_ROOT = ctx.config.HTTP_ROOT;
    let { title, src, href, serial } = ctx.request.fields;
    src = path.basename(src[0].path);
    ctx.db.query('INSERT INTO banner_table (title,src,href,serial) VALUES(?,?,?,?)', [title, src, href, serial])
    ctx.redirect(`${HTTP_ROOT}/admin/banner`);
});
router.get('/banner/delete/:id', async ctx => {
    let { id } = ctx.params;
    let { UPLOAD_DIR } = ctx.config;
    let { HTTP_ROOT } = ctx.config;
    let data = await ctx.db.query(`SELECT * FROM banner_table WHERE ID=?`, [id]);
    if (data.length == 0) {
        ctx.body = 'no this data'
    } else {
        let row = data[0];
        await ctx.db.query('DELETE FROM banner_table WHERE ID=?', [id]);
        fs.unlink(path.resolve(UPLOAD_DIR, row.src));
        ctx.redirect(`${HTTP_ROOT}/admin/banner`);
    }
});
router.post('/banner/modify/:id', async ctx => {
    const HTTP_ROOT = ctx.config.HTTP_ROOT;
    let { UPLOAD_DIR } = ctx.config;
    let { id } = ctx.params;


    let { title, src, href, serial } = ctx.request.fields;
    src = path.basename(src[0].path);



    ctx.db.query('UPDATE banner_table SET ID=?,title=?,src=?,href=?,serial=? WHERE ID=?', [id, title, src, href, serial, id]);


    ctx.redirect(`${HTTP_ROOT}/admin/banner`);



});
router.get('/banner/modify/:id', async ctx => {
    /* let { id } = ctx.params;
  
     const HTTP_ROOT = ctx.config.HTTP_ROOT;
     const table = 'banner_table';

     let datas = await ctx.db.query(`SELECT * FROM ${table} WHERE ID=?`, [id]);
     await ctx.render('admin/table', {
         action: ``,
         HTTP_ROOT,
         datas,
         type: 'modify',
         fields: [
             { title: '标题', name: 'title', type: 'text' },
             { title: '图片', name: 'src', type: 'file' },
             { title: '链接', name: 'href', type: 'text' },
             { title: '序号', name: 'serial', type: 'number' }
         ],
     });*/
    const HTTP_ROOT = ctx.config.HTTP_ROOT;
    const table = 'banner_table';
    let { id } = ctx.params;

    let data = await ctx.db.query(`SELECT * FROM ${table} WHERE ID=?`, [id]);
    let datas = data[0];

    await ctx.render('admin/xiugai', {
        id,
        datas,

        HTTP_ROOT,
        fields: [
            { title: '标题', name: 'title', type: 'text' },
            { title: '图片', name: 'src', type: 'file' },
            { title: '链接', name: 'href', type: 'text' },
            { title: '序号', name: 'serial', type: 'number' }
        ]
    });



});

/*function unlink(path) {
    return new Promise((resolve, reject) => {
        fs.unlink(path, (error) => {
            if (error) {
                reject(error);

            } else {
                resolve();
            }
        });

    });
}*/




router.get('/catalog', async ctx => {
    const HTTP_ROOT = ctx.config.HTTP_ROOT;
    const table = 'catalog_table';

    let datas = await ctx.db.query(`SELECT * FROM ${table}`);
    await ctx.render('admin/catalog', {
        action: `${HTTP_ROOT}/admin/catalog`,
        HTTP_ROOT,
        datas,


        fields: [
            { title: '类别', name: 'title', type: 'text' },

        ]
    });

});

router.get('/catalog/delete/:id', async ctx => {
    let { id } = ctx.params;
    let { UPLOAD_DIR } = ctx.config;

    let { HTTP_ROOT } = ctx.config;
    let data = await ctx.db.query(`SELECT * FROM catalog_table WHERE ID=?`, [id]);
    if (data.length == 0) {
        ctx.body = 'no this data'

    } else {


        let row = data[0];

        await ctx.db.query('DELETE FROM catalog_table WHERE ID=?', [id]);


        ctx.redirect(`${HTTP_ROOT}/admin/catalog`);

    }




});

router.post('/catalog', async ctx => {
    const HTTP_ROOT = ctx.config.HTTP_ROOT;
    let { title } = ctx.request.fields;



    ctx.db.query('INSERT INTO catalog_table (title) VALUES(?)', [title])
    ctx.redirect(`${HTTP_ROOT}/admin/catalog`);


});

router.get('/catalog/modify/:id', async ctx => {
    const HTTP_ROOT = ctx.config.HTTP_ROOT;
    let { id } = ctx.params;
    let data = await ctx.db.query('SELECT * FROM catalog_table WHERE ID=?', [id]);
    datas = data[0];
    await ctx.render('admin/catalog_modify', {
        id,
        datas,
        HTTP_ROOT,
        fields: [
            { title: '类别', name: 'title', type: 'text' },

        ]

    })

});

router.post('/catalog/modify/:id', async ctx => {
    let HTTP_ROOT = ctx.config.HTTP_ROOT;
    let { id } = ctx.params;
    let { title } = ctx.request.fields;
    await ctx.db.query('UPDATE catalog_table SET title=? WHERE ID=?', [title, id]);
    ctx.redirect(`${HTTP_ROOT}/admin/catalog`);


});






router.get('/article', async ctx => {
    let { HTTP_ROOT } = ctx.config;
    let datas = await ctx.db.query('SELECT * FROM article_table');
    let data1 = await ctx.db.query('SELECT * FROM catalog_table');
    await ctx.render('admin/article', {
        data1,
        datas,
        HTTP_ROOT,
        action: `${HTTP_ROOT}/admin/article`,
        fields: [
            { title: '标题', name: 'title', type: 'text' },
            { title: '图片', name: 'list_img_src', type: 'file' },
            { title: '浏览量', name: 'view', type: 'text' },
            { title: '评论量', name: 'comment', type: 'text' },
            { title: '分类', name: 'catalog_ID', type: 'select' },
            { title: '发表时间', name: 'created_time', type: 'date' },
            { title: '作者', name: 'author', type: 'text' },
            { title: '描述', name: 'summary', type: 'text' },
            { title: '内容', name: 'content', type: 'textarea' },



        ],
    })




});
router.post('/article', async ctx => {
    const HTTP_ROOT = ctx.config.HTTP_ROOT;
    let { title, catalog_ID, list_img_src, view, comment, created_time, author, summary, content } = ctx.request.fields;
    src = path.basename(list_img_src[0].path);
    let created_time2 = created_time.toString();
    await ctx.db.query('INSERT INTO  article_table (title,catalog_ID,list_img_src,view,comment,created_time,author,summary,content) VALUES(?,?,?,?,?,?,?,?,?)', [title, catalog_ID, src, view, comment, created_time2, author, summary, content]);
    await ctx.redirect(`${HTTP_ROOT}/admin/article`);
});
router.get('/article/delete/:id', async ctx => {
    const HTTP_ROOT = ctx.config.HTTP_ROOT;
    let { id } = ctx.params;
    await ctx.db.query('DELETE FROM article_table WHERE ID=?', [id]);
    ctx.redirect(`${HTTP_ROOT}/admin/article`);


});
router.get('/article/modify/:id', async ctx => {
    const HTTP_ROOT = ctx.config.HTTP_ROOT;
    let { id } = ctx.params;
    let data = await ctx.db.query('SELECT * FROM article_table WHERE ID=?', [id]);
    let datas = data[0];
    await ctx.render('admin/article_modify', {
        id,
        HTTP_ROOT,
        datas,
        fields: [
            { title: '标题', name: 'title', type: 'text' },
            { title: '分类', name: 'catalog_ID', type: 'select' },
            { title: '图片', name: 'list_img_src', type: 'file' },
            { title: '浏览量', name: 'view', type: 'text' },
            { title: '评论量', name: 'view', type: 'text' },
            { title: '发表时间', name: 'created_time', type: 'date' },
            { title: '作者', name: 'author', type: 'text' },
            { title: '描述', name: 'summary', type: 'text' },
            { title: '内容', name: 'content', type: 'textarea' },



        ],

    })




});

router.post('/article/modify/:id', async ctx => {
    const HTTP_ROOT = ctx.config.HTTP_ROOT;
    let { id } = ctx.params;
    let { title, catalog_ID, list_img_src, view, comment, created_time, author, summary, content } = ctx.request.fields;
    src = path.basename(list_img_src[0].path);
    created_time1 = created_time.toString();
    await ctx.db.query('UPDATE article_table SET title=?,catalog_ID=?,list_img_src=?,view=?，comment=?,created_time=?,author=?,summary=?,content=? WHERE ID=?', [title, catalog_ID, src, , view, comment, created_time1, author, summary, content, id]);
    ctx.redirect(`${HTTP_ROOT}/admin/article`);



});





router.get('/users', async ctx => {
    const HTTP_ROOT = ctx.config.HTTP_ROOT;
    let datas = await ctx.db.query('SELECT * FROM user_table ');
    await ctx.render('admin/users', {
        action: `${HTTP_ROOT}/admin/users`,
        datas,
        HTTP_ROOT,
        fields: [
            { title: '用户名', name: 'name', type: 'text' },
            { title: '密码', name: 'password', type: 'text' }
        ]
    })
});
router.post('/users', async ctx => {
    const HTTP_ROOT = ctx.config.HTTP_ROOT;
    let { name, password } = ctx.request.fields;
    await ctx.db.query(`INSERT INTO user_table (name,password) VALUES(?,?)`, [name, password]);
    await ctx.redirect(`${HTTP_ROOT}/admin/users`)
});
router.get('/users/delete/:id', async ctx => {
    const HTTP_ROOT = ctx.config.HTTP_ROOT;
    let { id } = ctx.params

    await ctx.db.query('DELETE FROM user_table WHERE name=?', [id]);
    await ctx.redirect(`${HTTP_ROOT}/admin/users`);
});

router.get('/users/modify/:id', async ctx => {
    const HTTP_ROOT = ctx.config.HTTP_ROOT;
    let { id } = ctx.params

    let data = await ctx.db.query('SELECT * FROM user_table WHERE name=?', [id]);
    let datas = data[0];
    await ctx.render('admin/users_modify', {
        id,
        HTTP_ROOT,
        datas,
        fields: [
            { title: '用户名', name: 'name', type: 'text' },
            { title: '密码', name: 'password', type: 'text' }
        ]

    })


});
router.post('/users/modify/:id', async ctx => {
    const HTTP_ROOT = ctx.config.HTTP_ROOT;
    let { name, password } = ctx.request.fields;
    await ctx.db.query('UPDATE user_table SET name=?,password=?', [name, password]);
    await ctx.redirect(`${HTTP_ROOT}/admin/users`);




});
router.get('/quit', async ctx => {
    const HTTP_ROOT = ctx.config.HTTP_ROOT;

    ctx.session['admin'] = null;

    await ctx.redirect(`${HTTP_ROOT}`);

})







module.exports = router.routes();