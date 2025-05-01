import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {MapComponent} from "./features/navigation/mapPage/map.component";
import {ReportComponent} from "./features/community/reportPage/report.component";
import {RegisterComponent} from "./features/auth/register-page/register.component";
import {LoginComponent} from "./features/auth/login-page/login.component";

const routes: Routes = [
  {path : 'navigation', component: MapComponent},
  {path: '', redirectTo: 'navigation', pathMatch: 'full'},
  {path: 'report', component: ReportComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'login', component: LoginComponent},

]

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
