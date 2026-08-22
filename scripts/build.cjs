const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawnSync } = require('child_process')

const root = path.resolve(__dirname, '..')
const sourceApp = path.join(root, 'app')
const runtime = process.env.DAILEMA_RUNTIME || path.join(root, 'runtime')
const output = path.join(root, 'release', '搭了么')

function assertFile(file, message) {
  if (!fs.existsSync(file)) throw new Error(message)
}

const applySilhouettes = spawnSync(process.execPath, [path.join(__dirname, 'apply-silhouettes.cjs')], {
  stdio: 'inherit',
})
if (applySilhouettes.status !== 0) process.exit(applySilhouettes.status || 1)

const applyPlatformLinks = spawnSync(process.execPath, [path.join(__dirname, 'apply-platform-links.cjs')], {
  stdio: 'inherit',
})
if (applyPlatformLinks.status !== 0) process.exit(applyPlatformLinks.status || 1)

const check = spawnSync(process.execPath, [path.join(__dirname, 'check.cjs')], {
  stdio: 'inherit',
})
if (check.status !== 0) process.exit(check.status || 1)

assertFile(path.join(runtime, '搭了么.exe'), '缺少 runtime/搭了么.exe，请先执行 scripts/seed-runtime.cjs')
assertFile(path.join(sourceApp, 'dist', 'index.html'), '缺少 app/dist/index.html')

fs.rmSync(output, { recursive: true, force: true })
fs.mkdirSync(output, { recursive: true })
fs.cpSync(runtime, output, {
  recursive: true,
  filter: (source) => !source.endsWith(`${path.sep}app.asar`),
})

const resources = path.join(output, 'resources')
fs.mkdirSync(resources, { recursive: true })
fs.cpSync(sourceApp, path.join(resources, 'app'), { recursive: true })

const note = [
  '搭了么 Windows 本地版',
  '版本：0.2.0',
  '生成时间：' + new Date().toLocaleString('zh-CN'),
  '',
  '请保留整个文件夹，双击“搭了么.exe”启动。',
  '应用离线计算配色；小红书和 Pinterest 按钮只会打开系统浏览器。',
].join(os.EOL)
fs.writeFileSync(path.join(output, '使用说明.txt'), `\uFEFF${note}`, 'utf8')

const files = fs.readdirSync(output, { recursive: true }).length
console.log(`\n构建完成：${output}`)
console.log(`目录条目：${files}`)
