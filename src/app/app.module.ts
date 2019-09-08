import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AngularResizedEventModule } from 'angular-resize-event';

import { AppComponent } from './app.component';
import { CanvasComponent } from './canvas/canvas.component';

@NgModule({
  declarations: [
    AppComponent,
    CanvasComponent
  ],
  imports: [
    BrowserModule,
    AngularResizedEventModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
