import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AngularResizedEventModule } from 'angular-resize-event';
import { NgxSvgCanvasModule } from '../../projects/ngx-svg-canvas/src/public_api';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
    ],
  imports: [
    BrowserModule,
    AngularResizedEventModule,
    NgxSvgCanvasModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
