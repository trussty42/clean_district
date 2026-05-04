function initHeaderAvatar() {
    const btn = document.getElementById('authButton');
    if (!btn) {
        console.error('❌ Кнопка #authButton не найдена!');
        return;
    }
    
    const saved = localStorage.getItem('ck_userAvatar');
    const currentUser = localStorage.getItem('ck_currentUser');
    
    console.log('🔍 initHeaderAvatar:', {
        кнопка: btn,
        есть_фото: !!saved,
        есть_юзер: !!currentUser,
        классы_до: btn.className
    });
    
    if (saved && currentUser) {
        console.log('✅ Показываем аватар');
        btn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <img src="${saved}" alt="Аватар" style="display:block;" />
        `;
        btn.classList.add('is-logged-in');
        btn.classList.remove('header__button-login');
        btn.onclick = () => window.location.href = 'dashboard.html';
    } else {
        console.log('ℹ️ Показываем "Вход"');
        btn.innerHTML = 'Вход';
        btn.classList.remove('is-logged-in');
        btn.onclick = () => window.location.href = 'profile.html';
    }
    
    console.log('классы_после:', btn.className);
}