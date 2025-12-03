// Базовый интерфейс для ответа списка
export interface QRListResponse<T> {
  type: string;
  result: T[];
}

// Поля, общие для всех объектов
export interface QRBaseEntity {
  id: number;
  name: string;
  className: string;
  deleted?: boolean; // <--- Вот это поле вызывало ошибку
}

// Категория (DishCategory)
export interface QRDishCategory extends QRBaseEntity {
  description?: string;
  parent?: { id: number } | number | null;
  order?: number;
}

// Блюдо (Dish)
export interface QRDish extends QRBaseEntity {
  price?: number;
  basePriceInList?: number; // <--- И это
  description?: string;
  article?: string;
  
  // Связи (TS должен знать, что они могут быть)
  parent?: { id: number } | number | null; 
  dishCategory?: { id: number } | number | null; // <--- И это
  
  measureUnit?: {
    name: string;
  };
  
  imageUrl?: string; // <--- И это
}