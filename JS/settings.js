const settingsBtn = document.querySelector('.settings-btn')
const closeBtn = document.querySelector('.close-settings-btn')
const settingsContainer = document.querySelector('.settings-container')

export function openSettings(){
    settingsBtn.addEventListener('click', () => {
        settingsContainer.classList.add('is-active')
    })
}

export function closeSettings(){
    closeBtn.addEventListener('click', () => {
        settingsContainer.classList.remove('is-active')
    })
}