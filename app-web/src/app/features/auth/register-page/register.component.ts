import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  form!: FormGroup;
  error: string | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', [Validators.required]],
    }, { validators: this.passwordsMatch });
  }

  // Validator custom
  passwordsMatch(c: AbstractControl) {
    return c.get('password')?.value === c.get('confirm')?.value
      ? null : { mismatch: true };
  }

  submit() {
    if (this.form.invalid) { return; }
    this.loading = true;
    const { username, email, password } = this.form.value;
    this.auth.register(username, email, password).subscribe({
      next: () => this.router.navigate(['/login']),
      error: err => {
        this.error = err.error?.message || 'Erreur lors de l’inscription';
        this.loading = false;
      }
    });
  }
}
