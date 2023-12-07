import {Component, inject, OnInit} from '@angular/core';
import {ProductService} from "../../../shared/services/product.service";
import {ProductType} from "../../../../types/product.type";
import {CategoryService} from "../../../shared/services/category.service";
import {CategoryWithTypeType} from "../../../../types/category-with-type.type";
import {ActivatedRoute, Router} from "@angular/router";
import {ActiveParamsUtil} from "../../../shared/utils/active-params.util";
import {ActiveParamsType} from "../../../../types/active-params.type";
import {AppliedFilterType} from "../../../../types/applied-filter.type";
import {debounceTime} from "rxjs";
import {CartService} from "../../../shared/services/cart.service";
import {CartType} from "../../../../types/cart.type";
import {FavoriteService} from "../../../shared/services/favorite.service";
import {FavoriteType} from "../../../../types/favorite.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {AuthService} from "../../../core/auth/auth.service";

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {
  private productService: ProductService = inject(ProductService);
  private categoryService: CategoryService = inject(CategoryService);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private cartService: CartService = inject(CartService);
  private router: Router = inject(Router);
  private favoriteService: FavoriteService = inject(FavoriteService);
  private authService: AuthService = inject(AuthService);
  public products: ProductType[] = [];
  public categoriesWithTypes: CategoryWithTypeType[] = [];
  public activeParams: ActiveParamsType = {types: []};
  public appliedFilters: AppliedFilterType[] = [];
  public sortingOpen: boolean = false;
  public sortingOptions: { name: string, value: string }[] = [
    {name: 'От А до Я', value: 'az-asc'},
    {name: 'От Я до А', value: 'az-desc'},
    {name: 'По возрастанию цены', value: 'price-asc'},
    {name: 'По убыванию цены', value: 'price-desc'},
  ];
  public pages: number[] = [];
  public cart: CartType | null = null;
  public favoriteProducts: FavoriteType[] | null = null;
  public isLogged: boolean = false;

  constructor() {
    this.isLogged = this.authService.getIsLoggedIn();
  }

  ngOnInit(): void {
    this.authService.isLogged$.subscribe((isLoggedIn: boolean): void => {
      this.isLogged = isLoggedIn;
    })

    this.cartService.getCart()
      .subscribe((data: CartType | DefaultResponseType): void => {
        if ((data as DefaultResponseType).error !== undefined) throw new Error((data as DefaultResponseType).message);

        this.cart = data as CartType;

        if (this.authService.getIsLoggedIn()) {
          this.favoriteService.getFavorites()
            .subscribe({
              next: (data: FavoriteType[] | DefaultResponseType): void => {
                if ((data as DefaultResponseType).error !== undefined) {
                  const error: string = (data as DefaultResponseType).message;
                  this.processCatalog();
                  throw new Error(error);
                }
                this.favoriteProducts = data as FavoriteType[];
                this.processCatalog();
              },
              error: (error): void => {
                this.processCatalog();
              }
            });
        } else {
          this.processCatalog();
        }
      });
  }

  private processCatalog(): void {
    this.categoryService.getCategoriesWithTypes()
      .subscribe((data: CategoryWithTypeType[]): void => {
        this.categoriesWithTypes = data;

        this.activatedRoute.queryParams
          .pipe(
            debounceTime(500)
          )
          .subscribe(params => {
            this.activeParams = ActiveParamsUtil.processParams(params);
            this.appliedFilters = [];

            this.activeParams.types.forEach((url: string): void => {
              for (let i: number = 0; i < this.categoriesWithTypes.length; i++) {
                const foundType = this.categoriesWithTypes[i].types.find(type => type.url === url);
                if (foundType) {
                  this.appliedFilters.push({
                    name: foundType.name,
                    urlParam: foundType.url
                  })
                }
              }
            });

            if (this.activeParams.heightFrom) {
              this.appliedFilters.push({
                name: 'Высота: от ' + this.activeParams.heightFrom + ' см',
                urlParam: 'heightFrom'
              });
            }
            if (this.activeParams.heightTo) {
              this.appliedFilters.push({
                name: 'Высота: до ' + this.activeParams.heightTo + ' см',
                urlParam: 'heightTo'
              });
            }
            if (this.activeParams.diameterFrom) {
              this.appliedFilters.push({
                name: 'Диаметр: от ' + this.activeParams.diameterFrom + ' см',
                urlParam: 'diameterFrom'
              });
            }
            if (this.activeParams.diameterTo) {
              this.appliedFilters.push({
                name: 'Диаметр: до ' + this.activeParams.diameterTo + ' см',
                urlParam: 'diameterTo'
              });
            }

            this.productService.getProducts(this.activeParams)
              .subscribe(data => {
                this.pages = [];
                for (let i: number = 1; i <= data.pages; i++) {
                  this.pages.push(i);
                }
                if (this.cart && this.cart.items.length > 0) {
                  this.products = data.items.map(product => {
                    if (this.cart) {
                      const productInCart = this.cart?.items.find(item => item.product.id === product.id);
                      if (productInCart) {
                        product.countInCart = productInCart.quantity;
                      }
                    }

                    return product;
                  });
                } else {
                  this.products = data.items;
                }
                if (this.favoriteProducts) {
                  this.products = this.products.map((product: ProductType) => {
                    const productInFavorite: FavoriteType | undefined = this.favoriteProducts?.find(item => item.id === product.id);
                    if (productInFavorite) product.isInFavorite = true;

                    return product;
                  })
                }
              });
          });
      });
  }

  public removeAppliedFilter(appliedFilter: AppliedFilterType): void {
    if (appliedFilter.urlParam === 'heightFrom' || appliedFilter.urlParam === 'heightTo' ||
      appliedFilter.urlParam === 'diameterFrom' || appliedFilter.urlParam === 'diameterTo') {
      delete this.activeParams[appliedFilter.urlParam];
    } else {
      this.activeParams.types = this.activeParams.types.filter((item: string): boolean => item !== appliedFilter.urlParam);
    }
    this.activeParams.page = 1;
    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams
    });
  }

  public toggleSorting(): void {
    this.sortingOpen = !this.sortingOpen;
  }

  public sort(value: string): void {
    if (this.activeParams.sort === value) delete this.activeParams.sort;
    else this.activeParams.sort = value;
    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams
    });
  }

  public openPage(page: number): void {
    this.activeParams.page = page;
    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams
    });
  }

  public openPrevPage(): void {
    if (this.activeParams.page && this.activeParams.page > 1) {
      this.activeParams.page--;
      this.router.navigate(['/catalog'], {
        queryParams: this.activeParams
      });
    }
  }

  public openNextPage(): void {
    if (this.activeParams.page && this.activeParams.page < this.pages.length) {
      this.activeParams.page++;
      this.router.navigate(['/catalog'], {
        queryParams: this.activeParams
      });
    }
  }
}
