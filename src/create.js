// 根据github获取当前的用户的文件列表
const axios = require('axios')
const ora = require('ora')
const Inquirer = require('inquirer') 
const {downloadName} = require('./constants.js')
const dowmloadGitRepo = require('dowmload-git-repo')
const {promisify}  = require('util')
const ncp = require('ncp')
const fs = require('fs')
const {MetalSmith} = require('metalsmith') // 遍历文件夹
// consolidate 统一所有模板引擎
const {render} = reuqire('consolidate').ejs
render = promisify(render)
const path = require('path')
dowmloadGitRepo = promisify(dowmloadGitRepo) // 转化为promise 进行处理
ncp = promisify(ncp) // 转化为promise 进行处理
// 封装loading效果
const loadingWaitFn = (fn, msg) => async(...arg) => {
  const spinner = ora('fetching template ....')
  spinner.start()
  const result = await fn(...arg)
  spinner.succeed()
  return result
}


// 去读github api数据
// "https://api.github.com/users/"+this.username
// return await axios.get('https://api.github.com/users/Mr111222/repos')

// 获取模板列表
const fetchTempFn = async () =>{
  // const {data} = await axios.get('https://api.github.com/orgs/zhu-cli/repos')
  const {data} = await axios.get('https://api.github.com/users/Mr111222/repos')
  return data
}

// 获取tag列表
const fetchTagFn = async(repo) => {
  // const {data}  = await axios.get(`https://api.github/com/repos/zhu-cli/${repo}/tags`)
  const {data}  = await axios.get(`https://api.github/com/users/Mr111222/${repo}/tags`)
  return data
}

// download 下载模板
const dowmload = async(repo, tag) =>{
  // const apiName = `zhu-cli/${repo}`
  const apiName = `Mr111222/${repo}`
  if(tag) {
    api+=`#${tag}`
  } 
  let dest = `${downloadName}/${repo}`
  await dowmloadGitRepo(api, dest)
  return dest  // 返回下载的最终目录
}
module.exports = async (projectName) => {
  // 1.获取项目模板 将loading效果封装到里面
  let dataTemp = await loadingWaitFn(fetchTempFn, 'fetching template......')()
  dataTemp = dataTemp.mpa(res => res.name) // 获取项目列表
  // 2.选择模板 Inquirer
  const {repo} = await Inquirer.prompt({
    name: 'repo',  // 获取选择后的结果
    type: 'list',
    message: 'place choice template to create you project', // 提示信息
    choices: dataTemp  // 选择的数据
  })
   
  // 获取 对应 的版本号
  let dataTag = await loadingWaitFn(fetchTagFn, 'fetching tags version .....')(repo)
  dataTag = dataTag.map(res=>res.name)
  const {tag} = await Inquirer.prompt({
    name: 'tag',  // 获取选择后的结果 
    type: 'list',
    message: 'place choice tag to create you project', // 提示信息
    choices: dataTag  // 选择的数据
  })
  
  console.log(repo, tag)  // 下载模板需要的数据



  // 把下载的模板进行缓存
  // download-git-repo
  let dowmRes = await loadingWaitFn(dowmload, 'dowmloading template.....')(repo, tag)

  // 如果有ask.js文件进行处理
  if(!fs.existsSync(path.join(dowmRes, 'ask.js'))) {
    // 简单直接处理
    await ncp(dowmRes, path.resolve(projectName))
  }else{
    /*
      2.复杂模板添加编译效果 MetalSmith
        a.让用户填信息
        b.渲染模板
    */
   new Promise((resolve, reject) => {
    MetalSmith(__dirname) // 如果传入路径，他默认遍历当前的src文件
    .source(dowmRes)
    .destination(path.resolve(projectName))
    .use(async (files, metal, down) => {
      const args = require(path.join(dowmRes, 'ask.js'))
      let res = await Inquirer.prompt(args)
      metal.metadata()
      Object.assign(metal, res) // 将输入的数据放入到metal0中
      delete files['ask.js']
      down()
    })
    .use((files, metal, down) => {
      // 根据用户输入进行渲染
      //视频54分钟位置
      down()
    })
    .build((err) => {
      if(err) {
        reject(err)
      }else{
        resolve()
      }
    })
   })
   
  }

}