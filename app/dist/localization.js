(() => {
  const LANGUAGE_KEY = 'dailema.desktop.language.v1'
  const DEFAULT_LANGUAGE = 'en'
  const sourceText = new WeakMap()

  const exact = new Map(Object.entries({
    '搭了么': 'DAILEMA',
    '穿搭配色': 'OUTFIT COLOR LAB', '男': 'Men', '女': 'Women',
    '上衣': 'Top', '裤子': 'Bottom', '袜子': 'Socks', '鞋子': 'Shoes',
    '未选': 'Not set', '重点': 'Focus', '无': 'None',
    '看几套经典搭配': 'Explore classic looks', '清空': 'Reset', '当前评分': 'SCORE',
    '选择颜色': 'Choose a color', '关闭': 'Close', '完成': 'Done', '其他': 'More',
    '自定义取色': 'Custom color', '清空这件': 'Clear item', '搭配方案': 'Styling options',
    '穿上试试': 'Try this look', '小红书': 'Xiaohongshu', '收起': 'Show less',
    '钉住': 'Lock', '解开': 'Unlock',
    '同色系纵深': 'Tonal depth', '邻近色柔和': 'Soft analogous',
    '对比色点睛': 'Contrast accent', '中性锚定': 'Neutral anchor',
    '牛仔基础': 'Denim foundation', '上浅下深': 'Light over dark',
    '上深下浅': 'Dark over light', '袜衣呼应': 'Sock-to-top echo',
    '跳色袜点睛': 'Statement socks', '袜子跳色': 'Statement socks',
    '袜子明度聚光': 'Lightness spotlight', '袜子留白衬托': 'Neutral canvas',
    '单色 + 中性，最稳': 'One color plus neutrals',
    '全中性，安全但平': 'All-neutral and understated',
    '上浅下深，显稳显瘦': 'Light top, dark base',
    '上深下浅，显活力': 'Dark top, light base',
    '中性鞋，万能': 'Neutral shoes keep it versatile',
    '袜子是唯一焦点': 'Socks are the only focal point',
    '袜子是全场唯一的颜色': 'Socks are the only color in the look',
    '跳色袜点睛': 'Statement socks add the accent',
    '跳色袜需要安静的背景': 'Statement socks need a quiet backdrop',
    '袜裤同色，腿不断': 'Matching socks and bottoms lengthen the leg',
    '袜子呼应上衣，进阶做法': 'Socks echo the top',
    '鞋裤同色系，腿更长': 'Tonal shoes and bottoms lengthen the leg',
    '鞋子呼应上衣': 'Shoes echo the top', '鞋子颜色孤立': 'The shoe color feels isolated',
    '四件全深色，太沉': 'The look is too dark overall',
    '上下深浅太接近': 'Top and bottom lack contrast',
    '上下高饱和对撞': 'Saturated colors are competing',
    '深裤 + 亮鞋，缺过渡': 'Dark bottoms and light shoes need a bridge',
    '深色袜 + 浅色鞋 = 断层': 'Dark socks break the line above light shoes',
    '深色袜 + 浅色裤，层次倒置': 'Dark socks reverse the lightness flow',
    '袜子和裤子「差一点」，显脏': 'Near-matching socks and bottoms look accidental',
    '袜子和下装反差很大': 'Socks contrast sharply with the bottoms',
    '同色极简，成立': 'Tonal minimalism works',
    '靠明度反差立住了': 'Lightness contrast defines the focus',
    '还不够显眼': 'The focus needs more contrast',
    '纯白': 'Pure white', '米白': 'Ivory', '燕麦': 'Oat', '浅灰': 'Light gray',
    '中灰': 'Mid gray', '炭灰': 'Charcoal', '纯黑': 'Black', '卡其': 'Khaki',
    '驼色': 'Camel', '深咖': 'Dark brown', '浅蓝': 'Light blue',
    '雾霾蓝': 'Dusty blue', '牛仔蓝': 'Denim blue', '钴蓝': 'Cobalt',
    '藏青': 'Navy', '午夜蓝': 'Midnight blue', '薄荷': 'Mint', '鼠尾草': 'Sage',
    '橄榄': 'Olive', '军绿': 'Army green', '松柏': 'Pine', '墨绿': 'Forest green',
    '奶油黄': 'Butter yellow', '芥末黄': 'Mustard', '姜黄': 'Turmeric',
    '焦糖': 'Caramel', '铁锈': 'Rust', '砖红': 'Brick red', '藕粉': 'Dusty pink',
    '浅粉': 'Pale pink', '珊瑚': 'Coral', '正红': 'True red', '酒红': 'Burgundy',
    '薰衣草': 'Lavender', '灰紫': 'Dusty violet', '紫罗兰': 'Violet', '深紫': 'Deep purple',
    '中性': 'NEUTRALS', '蓝调': 'BLUES', '绿调': 'GREENS', '暖调': 'WARM',
    '红粉': 'REDS & PINKS', '紫调': 'PURPLES'
  }))

  const currentLanguage = () => localStorage.getItem(LANGUAGE_KEY) || DEFAULT_LANGUAGE
  const slot = (value) => exact.get(value) || value

  function translate(value, node) {
    if (currentLanguage() === 'zh-CN') return value
    const clean = value.trim()
    if (!clean) return value
    if (exact.has(clean)) return value.replace(clean, exact.get(clean))

    let match
    if ((match = clean.match(/^补全剩下 (\d+) 件$/))) return `Complete ${match[1]} remaining items`
    if ((match = clean.match(/^已选 (\d+) \/ 4 件/))) return `${match[1]} of 4 items selected. Locked items stay unchanged.`
    if ((match = clean.match(/^重点：(.+?)。/))) return `Focus: ${slot(match[1])}. Other items will stay quiet and supportive.`
    if ((match = clean.match(/^搜索词「(.+)」$/))) return `Search: “outfit styling ${match[1]}”`
    if ((match = clean.match(/^共 (\d+) 条分析$/))) return `${match[1]} styling notes`
    if ((match = clean.match(/^(\d+) 色，在安全区内$/))) return `${match[1]} colors, balanced`
    if ((match = clean.match(/^(.+)是唯一焦点$/))) return `${slot(match[1])} is the only focal point`
    if ((match = clean.match(/^(.+)是全场唯一的颜色$/))) return `${slot(match[1])} is the only color in the look`
    if ((match = clean.match(/^(.+) 同色呼应$/))) return `${match[1].split('、').map(slot).join(' and ')} create a color echo`
    if ((match = clean.match(/^(.+) 在抢(.+)的戏$/))) return `${match[1].split('、').map(slot).join(' and ')} compete with ${slot(match[2])}`

    if (node?.parentElement?.classList.contains('note__detail')) {
      return 'Evaluated for color balance, contrast, proportion and visual continuity.'
    }
    if (node?.parentElement?.classList.contains('scheme__tagline')) {
      return 'A considered palette built around the selected item.'
    }
    if (node?.parentElement?.classList.contains('note__title')) return 'Styling note'
    if (node?.parentElement?.classList.contains('hint')) return 'Select an item or choose a focus to begin.'
    if (node?.parentElement?.classList.contains('disclaimer')) {
      return 'Suggestions are generated locally. Xiaohongshu and Pinterest open external inspiration searches.'
    }
    return value
  }

  function translateTextNode(node) {
    if (node.parentElement?.closest('[data-no-translate]')) return
    const state = sourceText.get(node)
    const current = node.nodeValue
    const source = state && current === state.output ? state.source : current
    const output = translate(source, node)
    sourceText.set(node, { source, output })
    if (current !== output) node.nodeValue = output
  }

  function translateAttributes(element) {
    for (const attribute of ['title', 'aria-label']) {
      if (!element.hasAttribute?.(attribute)) continue
      const key = attribute === 'title' ? 'i18nTitle' : 'i18nAria'
      const source = element.dataset[key] || element.getAttribute(attribute)
      element.dataset[key] = source
      element.setAttribute(attribute, translate(source))
    }
  }

  function translateTree(root = document.body) {
    document.documentElement.lang = currentLanguage() === 'zh-CN' ? 'zh-CN' : 'en'
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) translateTextNode(walker.currentNode)
    if (root.nodeType === Node.ELEMENT_NODE) translateAttributes(root)
    root.querySelectorAll?.('[title], [aria-label]').forEach(translateAttributes)
  }

  const copy = () => currentLanguage() === 'zh-CN'
    ? { title: '设置', language: '界面语言', close: '关闭设置', english: '英文', chinese: '中文' }
    : { title: 'Settings', language: 'Interface language', close: 'Close settings', english: 'Default', chinese: 'Chinese' }

  const closeSettings = () => document.querySelector('.language-settings-root')?.remove()

  function openSettings() {
    closeSettings()
    const text = copy()
    const root = document.createElement('div')
    root.className = 'language-settings-root'
    root.dataset.noTranslate = 'true'
    root.innerHTML = `
      <button class="settings-scrim" aria-label="${text.close}"></button>
      <section class="language-settings" role="dialog" aria-modal="true" aria-labelledby="language-settings-title">
        <header class="language-settings__head">
          <div><span>DAILEMA / 01</span><h2 id="language-settings-title">${text.title}</h2></div>
          <button class="settings-close" aria-label="${text.close}">×</button>
        </header>
        <div class="language-settings__body">
          <p>${text.language}</p>
          <div class="language-options">
            <button data-language="en"><span>English</span><small>${text.english}</small></button>
            <button data-language="zh-CN"><span>简体中文</span><small>${text.chinese}</small></button>
          </div>
        </div>
      </section>`
    document.body.appendChild(root)
    root.querySelector(`[data-language="${currentLanguage()}"]`)?.classList.add('is-active')
    root.querySelector('.settings-scrim').addEventListener('click', closeSettings)
    root.querySelector('.settings-close').addEventListener('click', closeSettings)
    root.querySelectorAll('[data-language]').forEach((button) => {
      button.addEventListener('click', () => {
        localStorage.setItem(LANGUAGE_KEY, button.dataset.language)
        closeSettings()
        translateTree()
        installSettingsButton(true)
      })
    })
  }

  function installSettingsButton(replace = false) {
    const topbar = document.querySelector('.topbar')
    if (!topbar) return false
    if (replace) topbar.querySelector('.settings-button')?.remove()
    if (topbar.querySelector('.settings-button')) return true
    const button = document.createElement('button')
    button.className = 'settings-button'
    button.type = 'button'
    button.setAttribute('aria-label', currentLanguage() === 'zh-CN' ? '打开设置' : 'Open settings')
    button.title = currentLanguage() === 'zh-CN' ? '设置' : 'Settings'
    button.innerHTML = '<span aria-hidden="true">⚙</span>'
    button.addEventListener('click', openSettings)
    topbar.appendChild(button)
    return true
  }

  function initialize() {
    translateTree()
    const timer = setInterval(() => installSettingsButton() && clearInterval(timer), 40)
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') translateTextNode(mutation.target)
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.TEXT_NODE) translateTextNode(node)
          if (node.nodeType === Node.ELEMENT_NODE && !node.closest('[data-no-translate]')) translateTree(node)
        }
      }
      installSettingsButton()
    })
    observer.observe(document.body, { subtree: true, childList: true, characterData: true })
  }

  window.addEventListener('DOMContentLoaded', initialize)
})()
