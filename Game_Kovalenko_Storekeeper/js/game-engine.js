// Глобальное состояние игры
let gameState = {
    playerName: '',
    company: 'company1',
    level: 1,
    score: 0,
    timeLeft: GAME_CONFIG.LEVEL_TIME,
    currentParty: null,
    usedCategories: [], // Для отслеживания использованных категорий на уровне 1
    intervalId: null
};

// DOM элементы
let scoreElement, timeElement, levelNameElement, questionElement;
let partyContainer, gameControls, boxesContainer, foundItemsContainer;

// Вспомогательные переменные для сканирования (уровень 3)
let scanningItem = null;
let scanProgress = 0;
let scanInterval = null;

// Вспомогательные переменные для drag&drop (уровень 2)
let draggedItem = null;
let dragStartX = 0;
let dragStartY = 0;

// Инициализация игры при загрузке страницы
function initGame() {
    // 1. Загружаем сохранённое состояние
    const savedState = loadGameState();
    if (savedState) {
        Object.assign(gameState, savedState);
        console.log('Загружено состояние:', gameState);
    } else {
        window.location.href = 'index.html';
        return;
    }  
    // 2. Находим DOM элементы
    scoreElement = document.getElementById('score');
    timeElement = document.getElementById('time-left');
    levelNameElement = document.getElementById('level-name');
    questionElement = document.getElementById('question-display');
    partyContainer = document.getElementById('party-container');
    gameControls = document.getElementById('game-controls');
    boxesContainer = document.getElementById('boxes-container');
    foundItemsContainer = document.getElementById('found-items');    
    // 3. Обновляем информацию в шапке
    document.getElementById('company-name').textContent = COMPANIES[gameState.company]?.name || 'Склад';
    document.getElementById('player-name').textContent = gameState.playerName;
    document.getElementById('current-level').textContent = gameState.level;
    document.getElementById('plan-score').textContent = LEVEL_SETTINGS[gameState.level]?.planScore || 10;
    levelNameElement.textContent = LEVEL_SETTINGS[gameState.level]?.name || '';  
    // 4. Применяем тему компании
    applyCompanyTheme(gameState.company);  
    // 5. Запускаем уровень
    startLevel();
}

// Запускает текущий уровень
function startLevel() {
    console.log(`Старт уровня ${gameState.level}`);
    // Сброс состояния уровня
    gameState.timeLeft = GAME_CONFIG.LEVEL_TIME;
    gameState.usedCategories = [];
    // Очищаем контейнеры
    partyContainer.innerHTML = '';
    boxesContainer.innerHTML = '';
    foundItemsContainer.innerHTML = '';
    // Настраиваем интерфейс для уровня
    setupLevelUI();
    // Обновляем UI
    updateUI();
    // Запускаем таймер
    startTimer();
    // Создаём первую партию
    createNewParty();
    // Вешаем обработчики
    setupEventListeners();
}

// Настраивает интерфейс для текущего уровня
function setupLevelUI() {
    const levelSettings = LEVEL_SETTINGS[gameState.level];
    
    // Обновляем название уровня
    levelNameElement.textContent = levelSettings.name;
    
    // Скрываем/показываем элементы управления
    questionElement.classList.toggle('hidden', gameState.level == 2);
    boxesContainer.classList.toggle('hidden', gameState.level !== 2);
    
    // Для уровня 2 создаём ящики
    if (gameState.level === 2) {
        createBoxes();
    }
}

