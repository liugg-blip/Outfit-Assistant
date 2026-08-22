const fs = require('fs')
const path = require('path')

const bundlePath = path.resolve(__dirname, '..', 'app', 'dist', 'assets', 'app.js')
let bundle = fs.readFileSync(bundlePath, 'utf8')

const douyinProvider = /,douyin:\{id:"douyin",label:"抖音",appUrl:f=>`snssdk1128:\/\/search\?keyword=\$\{encodeURIComponent\(f\)\}`,webUrl:f=>`https:\/\/www\.douyin\.com\/search\/\$\{encodeURIComponent\(f\)\}`\}/
const pinterestProvider = ',pinterest:{id:"pinterest",label:"Pinterest",appUrl:f=>`pinterest://search/pins/?q=${encodeURIComponent(`outfit styling ${f}`)}`,webUrl:f=>`https://www.pinterest.com/search/pins/?q=${encodeURIComponent(`outfit styling ${f}`)}`}'

if (douyinProvider.test(bundle)) bundle = bundle.replace(douyinProvider, pinterestProvider)
bundle = bundle.replaceAll('K0("douyin",D.keywords[0]),children:"抖音"', 'K0("pinterest",D.keywords[0]),children:"Pinterest"')
bundle = bundle.replaceAll('「小红书 / 抖音」按钮', '「小红书 / Pinterest」按钮')

if (!bundle.includes('id:"pinterest"')) throw new Error('Pinterest 平台对象没有写入')
if (bundle.includes('id:"douyin"') || bundle.includes('K0("douyin"')) throw new Error('仍然存在抖音平台调用')

fs.writeFileSync(bundlePath, bundle, 'utf8')
console.log('平台链接已更新：抖音 -> Pinterest')
