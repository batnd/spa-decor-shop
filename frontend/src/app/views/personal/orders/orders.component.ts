import {Component, inject, OnInit} from '@angular/core';
import {OrderService} from "../../../shared/services/order.service";
import {OrderType} from "../../../../types/order.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {OrderStatusUtil} from "../../../shared/utils/order-status.util";

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  private orderService: OrderService = inject(OrderService);
  public orders: OrderType[] = [];

  ngOnInit(): void {
    this.orderService.getOrders()
      .subscribe((data: OrderType[] | DefaultResponseType): void => {
        if ((data as DefaultResponseType).error !== undefined) throw new Error((data as DefaultResponseType).message);

        this.orders = (data as OrderType[]).map((item: OrderType) => {
          const status: { name: string, color: string } = OrderStatusUtil.getStatusAndColor(item.status);
          item.statusRus = status.name;
          item.color = status.color;
          return item;
        });
      });
  }
}
