const fs = require('fs')
const path = require('path')
const tmp = require('tmp')
const { spawn } = require('child_process');
const errorWhileCloning = new Error('Error while cloning')
const needToCloneFirst = new Error('You need to clone the repo first')
const errorWhileComitting = new Error('Error while commiting')

class Wiki {
  constructor (options) {
    this._options = Object.assign({}, options)
    
    let credentials = ''
    if (options.user && options.accessToken) {
      credentials = `${options.user}:${options.accessToken}@`
    }

    this._url = `https://${credentials}github.com/${this._options.repo}.wiki.git`
  }

  url () {
    return this._url
  }

  cleanup (cb) {
    this._path = null
    this._cleanup()
  }

  ls (cb) {
    if (!this._path) {
      return cb(needToCloneFirst)
    }

    fs.readdir(this._path, cb)
  }

  path (pathToAppend = '') {
    if (!this._path) {
      throw needToCloneFirst
    }

    return path.join(this._path, pathToAppend)
  }

  commitAndPush (message, cb) {
    if (!this._path) {
      throw cb(null, needToCloneFirst)
    }

    const command = `git add -A && git commit -m "${message}" && git push ${this._url} --all`
    const submit = spawn(command, {
      cwd: this._path,
      shell: true
    })

    submit.on('close', code => {
      if (code !== 0) {
        return cb(errorWhileComitting)
      }

      cb()
    })
  }

  clone (cb) {
    tmp.dir({
      prefix: 'ghwiki-',
      unsafeCleanup: true
    }, (err, path, cleanup) => {
      if (err) {
        return cb(err)
      }

      this._cleanup = cleanup
      this._path = path

      const child = spawn('git', [
        'clone', 
        this._url, 
        path
      ])
    
      child.on('close', code => {
        if (code !== 0) {
          cleanup()
          return cb(errorWhileCloning)
        }
        
        cb.call(this) 
      })
    })
  }
}

module.exports = Wiki
