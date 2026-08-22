const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const checks = []

function check(name, condition) {
  checks.push({ name, ok: Boolean(condition) })
}

const html = read('app/dist/index.html')
const bundle = read('app/dist/assets/app.js')
const main = read('app/electron/main.cjs')
const desktop = read('app/dist/desktop.js')
const atelier = read('app/dist/assets/atelier.css')
const localization = read('app/dist/localization.js')
const silhouettes = JSON.parse(read('design/silhouettes-v2.json'))

check('HTML has a restrictive CSP', html.includes("default-src 'self'") && html.includes("connect-src 'none'"))
check('iOS-only metadata removed', !html.includes('apple-mobile-web-app'))
check('focus selector retained', bundle.includes('重点') && bundle.includes('是全场唯一的颜色'))
check('R9 focus rules retained', bundle.includes('R9a') && bundle.includes('R9b') && bundle.includes('R9c'))
check('outfit generation retained', bundle.includes('搭配方案') && bundle.includes('穿上试试'))
check('platform links retained', bundle.includes('小红书') && bundle.includes('Pinterest'))
check('Douyin is fully removed', !bundle.includes('id:"douyin"') && !bundle.includes('K0("douyin"'))
check('Pinterest search is configured', bundle.includes('pinterest://search/pins') && bundle.includes('pinterest.com/search/pins'))
check('English is the default language', localization.includes("DEFAULT_LANGUAGE = 'en'") && html.includes('<html lang="en">'))
check('language settings are available', localization.includes('language-settings-root') && localization.includes('data-language="zh-CN"'))
check('dark sock wording is color-accurate', !bundle.includes('黑袜 + 浅色') && bundle.includes('深色袜 + 浅色'))
check('Electron sandbox enabled', main.includes('sandbox: true') && main.includes('nodeIntegration: false'))
check('permission requests denied', main.includes('setPermissionRequestHandler'))
check('window state persistence enabled', main.includes('window-state.json'))
check('desktop preferences wait for React', desktop.includes('waitForInterface') && desktop.includes('MouseEvent'))
check('atelier theme is linked', html.includes('atelier.css') && atelier.includes('FIT / COLOR STUDY'))
check('ergonomic silhouettes are defined', silhouettes.male.head.ry > silhouettes.male.head.rx && silhouettes.female.head.ry > silhouettes.female.head.rx)
check('natural stance is retained', silhouettes.male.bottom.includes('L 136,424') && silhouettes.female.bottom.includes('L 137,426'))
check('hands are part of the body silhouette', silhouettes.male.neck.includes('M 67,166') && silhouettes.female.neck.includes('M 72,157'))

for (const result of checks) console.log(`${result.ok ? 'PASS' : 'FAIL'}  ${result.name}`)
if (checks.some((result) => !result.ok)) process.exit(1)
