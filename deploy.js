/* eslint-disable import/no-commonjs */
/**
 * 基于svn的发版脚本  node deploy.js 打包目录(常为dist) 目标目录（svn目录） 发版指令(发版命令注意用引号包裹)
 * @example: node deploy.js dist /Users/ios/ec-slb-web/dist './front hwsd3_engx 'ec-slb-web/web''
 * @author: Miao Yunliang
 */

const fs = require('fs')
const path = require('path')
const { spawnSync, execSync } = require('child_process')

function warn(t) {
  console.log('\x1B[31m' + t + '\x1B[0m')
}

function checkFolderExist(path) {
  if (fs.existsSync(path)) {
    //
  } else {
    warn(`路径：${path}不存在，请检查`)
    process.exit(1)
  }
}

function checkIsFolderInSvn(path) {
  const checkIsSvnFolder = spawnSync('svn', ['info'], {
    cwd: path
  })
  if (checkIsSvnFolder.stderr.toString().includes('W155010')) {
    warn('目标目录不是svn')
    process.exit(1)
  }
}

function checkIsSvnRoot(pathUrl) {
  const files = fs.readdirSync(pathUrl, { withFileTypes: true })
  for (const dirent of files) {
    if (dirent.name === '.svn') {
      warn('\033[;31m 不允许在根目录下操作')
      process.exit(1)
    }
  }
}

function svnDelete(path) {
  const files = fs.readdirSync(path, { withFileTypes: true })
  for (const dirent of files) {
    if (dirent.name !== 'activity') {
      spawnSync('svn', ['delete', dirent.name], {
        cwd: path
      })
    }
  }
  spawnSync('svn', ['commit', '-m', 'delete'], {
    cwd: path
  })
}

function svnUpdate(path) {
  spawnSync('svn', ['update'], {
    cwd: path
  })
}

function svnAdd(path) {
  execSync(`svn add * --force`, {
    cwd: path
  })
  spawnSync('svn', ['commit', '-m', 'update'], {
    cwd: path
  })
}

function deployRemote(command) {
  var Client = require('ssh2').Client

  var conn = new Client()
  conn
    .on('ready', function() {
      console.log('Client :: ready')
      conn.shell(function(err, stream) {
        if (err) throw err
        stream
          .on('close', function() {
            console.log('Stream :: close')
            conn.end()
          })
          .on('data', function(data) {
            console.log(data.toString())
          })
        stream.end(`${command}\nexit\n`)
      })
    })
    .connect({
      host: '122.112.255.39',
      port: 9231,
      username: 'dev',
      password: 'dev2009'
    })
}

function start(copiedPath, resultPath) {
  console.log('开始更新同步svn...')
  svnUpdate(resultPath)
  console.log('开始删除svn文件...')
  svnDelete(resultPath)
  console.log('开始复制文件...')
  const files = fs.readdirSync(copiedPath)
  for (const dirent of files) {
    spawnSync('cp', ['-r', path.resolve(copiedPath, dirent), resultPath])
  }
  console.log('文件复制完毕,开始提交svn...')
  svnAdd(resultPath)
}

const args = process.argv.slice(2)
const from = args[0]
const to = args[1]
const deployCommand = args[2]
console.log(args, 'args')
if (!deployCommand) {
  warn('警告: 未传递发版命令')
}

checkFolderExist(to)
checkFolderExist(from)
checkIsFolderInSvn(to)
checkIsSvnRoot(to)
start(from, to)
deployRemote(deployCommand)
