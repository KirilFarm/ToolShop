// Инициализация Telegram
const tg = window.Telegram && window.Telegram.WebApp;

// Хранилище состояния
let S = {
    name: 'Пользователь', 
    nick: '', 
    id: 'test_browser_id', 
    bal: 0,
    photo: null, 
    keyHidden: true,
    fullKey: 'c17c66949f3d1b2e7a4c5aa',
    shortKey: 'c17c6694...a5aa',
    boostStock: 0,   
    boostPrice: 20.00,
    boostCount: 1      
};

// ЗДЕСЬ УКАЖИ СВОЙ ЮЗЕРНЕЙМ В ТЕЛЕГРАМЕ ДЛЯ ПРИЕМА ОПЛАТЫ:
const ADMIN_USERNAME = 'your_username';

const formatMoney = (amount) => Number(amount).toFixed(2) + ' ₴';

if (tg) {
    tg.ready();
    tg.expand();
    const u = tg.initDataUnsafe && tg.initDataUnsafe.user;
    if (u) {
        S.name = u.first_name || 'Пользователь';
        S.nick = u.username ? '@' + u.username : ''; 
        S.id = String(u.id); 
        S.photo = u.photo_url || null;
    }
}

// --- СВЯЗЬ С БЭКЕНДОМ ---
async function fetchUserData() {
    try {
        const res = await fetch('/api/get_user', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({tg_id: S.id, name: S.name})
        });
        const data = await res.json();
        S.bal = data.balance;
        S.boostStock = data.stock;
    } catch (e) {
        console.error("Ошибка сети:", e);
    }
}

async function buyItemOnServer(amount, totalPrice) {
    try {
        const res = await fetch('/api/buy', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({tg_id: S.id, amount: amount, total_price: totalPrice})
        });
        const data = await res.json();
        
        if (res.ok) {
            S.bal = data.new_balance;
            S.boostStock = data.new_stock;
            return true;
        } else {
            showToast(data.detail || "Ошибка покупки");
            return false;
        }
    } catch (e) {
        showToast("Ошибка соединения с сервером");
        return false;
    }
}

// ---------------------------------

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

function updateBalanceUI() {
    document.querySelectorAll('.user-bal').forEach(el => el.textContent = formatMoney(S.bal));
}

function initUI() {
    const h = new Date().getHours();
    const greeting = (h < 5 ? 'Доброй ночи' : h < 12 ? 'Доброе утро' : h < 18 ? 'Удачи в продажах' : 'Славный вечер') + ', ' + S.name;
    document.getElementById('greeting').textContent = greeting;

    document.querySelectorAll('.user-name').forEach(el => el.textContent = S.name);
    document.querySelectorAll('.user-nick').forEach(el => el.textContent = S.nick);
    document.querySelectorAll('.user-id').forEach(el => el.textContent = S.id);
    
    updateBalanceUI();
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

    const btnEditBanner = document.getElementById('btn-edit-banner');
    const btnResetImages = document.getElementById('btn-reset-images');
    const previewAvatar = document.getElementById('preview-avatar');
    const previewBanner = document.getElementById('preview-banner');
    const bannerText = document.getElementById('banner-text');
    const uploadBanner = document.getElementById('upload-banner');
    const uploadAvatar = document.getElementById('upload-avatar');

    if (btnEditBanner && uploadBanner) btnEditBanner.addEventListener('click', () => uploadBanner.click());
    if (previewAvatar && uploadAvatar) previewAvatar.addEventListener('click', () => uploadAvatar.click());

    if (uploadBanner) {
        uploadBanner.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewBanner.style.backgroundImage = `url('${e.target.result}')`;
                    if(bannerText) bannerText.style.display = 'none';
                }
                reader.readAsDataURL(file);
            }
        });
    }

    if (uploadAvatar) {
        uploadAvatar.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewAvatar.style.backgroundImage = `url('${e.target.result}')`;
                    previewAvatar.innerHTML = '';
                }
                reader.readAsDataURL(file);
            }
        });
    }

    if (btnResetImages) {
        btnResetImages.addEventListener('click', () => {
            previewBanner.style.backgroundImage = '';
            if(bannerText) bannerText.style.display = 'block';
            if(uploadBanner) uploadBanner.value = '';
            previewAvatar.style.backgroundImage = '';
            previewAvatar.innerHTML = 'TOOL<br>SHOP';
            if(uploadAvatar) uploadAvatar.value = '';
            showToast('Фотографии сброшены');
        });
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
            let nextIndex = currentIndex + 1 >= slides.length ? 0 : currentIndex + 1;
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
    if (pin) pin.addEventListener('input', () => {
        document.getElementById('pn').textContent = pin.value;
        document.getElementById('pc').pin.value.length + '/20';
    });

    const bio = document.getElementById('bio');
    if (bio) bio.addEventListener('input', () => {
        document.getElementById('bc').textContent = bio.value.length + '/190';
    });
}

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

