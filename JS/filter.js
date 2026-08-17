const all = document.querySelector('.all')
const text = document.querySelector('.text')
const code = document.querySelector('.code')
const link = document.querySelector('.link')
const btns = document.querySelectorAll('.btn')

function setActiveButton(activeBtn) {
    btns.forEach((btn) => btn.classList.remove('choice'))
    activeBtn.classList.add('choice')
}

function filterCards(type) {
    const clipCards = document.querySelectorAll('.clip-card') 

    clipCards.forEach((card) => {
        if (type === 'all' || card.id === type) {
            card.classList.add('is-active')
            card.classList.remove('is-disable')
        } else {
            card.classList.remove('is-active')
            card.classList.add('is-disable')
        }
    })
}

export function filtring() {
    if (!all || !text || !code || !link || !btns.length) return

    all.onclick = () => {
        setActiveButton(all)
        filterCards('all')
    }

    text.onclick = () => {
        setActiveButton(text)
        filterCards('text')
    }

    code.onclick = () => {
        setActiveButton(code)
        filterCards('code')
    }

    link.onclick = () => {
        setActiveButton(link)
        filterCards('link')
    }
}
