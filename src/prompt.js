const prompt = [
    {
        type: 'input',
        name: 'projectName',
        message: '请输入项目命名😄',
        filter: function (val) {
            return val
        }
    },
    {
        type: 'list',
        name: 'jskind',
        message: '请选择使用的模板',
        default: 0,
        choices: [
            {
                name: 'ECMAScript6',
                value: 'es6',
                url: '123'
            }, {
                name: 'TypeScript',
                value: 'ts',
                url: '456'
            }
        ]
    }
]

module.exports = prompt