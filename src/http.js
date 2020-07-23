const axios = require('axios')

const koa = require('koa')
const Router = require('koa-router')
const static = require('koa-static')

const render = require('koa-swig')
const { wrap } = require('co')
let bodyparser = require('koa-bodyparser');

const fs = require('fs')
const { exec } = require('child_process')

const path = require('path')
const ora = require('ora')
const chalk = require('chalk')
const json2ts = require('json2ts')
const xshell = require('shelljs')
const cors = require('koa2-cors');

const { writeFile } = require('./utils')


const viewDir = path.join(__dirname, '..', 'views')

// 保存目录
const dir = `${process.cwd()}/docs`

function createServer() {
    const app = new koa()

    app.use(static(`${viewDir}`))
    app.use(cors());
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
        const { list = [] } = ctx.request.body

        const spinner = ora(`⏰ ${chalk.gray(`正在生成接口文档中 ⌛️`)}`).start();
        const promises = []
        list.forEach(({ dirName, url }) => {
            const promise = new Promise((resolve) => {
                axios.get(url)
                    .then(res => resolve({ data: res.data, dirName: dirName }))
                    .catch(resolve);
            });
            promises.push(promise);
        });

        try {
            const datas = await Promise.all(promises)
            for (const data of datas) {
                await generateTsJson(data.data, data.dirName, spinner)
            }
            ctx.body = {
                status: 200
            }
            setTimeout(() => {
                process.exit()
            }, 1500);
        } catch (error) {
            console.log(error);
            spinner.fail(chalk.red('生成接口文档失败 😭'))
            process.exit(-1)
        }

    })

    // 启动路由
    app.use(bodyparser());
    app.use(router.routes());

    app.listen(8088, () => {
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

function generateTsJson(jsonContent, dirName, spinner) {

    const result = json2ts.convert(JSON.stringify(jsonContent, null, 4))
    try {
        //  判断是否存在目录
        if (fs.existsSync(dir)) {
            xshell.cd(dir)
            writeFile(dirName, result, spinner)
        } else {
            fs.mkdirSync('docs')
            xshell.cd(dir)
            writeFile(dirName, result, spinner)
        }
    } catch (error) {
        console.log(error);
        spinner.fail(chalk.red('生成接口文档失败 😭'))
        process.exit(-1)
    }
}


module.exports = createServer

// 测试接口
// http://ip-api.com/json/ 