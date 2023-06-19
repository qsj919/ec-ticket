const fs = require('fs')
const path = require('path')
const { spawnSync, execSync } = require('child_process')

// 创建文件夹
function createFolder(dir) {
  return new Promise(resolve => {
    if (fs.existsSync(dir)) {
      resolve()
      // 目录已存在
    } else {
      fs.mkdir(dir, () => {
        console.log(`${dir} 创建成功`)
        resolve()
      })
    }
  })
}

// 删除文件夹
const deleteFolderRecursive = function(directoryPath) {
  if (fs.existsSync(directoryPath)) {
    fs.readdirSync(directoryPath).forEach((file, index) => {
      const curPath = path.join(directoryPath, file)
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath)
      } else {
        // delete file
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(directoryPath)
  }
}

// 克隆svn
function createSvnAndUpdate(svnCwd, remoteSvn, username, pwd) {
  return createFolder(svnCwd).then(() => {
    execSync(`svn co ${remoteSvn} ${svnCwd} --username ${username} --password ${pwd}`)
    console.log(`svn[${remoteSvn}] 更新成功`)
  })
}

function svnAdd(path) {
  const a = spawnSync('svn', ['add', '.', '--force'], {
    cwd: path
  })
  if (a.stderr.toString().includes('E155015')) {
    console.log('添加到svn错误，请检查')
    process.exit(1)
  }

  const b = spawnSync('svn', ['commit', '-m', 'update'], {
    cwd: path
  })
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
      // warn('\033[;31m 不允许在根目录下操作')
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

function deployRemote(config) {
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
        stream.end(`${config.command}\nexit\n`)
      })
    })
    .connect({
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password
    })
}

class SvnClient {
  constructor(config) {
    this.config = config || {}
  }

  init() {}

  svnAdd(path) {
    const a = spawnSync('svn', ['add', '.', '--force'], {
      cwd: path
    })
    if (a.stderr.toString().includes('E155015')) {
      console.log('添加到svn错误，请检查')
      process.exit(1)
    }

    const b = spawnSync('svn', ['commit', '-m', 'update'], {
      cwd: path
    })
  }
}

class ImageUploadPlugin {
  constructor(options) {
    // excludePath
    this.options = options || {
      excludePath: null,
      deployConfig: {
        username: '',
        password: '',
        host: '',
        port: ''
      },
      svnConfig: {
        path: 'http://svn.hzdlsoft.com:3698/svn/ec-web/project/ec-web-doc/webCdn/weapp/ec-ticket',
        username: '',
        password: ''
      },
      enable: true
    }

    // this.svnClient = new SvnClient(this.options.svnConfig)
  }

  apply(compiler) {
    // 资源打包完毕后触发
    compiler.hooks.afterEmit.tapPromise('ImageUploadPlugin', compilation => {
      if (compilation.options.mode !== 'production' || !this.options.enable)
        return Promise.resolve()
      // 找到处理图片资源的规则
      const imageOptions = compiler.options.module.rules.find(
        rule => rule.resource && rule.resource('a.png')
      )
      if (imageOptions) {
        const ctx = compiler.context
        const tempFilePath = ctx + '/tempAssets'
        // 创建临时目录并且初始化svn
        const { path: svnPath, username, password } = this.options.svnConfig
        return createSvnAndUpdate(tempFilePath, svnPath, username, password).then(() => {
          // 遍历查找图片资源
          for (const fileName in compilation.assets) {
            if (imageOptions.resource(fileName)) {
              // 找到图片资源并移动到temp
              const asset = compilation.assets[fileName]
              // 排除其他文件夹
              const rp = this.options.excludePath
                ? path.relative(
                    compilation.outputOptions.path + this.options.excludePath,
                    asset.existsAt
                  )
                : '..'

              if (rp.startsWith('..')) {
                const sub = path.relative(
                  compilation.outputOptions.path,
                  path.dirname(asset.existsAt)
                )
                // 创建图片对应目录，目录不存在则无法复制
                // todo 创建前检测目录是否存在
                fs.mkdirSync(`${tempFilePath}/${sub}`, { recursive: true })
                // 移动文件
                fs.renameSync(
                  asset.existsAt,
                  `${tempFilePath}/${sub}/${path.basename(asset.existsAt)}`
                )
              }
            }
          }
          // 图片移动完毕，开始添加到svn并上传
          svnAdd(tempFilePath)
          // 删除文件夹
          deleteFolderRecursive(tempFilePath)
          // 发布
          if (this.options.sshConfig) {
            deployRemote(this.options.sshConfig)
          } else {
            console.log('未配置发布命令')
          }
        })
      }
    })
  }
}

module.exports = ImageUploadPlugin
