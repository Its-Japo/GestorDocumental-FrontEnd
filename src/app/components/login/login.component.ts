// LoginComponent.ts
import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { LoginRequest } from '../../interfaces/login-request.interface';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  hide = true;
  alertVisible = false;
  alertTitle = '';
  alertMessage = '';
  alertType = 'alert-danger';
  alertIcon = 'icon-danger';
  currentLanguage: string;

  constructor(
    private authService: AuthService,
    private router: Router,
    public translate: TranslateService,
    private loaderService: LoaderService
  ) {
    // Recuperar el idioma del localStorage si está disponible, o usar 'es' por defecto
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'es';
    this.currentLanguage = savedLanguage;
    this.translate.setDefaultLang(savedLanguage);
    this.translate.use(savedLanguage);
  }

  toggleVisibility(): void {
    this.hide = !this.hide;
  }

  loginForm = new FormGroup({
    username: new FormControl(''),
    password: new FormControl(''),
  });

  login() {
    const loginRequest: LoginRequest = {
      username: this.loginForm.value.username ?? '',
      pwd: this.loginForm.value.password ?? ''
    };

    this.authService.login(loginRequest).subscribe({
      next: (response: HttpResponse<any>) => {
        if (response.body.result && response.body.result.success) {
          // Guardar los parámetros en localStorage
          localStorage.setItem('userStatus', JSON.stringify({
            username: response.body.result.username,
            role: response.body.result.role
          }));

          this.loaderService.showLoader();
          this.router.navigate(['/portal']);
        } else {
          this.showAlert('Error', 'Credenciales incorrectas', 'danger');
          this.loaderService.hideLoader();
        }
      },
      error: (error: HttpErrorResponse) => {
        this.showAlert('Error', 'Credenciales incorrectas', 'danger');
        this.loaderService.hideLoader();
      }
    });
  }

  showAlert(title: string, message: string, type: 'success' | 'warning' | 'danger' | 'info'): void {
    this.alertTitle = title;
    this.alertMessage = message;
    this.alertType = `alert-${type}`;
    this.alertIcon = `fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'times-circle' : type === 'warning' ? 'exclamation-circle' : 'info-circle'}`;
    this.alertVisible = true;

    setTimeout(() => {
      this.alertVisible = false;
    }, 10000);
  }

  handleAlertClosed(): void {
    this.alertVisible = false;
  }

  switchLanguage(language: string) {
    this.translate.use(language);
    this.currentLanguage = language;
    localStorage.setItem('selectedLanguage', language); // Guarda el idioma seleccionado en localStorage
  }
}
