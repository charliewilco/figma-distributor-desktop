import Vue from 'vue'
import App from './App.vue'
import VModal from 'vue-js-modal'

Vue.use(VModal)

Vue.config.productionTip = false

var reactPage = document.getElementById('react-page')
var app = document.createElement('div')
app.id = 'distributorApp'
reactPage.parentNode.insertBefore(app, reactPage.nextSibling)
window.vue = new Vue({ // eslint-disable-line no-new
  el: '#distributorApp',
  render: h => h(App)
})

var jsInitChecktimer = setInterval(checkForJSFinish, 111)

function checkForJSFinish () {
  if (document.querySelector('[data-tooltip="align-bottom"]') !== null && jsInitChecktimer !== false) {
    clearInterval(jsInitChecktimer)
    jsInitChecktimer = false
    inject()
    document.querySelector('#distributorButton').disabled = document.querySelector('[data-tooltip="distribute-horizontal-spacing"]').className.includes('iconButtonDisabled')
    mutationObserver2.observe(document.querySelector('[data-tooltip="distribute-horizontal-spacing"]'), {
      attributes: true,
      characterData: false,
      childList: false,
      subtree: false,
      attributeOldValue: false,
      characterDataOldValue: false
    })
  }
}

var mutationObserver2 = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    if (mutation.target.className.includes('iconButtonDisabled') && window.vue.$children[0].modalOpened) window.vue.$children[0].singleSelect = true
    else window.vue.$children[0].singleSelect = false
    document.querySelector('#distributorButton').disabled = mutation.target.className.includes('iconButtonDisabled')
  })
})

function inject () {
  document.querySelector('[data-tooltip="distribute-horizontal-spacing"]').style.display = 'none'
  document.querySelector('[data-tooltip="distribute-vertical-spacing"]').style.display = 'none'
  var alignButton = document.querySelector('[data-tooltip="align-bottom"]')
  var distributorButton = document.createElement('button')
  distributorButton.id = 'distributorButton'
  distributorButton.innerText = 'Ɨ'
  distributorButton.style.fontFamily = 'FigmaIcons'
  alignButton.parentNode.insertBefore(distributorButton, alignButton.nextSibling)
  var vueInstance = window.vue.$children[0]
  distributorButton.addEventListener('click', function(e) {
    if (!document.querySelector('[data-tooltip="distribute-horizontal-spacing"]').className.includes('iconButtonDisabled')) vueInstance.toggleModal()
  }, false)
  document.querySelector('.focus-target').onkeydown = function (e) {
    if (e.metaKey && e.shiftKey && e.keyCode === 68) {
      e.preventDefault()
      if (!document.querySelector('[data-tooltip="distribute-horizontal-spacing"]').className.includes('iconButtonDisabled')) vueInstance.toggleModal()
    }
  }
}
