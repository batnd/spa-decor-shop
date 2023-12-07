import {Component, inject, OnInit} from '@angular/core';
import {FavoriteService} from "../../../shared/services/favorite.service";
import {FavoriteType} from "../../../../types/favorite.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {environment} from "../../../../environments/environment";
import {CartService} from "../../../shared/services/cart.service";
import {CartType} from "../../../../types/cart.type";
import {FavoriteWithCartType} from "../../../../types/favorite-with-cart.type";

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss']
})
export class FavoriteComponent implements OnInit {
  private favoriteService: FavoriteService = inject(FavoriteService);
  private cartService: CartService = inject(CartService);
  public products: FavoriteWithCartType[] = [];
  public serverStatic: string = environment.serverStaticPath;

  ngOnInit(): void {
    this.favoriteService.getFavorites()
      .subscribe((data: FavoriteType[] | DefaultResponseType): void => {
        if ((data as DefaultResponseType).error !== undefined) throw new Error((data as DefaultResponseType).message);

        this.cartService.getCart()
          .subscribe((cartData: CartType | DefaultResponseType): void => {
            if ((cartData as DefaultResponseType).error !== undefined) throw new Error((cartData as DefaultResponseType).message);

            this.products = (data as FavoriteWithCartType[]).map((favoriteItem: FavoriteWithCartType) => {
              const isFavoriteInCart: { product: {}, quantity: number } | undefined = (cartData as CartType).items.find(cartItem => cartItem.product.id === favoriteItem.id);
              if (isFavoriteInCart) {
                favoriteItem.isInCart = true;
                favoriteItem.countInCart = isFavoriteInCart.quantity;
              } else {
                favoriteItem.isInCart = false;
                favoriteItem.countInCart = 0;
              }
              return favoriteItem;
            });
          });
      });
  }

  public removeFromFavorites(id: string): void {
    this.favoriteService.removeFavorite(id)
      .subscribe((data: DefaultResponseType): void => {
        if (data.error) throw new Error(data.message);

        this.products = this.products.filter((item: FavoriteWithCartType): boolean => item.id !== id);
      })
  }

  public addToCart(id: string): void {
    this.cartService.updateCart(id, 1)
      .subscribe((data: CartType | DefaultResponseType): void => {
        if ((data as DefaultResponseType).error !== undefined) throw new Error((data as DefaultResponseType).message);

        this.products = this.products.map((item: FavoriteWithCartType): FavoriteWithCartType => {
          if (item.id === id) {
            item.countInCart = 1;
            item.isInCart = true;
          }
          return item;
        });
      })
  }

  public removeFromCart(id: string): void {
    this.cartService.updateCart(id, 0)
      .subscribe((data: CartType | DefaultResponseType): void => {
        if ((data as DefaultResponseType).error !== undefined) throw new Error((data as DefaultResponseType).message);

        this.products = this.products.map((item: FavoriteWithCartType): FavoriteWithCartType => {
          if (item.id === id) {
            item.countInCart = 0;
            item.isInCart = false;
          }
          return item;
        });
      });
  }

  public updateCount(id: string, count: number): void {
    this.cartService.updateCart(id, count)
      .subscribe((data: CartType | DefaultResponseType): void => {
        if ((data as DefaultResponseType).error !== undefined) throw new Error((data as DefaultResponseType).message);

        this.products = this.products.map((item: FavoriteWithCartType): FavoriteWithCartType => {
          if (item.id === id) item.countInCart = count;
          return item;
        });
      });
  }
}
