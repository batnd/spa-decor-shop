import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {PaymentType} from "../../../../types/payment.type";
import {DeliveryType} from "../../../../types/delivery.type";
import {UserService} from "../../../shared/services/user.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {UserInfoType} from "../../../../types/user-info.type";
import {HttpErrorResponse} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit {
  private fb: FormBuilder = inject(FormBuilder);
  private userService: UserService = inject(UserService);
  private _snackBar: MatSnackBar = inject(MatSnackBar);
  public userInfoForm: FormGroup = this.fb.group({
    firstName: [''],
    lastName: [''],
    phone: [''],
    fatherName: [''],
    paymentType: [PaymentType.cashToCourier],
    // deliveryType: [DeliveryType.delivery], // Для примера
    email: ['', Validators.required],
    street: [''],
    house: [''],
    entrance: [''],
    apartment: [''],
  });
  public deliveryTypes = DeliveryType;
  public deliveryType: DeliveryType = DeliveryType.delivery;
  public paymentTypes = PaymentType;

  ngOnInit(): void {
    this.userService.getUserInfo()
      .subscribe((data: UserInfoType | DefaultResponseType): void => {
        if ((data as DefaultResponseType).error !== undefined) throw new Error((data as DefaultResponseType).message);

        const userInfo: UserInfoType = data as UserInfoType;
        const paramsToUpdate = {
          firstName: userInfo.firstName ? userInfo.firstName : '',
          lastName: userInfo.lastName ? userInfo.lastName : '',
          phone: userInfo.phone ? userInfo.phone : '',
          fatherName: userInfo.fatherName ? userInfo.fatherName : '',
          paymentType: userInfo.paymentType ? userInfo.paymentType : PaymentType.cashToCourier,
          email: userInfo.email ? userInfo.email : '',
          street: userInfo.street ? userInfo.street : '',
          house: userInfo.house ? userInfo.house : '',
          entrance: userInfo.entrance ? userInfo.entrance : '',
          apartment: userInfo.apartment ? userInfo.apartment : '',
        }
        this.userInfoForm.setValue(paramsToUpdate);
        if (userInfo.deliveryType) this.deliveryType = userInfo.deliveryType;
      });
  }

  public changeDeliveryType(deliveryType: DeliveryType): void {
    // this.userInfoForm.get('deliveryType')?.setValue(deliveryType); // Для примера
    if (this.deliveryType === deliveryType) return;
    this.deliveryType = deliveryType;
    this.userInfoForm.markAsDirty();
  }

  public updateUserInfo(): void {
    if (this.userInfoForm.valid) {
      const paramObject: UserInfoType = {
        email: this.userInfoForm.value.email ? this.userInfoForm.value.email : '',
        deliveryType: this.deliveryType,
        paymentType: this.userInfoForm.value.paymentType ? this.userInfoForm.value.paymentType : PaymentType.cashToCourier
      };
      if (this.userInfoForm.value.firstName) paramObject.firstName = this.userInfoForm.value.firstName;
      if (this.userInfoForm.value.lastName) paramObject.lastName = this.userInfoForm.value.lastName;
      if (this.userInfoForm.value.fatherName) paramObject.fatherName = this.userInfoForm.value.fatherName;
      if (this.userInfoForm.value.phone) paramObject.phone = this.userInfoForm.value.phone;
      if (this.userInfoForm.value.street) paramObject.street = this.userInfoForm.value.street;
      if (this.userInfoForm.value.house) paramObject.house = this.userInfoForm.value.house;
      if (this.userInfoForm.value.entrance) paramObject.entrance = this.userInfoForm.value.entrance;
      if (this.userInfoForm.value.apartment) paramObject.apartment = this.userInfoForm.value.apartment;

      this.userService.updateUserInfo(paramObject)
        .subscribe({
          next: (data: DefaultResponseType): void => {
            if (data.error) {
              this._snackBar.open(data.message);
              throw new Error(data.message);
            } else {
              this._snackBar.open('Данные успешно сохранены');
              this.userInfoForm.markAsPristine(); // Форма станет "чистой" и кнопка станет disabled
            }
          },
          error: (errorResponse: HttpErrorResponse): void => {
            if (errorResponse.error && errorResponse.error.message) this._snackBar.open(errorResponse.error.message);
            else this._snackBar.open('Ошибка сохранения');
          }
        });
    }
  }
}
