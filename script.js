// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;

if (tg) {
    tg.ready();
    tg.expand(); // Развернуть на весь экран
    
    // Настройка цвета хедера и фона
    tg.setHeaderColor('#0b0c10');
    tg.setBackgroundColor('#0b0c10');

    // Получаем данные пользователя из Telegram
    const user = tg.initDataUnsafe?.user;
    
    // Если приложение открыто внутри Telegram, подставляем имя пользователя
    if (user && user.first_name) {
        document.getElementById('userName').textContent = user.first_name;
    }
}

// Обработка кнопки "Купить"
document.getElementById('buyButton').addEventListener('click', () => {
    if (tg && tg.initDataUnsafe?.user) {
        tg.showAlert('Открытие платежной системы для ' + tg.initDataUnsafe.user.first_name + '...');
    } else {
        alert('Открытие платежной системы... (работает вне Telegram)');
    }
});

// Анимация для нижней навигации (переключение активной иконки)
const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
    });
});

// Логика горизонтальной карусели и переключения точек
const track = document.getElementById('carouselTrack');
const dots = document.querySelectorAll('#paginationDots .dot');

if (track && dots.length > 0) {
    track.addEventListener('scroll', () => {
        // Вычисляем ширину одной карточки
        const cardWidth = track.offsetWidth;
        // Вычисляем, на сколько пикселей прокручена карусель
        const scrollLeft = track.scrollLeft;
        
        // Определяем индекс активной карточки (0 или 1)
        const activeIndex = Math.round(scrollLeft / cardWidth);

        // Обновляем классы для точек
        dots.forEach((dot, index) => {
            if (index === activeIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    });
}
