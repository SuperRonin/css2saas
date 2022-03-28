const fs = require('fs');
const path = require('path');
const consola = require('consola')
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
            if (filename.split('.').pop().toLowerCase() === format && filename.split('.')[1] !== 'skeleton') {

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

                var otherStr = ''

                // 保留外部引用
                var importReg = new RegExp(`@import.*?("|');`, 'g');
                var importFilter = importReg[Symbol.matchAll](data); //import语法 TODO font字体
                importFilter = Array.from(importFilter, (x) => x[0]).join('')
                data = data.replace(importReg, '');



                new CleanCSS({
                  format: {
                    semicolonAfterLastProperty: true
                  },
                  returnPromise: true
                })
                  .minify(data)
                  .then(function (output) {
                    data = output.styles

                    // 保留keyframe
                    var keyframeReg = /@keyframes.*?}}/g
                    var keyframeFilter = keyframeReg[Symbol.matchAll](data);
                    keyframeFilter = Array.from(keyframeFilter, (x) => x[0]).join('')
                    data = data.replace(keyframeReg, '');

                    // 保留font-face
                    var fontFaceReg = /@font-face.*?}/g
                    var fontFaceFilter = fontFaceReg[Symbol.matchAll](data);
                    fontFaceFilter = Array.from(fontFaceFilter, (x) => x[0]).join('')
                    data = data.replace(fontFaceReg, '');

                    otherStr = importFilter + '\n' + keyframeFilter + '\n' + fontFaceFilter + '\n'

                    // console.log(otherStr)
                    // console.log(data)

                    const result = otherStr + parseCSS(data, settings)
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

  consola.success('任务执行完毕')
}

/**
 * 删除指定后缀文件
 * @param {*} path 
 * @param {*} suffix 
 */
function delFiles(dir, suffix) {
  const ergodicDir = function (dir, suffix) {
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
            if (filename.split('.').pop().toLowerCase() === suffix && filename.split('.')[1] !== 'skeleton') {
              fs.unlinkSync(filedir);
            }
          }
          isDir && ergodicDir(filedir, suffix); //递归，如果是文件夹，就继续遍历该文件夹下面的文件
        })
      });
    });
  }

  ergodicDir(dir, suffix)
  consola.success('任务执行完毕')
}

module.exports = {
  extractFiles: extractFiles,
  delFiles: delFiles
}