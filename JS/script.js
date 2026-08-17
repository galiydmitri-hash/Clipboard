import { openSettings, closeSettings } from "./settings.js";
import { textTransform } from "./text-transform.js";
import { filtring } from "./filter.js";
import { search } from "./search.js";
import { itemsCounter } from "./count-items.js";

const SUPABASE_URL = 'https://qcsjdnvktqamgifdvlhx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable__t12LaoZFxUiwqQ_hBt_sw_bYlzbcyv';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const userEmailSpan = document.getElementById('user-email');
export const editor = document.getElementById('editor');
const clipTextInput = document.getElementById('clip-text');
export const clipsList = document.getElementById('clips-list');
const errorMessage = document.querySelector('.error-message');

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showNotification(text, duration = 1000) {
  if (!errorMessage) return;
  errorMessage.textContent = text;
  errorMessage.classList.add('is-active');
  setTimeout(() => {
    errorMessage.classList.remove('is-active');
  }, duration);
}

editor?.addEventListener('input', () => {
  clipTextInput.value = editor.innerText;
});

document.getElementById('btn-signup')?.addEventListener('click', async () => {
  const { error } = await supabaseClient.auth.signUp({
    email: emailInput.value,
    password: passwordInput.value
  });
  if (error) {
    showNotification(`Ошибка регистрации: ${error.message}`);
  } else {
    showNotification(`Регистрация успешна! Теперь нажмите "Войти".`);
  }
});

document.getElementById('btn-login')?.addEventListener('click', async () => {
  const { error } = await supabaseClient.auth.signInWithPassword({
    email: emailInput.value,
    password: passwordInput.value
  });
  if (error) {
    showNotification(`Ошибка входа: ${error.message}`);
  }
});

document.getElementById('btn-logout')?.addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
});

supabaseClient.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    authSection.classList.add('hidden');
    appSection.classList.remove('hidden');
    userEmailSpan.innerText = session.user.email;
    loadClips();
  } else {
    authSection.classList.remove('hidden');
    appSection.classList.add('hidden');
    userEmailSpan.innerText = '';
    clipsList.innerHTML = '';
  }
});

document.getElementById('btn-save')?.addEventListener('click', async () => {
  const text = clipTextInput.value.trim();
  if (!text) return;

  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return alert('Пользователь не авторизован');

  const { error } = await supabaseClient.from('clips').insert([
    { text_content: text, user_id: user.id }
  ]);

  if (error) {
    showNotification(`Ошибка сохранения: ${error.message}`);
  } else {
    editor.innerText = '';
    clipTextInput.value = '';
    loadClips();
  }
});

function getClipStyle(text) {
  const escapedText = escapeHtml(text);

  if (escapedText.includes('{') || escapedText.includes('=') || escapedText.includes('""')) {
    return {
      bgClass: 'var(--code-type)',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none">
<path d="M8 8L4 12L8 16" stroke="#7c5ac7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M16 8L20 12L16 16" stroke="#7c5ac7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14 5L10 19" stroke="#7c5ac7" stroke-width="1.8" stroke-linecap="round"/>
</svg>`,
      id: 'code'
    };
  } else if (escapedText.includes('https') || escapedText.includes('http')) {
    return {
      bgClass: 'var(--link-type)',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none">
<path d="M10 13.5a4 4 0 0 0 5.7.2l2-2a4 4 0 0 0-5.7-5.7l-1.1 1.1" stroke="#249b70" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14 10.5a4 4 0 0 0-5.7-.2l-2 2A4 4 0 0 0 12 18l1.1-1.1" stroke="#249b70" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
      id: 'link'
    };
  } else {
    return {
      bgClass: 'var(--text-type)',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none">
<path d="M6 5H18M12 5V19M9 19H15" stroke="#3b82c4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
      id: 'text'
    };
  }
}

async function loadClips() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return;

  const { data: clips, error } = await supabaseClient
    .from('clips')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    clipsList.innerHTML = 'Ошибка загрузки записей';
    itemsCounter();
    return;
  }

  if (!clips || clips.length === 0) {
    clipsList.innerHTML = 'Clipboard';
  } else {
    clipsList.innerHTML = clips.map(clip => {
      const style = getClipStyle(clip.text_content);
      const safeBg = escapeHtml(style.bgClass || '');
      const safeSvg = style.svg || '';
      const styleId = style.id || '';

      return `
        <div class="clip-card" data-id="${clip.id}" id="${styleId}">
          <div class="bg" style="background-color: ${safeBg};">${safeSvg}</div>
          <p class="clip-text">${escapeHtml(clip.text_content)}</p>
          <div class="clip-actions">
            <button class="btn-copy" type="button" title="Скопировать">
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none">
                <rect x="8" y="8" width="11" height="11" rx="2" stroke="#fff" stroke-width="1.8"/>
                <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            </button>
            <button class="btn-delete btn-danger" type="button" title="Удалить">
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none">
                <path d="M5 7H19" stroke="#EF4444" stroke-width="2" stroke-linecap="round"/>
                <path d="M9 7V5H15V7" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M7 7L8 19H16L17 7" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10 11V16M14 11V16" stroke="#EF4444" stroke-width="1.7" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  filtring();
  search();
  itemsCounter();
}

clipsList?.addEventListener('click', async (e) => {
  const card = e.target.closest('.clip-card');
  if (!card) return;

  const copyBtn = e.target.closest('.btn-copy');
  const deleteBtn = e.target.closest('.btn-delete');

  if (copyBtn) {
    const text = card.querySelector('.clip-text')?.innerText || '';
    await copyToClipboard(text);
  }

  if (deleteBtn) {
    const clipId = card.dataset.id;
    await deleteClip(clipId);
  }
});

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showNotification('Текст скопирован в буфер обмена');
  } catch (err) {
    showNotification('Не удалось скопировать');
  }
}

async function deleteClip(clipId) {
  const { error } = await supabaseClient
    .from('clips')
    .delete()
    .eq('id', clipId);

  if (error) {
    showNotification(`Ошибка удаления: ${error.message}`);
  } else {
    await loadClips(); 
  }
}

document.addEventListener('click', async (e) => {
  if (e.target.closest('.deleteAll')) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return alert('Пользователь не авторизован');

    if (!confirm('Вы уверены, что хотите удалить все записи?')) return;

    const { error } = await supabaseClient
      .from('clips')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      showNotification(`Ошибка удаления: ${error.message}`);
    } else {
      await loadClips();
    }
  }
});

openSettings();
closeSettings();
textTransform();