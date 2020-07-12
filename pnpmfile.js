const fs = require('fs')
const path = require('path')

module.exports = {
  hooks: { readPackage },
}

const OFFLINE_DIR = '.offline-packages'

let offlinePackages
const getOfflinePackages = () => {
  const dir = path.resolve(process.cwd(), OFFLINE_DIR)
  try {
    offlinePackages = fs.readdirSync(dir)
    console.log('Available offline packages:', offlinePackages)
  } catch (err) {
    console.error('Failed to read offline packages from', dir, err)
  }
}

const patchDeps = deps => {
  const toPatch = Object.entries(deps).filter(
    ([, value]) => value && value.startsWith('workspace')
  )
  for (const [name, version] of toPatch) {
    const [, versionNumber] = version.split(/:[\^~*]{0,1}/)
    let packageFile
    if (versionNumber) {
      const fileName = `${name}-${versionNumber}.tgz`
      if (offlinePackages.includes(fileName)) {
        packageFile = `file:./${OFFLINE_DIR}/${fileName}`
      }
    } else {
      const fileName = offlinePackages.find(packageFilename =>
        packageFilename.startsWith(name)
      )
      if (fileName) {
        packageFile = `file:./${OFFLINE_DIR}/${fileName}`
      }
    }
    if (packageFile) {
      deps[name] = packageFile
    } else {
      console.error('Failed to resolve offline:', name + '@' + versionNumber)
    }
  }
}

function readPackage(pkg) {
  if (!offlinePackages) {
    return
  }
  patchDeps(pkg.dependencies)
  patchDeps(pkg.devDependencies)
  return pkg
}

getOfflinePackages()
