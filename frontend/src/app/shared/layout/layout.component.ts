import {Component, inject, OnInit} from '@angular/core';
import {CategoryService} from "../services/category.service";
import {CategoryWithTypeType} from "../../../types/category-with-type.type";

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
})
export class LayoutComponent implements OnInit {
  private categoryService: CategoryService = inject(CategoryService);
  public categories: CategoryWithTypeType[] = [];
  ngOnInit(): void {
    this.categoryService.getCategoriesWithTypes()
      .subscribe((categories: CategoryWithTypeType[]): void => {
        this.categories = categories.map((item: CategoryWithTypeType) => {
          return Object.assign({typesUrl: item.types.map(item => item.url)}, item);
        });
      });
  }
}
