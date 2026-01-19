// Создаёт кусочек конфетти
function createConfettiPiece(container) {
    const confetti = createElement('div', 'confetti-piece');
    
    // Случайная позиция сверху
    confetti.style.left = `${Math.random() * 100}vw`;
    confetti.style.top = '-20px';
    
    // Случайный размер и форма
    const size = 10 + Math.random() * 20;
    const isCircle = Math.random() > 0.5;
    
    confetti.style.width = `${size}px`;
    confetti.style.height = `${isCircle ? size : size/2}px`;
    confetti.style.backgroundColor = getRandomConfettiColor();
    confetti.style.borderRadius = isCircle ? '50%' : '2px';
    
    // Случайное вращение
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    
    // Анимация падения
    const animation = confetti.animate([
        { 
            transform: 'translateY(0) rotate(0deg)',
            opacity: 1
        },
        { 
            transform: `translateY(100vh) rotate(${360 + Math.random() * 360}deg)`,
            opacity: 0
        }
    ], {
        duration: 2000 + Math.random() * 1000,
        easing: 'cubic-bezier(0.1, 0.2, 0.8, 1)'
    });
    
    container.appendChild(confetti);
    
    // Удаляем после анимации
    animation.onfinish = () => {
        if (confetti.parentNode) {
            confetti.remove();
        }
    };
}

// Переливания предметов
function makeAllItemsSparkle() {
    const items = document.querySelectorAll('.item');
    items.forEach(item => {
        item.classList.add('sparkle-effect');
    });
}

// Останавливает переливание
function stopAllItemsSparkle() {
    const items = document.querySelectorAll('.item');
    items.forEach(item => {
        item.classList.remove('sparkle-effect');
    });
}

// Случайный цвет для конфетти
function getRandomConfettiColor() {
    const colors = [
        '#FF0000', '#FF6B00', '#FFD700', '#00FF00',
        '#00FFFF', '#0000FF', '#8A2BE2', '#FF00FF',
        '#FF1493', '#00FF7F', '#1E90FF', '#FF4500'
    ];
    return getRandomElement(colors);
}

// Эффект конфетти
function createConfettiEffect() {
    const confettiContainer = createElement('div', 'confetti-container');
    confettiContainer.style.position = 'fixed';
    confettiContainer.style.top = '0';
    confettiContainer.style.left = '0';
    confettiContainer.style.width = '100vw';
    confettiContainer.style.height = '100vh';
    confettiContainer.style.pointerEvents = 'none';
    confettiContainer.style.zIndex = '999';
    
    document.body.appendChild(confettiContainer);
    
    // Создаём 150 конфетти
    for (let i = 0; i < 150; i++) {
        setTimeout(() => {
            createConfettiPiece(confettiContainer);
        }, i * 10);
    }
    // Переливание всех предметов
    makeAllItemsSparkle();
    
    // Убираем переливание через 2 секунды
    setTimeout(() => {
        stopAllItemsSparkle();
    }, 2000);
    
    // Удаляем через 3 секунды
    setTimeout(() => {
        if (confettiContainer.parentNode) {
            confettiContainer.remove();
        }
    }, 3000);
}

