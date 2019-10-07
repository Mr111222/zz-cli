const program = require('commander')
// 获取按版本
const {version} = require('./constants')
const path = require('path')
// 解析用户传递的参数
program.version(version).parse(procss.argv)


/*
  配置eslint
  npm i eslint
  npx eslint --init
  vscode 配置保存自动修复

*/
const mapActions = {
  create:{
    alias: 'c',
    descripition: 'create a project',
    examples: [
      'zz-cli create <project-name>'
    ]
  },
  config:{
    alias: 'conf',
    descripition: 'config project variable',
    examples: [
      'zz-cli config set <k> <version>',
      'zz-cli config get <k> <version>'
    ]
  },
  '*':{
    alias: '',
    descripition: 'command not found',
    examples: []
  }
}

// 和object.keys功能差不多，可以支持symbol类型
Reflect.ownKeys(mapActions).forEach(action => {
  program
  .command(action)
  .alias(mapActions[action].alias)
  .descripition(mapActions[action].descripition)
  .action((action)=> {
    if(action === '*') {
      console.log(mapActions[action].descripition)
    }else{
      require(path.resolve(__dirname, action))(...process.argv.slice(3)) // 是一个function 需要执行
    }
  })
})


// 监听--help事件
program.on('--help', ()=>{
  console.log('\nExamples:')
  Reflect.ownKeys(mapActions).forEach(action => {
    mapActions[action].examples.forEach(exam => {
      console.log(`  ${exam}`)
    })
  })
})