document.addEventListener('click', async e => {
    // === ОБРАБОТКА КЛИКОВ ПО СПОСОБАМ ПОПОЛНЕНИЯ И МОДАЛКАМ ===
    const tPay = e.target.closest('.pay-method');
    if (tPay) {
        showToast('Ожидание оплаты...');
        document.getElementById('topup-modal').classList.remove('active');
        
        // Открываем личку с админом для перевода (так как баланс пополняется вручную при переводе)
        setTimeout(() => {
            if (tg) {
                tg.openTelegramLink(`https://t.me/${ADMIN_USERNAME}`);
            } else {
                window.open(`https://t.me/${ADMIN_USERNAME}`, '_blank');
            }
        }, 1000);
        return;
    }

    const tOpenModal = e.target.closest('[data-open-modal]');
    if (tOpenModal) {
        document.getElementById(tOpenModal.dataset.openModal).classList.add('active');
        return;
    }

    const tCloseModal = e.target.closest('[data-close-modal], .modal-overlay');
    // Если кликнули на саму форму внутри модалки - не закрываем
    if (tCloseModal && !e.target.closest('.modal-sheet')) {
        document.getElementById('topup-modal').classList.remove('active');
        return;
    }
    // Если кликнули именно по кнопке "Отмена"
    if (e.target.closest('[data-close-modal]')) {
        document.getElementById('topup-modal').classList.remove('active');
        return;
    }
    // =========================================================

    const t = e.target.closest('[data-t], [data-go], [data-opt], [data-buy-tab], [data-lang], [data-toast], [data-buy-action], #boost-minus, #boost-plus, [data-boost-val]');
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
        S.boostCount = val <= S.boostStock ? val : S.boostStock;
        if(S.boostStock === 0) S.boostCount = 1;
        updateBuyUI();
    }
    
    // Кнопка покупки с сервера
    else if (t.dataset.buyAction === 'boosts') {
        let total = S.boostCount * S.boostPrice;
        if (S.boostCount > S.boostStock) return showToast('Недостаточно товара!');
        
        const originalText = t.textContent;
        t.textContent = "Обработка...";
        t.style.pointerEvents = "none";

        const success = await buyItemOnServer(S.boostCount, total);
        
        if (success) {
            S.boostCount = 1; 
            updateBalanceUI();
            updateStockUI();
            updateBuyUI();
            showToast('Покупка успешно выполнена!');
        }
        
        t.textContent = originalText;
        t.style.pointerEvents = "auto";
    }

    else if (t.dataset.buyTab) {
        document.querySelectorAll('[data-buy-tab]').forEach(btn => btn.classList.remove('on'));
        t.classList.add('on');
        document.querySelectorAll('.buy-sec').forEach(sec => sec.classList.remove('active'));
        document.getElementById('buy-sec-' + t.dataset.buyTab).classList.add('active');
    }
    else if (t.dataset.toast) {
        showToast(t.dataset.toast);
    }
});

function showToast(text) {
    const toast = document.getElementById('toast');
    toast.textContent = text;
    toast.classList.add('on');
    setTimeout(() => toast.classList.remove('on'), 1800);
}

window.addEventListener('load', async () => {
    await fetchUserData();
    initUI();
    
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if(loader) {
            loader.classList.add('hidden');
            setTimeout(() => { loader.remove(); }, 500);
        }
    }, 500);
});
