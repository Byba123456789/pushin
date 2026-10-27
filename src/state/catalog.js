export const GIFT = { catName: 'Пушин', message: 'Ты самая лучшая', unlockAfterFeeds: 10 };

export const FOOD = [
  { id: 'cookie', name: 'Печенька', price: 5, food: 20, fun: 2, potty: -6 },
  { id: 'milk', name: 'Молочко', price: 6, food: 15, fun: 2, potty: -12 },
  { id: 'fish', name: 'Рыбка', price: 10, food: 35, fun: 4, potty: -10 },
  { id: 'donut', name: 'Пончик', price: 12, food: 30, fun: 8, potty: -8 },
  { id: 'sushi', name: 'Суши', price: 15, food: 40, fun: 8, potty: -10 },
  { id: 'ramen', name: 'Рамен', price: 18, food: 50, fun: 8, potty: -14 },
  { id: 'pizza', name: 'Пицца', price: 20, food: 55, fun: 10, potty: -14 },
  { id: 'cake', name: 'Тортик', price: 25, food: 45, fun: 20, potty: -12 },
];

export const OUTFITS = [
  { id: 'bow', slot: 'head', name: 'Бантик', price: 40, level: 1 },
  { id: 'party_hat', slot: 'head', name: 'Колпачок', price: 60, level: 1 },
  { id: 'beanie', slot: 'head', name: 'Шапочка', price: 80, level: 2 },
  { id: 'chef_hat', slot: 'head', name: 'Колпак повара', price: 100, level: 3 },
  { id: 'crown', slot: 'head', name: 'Корона', price: 200, level: 5 },
  { id: 'round_glasses', slot: 'eyes', name: 'Очки', price: 50, level: 1 },
  { id: 'sunglasses', slot: 'eyes', name: 'Тёмные очки', price: 90, level: 2 },
  { id: 'heart_glasses', slot: 'eyes', name: 'Очки-сердечки', price: 130, level: 4 },
  { id: 'bowtie', slot: 'body', name: 'Бабочка', price: 50, level: 1 },
  { id: 'scarf', slot: 'body', name: 'Шарфик', price: 90, level: 2 },
  { id: 'sweater', slot: 'body', name: 'Свитер', price: 150, level: 3 },
  { id: 'unicorn', slot: 'body', name: 'Костюм единорога', price: 300, level: 5 },
  { id: 'apron', slot: 'body', name: 'Фартучек', price: 60, level: 1 },
  { id: 'bunny_ears', slot: 'head', name: 'Ушки-зайки', price: 70, level: 2 },
  { id: 'monocle', slot: 'eyes', name: 'Монокль', price: 90, level: 3 },
  { id: 'flower_wreath', slot: 'head', name: 'Веночек', price: 120, level: 3 },
  { id: 'tutu', slot: 'body', name: 'Пачка', price: 180, level: 4 },
  { id: 'star_glasses', slot: 'eyes', name: 'Очки-звёздочки', price: 160, level: 5 },
  { id: 'cape', slot: 'body', name: 'Накидка', price: 260, level: 6 },
  { id: 'wizard_hat', slot: 'head', name: 'Шляпа волшебника', price: 350, level: 6 },
];

export const XP = { feed: 2, wash: 2, potty: 1, sleep: 5, play: 3, pet: 1, read: 10, brush: 10, curtains: 2 };
export const ACT_XP_GAP_MIN = 20;
export const HOME_ACTS = {
  tea: { food: 8, fun: 4, xp: 6 },
  snack: { food: 18, fun: 3, xp: 6 },
  tv: { fun: 12, xp: 8 },
  water: { fun: 6, xp: 12 },
};
export const WATER_GAP_HOURS = 4;
const FIRST_LEVEL_XP = 100;
const LEVEL_GROWTH = 1.4;
export const xpToNext = (level) => Math.round(FIRST_LEVEL_XP * LEVEL_GROWTH ** (level - 1));
export const xpAtLevel = (level) => {
  let sum = 0;
  for (let l = 1; l < level; l++) sum += xpToNext(l);
  return sum;
};
export const levelAtXp = (xp) => {
  let level = 1;
  while (xp >= xpAtLevel(level + 1)) level++;
  return level;
};
export const DAILY_BONUS = { base: 20, perStreakDay: 10, max: 60 };

export const FRIENDS = [{ id: 'tommy', name: 'Томми', level: 3 }];
