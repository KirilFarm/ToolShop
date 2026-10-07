// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;

if (tg) {
    tg.ready();
    tg.expand(); // Развернуть на весь экран
    tg.setHeaderColor('#0b0c10');
    tg.setBackgroundColor('#0b0c10');
}

// Обработка кнопки покупки
document.getElementById('buyButton').addEventListener('click', () => {
    if (tg) {
        tg.showAlert('Открытие платежной системы...');
        // Для отправки данных обратно в бота:
        // tg.sendData(JSON.stringify({action: 'buy', item: 'boost'}));
    } else {
        alert('Открытие платежной системы... (работает вне Telegram)');
    }
});

// Добавим простую анимацию для навигации
const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
    });
});