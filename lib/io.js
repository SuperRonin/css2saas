const fs = require('fs');
const path = require('path');
const { parseCSS } = require('./script')
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

              // 转为scss
              fs.readFile(filedir, 'utf-8', function (err, data) {
                if (err) {
                  console.error(err)
                  fs.writeFileSync(__dirname, err)
                  return
                }

                // 保留注释
                data = data.replace(/\/\*/g, '/*!')

                // 保留外部引用
                var importReg = new RegExp(`@import.*?${suffix}("|');`, 'g');
                var importFilter = importReg[Symbol.matchAll](data); //import语法 TODO font字体
                importFilter = Array.from(importFilter, (x) => x[0]).join('')
                data = data.replace(importReg, '');

                

                new CleanCSS({ returnPromise: true })
                .minify(data)
                .then(function (output) {

                  // 保留keyframe
                  var keyframeReg = /@keyframes.*?}}/g
                  var keyframeFilter = keyframeReg[Symbol.matchAll](output.styles); //import语法 TODO font字体
                  keyframeFilter = Array.from(keyframeFilter, (x) => x[0]).join('')
                  importFilter += '\n' + keyframeFilter
                  output.styles = output.styles.replace(keyframeReg, '');

                  console.log(importFilter)
                  console.log(output.styles)

                  const result = importFilter + '\n' + parseCSS(output.styles, settings)
                  fs.writeFileSync(path.join(Path, filename.split('.')[0] + '.scss'), result)
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
   const ergodicDir = function(dir, suffix) {

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
          isDir && ergodicDir(filedir, suffix); //递归，如果是文件夹，就继续遍历该文件夹下面的文件
        })
      });
    });
  }

  ergodicDir(dir, suffix)
}

module.exports = {
  extractFiles: extractFiles,
  delFiles: delFiles
}