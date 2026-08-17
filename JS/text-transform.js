import { editor } from "./script.js";

export function textTransform(){
    const defaultText = 'Введите заметку...';

    editor.addEventListener('focus', () => {
        if (editor.textContent.trim() === defaultText) {
            editor.textContent = '';
        }
    });

    editor.addEventListener('blur', () => {
        if (editor.textContent.trim() === '') {
            editor.textContent = defaultText;
        }
    });
}
