const fs = require('fs')
const chalk = require('chalk')
const ora = require('ora')
const json2ts = require("json2ts");

function isURL(url) {
    const reg = /(http|https):\/\/([\w.]+\/?)\S*/
    if (!url) {
        console.log(chalk.red('请填写接口地址 🙏'));
        process.exit(-1)
    } else if (!reg.test(url)) {
        console.log(chalk.red('请输入有效的接口地址 🙏'));
        process.exit(-1)
    }
}

/**
 * 检测项目目录是否存在
 * @param {*} dir 
 * @param {*} name 
 */
function checkAppName(dir, name) {
    let isExists = fs.existsSync(dir)
    if (isExists) {
        console.log(chalk.red.bold(`The ${name} project already exists in  directory. Please try to use another projectName`));
        process.exit(-1)
    }
}

/**
 * 根据url 生成 ts 类
 * @param {*} jsonurl 接口地址
 * @param {*} projectPath 项目地址
 */
function generateTsJson(jsonurl, projectPath) {

    const spinner = ora(`⏰ ${chalk.gray('正在生成接口文档中 ⌛️')}`).start();

    const jsonContent = {
        "name": 'xikun',
        "list": [
            {
                "name": '小孩',
                "age": 12
            },
            {
                "name": '小孩',
                "age": 12
            }
        ],
        data: {
            "version": 1.1,
            "len": 20,
            "height": "22cm"
        }
    }
    const result = json2ts.convert(JSON.stringify(jsonContent, null, 4))
    try {
        const path = `${projectPath}/docs/${+new Date().ts}`
        fs.writeFileSync(path, result, 'utf-8');
        spinner.succeed(`${chalk.green('下载成功 😄')}`)
    } catch (error) {
        spinner.fail(chalk.red('生成接口文档失败 😭'))
        process.exit(-1)
    }
}

module.exports = {
    checkAppName: checkAppName,
    generateTsJson: generateTsJson,
    isURL: isURL
}