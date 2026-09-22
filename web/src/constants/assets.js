const createPlaceholder = (width, height, bg, color, text) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#${bg}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14px" font-weight="bold" fill="#${color}">${text}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

// Bloco de variáveis para centralizar as imagens do projeto.
export const ASSETS = {
  mascotHero: "../src/assets/logo_farmarcia.png",
  mascotWelcome: "../src/assets/logo_farmarcia.png",
  avatar1: createPlaceholder(40, 40, 'D7E4E5', '0E3D55', 'JM'),
  avatar2: createPlaceholder(40, 40, 'D7E4E5', '0E3D55', 'CA'),
  prodLaRoche: createPlaceholder(270, 160, 'EFEFEF', '6C788A', 'La Roche'),
  prodRedoxon: createPlaceholder(270, 160, 'EFEFEF', '6C788A', 'Redoxon'),
  prodDipirona: createPlaceholder(270, 160, 'EFEFEF', '6C788A', 'Dipirona'),
  prodHuggies: createPlaceholder(270, 160, 'EFEFEF', '6C788A', 'Huggies'),
};

// Os produtos MOCK_PRODUCTS foram movidos para services/api.js
