import { GIFT, FRIENDS } from '../state/catalog.js';

const RU = {
  living: 'Гостиная', kitchen: 'Кухня', bath: 'Ванная', bedroom: 'Спальня',
  rooms: 'Комнаты', play: 'Играть', playAria: 'Выбрать игру', games: 'Во что поиграем?', gameNyan: 'Полёт', gameNyanSub: 'лети на радуге и собирай монетки', gameSort: 'Переливашки', gameSortSub: 'расставь цвета по баночкам',
  food: 'Еда', clean: 'Чистота', energy: 'Энергия', fun: 'Веселье', potty: 'Туалет',
  needValue: '{name}: {v} из 100',
  coinsAria: 'Монетки: {n}', levelAria: 'Уровень {n}, опыт {xp} из {max}',
  soundOff: 'Выключить звук', soundOn: 'Включить звук',
  fridge: 'Холодильник', sponge: 'Мочалка', rinse: 'Смыть', toilet: 'На горшок',
  book: 'Почитать', curtainsOpen: 'Открыть шторы', curtainsClose: 'Закрыть шторы', brush: 'Зубки', brushedAlready: 'Я уже чистил зубки!', lightOff: 'Выключить свет', lightOn: 'Включить свет', console: 'Приставка', dance: 'Танец', wardrobe: 'Гардероб', sofaOn: 'Диван', sofaOff: 'Слезть',
  dragFood: 'Перетащи вкусняшку в миску или просто нажми',
  invite: '{name} придёт в гости на {n} уровне', inviteHint: 'Корми, купай и играй с котиком, чтобы поднять уровень',
  friendTitle: 'К котику пришёл {name}!', friendText: 'Теперь они дружат, обнимаются и танцуют вместе',
  full: '{cat} сыт и не хочет есть', noCoins: 'Не хватает монеток. Нажми «Играть»!',
  spongeHint: 'Поводи мочалкой по котику', rinseHint: 'Теперь смой пену', noFoam: 'Сначала потри мочалкой',
  cleanAlready: '{cat} и так чистенький', notPotty: 'Пока не хочется',
  sleeping: 'Тсс, {cat} спит. Включи свет, чтобы разбудить', tooMany: 'Ай, хватит! {cat} обиделся',
  busy: 'Минутку, {cat} занят',
  tea: 'Чай', snack: 'Вкусняшка', tv: 'Телик', water: 'Полить', watered: 'Цветок уже полит, пусть отдохнёт',
  dailyTitle: 'Подарок дня', dailyText: '+{n} монеток', streak: 'Дней подряд: {d}',
  levelTitle: 'Новый уровень!', levelText: 'Уровень {n}. Загляни в гардероб: там новые вещи',
  missTitle: 'Скучал по тебе!', missText: '{cat} так ждал, когда ты вернёшься',
  ok: 'Ура!', close: 'Закрыть',
  giftTitle: 'Тебе подарок', giftFor: '{name}, это тебе', giftPlaceholder: 'Тут будет послание', giftBox: 'Открыть подарок',
  coinsWon: '+{n} монеток',
  sortLevel: 'Уровень {n}', sortUndo: 'Отмена', sortRestart: 'Заново', sortAddJar: '+ баночка', sortLevels: 'Уровни', sortExit: 'Выход',
  sortStuck: 'Ходов нет — отмени или начни заново', sortWon: 'Уровень {n} пройден!', sortNext: 'Дальше', sortMoves: 'Ходов: {n}', sortPick: 'Выбери уровень',
  sortLevelAria: 'Уровень {n}, звёзд: {s}', sortLockedAria: 'Уровень {n} закрыт', sortStarsAria: 'Звёзд: {s} из 3', sortJarPrice: 'Добавить пустую баночку за {n} монеток',
  head: 'Голова', eyes: 'Очки', body: 'Одежда',
  buy: 'Купить', wear: 'Надеть', takeOff: 'Снять', lockedFrom: 'С {n} ур.', price: '{n} монеток',
  whoAria: 'Кого одеваем', giveName: 'Дать имя', nameLabel: 'Имя', nameDone: 'Готово', noOwned: 'Сначала купи вещи для {cat}: {name} сможет их надеть',
  dev: 'Консоль', devCoins: '+1000 монет', devInf: '∞ монет', devLevel: 'Уровень', devLevelDown: 'Уровень минус 1', devLevelUp: 'Уровень плюс 1',
  devUnlock: 'Открыть все вещи', devFill: 'Заполнить все нужды', devGift: 'Показать подарок', devFriend: 'Позвать {name} сейчас',
  devSortAll: 'Все уровни Переливашек', devReset: 'Сбросить прогресс', devSure: 'Точно сбросить весь прогресс?', devYes: 'Да, сбросить', devNo: 'Отмена',
};

