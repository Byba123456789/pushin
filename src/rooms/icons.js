const INK = '#4b2e1e';
const PINK = '#f6a5b6';
const MINT = '#9fdcc8';
const SKY = '#a9d4f5';
const BUTTER = '#ffd66b';
const LILAC = '#c9b3ef';
const CREAM = '#fff7ec';
const TAN = '#e9b47a';

const SVG = {
  food: `<circle cx="10" cy="13" r="3.2" fill="${TAN}"/><circle cx="16" cy="11.5" r="3.6" fill="#d9965a"/><circle cx="22" cy="13" r="3.2" fill="${TAN}"/><path d="M3.5 15h25c0 7-5.5 11.5-12.5 11.5S3.5 22 3.5 15z" fill="${PINK}"/><circle cx="16" cy="20.5" r="2" fill="#fff" stroke="none"/>`,
  clean: `<circle cx="13" cy="19" r="8.5" fill="#cfeafb"/><circle cx="23.5" cy="10" r="5" fill="#e3f4fd"/><circle cx="25" cy="23" r="3" fill="#e3f4fd"/><path d="M8.5 16.5a5 5 0 0 1 4-4" stroke="#fff" stroke-width="2"/>`,
  energy: `<path d="M19 4a12 12 0 1 0 9.5 17.5A10 10 0 0 1 19 4z" fill="${BUTTER}"/><path d="M8 7l1 2 2 .5-2 1-.5 2-1-2-2-.5 2-1z" fill="#fff" stroke-width="1.2"/>`,
  fun: `<circle cx="15" cy="16" r="10.5" fill="${LILAC}"/><path d="M7.5 10.5c5 3 10 2.5 14-3M5 17c6 2 12 0 18-7M8 23.5c6-1 11-5 14-11.5" fill="none" stroke-width="1.6"/><path d="M24 24c3 3 5 2 6-1" fill="none"/>`,
  potty: `<rect x="9" y="3.5" width="14" height="8" rx="2.5" fill="#e3f4fd"/><path d="M5 13.5h22c0 6-4 9.5-8 9.5v4h-6v-4c-4 0-8-3.5-8-9.5z" fill="#fff"/><path d="M8 13.5c1 3 4 4.5 8 4.5s7-1.5 8-4.5" fill="none" stroke-width="1.6"/>`,
  coin: `<circle cx="16" cy="16" r="12.5" fill="${BUTTER}"/><circle cx="16" cy="16" r="8.5" fill="none" stroke="#e0a526" stroke-width="1.6"/><path d="M16 11l1.5 3.2 3.5.5-2.5 2.4.6 3.4L16 18.9l-3.1 1.6.6-3.4-2.5-2.4 3.5-.5z" fill="#fff3c4" stroke="#e0a526" stroke-width="1.2"/>`,
  star: `<path d="M16 3.5l3.9 7.8 8.6 1.3-6.2 6 1.5 8.6L16 23.1l-7.8 4.1 1.5-8.6-6.2-6 8.6-1.3z" fill="${BUTTER}"/>`,
  soundOn: `<path d="M5 12.5h5l7-6v19l-7-6H5z" fill="#fff"/><path d="M21 11.5c2 2.5 2 6.5 0 9M24.5 8.5c4 4 4 11 0 15" fill="none"/>`,
  soundOff: `<path d="M5 12.5h5l7-6v19l-7-6H5z" fill="#fff"/><path d="M21.5 12.5l7 7M28.5 12.5l-7 7" fill="none"/>`,
  living: `<path d="M7 15V10a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v5" fill="${PINK}"/><rect x="2.5" y="12.5" width="6" height="12" rx="3" fill="${PINK}"/><rect x="23.5" y="12.5" width="6" height="12" rx="3" fill="${PINK}"/><rect x="7" y="15" width="18" height="8" rx="2.5" fill="#f9c2d0"/><path d="M6 25v2.5M26 25v2.5" fill="none"/>`,
  kitchen: `<rect x="8" y="3" width="16" height="26" rx="4" fill="${MINT}"/><path d="M8 12h16M12 6.5v3M12 15.5v5" fill="none"/><circle cx="19" cy="21" r="1.6" fill="${PINK}" stroke="none"/>`,
  bath: `<path d="M5.5 15V8.5a3 3 0 0 1 6 0" fill="none"/><circle cx="11" cy="14" r="3" fill="#e3f4fd"/><circle cx="16.5" cy="13" r="3.6" fill="#e3f4fd"/><circle cx="22" cy="14" r="3" fill="#e3f4fd"/><path d="M3 16h26v2.5c0 5-4 8.5-9 8.5h-8c-5 0-9-3.5-9-8.5z" fill="#fff"/><path d="M8 27l-1 2.5M24 27l1 2.5" fill="none"/>`,
  bedroom: `<ellipse cx="16" cy="21" rx="13" ry="7.5" fill="${LILAC}"/><ellipse cx="16" cy="19.5" rx="9" ry="4" fill="#f4ecff"/><path d="M24 3.5a5 5 0 1 0 4.5 7 4 4 0 0 1-4.5-7z" fill="${BUTTER}"/>`,
  play: `<path d="M3.5 23a12.5 12.5 0 0 1 25 0" fill="none" stroke="${PINK}" stroke-width="3.6"/><path d="M7.3 23a8.7 8.7 0 0 1 17.4 0" fill="none" stroke="${BUTTER}" stroke-width="3.6"/><path d="M11 23a5 5 0 0 1 10 0" fill="none" stroke="${MINT}" stroke-width="3.6"/><path d="M2 24.5a3.5 3.5 0 0 1 6-2.4 3 3 0 0 1 2 5.4H3.5A2.5 2.5 0 0 1 2 24.5zM22 24.5a3.5 3.5 0 0 1 6-2.4 3 3 0 0 1 2 5.4h-6.5A2.5 2.5 0 0 1 22 24.5z" fill="#fff"/>`,
  lock: `<path d="M11 14v-3.5a5 5 0 0 1 10 0V14" fill="none"/><rect x="7" y="14" width="18" height="14" rx="4.5" fill="${BUTTER}"/><circle cx="16" cy="20.5" r="2" fill="${INK}" stroke="none"/>`,
  close: `<path d="M10 10l12 12M22 10L10 22" fill="none" stroke-width="3"/>`,
  heart: `<path d="M16 27C6.5 20.5 3.5 15.5 3.5 11a6.3 6.3 0 0 1 12.5-1.6A6.3 6.3 0 0 1 28.5 11c0 4.5-3 9.5-12.5 16z" fill="${PINK}"/>`,
  gift: `<rect x="5" y="13.5" width="22" height="14.5" rx="2.5" fill="${MINT}"/><rect x="3.5" y="9.5" width="25" height="6" rx="2.5" fill="#bdebdc"/><path d="M16 9.5V28" fill="none" stroke="#fff" stroke-width="3.4"/><path d="M16 9.5c-6-7.5-11-1.5 0 0zm0 0c6-7.5 11-1.5 0 0z" fill="#fff"/>`,
  invite: `<rect x="3.5" y="8" width="25" height="18" rx="3.5" fill="#fff"/><path d="M4.5 10l11.5 8.5L27.5 10" fill="none"/><path d="M16 23.5c-3-2-4-3.5-4-4.8a2 2 0 0 1 4-.6 2 2 0 0 1 4 .6c0 1.3-1 2.8-4 4.8z" fill="${PINK}" stroke-width="1.2"/>`,
  console: `<path d="M9 10.5h14a6.5 6.5 0 0 1 6.5 6.5v1a5 5 0 0 1-9 3l-1.2-1.5h-6.6L11.5 21a5 5 0 0 1-9-3v-1A6.5 6.5 0 0 1 9 10.5z" fill="${LILAC}"/><path d="M9 14.5v5M6.5 17h5" fill="none"/><circle cx="21" cy="15.5" r="1.4" fill="${PINK}"/><circle cx="24" cy="18.5" r="1.4" fill="${MINT}"/>`,
  dance: `<path d="M12 23V9l14-3.5V20" fill="none"/><path d="M12 11l14-3.5" fill="none"/><circle cx="8.5" cy="23" r="3.6" fill="${PINK}"/><circle cx="22.5" cy="20" r="3.6" fill="${PINK}"/>`,
  wardrobe: `<path d="M11 5L4.5 9l3 5.5 3-1.2V27h11V13.3l3 1.2 3-5.5L21 5c-1 3.2-9 3.2-10 0z" fill="${PINK}"/><path d="M13 18h6" fill="none" stroke-width="1.6"/>`,
  tea: `<path d="M5.5 14h17v6a8 8 0 0 1-8 8h-1a8 8 0 0 1-8-8z" fill="${PINK}"/><path d="M22.5 16.5h2.5a3.5 3.5 0 0 1 0 7h-3" fill="none"/><path d="M8.5 17.5h11" fill="none" stroke="#fff" stroke-width="1.6"/><path d="M11 10c-1.5-2 1.5-3 0-5.5M17 10c-1.5-2 1.5-3 0-5.5" fill="none" stroke-width="1.6"/>`,
  snack: `<rect x="6.5" y="11" width="19" height="17" rx="5" fill="${CREAM}"/><rect x="5" y="6" width="22" height="6" rx="3" fill="${BUTTER}"/><circle cx="16" cy="20.5" r="4.6" fill="${TAN}"/><circle cx="14.4" cy="19.4" r="0.9" fill="#7a4a2e" stroke="none"/><circle cx="17.6" cy="21.6" r="0.9" fill="#7a4a2e" stroke="none"/>`,
  tv: `<path d="M12 8L8.5 3M20 8l3.5-5" fill="none"/><rect x="3.5" y="8" width="25" height="19" rx="5" fill="${MINT}"/><rect x="7" y="11.5" width="15" height="12" rx="3" fill="${SKY}"/><circle cx="25.2" cy="14.5" r="1.3" fill="#fff" stroke="none"/><circle cx="25.2" cy="19.5" r="1.3" fill="#fff" stroke="none"/><path d="M10 15.5l3-1" fill="none" stroke="#fff" stroke-width="1.6"/>`,
  water: `<path d="M5 13h15v10a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z" fill="${SKY}"/><path d="M20 19l7-6.5" fill="none" stroke-width="3.4"/><path d="M20 19l7-6.5" fill="none" stroke="${SKY}" stroke-width="1.2"/><path d="M5 15.5a5.5 5.5 0 0 0 0 7" fill="none"/><path d="M10 17.5h6" fill="none" stroke="#fff" stroke-width="1.6"/><path d="M26 21.5c-1 1.6-1 2.6 0 2.6s1-1.4 0-2.6zM29.5 17c-.8 1.2-.8 2 0 2s.8-1 0-2z" fill="#8fd0f5" stroke-width="1"/>`,
  fridge: `<rect x="8" y="3" width="16" height="26" rx="4" fill="${MINT}"/><path d="M8 12h16M12 6.5v3M12 15.5v5" fill="none"/>`,
  sponge: `<rect x="4.5" y="10" width="23" height="14" rx="4.5" fill="${BUTTER}"/><circle cx="10" cy="15" r="1.4" fill="#e0a526" stroke="none"/><circle cx="17" cy="19" r="1.6" fill="#e0a526" stroke="none"/><circle cx="22" cy="14" r="1.2" fill="#e0a526" stroke="none"/><circle cx="25" cy="7" r="2.6" fill="#e3f4fd"/><circle cx="20" cy="5" r="1.6" fill="#e3f4fd"/>`,
  rinse: `<path d="M15 7V4h7" fill="none"/><path d="M6.5 14a8.5 6.5 0 0 1 17 0z" fill="#d9ecf7"/><path d="M10 18l-1.5 4M15 18v5M20 18l1.5 4M12.5 24.5l-.8 2.5M18 25l.6 2.5" fill="none" stroke="#5aaee0"/>`,
  light: `<path d="M16 4.5a8.5 8.5 0 0 0-5 15.4V23h10v-3.1A8.5 8.5 0 0 0 16 4.5z" fill="${BUTTER}"/><rect x="11.5" y="23" width="9" height="5" rx="2" fill="#e9e1d6"/>`,
  moon: `<path d="M19 4a12 12 0 1 0 9.5 17.5A10 10 0 0 1 19 4z" fill="${LILAC}"/>`,
  book: `<path d="M16 8c-3-2.5-8-3-12-2v18c4-1 9-.5 12 2z" fill="#fff"/><path d="M16 8c3-2.5 8-3 12-2v18c-4-1-9-.5-12 2z" fill="${CREAM}"/><path d="M16 8v18" fill="none"/><path d="M7 11.5c2-.4 4-.2 6 .6M7 16c2-.4 4-.2 6 .6" fill="none" stroke="${PINK}" stroke-width="1.6"/>`,
  curtains: `<path d="M3 5.5h26" fill="none"/><path d="M5 6.5h9c-1.5 6-4 9-1 20H5z" fill="${LILAC}"/><path d="M27 6.5h-9c1.5 6 4 9 1 20h8z" fill="${LILAC}"/><path d="M9 10v12M23 10v12" fill="none" stroke="#fff" stroke-width="1.4"/>`,
  tooth: `<path d="M9.5 7c3-2.2 4.6-.4 6.5-.4s3.5-1.8 6.5.4c3.8 2.8 1 8.5 0 12.5-1 4-1.2 8-3.5 8-2 0-1.5-5-3-5s-1 5-3 5C10.7 27.5 10.5 23.5 9.5 19.5 8.5 15.5 5.7 9.8 9.5 7z" fill="#fff"/><path d="M25 3l.9 2 2.1.9-2.1.9L25 8.8l-.9-2-2.1-.9 2.1-.9z" fill="${BUTTER}" stroke-width="1.1"/>`,
  cookie: `<circle cx="16" cy="16" r="12" fill="${TAN}"/><ellipse cx="11" cy="12" rx="2" ry="1.6" fill="#7a4a2e" stroke="none"/><ellipse cx="19" cy="10" rx="1.8" ry="1.5" fill="#7a4a2e" stroke="none"/><ellipse cx="21.5" cy="18.5" rx="2" ry="1.6" fill="#7a4a2e" stroke="none"/><ellipse cx="12.5" cy="20.5" rx="1.8" ry="1.5" fill="#7a4a2e" stroke="none"/><ellipse cx="16.5" cy="15.5" rx="1.4" ry="1.2" fill="#7a4a2e" stroke="none"/>`,
  milk: `<path d="M9 11l3-5.5h8L23 11v17H9z" fill="#fff"/><path d="M9 11h14" fill="none"/><rect x="9" y="15" width="14" height="8" fill="${SKY}" stroke-width="1.4"/><path d="M16 21c-2-1.3-2.7-2.3-2.7-3.1a1.3 1.3 0 0 1 2.7-.4 1.3 1.3 0 0 1 2.7.4c0 .8-.7 1.8-2.7 3.1z" fill="#fff" stroke="none"/>`,
  fish: `<path d="M3.5 16c5-8 15-8.5 20 0-5 8.5-15 8-20 0z" fill="${SKY}"/><path d="M23.5 16l5.5-5.5v11z" fill="${SKY}"/><circle cx="9.5" cy="14.8" r="1.4" fill="${INK}" stroke="none"/><path d="M14 11.5c1.5 3 1.5 6 0 9" fill="none" stroke-width="1.5"/>`,
  donut: `<circle cx="16" cy="16" r="12" fill="${TAN}"/><path d="M16 5.5c3 0 4.5 1.5 6.5 1.8 2.3.4 3.4 3 3.4 5.2.5 2 .9 4.3-.6 6.5-1 1.6-.8 3.7-2.8 4.6-2.3 1-3.9.9-6.5 1.8-2.6-.6-5.7-.7-7.3-2.5-1.5-1.7-2.9-3.7-2.6-6.2.2-2.2-.5-4.5 1.2-6.4C9 6.6 12.6 5.5 16 5.5z" fill="${PINK}"/><circle cx="16" cy="16" r="4" fill="${CREAM}"/><path d="M10 10.5l1.5 1M21 9.5l-1 1.6M23 16.5l-1.7.4M11.5 21l1.4-1M18.5 22.5l.4-1.6" fill="none" stroke="#fff" stroke-width="1.6"/>`,
  sushi: `<rect x="4.5" y="15" width="23" height="11" rx="5.5" fill="#fff"/><path d="M4 15.5c4-6.5 20-6.5 24 0-4 3-20 3-24 0z" fill="#ffa58a"/><path d="M10 11.5l2 3M16 10.5l1.5 3.5M22 11.5l1 3" fill="none" stroke="#fff" stroke-width="1.5"/><rect x="13" y="13" width="6" height="13" rx="1" fill="#4f6152"/>`,
  ramen: `<path d="M11 3l4 9M21 2.5l-2 9.5" fill="none" stroke-width="1.8"/><path d="M5 13.5c2-2.5 4 0 6-2s4 0 6-2 4 0 6-2 2 1.5 4 4" fill="none" stroke="${BUTTER}" stroke-width="2.4"/><path d="M3 14h26c0 7-5.5 12-13 12S3 21 3 14z" fill="${PINK}"/><path d="M9 20.5h14" fill="none" stroke="#fff" stroke-width="1.8"/>`,
  pizza: `<path d="M16 28.5L4 8.5c8-5 16-5 24 0z" fill="${BUTTER}"/><path d="M4 8.5c8-5 16-5 24 0l-1.8 3c-7-4-13.4-4-20.4 0z" fill="${TAN}"/><circle cx="13" cy="15" r="2.4" fill="#f08080"/><circle cx="19.5" cy="14" r="2.2" fill="#f08080"/><circle cx="16" cy="21" r="2" fill="#f08080"/>`,
  cake: `<rect x="6" y="15" width="20" height="13" rx="2.5" fill="#fff3e0"/><path d="M6 18v-2.5A2.5 2.5 0 0 1 8.5 13h15a2.5 2.5 0 0 1 2.5 2.5V18c-1.2 2.5-2.8 2.5-4 0-1.2 2.5-2.8 2.5-4 0-1.2 2.5-2.8 2.5-4 0-1.2 2.5-2.8 2.5-4 0-1.2 2.5-2.8 2.5-4 0z" fill="${PINK}"/><rect x="14.8" y="6" width="2.6" height="7" rx="1" fill="${SKY}" stroke-width="1.4"/><path d="M16 1.8c1.8 2 1.8 3.5 0 4-1.8-.5-1.8-2 0-4z" fill="${BUTTER}" stroke-width="1.2"/>`,
  bow: `<path d="M16 16c-4-6.5-12-7-12 0s8 6.5 12 0zm0 0c4-6.5 12-7 12 0s-8 6.5-12 0z" fill="${PINK}"/><circle cx="16" cy="16" r="3" fill="#f9c2d0"/>`,
  party_hat: `<path d="M16 4l9 23H7z" fill="${MINT}"/><path d="M12 15.5l8-2M10 21.5l12-3" fill="none" stroke="#fff" stroke-width="2.2"/><circle cx="16" cy="4.5" r="3" fill="${BUTTER}"/>`,
  beanie: `<path d="M5 22a11 12 0 0 1 22 0z" fill="${LILAC}"/><rect x="4" y="20" width="24" height="7" rx="3.5" fill="#b39be6"/><circle cx="16" cy="7" r="3.6" fill="#fff"/>`,
  chef_hat: `<rect x="8.5" y="16" width="15" height="10" rx="2" fill="#fff"/><path d="M8.5 18a6 6 0 0 1-1-11.6 6.5 6.5 0 0 1 17 0A6 6 0 0 1 23.5 18z" fill="#fff"/><path d="M8.5 21.5h15" fill="none" stroke-width="1.6"/>`,
  crown: `<path d="M4 25V11l6 6 6-9.5 6 9.5 6-6v14z" fill="${BUTTER}"/><circle cx="10" cy="21" r="1.8" fill="${PINK}"/><circle cx="16" cy="20" r="2" fill="${MINT}"/><circle cx="22" cy="21" r="1.8" fill="${PINK}"/>`,
  round_glasses: `<circle cx="9" cy="17" r="6" fill="#e3f4fd"/><circle cx="23" cy="17" r="6" fill="#e3f4fd"/><path d="M15 16.5q1-2 2 0" fill="none"/>`,
  sunglasses: `<rect x="2.5" y="12" width="12" height="9.5" rx="4.5" fill="#3e2a22"/><rect x="17.5" y="12" width="12" height="9.5" rx="4.5" fill="#3e2a22"/><path d="M14.5 15h3M6 15l2-1.5M21 15l2-1.5" fill="none" stroke="#fff" stroke-width="1.4"/>`,
  heart_glasses: `<path d="M9 24C3 20 2 17 2 14.6a3.6 3.6 0 0 1 7-1.2 3.6 3.6 0 0 1 7 1.2C16 17 15 20 9 24zM23 24c-6-4-7-7-7-9.4a3.6 3.6 0 0 1 7-1.2 3.6 3.6 0 0 1 7 1.2C30 17 29 20 23 24z" fill="${PINK}"/>`,
  bowtie: `<path d="M16 16L5 9.5v13zm0 0l11-6.5v13z" fill="#f08080"/><rect x="13.5" y="13" width="5" height="6" rx="2" fill="#f4a0a0"/>`,
  scarf: `<path d="M5 10c7 4.5 15 4.5 22 0v6.5c-7 4.5-15 4.5-22 0z" fill="#f08080"/><path d="M19 17v10h6V15.5" fill="#f08080"/><path d="M19 22h6M10 13.5l1 4.5M15 14.5l.5 4.5" fill="none" stroke="#fff" stroke-width="1.6"/>`,
  sweater: `<path d="M11 5L4.5 9l3 5.5 3-1.2V27h11V13.3l3 1.2 3-5.5L21 5c-1 3.2-9 3.2-10 0z" fill="#f9c2d0"/><path d="M16 10v17M13 13l3 2 3-2M13 18l3 2 3-2" fill="none" stroke="#e88aa3" stroke-width="1.6"/>`,
  unicorn: `<path d="M16 2.5l5.5 14h-11z" fill="${BUTTER}"/><path d="M12.5 11l7-2M11.5 14l9-2.5" fill="none" stroke-width="1.4"/><circle cx="8" cy="22" r="5" fill="${PINK}"/><circle cx="14" cy="25" r="5" fill="${BUTTER}"/><circle cx="20" cy="25" r="5" fill="${MINT}"/><circle cx="25" cy="21" r="5" fill="${SKY}"/>`,
  bunny_ears: `<path d="M11 27C7 20 6 10 9 4c3 0 5 8 5 23z" fill="#fff"/><path d="M21 27c4-7 5-17 2-23-3 0-5 8-5 23z" fill="#fff"/><path d="M10 22c-1-5-1-10 .5-13M22 22c1-5 1-10-.5-13" fill="none" stroke="${PINK}" stroke-width="2.4"/>`,
  flower_wreath: `<path d="M4 21c6-6 18-6 24 0" fill="none" stroke="#9fd8a8" stroke-width="3"/><circle cx="7" cy="19" r="3.4" fill="${PINK}"/><circle cx="13" cy="15.5" r="3.4" fill="${BUTTER}"/><circle cx="19.5" cy="15.5" r="3.4" fill="${SKY}"/><circle cx="25.5" cy="19" r="3.4" fill="${PINK}"/>`,
  wizard_hat: `<path d="M16 2l8 21H8z" fill="#9a86d9"/><rect x="3" y="22" width="26" height="5" rx="2.5" fill="#9a86d9"/><path d="M14 10l1 2 2 .3-1.5 1.4.4 2-1.9-1-1.9 1 .4-2-1.5-1.4 2-.3z" fill="${BUTTER}" stroke-width="1"/>`,
  star_glasses: `<path d="M9 9.5l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7zM23 9.5l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7z" fill="${BUTTER}" stroke-width="1.4"/>`,
  monocle: `<circle cx="14" cy="15" r="8" fill="#e3f4fd"/><path d="M19.5 21q4 4 3 8" fill="none" stroke="${BUTTER}" stroke-width="1.8"/><path d="M10 12l2-1.5" fill="none" stroke="#fff" stroke-width="1.6"/>`,
  apron: `<path d="M9 6h14v6l3 2v13H6V14l3-2z" fill="#fff"/><rect x="11" y="17" width="10" height="6" rx="2" fill="${PINK}"/><path d="M9 6l-3-3M23 6l3-3" fill="none" stroke-width="1.6"/>`,
  tutu: `<rect x="9" y="8" width="14" height="7" rx="2" fill="${PINK}"/><path d="M9 15l-6 9 4-1 2 3 3-3 4 3 4-3 3 3 2-3 4 1-6-9z" fill="#f9c2d0"/>`,
  cape: `<path d="M9 6h14l5 21H4z" fill="#e57d8f"/><path d="M8 6c3 4 13 4 16 0" fill="#fff3e0"/><circle cx="16" cy="9" r="2" fill="${BUTTER}"/>`,
};

export function svg(name, cls = 'rm-ico') {
  return `<svg class="${cls}" viewBox="0 0 32 32" aria-hidden="true" focusable="false" stroke="${INK}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${SVG[name]}</svg>`;
}

const images = {};

export function iconImage(name) {
  if (!images[name]) {
    const img = new Image(128, 128);
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 32 32" stroke="${INK}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${SVG[name]}</svg>`,
    );
    images[name] = img;
  }
  return images[name];
}
