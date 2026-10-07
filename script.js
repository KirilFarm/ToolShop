// Инициализация Telegram
const tg = window.Telegram && window.Telegram.WebApp;

// Хранилище состояния
let S = {
    name: 'Пользователь', 
    nick: '', 
    id: '---',
    bal: 0,
    photo: null, 
    keyHidden: true,
    fullKey: 'c17c66949f3d1b2e7a4c5aa',
    shortKey: 'c17c6694...a5aa',
    
    // Данные для магазина (МЕНЯЕМ СКЛАД НА 100)
    boostStock: 100,   // В наличии: 100 шт.
    boostPrice: 20.00,
    boostCount: 1      
};

const formatMoney = (amount) => Number(amount).toFixed(2) + ' ₴';

if (tg) {
    tg.ready();
    tg.expand();
    const u = tg.initDataUnsafe && tg.initDataUnsafe.user;
    if (u) {
        S.name = u.first_name || 'Пользователь';
        S.nick = u.username ? '@' + u.username : ''; 
        S.id = u.id || '---';
        S.photo = u.photo_url || null;
    }
}

function updateBuyUI() {
    const cEl = document.getElementById('boost-count');
    const tEl = document.getElementById('boost-total');
    if (cEl && tEl) {
        cEl.textContent = S.boostCount;
        tEl.textContent = formatMoney(S.boostCount * S.boostPrice);
    }
}

function updateStockUI() {
    document.querySelectorAll('.stock-display').forEach(el => {
        el.textContent = `В наличии: ${S.boostStock} шт.`;
    });
}