const EN = {
  living: 'Living', kitchen: 'Kitchen', bath: 'Bath', bedroom: 'Bedroom',
  rooms: 'Rooms', play: 'Play', playAria: 'Choose a game', games: 'What shall we play?', gameNyan: 'Flight', gameNyanSub: 'fly on a rainbow and catch coins', gameSort: 'Pour Party', gameSortSub: 'sort the colors into jars',
  food: 'Food', clean: 'Clean', energy: 'Energy', fun: 'Fun', potty: 'Potty',
  needValue: '{name}: {v} of 100',
  coinsAria: 'Coins: {n}', levelAria: 'Level {n}, XP {xp} of {max}',
  soundOff: 'Mute sound', soundOn: 'Turn sound on',
  fridge: 'Fridge', sponge: 'Sponge', rinse: 'Rinse', toilet: 'Potty time',
  book: 'Read', curtainsOpen: 'Open curtains', curtainsClose: 'Close curtains', brush: 'Teeth', brushedAlready: 'I already brushed my teeth!', lightOff: 'Lights off', lightOn: 'Lights on', console: 'Video game', dance: 'Dance', wardrobe: 'Wardrobe', sofaOn: 'Sofa', sofaOff: 'Hop down',
  dragFood: 'Drag a treat into the bowl or just tap it',
  invite: '{name} visits at level {n}', inviteHint: 'Feed, bathe and play with the kitty to level up',
  friendTitle: '{name} came to visit!', friendText: 'Now they are friends: hugs and dances together',
  full: '{cat} is full', noCoins: 'Not enough coins. Tap “Play”!',
  spongeHint: 'Rub the sponge over the kitty', rinseHint: 'Now rinse the foam', noFoam: 'Use the sponge first',
  cleanAlready: '{cat} is already clean', notPotty: 'Not needed yet',
  sleeping: 'Shh, {cat} is asleep. Turn on the light to wake up', tooMany: 'Ouch, enough! {cat} is upset',
  busy: 'Just a moment, {cat} is busy',
  tea: 'Tea', snack: 'Treat', tv: 'TV', water: 'Water', watered: 'The flower is watered, let it rest',
  dailyTitle: 'Daily gift', dailyText: '+{n} coins', streak: 'Day streak: {d}',
  levelTitle: 'Level up!', levelText: 'Level {n}. New things in the wardrobe',
  missTitle: 'Missed you!', missText: '{cat} was waiting for you',
  ok: 'Yay!', close: 'Close',
  giftTitle: 'A gift for you', giftFor: 'For {name}', giftPlaceholder: 'A message will be here', giftBox: 'Open the gift',
  coinsWon: '+{n} coins',
  sortLevel: 'Level {n}', sortUndo: 'Undo', sortRestart: 'Restart', sortAddJar: '+ jar', sortLevels: 'Levels', sortExit: 'Exit',
  sortStuck: 'No moves left — undo or restart', sortWon: 'Level {n} cleared!', sortNext: 'Next', sortMoves: 'Moves: {n}', sortPick: 'Pick a level',
  sortLevelAria: 'Level {n}, stars: {s}', sortLockedAria: 'Level {n} is locked', sortStarsAria: 'Stars: {s} of 3', sortJarPrice: 'Add an empty jar for {n} coins',
  head: 'Head', eyes: 'Glasses', body: 'Clothes',
  buy: 'Buy', wear: 'Wear', takeOff: 'Take off', lockedFrom: 'From lv {n}', price: '{n} coins',
  whoAria: 'Who to dress', giveName: 'Give a name', nameLabel: 'Name', nameDone: 'Done', noOwned: 'Buy things for {cat} first: {name} can wear them',
  dev: 'Console', devCoins: '+1000 coins', devInf: '∞ coins', devLevel: 'Level', devLevelDown: 'Level minus 1', devLevelUp: 'Level plus 1',
  devUnlock: 'Unlock all items', devFill: 'Fill all needs', devGift: 'Show the gift', devFriend: 'Call {name} now',
  devSortAll: 'All Pour Party levels', devReset: 'Reset progress', devSure: 'Really reset all progress?', devYes: 'Yes, reset', devNo: 'Cancel',
};