// Создаёт новую партию предметов
function createNewParty() {   
    console.log('Создание новой партии...');
    
    // Очищаем контейнер
    partyContainer.innerHTML = '';
    partyContainer.classList.remove('party-exit', 'party-error');
    
    // Определяем целевые категории для этой партии
    let targetCategories = [];
    
    if (gameState.level === 1) {
        // Уровень 1: одна категория, которую ещё не спрашивали
        targetCategories = [getRandomCategoryId()];
        
        // Обновляем вопрос
        const categoryName = CATEGORIES[targetCategories[0]].emoji + ' ' + CATEGORIES[targetCategories[0]].name;
        document.getElementById('target-category').textContent = categoryName;
        document.getElementById('question-display-hint').textContent =`👇 Дважды кликните по нужному предмету`;
        
    } else if (gameState.level === 2) {
        // Уровень 2: две случайные разные категории
        targetCategories = getTwoRandomCategories();
        document.getElementById('question-display-hint').textContent =`📦 Перетащите предметы в нужный ящик`;
        // Обновляем ящики
        updateBoxes(targetCategories);
    } else if (gameState.level === 3) {
        // Уровень 3: одна категория (как в уровне 1)
        targetCategories = [getRandomCategoryId()];
        // Обновляем вопрос
        const categoryName = CATEGORIES[targetCategories[0]].emoji + ' ' + CATEGORIES[targetCategories[0]].name;
        document.getElementById('target-category').textContent = categoryName;
        document.getElementById('question-display-hint').textContent =`🔍 Наведите на предмет и нажмите ПРОБЕЛ для сканирования`;
    }
    
    // Создаём партию предметов
    const partyItems = [];
    //const partySize = GAME_CONFIG.PARTY_SIZE / (4 - gameState.level);
    const partySize = GAME_CONFIG.PARTY_SIZE;
    // 1. Гарантируем минимум 2 предмета из каждой целевой категории
    targetCategories.forEach(categoryId => {
        const categoryItems = ALL_ITEMS.filter(item => item.category === categoryId);
        for (let i = 0; i < 2; i++) {
            if (categoryItems.length > 0) {
                const item = { ...getRandomElement(categoryItems) };
                item.id = `item_${Date.now()}_${Math.random()}`;
                item.animation = getRandomAnimationForLevel(gameState.level);
                partyItems.push(item);
            }
        }
    });
    
    // 2. Добиваем остаток случайными предметами
    while (partyItems.length < partySize) {
        const randomItem = { ...getRandomElement(ALL_ITEMS) };
        randomItem.id = `item_${Date.now()}_${Math.random()}`;
        randomItem.animation = getRandomAnimationForLevel(gameState.level);
        partyItems.push(randomItem);
    }
    
    // 3. Перемешиваем
    const shuffledItems = shuffleArray(partyItems);
    
    // 4. Сохраняем партию в состоянии
    gameState.currentParty = {
        id: Date.now(),
        items: shuffledItems,
        targetCategories: targetCategories,
        foundCount: 0,
        requiredCount: countTargetItems(shuffledItems, targetCategories)
    };
    
    console.log(`Партия создана: ${shuffledItems.length} предметов, ` +
                `целевые категории: ${targetCategories}, ` +
                `нужно найти: ${gameState.currentParty.requiredCount}`);
    
    // 5. Создаём DOM элементы
    createPartyItems(shuffledItems);
    
    // Анимация появления
    partyContainer.classList.add('party-enter');
    setTimeout(() => {
        partyContainer.classList.remove('party-enter');
    }, 1000);
}

// Создаёт DOM элементы для предметов партии
function createPartyItems(items) {
    items.forEach(item => {
        const itemElement = createItemElement(item);
        partyContainer.appendChild(itemElement);
    });
}

// Создаёт DOM элемент предмета
function createItemElement(item) {
    const itemElement = createElement('div', 'item');
    itemElement.dataset.itemId = item.id;
    itemElement.dataset.category = item.category;
    
    // Добавляем анимацию
    if (item.animation) {
        itemElement.classList.add(item.animation.class, `${item.animation.class}-${item.animation.type}`);
    }
    
    // Эмодзи
    const emoji = createElement('div', 'item-emoji', item.emoji);
    itemElement.appendChild(emoji);
    
    // Название
    const name = createElement('div', 'item-name', item.name);
    itemElement.appendChild(name);
    
    // Для уровня 3 добавляем оверлей сканера
    if (gameState.level === 3) {
        const scannerOverlay = createElement('div', 'scanner-overlay');
        scannerOverlay.dataset.itemId = item.id;
        itemElement.appendChild(scannerOverlay);
        
        const scanProgressEl = createElement('div', 'scan-progress');
        scanProgressEl.dataset.itemId = item.id;
        itemElement.appendChild(scanProgressEl);
    }
    // В createItemElement() обновляем анимации для уровня 3:
if (gameState.level === 3) {
    // Используем анимации
    const bigAnimations = ['swim-horizontal-big', 'swim-vertical-big', 
                          'swim-diagonal-big', 'swim-random'];
    const randomBigAnim = getRandomElement(bigAnimations);
    itemElement.classList.add(randomBigAnim);
}
    // Обработчики событий в зависимости от уровня
    setupItemEventListeners(itemElement, item.id);
    
    // Случайная позиция в сетке (упрощённо)
    itemElement.style.gridArea = 'auto';
    
    return itemElement;
}

