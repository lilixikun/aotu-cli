const fs = require('fs')

const xshell = require('shelljs')

const dir = '/Users/xikun/Documents/xikun/git/xk-web-cli/docs'
if (fs.existsSync(dir)) {
    console.log(111);
} else {
    fs.mkdirSync('docs')
    xshell.cd(dir)
    fs.writeFile("ceshi.ts", "Hello World!", function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("File saved successfully!");
    })
}