const EN_NAMES = {
  tommy: 'Tommy', cookie: 'Cookie', milk: 'Milk', fish: 'Fish', donut: 'Donut', sushi: 'Sushi', ramen: 'Ramen', pizza: 'Pizza', cake: 'Cake',
  bow: 'Bow', party_hat: 'Party hat', beanie: 'Beanie', chef_hat: 'Chef hat', crown: 'Crown',
  round_glasses: 'Glasses', sunglasses: 'Sunglasses', heart_glasses: 'Heart glasses',
  bowtie: 'Bow tie', scarf: 'Scarf', sweater: 'Sweater', unicorn: 'Unicorn suit',
  apron: 'Apron', bunny_ears: 'Bunny ears', monocle: 'Monocle', flower_wreath: 'Flower wreath', tutu: 'Tutu', star_glasses: 'Star glasses', cape: 'Cape', wizard_hat: 'Wizard hat',
  cap: 'Cap', strawberry_hat: 'Strawberry hat', cowboy_hat: 'Cowboy hat', tiara: 'Tiara', sleep_mask: 'Sleep mask', aviators: 'Aviators', cat_glasses: 'Cat-eye glasses',
  bandana: 'Bandana', necktie: 'Necktie', hoodie: 'Hoodie', star_pajamas: 'Star pajamas', bee_suit: 'Bee costume',
};

const tg = window.Telegram && window.Telegram.WebApp;
const code = (tg && tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.language_code) || navigator.language || 'ru';
export const lang = /^(ru|uk|be|kk)/i.test(code) ? 'ru' : 'en';
const user = (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) || {};
export const userName = user.first_name || '';
export const isDev = (user.username || '').toLowerCase() === 'omanns';
const dict = lang === 'ru' ? RU : EN;

const TALK = {
  ru: {
    love: [
      'Люблю тебя, {name}!', 'Ты сегодня очень красивая', 'Ты лучшая на свете', 'Обнимешь меня?', 'Скучал по тебе',
      'Ты моё солнышко', 'Мур-р, хорошо с тобой', 'Давай поиграем?', 'Я тебя жду каждый день', '{name}, ты чудо',
      'С тобой тепло и уютно', 'Погладь меня ещё чуть-чуть', 'Ты у меня самая-самая', 'Улыбнись, тебе очень идёт',
      'Я рядом, всё будет хорошо', 'Спасибо, что заботишься обо мне', 'Ты делаешь мой день лучше', 'Хочу к тебе на ручки',
      'Мне повезло с тобой, {name}', 'Ты сегодня молодец!', 'Поцелуй в носик?', 'Мур! Это значит «люблю»',
      'Не забывай отдыхать, хорошо?', 'Я горжусь тобой', 'Будешь моей подушкой?', '{name}, ты самая милая',
    ],
    food: ['Хочу кушать…', 'Животик урчит…'], clean: ['Помой меня!', 'Я весь чумазый…'], potty: ['Мне надо в туалет!', 'Ой, срочно на горшок!'],
    energy: ['Я устал…', 'Глазки слипаются…'], fun: ['Скучно…', 'Поиграй со мной…'],
  },
  en: {
    love: [
      'I love you, {name}!', 'You look so pretty today', 'You are the best', 'Hug me?', 'I missed you',
      'You are my sunshine', 'Purr, I like being with you', 'Shall we play?', 'I wait for you every day', '{name}, you are a wonder',
      'It is so cozy with you', 'Pet me a little more', 'You are my favorite', 'Smile, it suits you',
      'I am here, all will be fine', 'Thanks for taking care of me', 'You make my day better', 'Can I sit on your lap?',
      'I am lucky to have you, {name}', 'You did great today!', 'Nose kiss?', 'Purr means “I love you”',
      'Do not forget to rest, okay?', 'I am proud of you', 'Will you be my pillow?', '{name}, you are the sweetest',
    ],
    food: ['I am hungry…', 'My tummy rumbles…'], clean: ['Wash me!', 'I am all messy…'], potty: ['I need the potty!', 'Potty, quick!'],
    energy: ['I am tired…', 'So sleepy…'], fun: ['I am bored…', 'Play with me…'],
  },
};

