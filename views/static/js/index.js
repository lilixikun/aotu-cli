
const a = 123;
const b = 456;
console.log(a + b);

const data = {
    "list": [{
        "dirName": "测试",
        "url": "http://ip-api.com/json/"
    }],
    name: 'xikun'

}

fetch('/download', {
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
    method: 'post'
})