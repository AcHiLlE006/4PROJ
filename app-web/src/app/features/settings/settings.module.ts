import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsPageComponent } from './settingPage/settings-page.component';
import { SettingsComponent } from './settings.component';



@NgModule({
  declarations: [
    SettingsPageComponent,
    SettingsComponent
  ],
  imports: [
    CommonModule
  ]
})
export class SettingsModule { }
