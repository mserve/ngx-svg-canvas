import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Input
} from '@angular/core';

import * as Two from 'twojs-ts';
import * as two from 'twojs-ts/two.min';
import * as downloadjs from 'downloadjs';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit, AfterViewInit {


  @Input() gridSize: number;
  @Input() gridColor: string;
  @Input() lineColor: string;
  @Input() lineWidth: number;

  /* Menu Options */
  colorPalette = [
    'black',
    'gray',
    'white',
    'red',
    'orange',
    'yellow',
    'green',
    'blue',
    'indigo',
    'violet'
  ];

  lineSizes = [
    5,
    10,
    15
  ];

  /* twojs / canvas */

  @ViewChild('canvas', {
    static: false
  }) canvas: ElementRef;

  two: Two.Two;

  /* internal states */
  private isDrawing: boolean;
  private line: any;
  private lastPoint: any;
  private offset;
  private mode = 'draw';

  constructor() { }

  ngOnInit() {
    // Sanitize input
    this.lineColor = (!!this.lineColor ? this.lineColor : 'black');
    this.lineWidth = (!!this.lineWidth ? this.lineWidth : 10);
  }

  save(): void {
    const localTwo = new two({
      type: two.Types.canvas,
      width: this.two.width,
      height: this.two.height
    }) as Two.Two;

    this.two.scene.children.forEach(v => {
      localTwo.add(v.clone());
    });

    localTwo.render();
    downloadjs(localTwo.renderer.domElement.toDataURL('image/png'), 'whiteboard.png', 'image/png');


  }

  clear(): void {
    this.two.clear();
  }

  setColor(color: string) {
    this.lineColor = color;
  }

  setLineWidth(size: number) {
    this.lineWidth = size;
  }

  startDrag(e: MouseEvent) {
    e.preventDefault();

    // Get current cursor position
    const x = this.removeOffsetX(e.clientX);
    const y = this.removeOffsetY(e.clientY);

    // start
    this.isDrawing = true;
    this.startDrawing(x, y);

  }

  startPan(e: any) {
    e.preventDefault();

    // Get current cursor position
    const x = this.removeOffsetX(e.center.x);
    const y = this.removeOffsetY(e.center.y);

    // start
    this.isDrawing = true;
    this.startDrawing(x, y);

  }

  pan(e: any) {
    e.preventDefault();

    if (!this.isDrawing) {
      return;
    }
    // Check if large
    const x = this.removeOffsetX(e.center.x as number);
    const y = this.removeOffsetY(e.center.y as number);
    this.addPoint(x, y);
  }

  drag(e: MouseEvent) {
    e.preventDefault();

    if (!this.isDrawing) {
      return;
    }

    // Get current cursor position
    const x = this.removeOffsetX(e.clientX);
    const y = this.removeOffsetY(e.clientY);

    this.addPoint(x, y);
  }

  endPan(e: any) {
    e.preventDefault();
    this.isDrawing = false;

  }

  endDrag(e: MouseEvent) {
    e.preventDefault();
    this.isDrawing = false;
  }

  private startDrawing(x: number, y: number) {
    this.line = null;
    this.lastPoint = this.makePoint(x, y);
  }

  private addPoint(x: number, y: number) {
    // Check if line is started
    if (!this.line) {
      this.line = this.two.makeCurve([this.makePoint(this.lastPoint.x, this.lastPoint.y), this.makePoint(x, y)], true);
      this.line.noFill().stroke = this.lineColor;
      this.line.linewidth = this.lineWidth;
      this.line.vertices.forEach(v => {
        v.addSelf(this.line.translation);
      });
      this.line.translation.clear();
    } else {
      this.line.vertices.push(this.makePoint(x, y));
    }

    this.lastPoint.set(x, y);
  }

  private stopDrawing() {

  }

  private removeOffsetX(x: number) {
    return this.limit(x - this.offset.left, 0, this.offset.width);
  }

  private removeOffsetY(y: number) {
    return this.limit(y - this.offset.top, 0, this.offset.height);
  }

  private limit(v, minVal, maxVal) {
    return (v >= minVal ? (v <= maxVal ? v : maxVal) : minVal);
  }



  private makePoint(x: number, y: number) {

    const v = new two.Vector(x, y);
    v.position = new two.Vector().copy(v);

    return v;

  }




  ngAfterViewInit(): void {
    /* canvas element */
    const localCanvas = this.canvas.nativeElement;

    this.offset = this.canvas.nativeElement.getBoundingClientRect();

    /* active canvas for two */
    this.two = new two({
      type: two.Types.svg,
      autostart: true,
      fullscreen: false,
      width: this.canvas.nativeElement.offsetWidth,
      height: this.canvas.nativeElement.offsetHeight
    }).appendTo(localCanvas);

    this.lastPoint = new two.Vector();

    /* Generate grid */
    if (!!this.gridSize) {
      const localTwo = new two({
        type: two.Types.canvas,
        width: this.gridSize,
        height: this.gridSize
      });
      const strokeColor = this.gridColor || '#6dcff6';

      const a = localTwo.makeLine(localTwo.width / 2, 0, localTwo.width / 2, localTwo.height);
      const b = localTwo.makeLine(0, localTwo.height / 2, localTwo.width, localTwo.height / 2);
      a.stroke = b.stroke = strokeColor;
      localTwo.update();

      this.canvas.nativeElement.style.background = 'url(' + localTwo.renderer.domElement.toDataURL('image/png') + ') 0 0 repeat';
      this.canvas.nativeElement.style.backgroundSize = this.gridSize + 'px ' + this.gridSize + 'px'

    }

  }

}