// Настраивает обработчики событий для предмета
function setupItemEventListeners(itemElement, itemId) {
    if (gameState.level === 1) {
        // Уровень 1: двойной клик
        itemElement.addEventListener('dblclick', () => handleLevel1Click(itemId));
        
    } else if (gameState.level === 2) {
        // Уровень 2: перетаскивание
        itemElement.setAttribute('draggable', 'true');
        itemElement.addEventListener('dragstart', (e) => handleDragStart(e, itemId));
        itemElement.addEventListener('dragend', handleDragEnd);
        
    } else if (gameState.level === 3) {
        // Уровень 3: наведение для сканирования
        itemElement.addEventListener('mouseenter', () => handleMouseEnter(itemId));
        itemElement.addEventListener('mouseleave', () => handleMouseLeave(itemId));
    }
}

// Создаёт ящики для уровня 2
function createBoxes() {
    boxesContainer.innerHTML = '';
    
    for (let i = 0; i < LEVEL_SETTINGS[2].boxesCount; i++) {
        const box = createElement('div', 'box');
        box.dataset.boxIndex = i;
        box.classList.add('box-pulse');
        
        // Эмодзи-заглушка (будет обновлено)
        const emoji = createElement('div', 'box-emoji', '?');
        box.appendChild(emoji);
        
        // Название категории
        const label = createElement('div', 'box-label', 'Загрузка...');
        box.appendChild(label);
        
        // Обработчик для drop
        box.addEventListener('dragover', handleDragOver);
        box.addEventListener('drop', (e) => handleDrop(e, i));
        
        boxesContainer.appendChild(box);
    }
}

// Обновляет ящики с категориями
function updateBoxes(targetCategories) {
    const boxes = boxesContainer.querySelectorAll('.box');
    
    targetCategories.forEach((categoryId, index) => {
        if (boxes[index]) {
            const category = CATEGORIES[categoryId];
            boxes[index].dataset.category = categoryId;
            boxes[index].querySelector('.box-emoji').textContent = category.emoji;
            boxes[index].querySelector('.box-label').textContent = category.name;
            boxes[index].style.setProperty('background-color', category.color);
        }
    });
}

// Получает две случайные разные категории
function getTwoRandomCategories() {
    const categoryIds = Object.keys(CATEGORIES).map(Number);
    const first = getRandomElement(categoryIds);
    
    // Вторая категория должна отличаться от первой
    let second;
    do {
        second = getRandomElement(categoryIds);
    } while (second === first);
    
    return [first, second];
}

// Считает сколько предметов целевых категорий в партии
function countTargetItems(items, targetCategories) {
    return items.filter(item => targetCategories.includes(item.category)).length;
}

// Получает случайную анимацию для уровня
function getRandomAnimationForLevel(level) {
    const animations = GAME_CONFIG.ANIMATIONS[`LEVEL${level}`];
    if (!animations) return null;
    
    const animationTypes = Object.keys(animations);
    const randomType = getRandomElement(animationTypes);
    const animation = animations[randomType];
    
    return {
        class: animation.class,
        type: getRandomElement(animation.types)
    };
}

// Обработчик правильного выбора
function handleCorrectChoice(item, itemElement) {
    // Конфетти
    createConfettiEffect();
    
    // Увеличиваем счет
    if (gameState.level === 3) {
        gameState.score += 2;
    }
    else
        gameState.score += 1;
        gameState.currentParty.foundCount++;
    
    // Добавляем в найденные
    addFoundItem(item.emoji);
    
    // Убираем предмет с анимацией
    itemElement.classList.add('item-remove');
    setTimeout(() => {
        if (itemElement.parentNode) {
            itemElement.remove();
        }
    }, 150);
    
    // Проверяем, закончилась ли партия
    if (gameState.currentParty.foundCount >= gameState.currentParty.requiredCount) {
        setTimeout(() => {
            nextParty();
        }, 1500); // Даём время эффектам
    }
    
    updateUI();
}

// Обработчик неправильного выбора
function handleWrongChoice() {
    showMessage('-1 очко', 'error');
    // Штраф
    gameState.score = Math.max(0, gameState.score - 1); 
    // Анимация ошибки
    partyContainer.classList.add('party-error');
    // Сбрасываем анимацию ошибки
    setTimeout(() => {
        partyContainer.classList.remove('party-error');
    }, 1000);
    updateUI();
}

