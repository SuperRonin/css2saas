const fs = require('fs');
const path = require('path');
const { parseCSS } = require('./script2')

var CleanCSS = require('clean-css');


let arr = []
function extractFiles(dirname, suffix, settings) {

  const ergodicDir = (Path, format) => {
    fs.readdir(Path, (err, files) => {
      err && console.warn('路径读取出错', err);
      //遍历读取到的文件列表
      files.forEach((filename) => {
        let filedir = path.join(Path, filename);//完整的路径

        //根据文件路径获取文件信息，返回一个fs.Stats对象
        fs.stat(filedir, (error, stats) => {
          error && console.warn('获取文件stats失败', error);
          let isFile = stats.isFile(); //是文件
          let isDir = stats.isDirectory(); //是文件夹
          if (isFile) {
            if (filename.split('.').pop().toLowerCase() === format) {

              arr.push(`${filedir}`)
              // 删除文件 TODO

              // 转为scss
              fs.readFile(filedir, 'utf-8', function (err, data) {
                if (err) {
                  console.error(err)
                  fs.writeFileSync(__dirname, err)
                  return
                }
                data = data.replace(/\/\*/g, '/*!')
                new CleanCSS({ returnPromise: true })
                .minify(data)
                .then(function (output) {
                  fs.writeFileSync(path.join(Path, filename.split('.')[0] + '.scss'), parseCSS(output.styles, settings))
                });
              })
            }
          }
          isDir && ergodicDir(filedir, format); //递归，如果是文件夹，就继续遍历该文件夹下面的文件
        })
      });
    });
  }

  let Path = path.resolve(`./${dirname}`);//获取绝对路径
  ergodicDir(Path, suffix);
}

/**
 * 删除指定后缀文件
 * @param {*} path 
 * @param {*} suffix 
 */
 function delFiles(dir, suffix) {
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

module.exports = {
  extractFiles: extractFiles,
  delFiles: delFiles
}