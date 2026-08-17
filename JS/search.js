const searchArea = document.querySelector('.search-area');

export function search() {
    if (!searchArea) return;

    const searchValue = searchArea.value
        .toLowerCase()
        .trim();

    const clipCards = document.querySelectorAll('.clip-card');

    clipCards.forEach((card) => {
        const cardText = card
            .querySelector('.clip-text')
            ?.textContent
            .toLowerCase() || '';

        card.style.display = cardText.includes(searchValue)
            ? 'flex'
            : 'none';
    });
}

searchArea?.addEventListener('input', search);