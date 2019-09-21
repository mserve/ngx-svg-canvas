import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { NgxSvgCanvasModule } from '../../projects/ngx-svg-canvas/src/public-api';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
    ],
  imports: [
    BrowserModule,
    NgxSvgCanvasModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
