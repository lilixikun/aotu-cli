const axios = require('axios')

const koa = require('koa')
const Router = require('koa-router')
const static = require('koa-static')

const render = require('koa-swig')
const { wrap } = require('co')
let bodyparser = require('koa-bodyparser');

const fs = require('fs')
const { exec } = require('child_process')
const url = require('url')
const path = require('path')
const ora = require('ora')
const chalk = require('chalk')
const json2ts = require('json2ts')
const xshell = require('shelljs')


const viewDir = path.join(__dirname, '..', 'views')

function createServer() {
    const app = new koa()

    app.use(static(`${viewDir}/static`))
    app.context.render = wrap(
        render({
            root: viewDir,
            autoescape: true,
            cache: false,
            ext: 'html',
            varControls: ['[[', ']]'],
            writeBody: false,
        })
    );
    const router = new Router()

    router.get('/', async (ctx) => {
        ctx.body = await ctx.render('index', {
            data: 'aotu',
        });
    })

    router.post('/download', async (ctx) => {
        const { list } = ctx.request.body

        const promises = []
        list.forEach(({ dirName, url }) => {
            const promise = new Promise((resolve) => {
                axios.get(url)
                    .then(res => resolve({ data: res.data, dirName: dirName }))
                    .catch(resolve);
            });
            promises.push(promise);
        });

        Promise.all(promises).then((datas) => {
            for (const data of datas) {
                generateTsJson(data.data, data.dirName)
            }
        }).finally(() => {
            //process.exit(-1)
            ctx.body = 'success'
        })
    })

    // 启动路由
    app.use(bodyparser());
    app.use(router.routes());

    app.listen(8088, () => {
        console.log('启动成功 🍺');

        const localhost = 'http://127.0.0.1:8088/'
        switch (process.platform) {
            //mac系统使用 一下命令打开url在浏览器
            case "darwin":
                exec(`open ${localhost}`);
            //win系统使用 一下命令打开url在浏览器
            case "win32":
                exec(`start ${localhost}`);
            // 默认mac系统
            default:
                exec(`open ${localhost}`);
        }
    })


}

createServer()

// http.createServer(function (req, res) {
//     if (req.url === "/") {
//         const pathname = `${path.join(process.cwd(), '../')}views/index.html`
//         fs.exists(pathname, function (exists) {
//             if (exists) {
//                 res.writeHead(200, { "Content-Type": "text/html" });
//             }
//             fs.readFile(pathname, function (err, data) {
//                 console.log(data);
//                 if (err) {
//                     console.log("服务异常");
//                     process.exit(-1)
//                 }
//                 res.end(data)
//             })
//         })
//     } else if (req.url === "/download") {

//         var str = '';
//         var body
//         req.on('data', function (data) {
//             str += data;
//         });

//         req.on('end', function () {
//             body = JSON.parse(str);
//             const promises = [];
//             body.forEach(item => {
//                 const promise = new Promise((resolve) => {
//                     axios.get(item.url)
//                         .then(resolve)
//                         .catch(resolve);
//                 });
//                 promises.push(promise);
//             });

//             Promise.all(promises).then((datas) => {
//                 for (const data of datas) {
//                     generateTsJson(data)
//                 }
//             }).finally(() => {
//                 process.exit(-1)
//             })
//         });
//     }
//     else {
//         res.end("404")
//     }

// }).listen(8088, "127.0.0.1")

// // 自动打开默认浏览器
// cp.exec('start http://127.0.0.1:8088/');

function generateTsJson(jsonContent, dirName) {

    const spinner = ora(`⏰ ${chalk.gray(`正在生成接口文档中${dirName} ⌛️`)}`).start();

    const result = json2ts.convert(JSON.stringify(jsonContent, null, 4))
    try {
        const dir = `${process.cwd()}/docs`

        if (fs.existsSync(dir)) {
            console.log(dir);
            xshell.cd(dir)
            fs.writeFile(`${dirName}.ts`, result, 'utf-8', function (err) {
                if (err) {
                    spinner.fail(chalk.red('生成接口文档失败 😭'))
                }
                spinner.succeed(`${chalk.green(`生成文档${dirName}.ts 成功 😄`)}`)
            })
        } else {
            fs.mkdirSync('docs')
            xshell.cd(dir)
            fs.writeFile(`${dirName}.ts`, result, 'utf-8', function (err) {
                if (err) {
                    spinner.fail(chalk.red('生成接口文档失败 😭'))
                }
                spinner.succeed(`${chalk.green(`生成文档${dirName}.ts 成功 😄`)}`)
            })
        }
    } catch (error) {
        spinner.fail(chalk.red('生成接口文档失败 😭'))
        process.exit(-1)
    }
}

// http://ip-api.com/json/ 接口地址