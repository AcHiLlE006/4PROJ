import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {DashboardComponent} from "./features/dashboard/dashboardPage/dashboard.component";
import {MapComponent} from "./features/navigation/mapPage/map.component";
import {ReportComponent} from "./features/community/reportPage/report.component";
import {RegisterComponent} from "./features/auth/registerPage/register.component";
import {SettingsComponent} from "./features/settings/settingsPage/settings.component";
import {LoginComponent} from "./features/auth/loginPage/login.component";

const routes: Routes = [
  {path: 'dashboard', component: DashboardComponent, title: "Were2go"},
  {path : 'navigation', component: MapComponent},
  {path: 'report', component: ReportComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'settings', component: SettingsComponent},
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
