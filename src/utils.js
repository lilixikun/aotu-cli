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
 * 写入文件
 * @param {*} dirName 
 * @param {*} result 
 * @param {*} spinner 
 */
function writeFile(dirName, result, spinner) {
    fs.writeFile(`${dirName}.ts`, result, 'utf-8', function (err) {
        if (err) {
            spinner.fail(chalk.red('生成接口文档失败 😭'))
            process.exit(-1)
        }
        spinner.succeed(`${chalk.green(`生成文档${dirName}.ts 成功 😄`)}`)
    })
}

module.exports = {
    checkAppName: checkAppName,
    writeFile: writeFile,
    isURL: isURL
}