import { Injectable, Logger } from '@nestjs/common';
import { QuickRestoService } from '../quick-resto/quick-resto.service';

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);

  constructor(private readonly qrService: QuickRestoService) {}

  async getMenu() {
    this.logger.log('🚀 Загрузка меню (Метод СКАНЕРА ID 1-50)...');

    const classNameDish = 'ru.edgex.quickresto.modules.warehouse.nomenclature.dish.Dish';
    const moduleName = 'warehouse.nomenclature.dish';

    // 1. Создаем массив запросов для ID от 1 до 50
    // Мы запрашиваем каждый ID напрямую, API не сможет скрыть от нас Салат
    const range = Array.from({ length: 50 }, (_, i) => i + 1);
    
    const attempts = await Promise.all(range.map(id => 
        this.qrService.readObject(moduleName, classNameDish, id)
    ));

    // Оставляем только то, что нашлось (не null) и не удалено
    const allItems = attempts.filter(item => item && !item.deleted);

    this.logger.log(`📥 Найдено живых объектов: ${allItems.length}`);

    // 2. Разделяем на папки и еду
    const menuMap = new Map<number, any>();
    const dishes: any[] = [];

    allItems.forEach((item: any) => {
        if (item.className.includes('DishCategory')) {
            // Это папка
            menuMap.set(item.id, {
                id: item.id,
                name: item.name,
                items: [] as any[],
                order: item.order || 0
            });
        } else if (item.className.includes('Dish')) {
            // Это еда
            dishes.push(item);
        }
    });

    const rootCategory = {
        id: 0,
        name: "Популярное",
        items: [] as any[]
    };

    // 3. Раскладываем еду по папкам
    dishes.forEach((dish: any) => {
        // Логика поиска родителя (твоя структура)
        let parentId: number | null = null;

        if (dish.parentId) {
            parentId = dish.parentId;
        } else if (dish.parentItem && dish.parentItem.id) {
            parentId = dish.parentItem.id;
        } else if (dish.parent) {
            parentId = typeof dish.parent === 'object' ? dish.parent.id : dish.parent;
        }

        // Логика цены
        let finalPrice = dish.price || dish.basePriceInList || 0;
        if (dish.dishSales && dish.dishSales.length > 0 && dish.dishSales[0].price > 0) {
             finalPrice = dish.dishSales[0].price;
        }

        const formattedDish = {
            id: dish.id,
            name: dish.name,
            description: dish.description || '',
            price: finalPrice,
            image: dish.imageUrl || null,
            unit: dish.measureUnit?.name || ''
        };

        // Если нашли папку-родителя - кладем туда
        if (parentId && menuMap.has(parentId)) {
            menuMap.get(parentId).items.push(formattedDish);
        } else {
            // Иначе в корень
            rootCategory.items.push(formattedDish);
        }
    });

    // 4. Финал
    const result = Array.from(menuMap.values());

    if (rootCategory.items.length > 0) {
        result.unshift(rootCategory);
    }

    return result.filter(cat => cat.items.length > 0);
  }
}