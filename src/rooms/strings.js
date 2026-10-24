import { GIFT } from '../state/catalog.js';

const RU = {
  living: 'Гостиная', kitchen: 'Кухня', bath: 'Ванная', bedroom: 'Спальня',
  rooms: 'Комнаты', play: 'Играть', playAria: 'Играть в полёт за монетками',
  food: 'Еда', clean: 'Чистота', energy: 'Энергия', fun: 'Веселье', potty: 'Туалет',
  needValue: '{name}: {v} из 100',
  coinsAria: 'Монетки: {n}', levelAria: 'Уровень {n}, опыт {xp} из {max}',
  soundOff: 'Выключить звук', soundOn: 'Включить звук',
  fridge: 'Холодильник', sponge: 'Мочалка', rinse: 'Смыть', toilet: 'На горшок',
  lightOff: 'Выключить свет', lightOn: 'Включить свет', console: 'Приставка', dance: 'Танец', wardrobe: 'Гардероб',
  dragFood: 'Перетащи вкусняшку в миску или просто нажми',
  invite: '{name} придёт в гости на {n} уровне', inviteHint: 'Корми, купай и играй с котиком, чтобы поднять уровень',
  friendTitle: 'К котику пришёл {name}!', friendText: 'Теперь они дружат, обнимаются и танцуют вместе',
  full: '{cat} сыт и не хочет есть', noCoins: 'Не хватает монеток. Нажми «Играть»!',
  spongeHint: 'Поводи мочалкой по котику', rinseHint: 'Теперь смой пену', noFoam: 'Сначала потри мочалкой',
  cleanAlready: '{cat} и так чистенький', notPotty: 'Пока не хочется',
  sleeping: 'Тсс, {cat} спит. Включи свет, чтобы разбудить', tooMany: 'Ай, хватит! {cat} обиделся',
  busy: 'Минутку, {cat} занят',
  dailyTitle: 'Подарок дня', dailyText: '+{n} монеток', streak: 'Дней подряд: {d}',
  levelTitle: 'Новый уровень!', levelText: 'Уровень {n}. Загляни в гардероб: там новые вещи',
  missTitle: 'Скучал по тебе!', missText: '{cat} так ждал, когда ты вернёшься',
  ok: 'Ура!', close: 'Закрыть',
  giftTitle: 'Тебе подарок', giftFor: '{name}, это тебе', giftPlaceholder: 'Тут будет послание', giftBox: 'Открыть подарок',
  coinsWon: '+{n} монеток',
  head: 'Голова', eyes: 'Очки', body: 'Одежда',
  buy: 'Купить', wear: 'Надеть', takeOff: 'Снять', lockedFrom: 'С {n} ур.', price: '{n} монеток',
};

const EN = {
  living: 'Living', kitchen: 'Kitchen', bath: 'Bath', bedroom: 'Bedroom',
  rooms: 'Rooms', play: 'Play', playAria: 'Play the flying game for coins',
  food: 'Food', clean: 'Clean', energy: 'Energy', fun: 'Fun', potty: 'Potty',
  needValue: '{name}: {v} of 100',
  coinsAria: 'Coins: {n}', levelAria: 'Level {n}, XP {xp} of {max}',
  soundOff: 'Mute sound', soundOn: 'Turn sound on',
  fridge: 'Fridge', sponge: 'Sponge', rinse: 'Rinse', toilet: 'Potty time',
  lightOff: 'Lights off', lightOn: 'Lights on', console: 'Video game', dance: 'Dance', wardrobe: 'Wardrobe',
  dragFood: 'Drag a treat into the bowl or just tap it',
  invite: '{name} visits at level {n}', inviteHint: 'Feed, bathe and play with the kitty to level up',
  friendTitle: '{name} came to visit!', friendText: 'Now they are friends: hugs and dances together',
  full: '{cat} is full', noCoins: 'Not enough coins. Tap “Play”!',
  spongeHint: 'Rub the sponge over the kitty', rinseHint: 'Now rinse the foam', noFoam: 'Use the sponge first',
  cleanAlready: '{cat} is already clean', notPotty: 'Not needed yet',
  sleeping: 'Shh, {cat} is asleep. Turn on the light to wake up', tooMany: 'Ouch, enough! {cat} is upset',
  busy: 'Just a moment, {cat} is busy',
  dailyTitle: 'Daily gift', dailyText: '+{n} coins', streak: 'Day streak: {d}',
  levelTitle: 'Level up!', levelText: 'Level {n}. New things in the wardrobe',
  missTitle: 'Missed you!', missText: '{cat} was waiting for you',
  ok: 'Yay!', close: 'Close',
  giftTitle: 'A gift for you', giftFor: 'For {name}', giftPlaceholder: 'A message will be here', giftBox: 'Open the gift',
  coinsWon: '+{n} coins',
  head: 'Head', eyes: 'Glasses', body: 'Clothes',
  buy: 'Buy', wear: 'Wear', takeOff: 'Take off', lockedFrom: 'From lv {n}', price: '{n} coins',
};

const EN_NAMES = {
  tommy: 'Tommy', cookie: 'Cookie', milk: 'Milk', fish: 'Fish', donut: 'Donut', sushi: 'Sushi', ramen: 'Ramen', pizza: 'Pizza', cake: 'Cake',
  bow: 'Bow', party_hat: 'Party hat', beanie: 'Beanie', chef_hat: 'Chef hat', crown: 'Crown',
  round_glasses: 'Glasses', sunglasses: 'Sunglasses', heart_glasses: 'Heart glasses',
  bowtie: 'Bow tie', scarf: 'Scarf', sweater: 'Sweater', unicorn: 'Unicorn suit',
};

const tg = window.Telegram && window.Telegram.WebApp;
const code = (tg && tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.language_code) || navigator.language || 'ru';
export const lang = /^(ru|uk|be|kk)/i.test(code) ? 'ru' : 'en';
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
  const name = GIFT.herName;
  return TALK[lang][kind].filter((p) => name || !p.includes('{name}')).map((p) => p.replace('{name}', name));
}

export const scenes = SCENES[lang];

export function t(key, vars = {}) {
  return dict[key].replace(/\{(\w+)\}/g, (_, k) => (k === 'cat' ? GIFT.catName : vars[k]));
}

export function itemName(item) {
  return lang === 'ru' ? item.name : EN_NAMES[item.id] || item.name;
}
