const fs = require('fs');
const path = require('path');
var CleanCSS = require('clean-css');
const { extractFiles } = require('../lib/io.js')

// const dirName = '/index.wxss'; //要转换的文件路径
// fs.readFile(path.join(__dirname, dirName), 'utf-8', function (err, data) {
//   if (err) {
//     console.error(err)
//     return
//   }

//   data = data.replace(/\/\*/g, '/*!')

//   new CleanCSS({ returnPromise: true })
//   .minify(data)
//   .then(output => {
//     console.log('output', output);
//   })
// })
delFile('test', 'wxss')
function delFile(dir, suffix) {
  fs.readdir(path.resolve(dir), (err, files) => {
    err && console.warn('路径读取出错', err);
    //遍历读取到的文件列表
    files.forEach((filename) => {
      let filedir = path.join(dir, filename);//完整的路径

      //根据文件路径获取文件信息，返回一个fs.Stats对象
      fs.stat(filedir, (error, stats) => {
        error && console.warn('获取文件stats失败', error);
        let isFile = stats.isFile(); //是文件
        let isDir = stats.isDirectory(); //是文件夹
        if (isFile) {
          if (filename.split('.').pop().toLowerCase() === suffix) {
            fs.unlinkSync(filedir);
          }
        }
        isDir && ergodicDir(filedir, format); //递归，如果是文件夹，就继续遍历该文件夹下面的文件
      })
    });
  });
}




