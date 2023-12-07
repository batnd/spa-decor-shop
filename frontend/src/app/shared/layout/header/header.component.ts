import {Component, HostListener, inject, Input, OnInit} from '@angular/core';
import {AuthService} from "../../../core/auth/auth.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";
import {CategoryWithTypeType} from "../../../../types/category-with-type.type";
import {CartService} from "../../services/cart.service";
import {ProductService} from "../../services/product.service";
import {ProductType} from "../../../../types/product.type";
import {environment} from "../../../../environments/environment";
import {FormControl} from "@angular/forms";
import {debounceTime} from "rxjs";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() public categories: CategoryWithTypeType[] = [];
  private authService: AuthService = inject(AuthService);
  private _snackBar: MatSnackBar = inject(MatSnackBar);
  private cartService: CartService = inject(CartService);
  private router: Router = inject(Router);
  private productService: ProductService = inject(ProductService);
  public isLogged: boolean = false;
  public count: number = 0;
  public products: ProductType[] = [];
  public serverStaticPath: string = environment.serverStaticPath;
  public showedSearch: boolean = false;
  public searchField = new FormControl();

  constructor() {
    this.isLogged = this.authService.getIsLoggedIn();
  }

  ngOnInit(): void {
    this.searchField.valueChanges
      .pipe(
        debounceTime(500) // Отложенная отправка запроса
      )
      .subscribe(value => {
        if (value && value.length > 2) {
          this.productService.searchProducts(value)
            .subscribe((data: ProductType[]): void => {
              this.products = data;
              this.showedSearch = true;
            })
        } else {
          this.products = [];
        }
      });

    this.authService.isLogged$.subscribe((isLoggedId: boolean): void => {
      this.isLogged = isLoggedId;
      this.getCartCount();
    });

    // this.cartService.getCartCount()
    //   .subscribe((data: { count: number } | DefaultResponseType): void => {
    //     if ((data as DefaultResponseType).error !== undefined) throw new Error((data as DefaultResponseType).message);
    //
    //     this.count = (data as { count: number }).count;
    //   });
    this.getCartCount();

    this.cartService.count$
      .subscribe(count => {
        this.count = count;
      })
  }

  public logout(): void {
    this.authService.logout()
      .subscribe({
        next: (): void => {
          this.doLogout();
        },
        error: (): void => {
          this.doLogout();
        }
      });
  }

  private getCartCount(): void {
    this.cartService.getCartCount()
      .subscribe((data: { count: number } | DefaultResponseType): void => {
        if ((data as DefaultResponseType).error !== undefined) throw new Error((data as DefaultResponseType).message);

        this.count = (data as { count: number }).count;
      });
  }

  private doLogout(): void {
    this.authService.removeTokens();
    this.authService.userId = null;
    this._snackBar.open('Вы вышли из системы');

    const currentRoutes: string = this.router.url;
    if (currentRoutes.includes('profile')|| currentRoutes.includes('orders') || currentRoutes.includes('favourite') || currentRoutes.includes('cart')) this.router.navigate(['/']);
    // this.router.navigate(['/']);
  }

  public selectProduct(url: string): void {
    this.router.navigate(['/product/' + url]);
    this.searchField.setValue('');
    this.products = []; // Окно поиска скрывается
  }

  @HostListener('document:click', ['$event'])
  click(event: Event): void {
    const eventTarget: HTMLElement = event.target as HTMLElement;

    if (this.showedSearch && (eventTarget.nodeName.toLowerCase() === 'svg') || (eventTarget.nodeName.toLowerCase() === 'path')) {
      this.showedSearch = false;
      return;
    }
    if (this.showedSearch && eventTarget.className.indexOf('search-product')) {
      this.showedSearch = false;
    }
  }
}
