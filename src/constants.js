const {version} = require('../package.json')

// 存储模板位置 判断系统类型
const downloadName = `${process.env[process.platform === 'darwin' ? 'HOME' : 'USERPROFILE']}/.template`



module.exports = {
  version,
  downloadName
}