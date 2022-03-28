一款将css转换为scss的工具

#### 使用

```
npm i css-pipe-all

yarn add css-pipe-all
```

#### 目前实现功能
- 支持去除注释（选择器内/外）
- 支持指定缩进2、4个空格
- 支持批量删除无用文件

#### 可选参数t

|  参数   | 含义  |
|  ----  | ----  |
| wxss  | 文件后缀 |
| css   | 文件后缀 |
| acss  | 文件后缀 |
| ttss  | 文件后缀 |
ps: 理论上只要文件内容为标准css语法，任何文件后缀都可转换

#### 可选参数opt

|  参数   | 含义  |
|  ----  | ----  |
| delOut  | 去除选择器外层注释 |
| delIn  | 去除选择器内层注释 |
| tab2  | 缩进2个空格 |
| tab4  | 缩进4个空格 |
| delFile  | 删除指定后缀类型文件 |


#### 案例
- 现有index.wxss文件内容如下
```
/* Outside Comment 选择器外层注释 */
header {
    padding:20px;
}
header h1 { /* Nesting 选择器内层注释 */
    box-shadow: 0 0 0 rgba(0,0,0,0.9);
}
```


- 基础语法转换
```
# 执行命令
cssPipe run index -t wxss

# 转换结果

/*! Outside Comment 选择器外层注释 */
header {
  padding: 20px;
  h1 {
    /*! Nesting 选择器内层注释 */
    box-shadow: 0 0 0 rgba(0,0,0,.9);
  }
}
```
- 缩进为4个空格
```
# 命令
cssPipe run index -t wxss -opt tab4

# 转换结果
/*! Outside Comment 选择器外层注释 */
header {
    padding: 20px;
    h1 {
        /*! Nesting 选择器内层注释 */
        box-shadow: 0 0 0 rgba(0,0,0,.9);
    }
}
```

- 删除选择器外层注释
```
# 命令
cssPipe run index -t wxss -opt delOut

# 转换结果
header {
  padding: 20px;
  h1 {
    /*! Nesting 选择器内层注释 */
    box-shadow: 0 0 0 rgba(0,0,0,.9);
  }
}
```
