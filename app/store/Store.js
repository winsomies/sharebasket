import { create } from 'zustand';

const useShareBasket = create((set) => ({
  discounts: [],
  metaobject: [],
  collections: [],
  shop: {},
  plan:{},
  appEmbed:false,
  analytics:[],
  theme: "",
  setTheme:(theme)=> set({theme}),
  setAppEmbed:(appEmbed)=> set({appEmbed}),
  setPlan: (plan) => set({ plan }),
  setDiscounts: (discounts) => set({ discounts }),
  setPopups: (popups) => set({ popups }),
  setMetaobject: (metaobject) => set({ metaobject }),
  setAnalytics: (analytics) => set({ analytics }),
  
  setCollections: (collections) => set({ collections }),
  setShop: (shop) => set({ shop }),
}));

export default useShareBasket;