(() => {
  const LANGUAGE_KEY = 'dailema.desktop.language.v1'
  const DB_NAME = 'dailema-library-v1'
  const modelShapes = [
    ['Ari', 'XXS', 'slim', '#d8b39c', 70, 31, 38], ['Mina', 'XS', 'petite', '#e8c6ad', 66, 33, 40],
    ['Noa', 'S', 'straight', '#b97f65', 74, 35, 41], ['Jules', 'M', 'athletic', '#80533f', 82, 34, 43],
    ['Sam', 'M', 'balanced', '#d1a087', 78, 37, 45], ['Alex', 'L', 'soft', '#efcbb0', 82, 42, 50],
    ['Robin', 'XL', 'curved', '#69483b', 84, 46, 55], ['Taylor', '2XL', 'broad', '#a96f52', 92, 45, 54],
    ['Morgan', '3XL', 'full', '#d7aa8e', 96, 53, 62], ['Casey', '4XL', 'full', '#8b5d49', 101, 58, 67]
  ].map(([name, size, shape, skin, shoulder, waist, hip], index) => ({ id: `model-${index}`, name, size, shape, skin, shoulder, waist, hip }))

  const garments = [
    ['top-tee', 'top', 'Essential tee', '#e8e5df', 'tee'], ['top-knit', 'top', 'Fine knit', '#455d73', 'knit'],
    ['top-shirt', 'top', 'Relaxed shirt', '#d7d1c5', 'shirt'], ['top-jacket', 'top', 'Short jacket', '#355d58', 'jacket'],
    ['bottom-straight', 'bottom', 'Straight trousers', '#303333', 'straight'], ['bottom-wide', 'bottom', 'Wide trousers', '#72695d', 'wide'],
    ['bottom-denim', 'bottom', 'Denim', '#557087', 'denim'], ['bottom-skirt', 'bottom', 'Midi skirt', '#6e3940', 'skirt'],
    ['shoes-low', 'shoes', 'Low sneakers', '#f0eee9', 'sneaker'], ['shoes-boot', 'shoes', 'Ankle boots', '#252525', 'boot'],
    ['socks-crew', 'socks', 'Crew socks', '#bd3d2d', 'crew'], ['socks-ankle', 'socks', 'Ankle socks', '#e6e2d9', 'ankle']
  ].map(([id, category, name, color, style]) => ({ id, category, name, color, style }))

  const state = { model: modelShapes[4], outfit: {}, customModels: [], customGarments: [], tab: 'models', garmentCategory: 'top' }
  const isZh = () => (localStorage.getItem(LANGUAGE_KEY) || 'en') === 'zh-CN'
  const t = (en, zh) => isZh() ? zh : en

  function openDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1)
      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains('assets')) db.createObjectStore('assets', { keyPath: 'id' })
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async function saveAsset(asset) {
    const db = await openDb()
    await new Promise((resolve, reject) => {
      const tx = db.transaction('assets', 'readwrite')
      tx.objectStore('assets').put(asset)
      tx.oncomplete = resolve
      tx.onerror = () => reject(tx.error)
    })
    db.close()
  }

  async function loadAssets() {
    const db = await openDb()
    const items = await new Promise((resolve, reject) => {
      const request = db.transaction('assets').objectStore('assets').getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    db.close()
    state.customModels = items.filter((item) => item.kind === 'model')
    state.customGarments = items.filter((item) => item.kind === 'garment')
  }

  const fileData = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

  function bodySvg(model, compact = false) {
    const shoulder = model.shoulder || 78, waist = model.waist || 37, hip = model.hip || 45
    const skin = model.skin || '#cda58d'
    return `<svg viewBox="0 0 180 420" aria-hidden="true" class="${compact ? 'library-avatar--compact' : 'library-avatar'}">
      <ellipse cx="90" cy="39" rx="18" ry="24" fill="${skin}"/><path d="M82 61h16v24H82z" fill="${skin}"/>
      <path d="M${90-shoulder/2} 84 Q90 72 ${90+shoulder/2} 84 L${90+waist/2} 218 Q90 228 ${90-waist/2} 218Z" fill="#cbc9c4"/>
      <path d="M${90-shoulder/2} 88 L${90-shoulder/2-10} 235 Q${90-shoulder/2-2} 242 ${90-shoulder/2+5} 233 L${90-waist/2} 112Z" fill="${skin}"/>
      <path d="M${90+shoulder/2} 88 L${90+shoulder/2+10} 235 Q${90+shoulder/2+2} 242 ${90+shoulder/2-5} 233 L${90+waist/2} 112Z" fill="${skin}"/>
      <path d="M${90-hip/2} 214 Q90 228 ${90+hip/2} 214 L109 382 H92 L89 260 L86 382 H69Z" fill="#777a78"/>
      <path d="M67 380h21v17H53q-5-9 14-17M92 380h21q19 8 14 17H92z" fill="#383a39"/>
    </svg>`
  }

  function renderStage() {
    const stage = document.querySelector('.tryon-stage__canvas')
    if (!stage) return
    const model = state.model
    const base = model.data ? `<img class="tryon-photo" src="${model.data}" alt="${model.name}">` : bodySvg(model)
    const layers = ['bottom', 'top', 'socks', 'shoes'].map((category) => {
      const item = state.outfit[category]
      if (!item) return ''
      if (item.data) return `<img class="garment-layer garment-layer--${category}" src="${item.data}" alt="${item.name}">`
      return `<div class="garment-shape garment-shape--${category} garment-shape--${item.style}" style="--garment:${item.color}" title="${item.name}"></div>`
    }).join('')
    stage.innerHTML = `<div class="tryon-subject">${base}${layers}</div><div class="tryon-ground"></div>`
    document.querySelector('.tryon-model-name').textContent = `${model.name} / ${model.size || t('Custom', '自定义')}`
  }

  function renderModels() {
    const list = [...modelShapes, ...state.customModels]
    return `<div class="library-grid library-grid--models">${list.map((model) => `
      <button class="library-card ${state.model.id === model.id ? 'is-selected' : ''}" data-model="${model.id}">
        <div class="library-card__visual">${model.data ? `<img src="${model.data}" alt="">` : bodySvg(model, true)}</div>
        <div class="library-card__meta"><strong>${model.name}</strong><span>${model.size || t('Custom', '自定义')} · ${model.shape || t('Photo', '照片')}</span></div>
      </button>`).join('')}</div>`
  }

  function renderGarments(category = state.garmentCategory) {
    state.garmentCategory = category
    const list = [...garments, ...state.customGarments].filter((item) => item.category === category)
    return `<div class="garment-filters">${['top','bottom','socks','shoes'].map((value) => `<button class="${value === category ? 'is-active' : ''}" data-category="${value}">${t({top:'Tops',bottom:'Bottoms',socks:'Socks',shoes:'Shoes'}[value],{top:'上衣',bottom:'下装',socks:'袜子',shoes:'鞋子'}[value])}</button>`).join('')}</div>
      <div class="library-grid">${list.map((item) => `<button class="library-card ${state.outfit[item.category]?.id === item.id ? 'is-selected' : ''}" data-garment="${item.id}">
        <div class="library-card__visual library-card__visual--garment">${item.data ? `<img src="${item.data}" alt="">` : `<span class="garment-thumb garment-thumb--${item.category}" style="--garment:${item.color}"></span>`}</div>
        <div class="library-card__meta"><strong>${item.name}</strong><span>${t('Add to look','加入搭配')}</span></div></button>`).join('')}</div>`
  }

  function renderPanel(category = state.garmentCategory) {
    const panel = document.querySelector('.tryon-library__content')
    if (!panel) return
    panel.innerHTML = state.tab === 'models' ? renderModels() : renderGarments(category)
  }

  async function importAsset(kind, category) {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = 'image/png,image/jpeg,image/webp'; input.multiple = true
    input.onchange = async () => {
      for (const file of [...input.files].slice(0, 12)) {
        if (file.size > 12 * 1024 * 1024) { alert(t('Each image must be under 12 MB.', '每张图片不能超过 12 MB。')); continue }
        const asset = { id: `custom-${Date.now()}-${Math.random().toString(16).slice(2)}`, kind, category, name: file.name.replace(/\.[^.]+$/, ''), data: await fileData(file) }
        await saveAsset(asset)
      }
      await loadAssets(); renderPanel(category); bindPanel(category)
    }
    input.click()
  }

  function bindPanel(category = 'top') {
    const panel = document.querySelector('.tryon-library__content')
    panel?.querySelectorAll('[data-model]').forEach((button) => button.onclick = () => {
      state.model = [...modelShapes, ...state.customModels].find((item) => item.id === button.dataset.model)
      renderPanel(); bindPanel(); renderStage()
    })
    panel?.querySelectorAll('[data-garment]').forEach((button) => button.onclick = () => {
      const item = [...garments, ...state.customGarments].find((value) => value.id === button.dataset.garment)
      state.outfit[item.category] = item; renderPanel(item.category); bindPanel(item.category); renderStage()
    })
    panel?.querySelectorAll('[data-category]').forEach((button) => button.onclick = () => { state.garmentCategory = button.dataset.category; renderPanel(); bindPanel() })
  }

  function openStudio() {
    document.querySelector('.tryon-root')?.remove()
    const root = document.createElement('div'); root.className = 'tryon-root'; root.dataset.noTranslate = 'true'
    root.innerHTML = `<header class="tryon-header"><div><span>DAILEMA / FIT LAB</span><h1>${t('Virtual fitting studio','虚拟试衣工作室')}</h1></div><div class="tryon-header__actions"><button class="tryon-clear">${t('Clear look','清空穿搭')}</button><button class="tryon-close" aria-label="${t('Close','关闭')}">×</button></div></header>
      <main class="tryon-workspace"><aside class="tryon-library"><div class="tryon-tabs"><button data-tab="models" class="is-active">${t('Models','模型库')}</button><button data-tab="garments">${t('Wardrobe','服装库')}</button></div><div class="tryon-library__toolbar"><p>${t('Choose a similar body type or import a full-body photo.','选择相近体型，或导入全身照片。')}</p><button class="tryon-import">＋ ${t('Import model','导入模特')}</button></div><div class="tryon-library__content"></div></aside>
      <section class="tryon-stage"><div class="tryon-stage__head"><div><span>${t('CURRENT MODEL','当前模型')}</span><strong class="tryon-model-name"></strong></div><button class="tryon-import-garment">＋ ${t('Import garment','导入服装')}</button></div><div class="tryon-stage__canvas"></div><p class="tryon-boundary">${t('Local visual overlay preview. It does not simulate exact fit, drape or size.','本地视觉叠穿预览，不代表真实尺码、垂坠或面料物理效果。')}</p></section></main>`
    document.body.appendChild(root); renderPanel(); bindPanel(); renderStage()
    root.querySelector('.tryon-close').onclick = () => root.remove()
    root.querySelector('.tryon-clear').onclick = () => { state.outfit = {}; renderStage(); renderPanel(); bindPanel() }
    root.querySelectorAll('[data-tab]').forEach((button) => button.onclick = () => {
      state.tab = button.dataset.tab; root.querySelectorAll('[data-tab]').forEach((item) => item.classList.toggle('is-active', item === button));
      root.querySelector('.tryon-import').textContent = state.tab === 'models' ? `＋ ${t('Import model','导入模特')}` : `＋ ${t('Import garment','导入服装')}`
      renderPanel(); bindPanel()
    })
    root.querySelector('.tryon-import').onclick = () => state.tab === 'models' ? importAsset('model') : importAsset('garment', state.garmentCategory)
    root.querySelector('.tryon-import-garment').onclick = () => importAsset('garment', state.garmentCategory)
  }

  function install() {
    const topbar = document.querySelector('.topbar'); if (!topbar || topbar.querySelector('.studio-button')) return false
    const button = document.createElement('button'); button.className = 'studio-button'; button.type = 'button'; button.textContent = t('FIT LAB','试衣间'); button.onclick = openStudio
    topbar.insertBefore(button, topbar.querySelector('.settings-button')); return true
  }

  window.addEventListener('DOMContentLoaded', async () => {
    try { await loadAssets() } catch {}
    const timer = setInterval(() => install() && clearInterval(timer), 50)
  })
})()
