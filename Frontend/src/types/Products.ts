export type Product = {
  [x: string]: any;
  id: string;
  name: string;
  description?: string;
  cost: number;
  price: number;
  image_url?: string;
  category_id?: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
};
