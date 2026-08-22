const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const bundlePath = path.join(root, 'app', 'dist', 'assets', 'app.js')
const modelPath = path.join(root, 'design', 'silhouettes-v2.json')
const model = JSON.parse(fs.readFileSync(modelPath, 'utf8'))
let bundle = fs.readFileSync(bundlePath, 'utf8')

const silhouettes = `const H1=${JSON.stringify(model.male)},q1=${JSON.stringify(model.female)},k0=`
const hitAreas = `,B1=${JSON.stringify(model.hitAreas)},Q0=`

const silhouettePattern = /const H1=.*?,k0=/
const hitAreaPattern = /,B1=.*?,Q0=/

if (!silhouettePattern.test(bundle)) throw new Error('没有找到人体模型数据段')
if (!hitAreaPattern.test(bundle)) throw new Error('没有找到人体热区数据段')

bundle = bundle.replace(silhouettePattern, silhouettes)
bundle = bundle.replace(hitAreaPattern, hitAreas)

const circleHead = 'E.jsx("circle",{cx:D.head.cx,cy:D.head.cy,r:D.head.r})'
const ellipseHead = 'E.jsx("ellipse",{cx:D.head.cx,cy:D.head.cy,rx:D.head.rx,ry:D.head.ry})'
if (bundle.includes(circleHead)) bundle = bundle.replace(circleHead, ellipseHead)
if (!bundle.includes(ellipseHead)) throw new Error('没有找到头部绘制节点')

fs.writeFileSync(bundlePath, bundle, 'utf8')
console.log('人体模型已更新：男 / 女 / 点击热区')