const SCENES = {
  ru: [
    { lines: [['cat', 'Я тебя люблю'], ['friend', 'И я тебя!']], act: 'hug' },
    { lines: [['cat', 'Давай поиграем?'], ['friend', 'Давай!']], act: 'dance' },
    { lines: [['friend', 'Давай покушаем?'], ['cat', 'Я только за!'], ['friend', 'Чур, мне печеньку']], act: 'eat' },
    { lines: [['cat', 'Посмотрим мультик?'], ['friend', 'Да, про котиков!']], act: 'tv' },
    { lines: [['friend', 'Ты такой милый'], ['cat', 'Ой, ну что ты…']], act: 'shy' },
    { lines: [['cat', 'Расскажи шутку'], ['friend', 'Мяу-мяу-мяу!'], ['cat', 'Ха-ха!']], act: 'laugh' },
    { lines: [['friend', 'Послушаем музыку?'], ['cat', 'Включай!']], act: 'music' },
    { lines: [['cat', 'Почитаем вместе?'], ['friend', 'Давай сказку']], act: 'read' },
    { lines: [['friend', 'Обнимашки?'], ['cat', 'Всегда!']], act: 'hug' },
    { lines: [['cat', 'Хорошо, что ты пришёл'], ['friend', 'Я всегда рядом'], ['cat', 'Мур-р']], act: 'shy' },
    { lines: [['friend', 'Потанцуем?'], ['cat', 'Ещё как!']], act: 'dance' },
  ],
  en: [
    { lines: [['cat', 'I love you'], ['friend', 'I love you too!']], act: 'hug' },
    { lines: [['cat', 'Shall we play?'], ['friend', 'Yes!']], act: 'dance' },
    { lines: [['friend', 'Let us eat?'], ['cat', 'Count me in!'], ['friend', 'Dibs on the cookie']], act: 'eat' },
    { lines: [['cat', 'Watch cartoons?'], ['friend', 'Yes, about cats!']], act: 'tv' },
    { lines: [['friend', 'You are so cute'], ['cat', 'Oh, stop it…']], act: 'shy' },
    { lines: [['cat', 'Tell me a joke'], ['friend', 'Meow-meow-meow!'], ['cat', 'Ha-ha!']], act: 'laugh' },
    { lines: [['friend', 'Listen to music?'], ['cat', 'Turn it on!']], act: 'music' },
    { lines: [['cat', 'Read together?'], ['friend', 'A fairy tale, please']], act: 'read' },
    { lines: [['friend', 'Hugs?'], ['cat', 'Always!']], act: 'hug' },
    { lines: [['cat', 'Glad you came'], ['friend', 'I am always here'], ['cat', 'Purr']], act: 'shy' },
    { lines: [['friend', 'Dance?'], ['cat', 'You bet!']], act: 'dance' },
  ],
};

export function phrases(kind) {
  return TALK[lang][kind].filter((p) => userName || !p.includes('{name}')).map((p) => p.replace('{name}', () => userName));
}

export const scenes = SCENES[lang];

export function t(key, vars = {}) {
  return dict[key].replace(/\{(\w+)\}/g, (_, k) => (k === 'cat' ? GIFT.catName : vars[k]));
}

export const friendLabel = (friend) => friend.name || itemName(FRIENDS[0]);

export function itemName(item) {
  return lang === 'ru' ? item.name : EN_NAMES[item.id] || item.name;
}
