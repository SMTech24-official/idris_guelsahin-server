export type TPlan = {
  readonly id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  fetures: string[];
  stripePriceId: string;
  isActive: boolean;
};
