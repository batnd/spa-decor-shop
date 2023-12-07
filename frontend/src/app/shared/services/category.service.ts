import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {CategoryType} from "../../../types/category.type";
import {environment} from "../../../environments/environment";
import {TypeType} from "../../../types/type.type";
import {CategoryWithTypeType} from "../../../types/category-with-type.type";

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http: HttpClient = inject(HttpClient);
  constructor() { }

  public getCategories(): Observable<CategoryType[]> {
    return this.http.get<CategoryType[]>(environment.api + 'categories');
  }
  public getCategoriesWithTypes(): Observable<CategoryWithTypeType[]> {
    return this.http.get<TypeType[]>(environment.api + 'types')
      .pipe(
        map((items: TypeType[]) => {
          const array: CategoryWithTypeType[] = [];
          items.forEach((item: TypeType): void => {
            const foundItem: CategoryWithTypeType | undefined = array.find((arrayItem: CategoryWithTypeType): boolean => arrayItem.url === item.category.url);
            if (foundItem) {
              foundItem.types.push({
                id: item.id,
                name: item.name,
                url: item.url,
              });
            } else {
              array.push({
                id: item.category.id,
                name: item.category.name,      // Комнатные растения
                url: item.category.url,        // komnatnie_rasteniya
                types: [
                  {
                    id: item.id,
                    name: item.name,
                    url: item.url,
                  }]
              })
            }
          });
          return array;
        })
      );
  }
}
