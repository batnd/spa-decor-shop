import {OrderStatusType} from "../../../types/order-status.type";

export class OrderStatusUtil {
  static getStatusAndColor(status: OrderStatusType | undefined | null): { name: string, color: string } {
    let name: string ='Новый';
    let color: string = '#456F49';

    switch (status) {
      case OrderStatusType.delivery:
        name = 'Доставка';
        break;
      case OrderStatusType.cancelled:
        name = 'Отменён';
        color = '#FF7575';
        break;
      case OrderStatusType.pending:
        name = 'Обработка';
        break;
      case OrderStatusType.success:
        name = 'Выполнен';
        color = '#86D5B9';
        break;
    }

    return { name, color };
  }
}
