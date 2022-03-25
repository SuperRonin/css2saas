const fs = require('fs');
const path = require('path');
const minifiers = require('css-minifiers');
const csso = minifiers.csso;

const dirName = '/index.wxss'; //要转换的文件路径
fs.readFile(path.join(__dirname, dirName), 'utf-8', function (err, data) {
  if (err) {
    console.error(err)
    return
  }

  csso(data).then(function (output) {
    // 当前目录生成编译后的scss文件
    fs.writeFileSync(path.join(__dirname, 'index.scss'), parseCSS(output))
  })
})