function initUI() {
    const h = new Date().getHours();
    const greeting = (h < 5 ? 'Доброй ночи' : h < 12 ? 'Доброе утро' : h < 18 ? 'Удачи в продажах' : 'Славный вечер') + ', ' + S.name;
    document.getElementById('greeting').textContent = greeting;

    document.querySelectorAll('.user-name').forEach(el => el.textContent = S.name);
    document.querySelectorAll('.user-nick').forEach(el => el.textContent = S.nick);
    document.querySelectorAll('.user-id').forEach(el => el.textContent = S.id);
    document.querySelectorAll('.user-bal').forEach(el => el.textContent = formatMoney(S.bal));

    updateStockUI();
    updateBuyUI();

    const avatar = document.getElementById('user-avatar');
    if (avatar) {
        if (S.photo) {
            avatar.style.backgroundImage = `url('${S.photo}')`;
            avatar.textContent = ''; 
        } else if (S.name) {
            avatar.textContent = S.name.substring(0, 2).toUpperCase();
            avatar.style.backgroundImage = 'linear-gradient(135deg, #ff1a1a, #990000)';
        }
    }

    const car = document.getElementById('car');
    if (car) {
        const dots = document.querySelectorAll('#dots i');
        const slides = car.querySelectorAll('.slide');
        let autoScrollTimer;

        car.addEventListener('scroll', () => {
            const i = Math.round(car.scrollLeft / car.clientWidth);
            dots.forEach((d, j) => d.classList.toggle('on', i === j));
        });

        const scrollNext = () => {
            if (!document.getElementById('view-home').classList.contains('active')) return;
            const currentIndex = Math.round(car.scrollLeft / car.clientWidth);
            let nextIndex = currentIndex + 1;
            if (nextIndex >= slides.length) nextIndex = 0;
            slides[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        };

        const startAutoScroll = () => { autoScrollTimer = setInterval(scrollNext, 3500); };
        const stopAutoScroll = () => { clearInterval(autoScrollTimer); };

        car.addEventListener('touchstart', stopAutoScroll, {passive: true});
        car.addEventListener('touchend', startAutoScroll, {passive: true});
        car.addEventListener('mouseenter', stopAutoScroll);
        car.addEventListener('mouseleave', startAutoScroll);

        startAutoScroll();
    }

    const pin = document.getElementById('pin');
    if (pin) {
        pin.addEventListener('input', () => {
            document.getElementById('pn').textContent = pin.value;
            document.getElementById('pc').textContent = pin.value.length + '/20';
        });
    }
    const bio = document.getElementById('bio');
    if (bio) {
        bio.addEventListener('input', () => {
            document.getElementById('bc').textContent = bio.value.length + '/190';
        });
    }
}
initUI();

function switchTab(tabId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-' + tabId).classList.add('active');

    document.querySelectorAll('nav button').forEach(b => {
        if (b.dataset.t === tabId || (tabId === 'hist' && b.dataset.t === 'me')) {
            b.classList.add('on');
        } else {
            b.classList.remove('on');
        }
    });
    document.getElementById('app').scrollTop = 0;
}

document.addEventListener('click', e => {
    const t = e.target.closest('[data-t], [data-go], [data-opt], [data-buy-tab], [data-lang], [data-toast], [data-topup], [data-buy-action], #boost-minus, #boost-plus, [data-boost-val], #toggle-key, #copy-key');
    if (!t) return;

    if (t.dataset.t || t.dataset.go) {
        switchTab(t.dataset.t || t.dataset.go);
    }
    else if (t.hasAttribute('data-opt')) {
        t.parentElement.querySelectorAll('.opt').forEach(opt => opt.classList.remove('sel'));
        t.classList.add('sel');
    }
    
    else if (t.id === 'boost-minus') {
        if (S.boostCount > 1) { S.boostCount--; updateBuyUI(); }
    }
    else if (t.id === 'boost-plus') {
        if (S.boostCount < S.boostStock) { S.boostCount++; updateBuyUI(); }
        else { showToast('Максимум в наличии!'); }
    }
    else if (t.hasAttribute('data-boost-val')) {
        let val = parseInt(t.dataset.boostVal);
        if (val <= S.boostStock) { S.boostCount = val; }
        else { S.boostCount = S.boostStock; }
        updateBuyUI();
    }
    
    else if (t.dataset.buyAction === 'boosts') {
        let total = S.boostCount * S.boostPrice;
        
        if (S.boostCount > S.boostStock) {
            return showToast('Недостаточно товара в наличии!');
        }
        if (S.bal < total) {
            return showToast('Недостаточно средств. Пополните баланс');
        }
        
        S.bal -= total;
        S.boostStock -= S.boostCount;
        S.boostCount = 1; 
        
        document.querySelectorAll('.user-bal').forEach(el => el.textContent = formatMoney(S.bal));
        updateStockUI();
        updateBuyUI();
        showToast('Покупка успешно выполнена!');
    }
    
    else if (t.dataset.topup) {
        S.bal += 1000;
        document.querySelectorAll('.user-bal').forEach(el => el.textContent = formatMoney(S.bal));
        showToast('Баланс пополнен на 1000 ₴ (Тест)');
    }

    else if (t.dataset.buyTab) {
        document.querySelectorAll('[data-buy-tab]').forEach(btn => btn.classList.remove('on'));
        t.classList.add('on');
        document.querySelectorAll('.buy-sec').forEach(sec => sec.classList.remove('active'));
        document.getElementById('buy-sec-' + t.dataset.buyTab).classList.add('active');
    }
    else if (t.dataset.lang) {
        document.querySelectorAll('[data-lang]').forEach(btn => btn.classList.remove('on'));
        t.classList.add('on');
    }
    else if (t.dataset.toast) {
        showToast(t.dataset.toast);
    }
    else if (t.id === 'toggle-key') {
        S.keyHidden = !S.keyHidden;
        document.getElementById('api-key-text').textContent = S.keyHidden ? S.shortKey : S.fullKey;
    }
    else if (t.id === 'copy-key') {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(S.fullKey).catch(() => {});
        }
        showToast('API ключ скопирован');
    }
});

function showToast(text) {
    const toast = document.getElementById('toast');
    toast.textContent = text;
    toast.classList.add('on');
    setTimeout(() => toast.classList.remove('on'), 1800);
}

// --- ЛОГИКА ЭКРАНА ЗАГРУЗКИ ---
window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if(loader) {
            loader.classList.add('hidden');
            setTimeout(() => { loader.remove(); }, 500);
        }
    }, 1500);
});
