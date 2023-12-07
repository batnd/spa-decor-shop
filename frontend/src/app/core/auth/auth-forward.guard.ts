import { CanActivateFn, Router } from '@angular/router';
import {AuthService} from "./auth.service";
import {inject} from "@angular/core";
import {Location} from "@angular/common";

export const authForwardGuard: CanActivateFn = (route, state) => {
  const authService: AuthService = inject(AuthService);
  const location: Location = inject(Location);
  // const router: Router = inject(Router);

  if (authService.getIsLoggedIn()) {
    location.back();
    // router.navigate(['..']);
    return false;
  }
  return true;
};
