const commander = require('commander');
const inquirer = require('inquirer')
const figlet = require('figlet');
const Printer = require('@darkobits/lolcatjs')
const chalk = require('chalk')
const shell = require('shelljs')
const ora = require('ora');
const download = require('download-git-repo');
const versionStr = figlet.textSync('Aotu');

const questions = require('./prompt')
const { version, name } = require('../package.json');
const { checkAppName } = require('./utils')
const createServer = require('./http')

let projectName;
let projectPath;

const program = new commander.Command(name)

program.version(
    Printer.default.fromString(
        `   \n      席坤的手架${version}\n    www.47.98.161.153:8082 \n${versionStr}`
    ), '-v, --version')


program.option('init', '初始化项目🔧', 'blue')
    .option('json2ts', '输入接口地址,自动生成TypeScript类 🥱')
    .option('-i,--info', 'print environment debug logs 🪂')

const bindHandler = {
    init() {
        inquirer.prompt(questions).then(answers => {
            projectName = answers.projectName
            const _pwd = process.cwd();
            // 用户全路径
            projectPath = `${_pwd}/${projectName}`;
            // 检查路径是否存在
            checkAppName(projectPath, projectName)

            const spinner = ora(`⏰ ${chalk.red('downloading template')}`).start();
            // 项目模版地址
            const url = `direct:https://github.com/LiLixikun/${answers.jskind}.git`;
            // 执行下载任务
            download(url, projectPath, { clone: true }, function (err) {
                spinner.stop();
                if (err) {
                    console.log(chalk.red('下载失败 😭'));
                    process.exit(-1)
                } else {
                    spinner.succeed(`${chalk.green('下载成功 😄')}`)
                    // 修改项目名称
                    shell.sed(
                        '-i',
                        'aotu',
                        projectName,
                        projectPath + '/package.json'
                    );
                }
            });

        }).catch(error => {
            console.log(chalk.red('脚手架出现异常,请联系 xx 📧'));
        })
    },
    json2ts() {
        createServer()
    },
    info() {
        console.log(chalk.bold('\n Auto Info:'));
        console.log(`\n 当前版本 ${chalk.yellow(name)}:${chalk.bold(version)}`);
    }
}

program
    .usage(`${chalk.green('<cmd>')} <options>`)
    .arguments('<cmd> [env]')
    .action(function (cmd, ages) {
        const handler = bindHandler[cmd];
        if (typeof handler === 'undefined') {
            ora(chalk.red(`命令${cmd}:`) + chalk.red('暂未支持')).fail();
        } else {
            handler(ages);
        }
    });

try {
    program.parse(process.argv);
} catch (error) {
    console.log(error);
    console.log(chalk.red('脚手架出现异常,请联系 xx 📧'));
}
