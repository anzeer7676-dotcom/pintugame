import { game, prepare } from './scenes'

const boot = document.getElementById('boot')
const bootText = document.getElementById('boot-text')
const bootError = document.getElementById('boot-error')

function showError(error) {
  console.error(error)
  if (bootText) {
    bootText.textContent = '载入失败'
  }
  if (bootError) {
    bootError.textContent = `${error && error.message ? error.message : error}`
    bootError.hidden = false
  }
}

prepare()
  .then(() => {
    game.start()
    window.__slidingGame = game
    boot.classList.add('is-hidden')
  })
  .catch(showError)
