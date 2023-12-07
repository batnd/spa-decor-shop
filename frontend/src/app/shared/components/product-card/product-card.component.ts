import {Component, inject, Input, OnInit} from '@angular/core';
import {ProductType} from "../../../../types/product.type";
import {environment} from "../../../../environments/environment";
import {CartService} from "../../services/cart.service";
import {CartType} from "../../../../types/cart.type";
import {AuthService} from "../../../core/auth/auth.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {FavoriteType} from "../../../../types/favorite.type";
import {MatSnackBar} from "@angular/material/snack-bar";
import {FavoriteService} from "../../services/favorite.service";
import {Router} from "@angular/router";

@Component({
  selector: 'product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements OnInit {
  private cartService: CartService = inject(CartService);
  private authService: AuthService = inject(AuthService);
  private _snackBar: MatSnackBar = inject(MatSnackBar);
  private favoriteService: FavoriteService = inject(FavoriteService);
  private router: Router = inject(Router);
  @Input() public product!: ProductType;
  @Input() public isLight: boolean = false;
  @Input() public countInCart: number | undefined = 0;
  @Input() public isUserLoggedIn: boolean = false;
  public serverStaticPath: string = environment.serverStaticPath;
  public count: number = 1;

  ngOnInit(): void {
    if (this.countInCart && this.countInCart > 1) {
      this.count = this.countInCart;
    }
  }

  public addToCart(): void {
    this.cartService.updateCart(this.product.id, this.count)
      .subscribe((data: CartType | DefaultResponseType): void => {
        if ((data as DefaultResponseType).error !== undefined) throw new Error((data as DefaultResponseType).message);

        this.countInCart = this.count;
      });
  }

  public updateCount(value: number): void {
    this.count = value;
    if (this.countInCart) {
      this.cartService.updateCart(this.product.id, this.count)
        .subscribe((data: CartType | DefaultResponseType): void => {
          if ((data as DefaultResponseType).error !== undefined) throw new Error((data as DefaultResponseType).message);

          this.countInCart = this.count;
        });
    }
  }

  public removeFromCart(): void {
    this.cartService.updateCart(this.product.id, 0)
      .subscribe((data: CartType | DefaultResponseType): void => {
        if ((data as DefaultResponseType).error !== undefined) throw new Error((data as DefaultResponseType).message);

        this.countInCart = 0;
        this.count = 1;
      });
  }

  public updateFavorite(): void {
    if (!this.authService.getIsLoggedIn()) {
      this._snackBar.open('Для добавления в избранное необходимо авторизоваться!');
      return;
    }

    if (this.product.isInFavorite) {
      this.favoriteService.removeFavorite(this.product.id)
        .subscribe((data: DefaultResponseType): void => {
          if (data.error) throw new Error(data.message);
          this.product.isInFavorite = false;
        })
    } else {
      this.favoriteService.addFavorite(this.product.id)
        .subscribe((data: FavoriteType | DefaultResponseType): void => {
          if ((data as DefaultResponseType).error !== undefined) throw new Error((data as DefaultResponseType).message);
          this.product.isInFavorite = true;
        });
    }
  }

  public navigate(): void {
    if (this.isLight) this.router.navigate(['/product/' + this.product.url]);
  }
}
