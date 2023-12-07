import {Component, inject, OnInit} from '@angular/core';
import {OwlOptions} from "ngx-owl-carousel-o";
import {ProductService} from "../../../shared/services/product.service";
import {ProductType} from "../../../../types/product.type";
import {CartService} from "../../../shared/services/cart.service";
import {CartType} from "../../../../types/cart.type";
import {environment} from "../../../../environments/environment";
import {DefaultResponseType} from "../../../../types/default-response.type";

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  private productService: ProductService = inject(ProductService);
  private cartService: CartService = inject(CartService);
  public extraProducts: ProductType[] = [];
  public customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    margin: 24,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      },
      940: {
        items: 4
      }
    },
    nav: false
  };
  public serverStaticPath: string = environment.serverStaticPath;
  public cart: CartType | null = null;
  public totalAmount: number = 0;
  public totalCount: number = 0;

  ngOnInit(): void {
    this.productService.getBestProducts()
      .subscribe((data: ProductType[]): void => {
        this.extraProducts = data;
      });

    this.cartService.getCart()
      .subscribe((data: CartType | DefaultResponseType): void => {
        if ((data as DefaultResponseType).error !== undefined) throw new Error((data as DefaultResponseType).message);

        this.cart = data as CartType;
        this.calculateTotal();
      })
  }

  private calculateTotal(): void {
    this.totalAmount = 0;
    this.totalCount = 0;
    if (this.cart) {
      this.cart.items.forEach(item => {
        this.totalAmount += item.quantity * item.product.price;
        this.totalCount += item.quantity;
      });
    }
  }

  public updateCount(id: string, count: number): void {
    if (this.cart) {
      this.cartService.updateCart(id, count)
        .subscribe((data: CartType | DefaultResponseType): void => {
          if ((data as DefaultResponseType).error !== undefined) throw new Error((data as DefaultResponseType).message);

          this.cart = data as CartType;
          this.calculateTotal();
        });
    }
  }
}
