(() => {
  const STORAGE_KEY = 'dailema.desktop.preferences.v1'

  function readPreferences() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    } catch {
      return {}
    }
  }

  function clickByText(selector, text) {
    const item = [...document.querySelectorAll(selector)].find(
      (node) => node.textContent.trim() === text,
    )
    item?.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true, view: window }),
    )
  }

  function restorePreferences() {
    const preferences = readPreferences()
    if (preferences.gender) clickByText('.seg__item', preferences.gender)
    if (preferences.focus) clickByText('.fpill', preferences.focus)
  }

  function currentText(selector, activeClass) {
    return document.querySelector(`${selector}.${activeClass}`)?.textContent.trim() || null
  }

  function savePreferences() {
    const preferences = {
      gender: currentText('.seg__item', 'seg__item--on'),
      focus: currentText('.fpill', 'fpill--on'),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  }

  function installPreferenceObserver() {
    let timer
    const observer = new MutationObserver(() => {
      clearTimeout(timer)
      timer = setTimeout(savePreferences, 80)
    })
    observer.observe(document.getElementById('root'), {
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    })
  }

  function installKeyboardNavigation() {
    document.addEventListener('keydown', (event) => {
      if (!event.altKey || event.ctrlKey || event.metaKey) return
      const focusLabels = ['无', '上衣', '裤子', '袜子', '鞋子']
      const index = Number(event.key)
      if (Number.isInteger(index) && index >= 0 && index <= 4) {
        event.preventDefault()
        clickByText('.fpill', focusLabels[index])
      }
    })
  }

  function waitForInterface(timeout = 4000) {
    return new Promise((resolve) => {
      const startedAt = Date.now()
      const poll = () => {
        if (document.querySelectorAll('.fpill').length === 5) return resolve(true)
        if (Date.now() - startedAt >= timeout) return resolve(false)
        requestAnimationFrame(poll)
      }
      poll()
    })
  }

  window.addEventListener('DOMContentLoaded', async () => {
    if (await waitForInterface()) {
      restorePreferences()
      installPreferenceObserver()
      installKeyboardNavigation()
    }
  })
})()
