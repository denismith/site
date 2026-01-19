// Конфигурация игры
const GAME_CONFIG = {
    PARTY_SIZE: 30,     // Количество предметов в партии
    LEVEL_TIME: 90,     // Время уровня в секундах
    ITEM_SIZE: 150,     // Размер предмета в пикселях
    
    // Настройки анимаций
    ANIMATIONS: {
        // Уровень 1
        LEVEL1: {
            pulse: { class: "pulse", types: ["slow", "medium", "fast"] },
            rotate: { class: "rotate", types: ["left", "right", "alternate"] },
            bounce: { class: "bounce", types: ["small", "medium", "large"] }
        },
        // Уровень 2
        LEVEL2: {
            jump: { class: "jump", types: ["slow", "medium", "fast"] },
            float: { class: "float", types: ["gentle", "medium"] },
            pulse: { class: "pulse", types: ["slow", "medium", "fast"] },
            rotate: { class: "rotate", types: ["left", "right", "alternate"] },
            bounce: { class: "bounce", types: ["small", "medium", "large"] }
        },
        // Уровень 3 
        LEVEL3: {
            swim: { class: "swim", types: ["horizontal", "vertical", "diagonal"] },
            glow: { class: "glow", types: ["red", "blue", "green", "rainbow"] }
        }
    }
};

// Категории товаров (9 категорий)
const CATEGORIES = {
    1: { id: 1, name: "Еда", emoji: "🍎", color: "#FF6B6B" },
    2: { id: 2, name: "Одежда", emoji: "👕", color: "#4ECDC4" },
    3: { id: 3, name: "Электроника", emoji: "📱", color: "#45B7D1" },
    4: { id: 4, name: "Инструменты для ремонта", emoji: "🔧", color: "#96CEB4" },
    5: { id: 5, name: "Украшения", emoji: "💎", color: "#FFEAA7" },
    6: { id: 6, name: "Растения", emoji: "🌵", color: "#55EFC4" },
    7: { id: 7, name: "Спортивный инвентарь", emoji: "⚽", color: "#74B9FF" },
    8: { id: 8, name: "Музыкальные инструменты", emoji: "🎸", color: "#A29BFE" },
    9: { id: 9, name: "Канцелярия", emoji: "📎", color: "#FDA7DF" }
};

// Все предметы игры
const ALL_ITEMS = [
    // Категория 1: Еда
    { emoji: "🍎", name: "яблоко", category: 1 },
    { emoji: "🍌", name: "банан", category: 1 },
    { emoji: "🍕", name: "пицца", category: 1 },
    { emoji: "🍔", name: "бургер", category: 1 },
    { emoji: "🥝", name: "киви", category: 1 },
    { emoji: "🍇", name: "виноград", category: 1 },
    { emoji: "🥐", name: "круассан", category: 1 },
    
    // Категория 2: Одежда
    { emoji: "👕", name: "футболка", category: 2 },
    { emoji: "👖", name: "джинсы", category: 2 },
    { emoji: "👠", name: "туфли", category: 2 },
    { emoji: "🧥", name: "пальто", category: 2 },
    { emoji: "👗", name: "платье", category: 2 },
    { emoji: "🧦", name: "носки", category: 2 },
    
    // Категория 3: Электроника
    { emoji: "📱", name: "телефон", category: 3 },
    { emoji: "💻", name: "ноутбук", category: 3 },
    { emoji: "🎧", name: "наушники", category: 3 },
    { emoji: "🎮", name: "приставка", category: 3 },
    { emoji: "📷", name: "камера", category: 3 },
    { emoji: "🖨️", name: "принтер", category: 3 },
    { emoji: "⌨️", name: "клавиатура", category: 3 },
    
    // Категория 4: Инструменты для ремонта
    { emoji: "🔨", name: "молоток", category: 4 },
    { emoji: "🔧", name: "гаечный ключ", category: 4 },
    { emoji: "🪚", name: "пила", category: 4 },
    { emoji: "🧰", name: "инструменты", category: 4 },
    { emoji: "⚒️", name: "молот и кирка", category: 4 },
    { emoji: "🪛", name: "отвертка", category: 4 },

    // Категория 5: Украшения
    { emoji: "🎀", name: "бант", category: 5 },
    { emoji: "💍", name: "кольцо", category: 5 },
    { emoji: "👑", name: "корона", category: 5 },
    { emoji: "🕶️", name: "очки", category: 5 },
    
    // Категория 6: Растения
    { emoji: "🌵", name: "кактус", category: 6 },
    { emoji: "🌻", name: "подсолнух", category: 6 },
    { emoji: "🌹", name: "роза", category: 6 },
    { emoji: "🍀", name: "клевер", category: 6 },
    { emoji: "🎋", name: "бамбук", category: 6 },
    
    // Категория 7: Спортивный инвентарь
    { emoji: "⚽", name: "футбольный мяч", category: 7 },
    { emoji: "🏀", name: "баскетбольный мяч", category: 7 },
    { emoji: "🎾", name: "теннисная ракетка", category: 7 },
    { emoji: "🏒", name: "хоккейная клюшка", category: 7 },
    { emoji: "🥊", name: "боксерские перчатки", category: 7 },
    { emoji: "🥌", name: "Камень для керлинга", category: 7 },
    
    // Категория 8: Музыкальные инструменты
    { emoji: "🎸", name: "гитара", category: 8 },
    { emoji: "🎹", name: "пианино", category: 8 },
    { emoji: "🎺", name: "труба", category: 8 },
    { emoji: "🥁", name: "барабаны", category: 8 },
    { emoji: "🎻", name: "скрипка", category: 8 },
    { emoji: "🪉", name: "арфа", category: 8 },
    
    // Категория 9: Канцелярия
    { emoji: "📎", name: "скрепка", category: 9 },
    { emoji: "✏️", name: "карандаш", category: 9 },
    { emoji: "📏", name: "линейка", category: 9 },
    { emoji: "📌", name: "кнопка", category: 9 },
    { emoji: "📒", name: "тетрадь", category: 9 }
];

// Настройки уровней
const LEVEL_SETTINGS = {
    1: {
        name: "Найди и дважды кликни",
        mechanics: "doubleClick",
        description: "Найдите все предметы указанной категории",
        requiredCategories: [], // Будет заполняться динамически
        planScore: 9
    },
    2: {
        name: "Перетащи в нужный ящик",
        mechanics: "dragDrop",
        boxesCount: 2,
        description: "Перетащите предметы в правильные ящики",
        planScore: 15
    },
    3: {
        name: "Просканируй предметы",
        mechanics: "scan",
        scanTime: 1000, // 1 секунда на сканирование
        description: "Наведите и удерживайте пробел для сканирования",
        planScore: 25
    }
};

// Настройки компаний
const COMPANIES = {
    company1: {
        name: "🍓 Strawberries",
        colorPrimary: "#AF4C4C",
        colorSecondary: "#c34a4a",
        conveyorColor: "#8e3838"
    },
    company2: {
        name: "⚡️ Flash Warehouse",
        colorPrimary: "#E47900",
        colorSecondary: "#FF9800",
        conveyorColor: "#E6AF19"
    },
    company3: {
        name: "🚙 Express Logistics",
        colorPrimary: "#2196F3",
        colorSecondary: "#03A9F4",
        conveyorColor: "#1976D2"
        
    }
};