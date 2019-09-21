import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSvgCanvasComponent } from './ngx-svg-canvas.component';
import { AngularResizedEventModule } from 'angular-resize-event';



@NgModule({
  declarations: [NgxSvgCanvasComponent],
  imports: [
    CommonModule,
    AngularResizedEventModule

  ],
  exports: [CommonModule,
    NgxSvgCanvasComponent]
})
export class NgxSvgCanvasModule { }
