// Bloco de variáveis para centralizar as imagens do projeto.
export const ASSETS = {
  mascotHero: "../src/assets/logo_farmarcia.png",
  mascotWelcome: "../src/assets/logo_farmarcia.png",
  avatar1: "https://placehold.co/40x40/D7E4E5/0E3D55?text=JM",
  avatar2: "https://placehold.co/40x40/D7E4E5/0E3D55?text=CA",
  prodLaRoche: "https://placehold.co/270x160/EFEFEF/6C788A?text=La+Roche-Posay",
  prodRedoxon: "https://placehold.co/270x160/EFEFEF/6C788A?text=Redoxon",
  prodDipirona: "https://placehold.co/270x160/EFEFEF/6C788A?text=Dipirona",
  prodHuggies: "https://placehold.co/270x160/EFEFEF/6C788A?text=Huggies",
};

export const MOCK_PRODUCTS = [
  { id: 1, image: ASSETS.prodLaRoche, discount: '-20% OFF', brand: 'La Roche-Posay', name: 'Anthelios FPS 60', rating: 4, reviews: 42, oldPrice: 'R$ 89,90', price: 'R$ 71,90', installment: '2x de R$ 35,95' },
  { id: 2, image: ASSETS.prodDipirona, discount: '-65% OFF', brand: 'EMS Genéricos', name: 'Dipirona 500mg 10 comprimidos', rating: 5, reviews: 128, oldPrice: 'R$ 10,90', price: 'R$ 3,80', installment: '1x de R$ 3,80' },
  { id: 3, image: ASSETS.prodRedoxon, discount: '-25% OFF', brand: 'Bayer', name: 'Redoxon Vitamina C 1g Laranja', rating: 4, reviews: 15, oldPrice: 'R$ 32,90', price: 'R$ 24,60', installment: '1x de R$ 24,60' },
  { id: 4, image: ASSETS.prodHuggies, discount: '-18% OFF', brand: 'Huggies', name: 'Fralda Huggies Supreme Care M', rating: 5, reviews: 310, oldPrice: 'R$ 89,90', price: 'R$ 73,70', installment: '2x de R$ 36,85' },
];