// Добавляет найденный предмет в список снизу
function addFoundItem(emoji) {
    const foundItem = createElement('div', 'found-item', emoji);
    foundItemsContainer.appendChild(foundItem);
}

// Переход к следующей партии
function nextParty() {
    showMessage('Смена партии товаров...', 'info');
    console.log('Начинаем смену партии...');
    // 1. Анимация уезжания текущей партии
    partyContainer.classList.add('party-exit');   
    // 2. Очищаем найденные предметы
    foundItemsContainer.innerHTML = '';   
    // 3. Через 1 секунду создаём новую партию
    setTimeout(() => {
    console.log('Создаём новую партию...');
    // Очищаем контейнер полностью
    partyContainer.innerHTML = '';
    partyContainer.classList.remove('party-exit'); 
    // Создаём новую партию
    createNewParty();
    }, 1000); // Даём время на анимацию уезжания
}

// УРОВЕНЬ 1: DOUBLE CLCIK 
function handleLevel1Click(itemId) { 
    const item = gameState.currentParty.items.find(i => i.id === itemId);
    const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
    
    if (!item || !itemElement) return;
    
    const isTargetCategory = gameState.currentParty.targetCategories.includes(item.category);
    
    if (isTargetCategory) {
        // Правильный выбор
        handleCorrectChoice(item, itemElement);
        showMessage('+1 очко', 'success');
    } else {
        // Неправильный выбор
        handleWrongChoice();
    }
}

// УРОВЕНЬ 2: DRAG & DROP
function handleDragStart(e, itemId) {
    draggedItem = itemId;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    
    // Устанавливаем данные для drag
    e.dataTransfer.setData('text/plain', itemId);
    e.dataTransfer.effectAllowed = 'move';
    
    // Визуальный эффект
    const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
    if (itemElement) {
        itemElement.style.opacity = '0.5';
    }
}

function handleDragEnd(e) {
    const itemElement = document.querySelector(`[data-item-id="${draggedItem}"]`);
    if (itemElement) {
        itemElement.style.opacity = '1';
    }
    draggedItem = null;
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e, boxIndex) {
    e.preventDefault();
    
    if (!draggedItem) return;
    
    const item = gameState.currentParty.items.find(i => i.id === draggedItem);
    const itemElement = document.querySelector(`[data-item-id="${draggedItem}"]`);
    const box = boxesContainer.querySelector(`[data-box-index="${boxIndex}"]`);
    
    if (!item || !itemElement || !box) return;
    
    const targetCategory = parseInt(box.dataset.category);
    const isCorrect = item.category === targetCategory;
    
    if (isCorrect) {
        // Правильно: добавляем в ящик
        handleCorrectChoice(item, itemElement);   
        showMessage('+1 очко', 'success');    
    } else {
        // Неправильно: возвращаем на место
        handleWrongChoice();
        itemElement.style.opacity = '1';
    }
    
    draggedItem = null;
}

// УРОВЕНЬ 3: СКАНИРОВАНИЕ
// Наведение мыши на предмет для сканирования
function handleMouseEnter(itemId) {
    if (gameState.level !== 3) return;  
    scanningItem = itemId;
    const scanner = document.querySelector(`.scanner-overlay[data-item-id="${itemId}"]`);
    if (scanner) {
        scanner.classList.add('scanner-red');
    }
}

// Действия при наведенное мыши
function handleMouseLeave(itemId) {
    if (gameState.level !== 3) return;    
    if (scanningItem === itemId) {
        stopScanning();
        scanningItem = null;
    }   
    const scanner = document.querySelector(`.scanner-overlay[data-item-id="${itemId}"]`);
    if (scanner) {
        scanner.classList.remove('scanner-red');
    }
}

// Нажатие пробела
function handleKeyPress(e) {
    if (gameState.level === 3 && e.key === ' ' && scanningItem) {
        e.preventDefault();
        startScanning(scanningItem);
    }
}

// Начинает сканирование
function startScanning(itemId) {
    if (scanInterval) return;
    
    console.log(`Сканирование предмета: ${itemId}`);
    
    const scanProgressEl = document.querySelector(`.scan-progress[data-item-id="${itemId}"]`);
    if (!scanProgressEl) return;
    
    scanProgress = 0;
    scanInterval = setInterval(() => {
        scanProgress += 10;
        scanProgressEl.style.setProperty('--progress', `${scanProgress * 3.6}deg`);
        
        if (scanProgress >= 100) {
            completeScan(itemId);
        }
    }, 100); // 1 секунда на полное сканирование
}

