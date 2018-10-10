import Vue from "vue";
import App from "./App.vue";
import VModal from "vue-js-modal";

Vue.use(VModal);

Vue.config.productionTip = false;

var reactPage = document.getElementById("react-page");
var app = document.createElement("div");
app.id = "distributorApp";
reactPage.parentNode.insertBefore(app, reactPage.nextSibling);
var distributorVue = window.distributorVue;
distributorVue = new Vue({
  // eslint-disable-line no-new
  el: "#distributorApp",
  render: h => h(App)
});

var alignIconChecker = setInterval(checkForAlignIcon, 100);

function checkForAlignIcon() {
  if (
    document.querySelector('[data-tooltip="align-bottom"]') !== null &&
    alignIconChecker !== false
  ) {
    clearInterval(alignIconChecker);
    alignIconChecker = false;
    inject();
    document.querySelector(
      "#distributorButton"
    ).disabled = document
      .querySelector('[data-tooltip="distribute-horizontal-spacing"]')
      .className.includes("iconButtonDisabled");
    alignButtonsObserver.observe(
      document.querySelector('[data-tooltip="distribute-horizontal-spacing"]'),
      {
        attributes: true
      }
    );
    pageObserver.observe(document.querySelector('div[class*="content-13"]'), {
      childList: true
    });
  }
}

var alignButtonsObserver = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (
      mutation.target.className.includes("iconButtonDisabled") &&
      distributorVue.$children[0].modalOpened
    )
      distributorVue.$children[0].singleSelect = true;
    else distributorVue.$children[0].singleSelect = false;
    document.querySelector(
      "#distributorButton"
    ).disabled = mutation.target.className.includes("iconButtonDisabled");
  });
});

var pageObserver = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (mutation.addedNodes.length === 1) {
      if (mutation.addedNodes[0].childNodes.length > 0) {
        if (
          document.querySelector('div[class*="fullscreen_view--page"]') !== null
        )
          alignIconChecker = setInterval(checkForAlignIcon, 100);
        else alignButtonsObserver.disconnect();
      }
    }
  });
});

function inject() {
  document.querySelector(
    '[data-tooltip="distribute-horizontal-spacing"]'
  ).style.display = "none";
  document.querySelector(
    '[data-tooltip="distribute-vertical-spacing"]'
  ).style.display = "none";
  var alignButton = document.querySelector('[data-tooltip="align-bottom"]');
  var distributorButton = document.createElement("button");
  distributorButton.id = "distributorButton";
  distributorButton.innerText = "Ɨ";
  distributorButton.style.fontFamily = "FigmaIcons";
  alignButton.parentNode.insertBefore(
    distributorButton,
    alignButton.nextSibling
  );
  distributorButton.addEventListener(
    "click",
    function() {
      if (
        !document
          .querySelector('[data-tooltip="distribute-horizontal-spacing"]')
          .className.includes("iconButtonDisabled")
      )
        distributorVue.$children[0].toggleModal();
    },
    false
  );
  document.querySelector(".focus-target").onkeydown = function(e) {
    if (e.metaKey && e.shiftKey && e.keyCode === 68) {
      e.preventDefault();
      if (
        !document
          .querySelector('[data-tooltip="distribute-horizontal-spacing"]')
          .className.includes("iconButtonDisabled")
      )
        distributorVue.$children[0].toggleModal();
    }
  };
}
