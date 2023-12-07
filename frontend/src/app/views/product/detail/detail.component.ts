import {Component, inject, OnInit} from '@angular/core';
import {OwlOptions} from "ngx-owl-carousel-o";
import {ProductType} from "../../../../types/product.type";
import {ProductService} from "../../../shared/services/product.service";
import {ActivatedRoute} from "@angular/router";
import {environment} from "../../../../environments/environment";
import {CartType} from "../../../../types/cart.type";
import {CartService} from "../../../shared/services/cart.service";
import {FavoriteService} from "../../../shared/services/favorite.service";
import {FavoriteType} from "../../../../types/favorite.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {AuthService} from "../../../core/auth/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {
  private productService: ProductService = inject(ProductService);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private cartService: CartService = inject(CartService);
  private favoriteService: FavoriteService = inject(FavoriteService);
  private authService: AuthService = inject(AuthService);
  private _snackBar: MatSnackBar = inject(MatSnackBar);
  public recommendedProducts: ProductType[] = [];
  public product!: ProductType;
  public serverStaticPath: string = environment.serverStaticPath;
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
  public count: number = 1;
  public isLogged: boolean = false;

  constructor() {
    this.isLogged = this.authService.getIsLoggedIn();
  }

  ngOnInit(): void {
    this.authService.isLogged$.subscribe((isLoggedIn: boolean): void => {
      this.isLogged = isLoggedIn;
    });

    this.activatedRoute.params.subscribe(params => {
      this.productService.getProduct(params['url'])
        .subscribe((data: ProductType): void => {
          this.product = data;

          this.cartService.getCart()
            .subscribe((cartData: CartType | DefaultResponseType): void => {
              if ((cartData as DefaultResponseType).error !== undefined) throw new Error((cartData as DefaultResponseType).message);

              const cartDataResponse: CartType = cartData as CartType;
              if (cartDataResponse ) {
                const productInCart = cartDataResponse.items.find(item => item.product.id === this.product.id);
                if (productInCart) {
                  this.product.countInCart = productInCart.quantity;
                  this.count = this.product.countInCart;
                } else {
                  this.count = 1;
                }
              }
            });

          if (this.authService.getIsLoggedIn()) {
            this.favoriteService.getFavorites()
              .subscribe((data: FavoriteType[] | DefaultResponseType): void => {
                if ((data as DefaultResponseType).error !== undefined) {
                  const error: string = (data as DefaultResponseType).message;
                  throw new Error(error);
                }
                const products: FavoriteType[] = data as FavoriteType[];
                const currentProductExists: FavoriteType | undefined = products.find(item => item.id === this.product.id);
                if (currentProductExists) this.product.isInFavorite = true;
              });
          }
        });
    });

    this.productService.getBestProducts()
      .subscribe((data: ProductType[]): void => {
        this.recommendedProducts = data;
      });
  }

  public updateCount(value: number): void {
    this.count = value;
    if (this.product.countInCart) {
      this.cartService.updateCart(this.product.id, this.count)
        .subscribe((data: CartType | DefaultResponseType): void => {
          if ((data as DefaultResponseType).error !== undefined) throw new Error((data as DefaultResponseType).message);

          this.product.countInCart = this.count;
        });
    }
  }

  public addToCart(): void {
    this.cartService.updateCart(this.product.id, this.count)
      .subscribe((data: CartType | DefaultResponseType): void => {
        if ((data as DefaultResponseType).error !== undefined) throw new Error((data as DefaultResponseType).message);

        this.product.countInCart = this.count;
      });
  }

  public removeFromCart(): void {
    this.cartService.updateCart(this.product.id, 0)
      .subscribe((data: CartType | DefaultResponseType): void => {
        if ((data as DefaultResponseType).error !== undefined) throw new Error((data as DefaultResponseType).message);

        this.product.countInCart = 0;
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
}