// Действия при выполненном сканировании
function completeScan(itemId) {
    // Останавливаем прогресс сканирования
    stopScanning();
    // Ищем объект предмета в текущей партии по его ID
    const item = gameState.currentParty.items.find(i => i.id === itemId);
    const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
    if (!item || !itemElement) return;
    // Проверяем, относится ли предмет к целевой категории
    const isTargetCategory = gameState.currentParty.targetCategories.includes(item.category);
    if (isTargetCategory) {
        handleCorrectChoice(item, itemElement);
        showMessage('+2 очка', 'success');
    } else {
        handleWrongChoice();
    }
    scanningItem = null;
}

// Остановка сканирования
function stopScanning() {
    if (scanInterval) {
        clearInterval(scanInterval);
        scanInterval = null;
        scanProgress = 0;
        // Сбрасываем прогресс на всех элементах
        const progressElements = document.querySelectorAll('.scan-progress');
        progressElements.forEach(el => {
            el.style.setProperty('--progress', '0deg');
        });
    }
}

// Общие функции

// Обработчики
function setupEventListeners() {
    // Кнопка экстренной остановки
    document.getElementById('emergency-stop').addEventListener('click', endLevelEarly);
    
    // Обработка клавиатуры
    if (gameState.level === 3) {
        document.addEventListener('keydown', handleKeyPress);
    }
}

// Обновление интерфейса очков и таймера
function updateUI() {
    if (scoreElement) scoreElement.textContent = gameState.score;
    if (timeElement) timeElement.textContent = gameState.timeLeft;
    
    // Предупреждение при малом времени
    if (gameState.timeLeft <= 30) {
        timeElement.classList.add('timer-warning');
    } else {
        timeElement.classList.remove('timer-warning');
    }
}

// Таймер игры
function startTimer() {
    if (gameState.intervalId) {
        clearInterval(gameState.intervalId);
    }
    
    gameState.intervalId = setInterval(() => {
        if (gameState.timeLeft > 0) {
            gameState.timeLeft--;
            updateUI();
        } else {
            endLevel();
        }
    }, 1000);
}
// Досрочное завершение
function endLevelEarly() {
    if (confirm('Завершить уровень досрочно?\nТекущие очки: ' + gameState.score + 
                '\nПлан: ' + LEVEL_SETTINGS[gameState.level].planScore)) {
        endLevel();
    }
}

// Завершение уровня
function endLevel() {
    console.log('Завершение уровня...');
    // Останавливаем таймер
    if (gameState.intervalId) {
        clearInterval(gameState.intervalId);
        gameState.intervalId = null;
    }   
    // Снимаем обработчики
    document.removeEventListener('keydown', handleKeyPress);
    stopScanning();   
    // Проверяем выполнение плана
    const planScore = LEVEL_SETTINGS[gameState.level].planScore;
    const isPlanCompleted = gameState.score >= planScore;
    // Сохраняем результат
    saveRecord(gameState.playerName, gameState.company, gameState.score);  
    // Определяем следующий уровень
    let nextState = null;  
    if (isPlanCompleted) {
        // План выполнен
        if (gameState.level < 3) {
            // Следующий уровень
            nextState = {
                playerName: gameState.playerName,
                company: gameState.company,
                level: gameState.level + 1,
                score: 0
            };
        } else {
            // Игра полностью пройдена
            nextState = {
                playerName: gameState.playerName,
                company: gameState.company,
                level: 1,
                score: 0
            };
        }
    } else {
        // План не выполнен - начинаем уровень заново
        nextState = {
            playerName: gameState.playerName,
            company: gameState.company,
            level: gameState.level,
            score: 0
        };
    }  
    // Сохраняем прогресс
    saveGameState(nextState);
    // Переходим на страницу результатов
    setTimeout(() => {
        window.location.href = 'results.html?score=' + gameState.score + 
                               '&level=' + gameState.level + 
                               '&plan=' + planScore +
                               '&completed=' + isPlanCompleted +
                               '&nextLevel=' + (nextState.level || 1);
    }, 1000);
}

// Запускаем игру когда страница загрузится
window.addEventListener('DOMContentLoaded', initGame);