import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularResizedEventModule } from 'angular-resize-event';
import { NgxSvgCanvasComponent } from './ngx-svg-canvas.component';



@NgModule({
  declarations: [NgxSvgCanvasComponent],
  imports: [
    CommonModule,
    AngularResizedEventModule
  ],
  exports: [NgxSvgCanvasComponent],
})
export class NgxSvgCanvasModule { }
