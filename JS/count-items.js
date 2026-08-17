import { clipsList } from "./script.js"
const counterItems = document.querySelector('.info-about-all-items')

export function itemsCounter(){
    if (clipsList){
        const total = clipsList.childElementCount; 
        counterItems.innerHTML = `<span>Всего элементов: ${total}</span>
        <button class="deleteAll">Очистеть всё</button>`
    }
}