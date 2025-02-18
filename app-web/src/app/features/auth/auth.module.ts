import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterPageComponent } from './register-page/register-page.component';
import { RegisterComponent } from './registerPage/register.component';



@NgModule({
  declarations: [
    RegisterPageComponent,
    RegisterComponent
  ],
  imports: [
    CommonModule
  ]
})
export class AuthModule { }
