const http = require('http')
const axios = require('axios')
const fs = require('fs')
const cp = require('child_process')
const url = require('url')
const path = require('path')

http.createServer(function (req, res) {
    if (req.url === "/") {
        const pathname = `${path.join(process.cwd(), '../')}views/index.html`
        fs.exists(pathname, function (exists) {
            if (exists) {
                res.writeHead(200, { "Content-Type": "text/html" });
            }
            fs.readFile(pathname, function (err, data) {
                console.log(data);
                if (err) {
                    console.log("服务异常");
                    process.exit(-1)
                }
                res.end(data)
            })
        })
    } else if (req.url === "/download") {

        var str = '';
        var body
        req.on('data', function (data) {
            str += data;
        });

        req.on('end', function () {
            body = JSON.parse(str);
            const promises = [];
            body.forEach(item => {
                const promise = new Promise((resolve) => {
                    axios.get(item.url)
                        .then(resolve)
                        .catch(resolve);
                });
                promises.push(promise);
            });

            Promise.all(promises).then((datas) => {
                for (const data of datas) {
                    generateTsJson(data)
                }
            }).finally(() => {
                process.exit(-1)
            })
        });
    }
    else {
        res.end("404")
    }

}).listen(8088, "127.0.0.1")

// 自动打开默认浏览器
cp.exec('start http://127.0.0.1:8088/');


function generateTsJson(jsonContent, dirName) {

    const spinner = ora(`⏰ ${chalk.gray(`正在生成接口文档中${dirName} ⌛️`)}`).start();

    const result = json2ts.convert(JSON.stringify(jsonContent, null, 4))
    try {
        const path = `${process.cwd()}/docs/${dirName.ts}`
        fs.writeFileSync(path, result, 'utf-8');
        spinner.succeed(`${chalk.green(`生成文档${dirName}.ts 成功 😄`)}`)
    } catch (error) {
        spinner.fail(chalk.red('生成接口文档失败 😭'))
        process.exit(-1)
    }
}

// http://ip-api.com/json/ 接口地址