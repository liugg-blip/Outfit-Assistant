const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const source = process.argv[2] || String.raw`C:\Users\Administrator\Desktop\coding弃用\搭了么`
const target = path.join(root, 'runtime')

if (!fs.existsSync(path.join(source, '搭了么.exe'))) {
  throw new Error(`没有找到运行时：${source}`)
}

fs.rmSync(target, { recursive: true, force: true })
fs.cpSync(source, target, {
  recursive: true,
  filter: (entry) => !entry.endsWith(`${path.sep}app.asar`),
})
fs.mkdirSync(path.join(target, 'resources'), { recursive: true })
console.log(`运行时已复制到：${target}`)
