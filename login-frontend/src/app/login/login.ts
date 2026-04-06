import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule], 
  templateUrl: './login.html',
  styleUrl: './login.css' 
})
export class Login {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  currentView: string = 'login';
  
  savedUsername: string = ''; 

  loginForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  otpRequestForm: FormGroup = this.fb.group({
    username: ['', Validators.required]
  });

  passwordResetForm: FormGroup = this.fb.group({
    otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    new_password: ['', [Validators.required, Validators.minLength(8)]]
  });

  switchView(view: string) {
    this.currentView = view;
  }

  onLoginSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.http.post('http://localhost:8000/api/login/', { username, password })
        .subscribe({
          next: (response: any) => {
            localStorage.setItem('access_token', response.access);
            this.router.navigate(['/home']);
          },
          error: (error) => {
            console.error('Login failed', error);
            alert('Usuario o contraseña incorrectos.');
          }
        });
    }
  }

  onRequestOtpSubmit() {
    if (this.otpRequestForm.valid) {
      const username = this.otpRequestForm.value.username;
      this.savedUsername = username; 

      this.http.post('http://localhost:8000/api/request-otp/', { username })
        .subscribe({
          next: (response: any) => {
            // Pasamos a la siguiente pantalla
            this.switchView('resetPassword');
          },
          error: (error) => {
            console.error('Error al pedir OTP', error);
            alert('Hubo un error al generar el código.');
          }
        });
    }
  }

  onResetPasswordSubmit() {
    if (this.passwordResetForm.valid) {
      const { otp, new_password } = this.passwordResetForm.value;

      this.http.post('http://localhost:8000/api/reset-password/', {
        username: this.savedUsername, 
        otp: otp,
        new_password: new_password
      }).subscribe({
        next: (response: any) => {
          alert('¡Contraseña cambiada con éxito!');
          this.switchView('login'); // Volvemos al login
          this.loginForm.reset();
          this.passwordResetForm.reset();
        },
        error: (error) => {
          console.error('Error al cambiar clave', error);
          alert('El código es inválido o ha expirado.');
        }
      });
    }
  }
}