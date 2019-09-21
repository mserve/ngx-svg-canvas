import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Input
} from '@angular/core';

import 'hammerjs';

import { ResizedEvent } from 'angular-resize-event';


import { CanvasMode } from './canvas-mode';
import * as Two from 'twojs-ts';
import * as two from 'twojs-ts/two.min';
import downloadjs from 'downloadjs';

// tslint:disable:component-selector
@Component({
  selector: 'ngx-svg-canvas',
  templateUrl: './ngx-svg-canvas.component.html',
  styleUrls: ['./ngx-svg-canvas.component.scss']
})
export class NgxSvgCanvasComponent implements OnInit, AfterViewInit {


  @Input() gridSize: number;
  @Input() gridColor: string;
  // tslint:disable-next-line:variable-name
  private _lineWidth: number;
  // tslint:disable-next-line:variable-name
  private _lineColor: string;

  public readonly modes = CanvasMode;

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
  private currentObject: any;
  // tslint:disable-next-line:variable-name
  private _mode: CanvasMode;

  constructor() { }

  ngOnInit() {
    // Sanitize input
    this._lineColor = (!!this.lineColor ? this.lineColor : 'black');
    this._lineWidth = (!!this.lineWidth ? this.lineWidth : 10);

    // Set mode
    this._mode = CanvasMode.Pencil;
  }



  save(): void {
    // Create second Two instance
    const localTwo = new two({
      type: two.Types.canvas,
      width: this.two.width,
      height: this.two.height,
      ratio: 1.0
    }) as Two.Two;

    // Copy scene (object by object)
    this.two.scene.children.forEach(v => {
      localTwo.add(v.clone());
    });

    // Render scene
    localTwo.render();

    // Get content and send it to browser with downloadjs
    downloadjs(localTwo.renderer.domElement.toDataURL('image/png'), 'whiteboard.png', 'image/png');

  }

  clear(): void {
    // Clear the scene ;)
    this.two.clear();
  }

  @Input('lineColor') set lineColor(color: string) {
    //  check validity of value
    const s = new Option().style;
    s.color = color;
    if (s.color === '') {
      return;
    }
    this._lineColor = s.color;
  }

  get lineColor() {
    return this._lineColor;
  }

  @Input('lineWidth') set lineWidth(size: number) {
    if (size <= 0) {
      return;
    }
    this._lineWidth = size;
  }

  get lineWidth() {
    return this._lineWidth;
  }

  set mode(mode: CanvasMode) {
    this._mode = mode;
  }

  onResized(e: ResizedEvent) {
    this.two.width = this.canvas.nativeElement.offsetWidth;
    this.two.height = this.canvas.nativeElement.offsetHeight;
  }

  onPanStart(e: HammerInput) {
    e.preventDefault();

    // Get current cursor position
    const x = this.removeOffsetX(e.center.x);
    const y = this.removeOffsetY(e.center.y);

    // start
    this.handleStart(x, y);
  }

  onPan(e: HammerInput) {
    e.preventDefault();

    // Get position
    const x = this.removeOffsetX(e.center.x as number);
    const y = this.removeOffsetY(e.center.y as number);

    this.handleMove(x, y);
  }


  onPanEnd(e: HammerInput) {
    e.preventDefault();

    // Get position
    const x = this.removeOffsetX(e.center.x as number);
    const y = this.removeOffsetY(e.center.y as number);

    this.handleEnd(x, y);
  }

  private handleStart(x: number, y: number) {
    // start
    this.isDrawing = true;

    switch (this._mode) {
      case CanvasMode.Pencil:
      case CanvasMode.Rectangle:
      case CanvasMode.Elipse:
      case CanvasMode.Line:
      case CanvasMode.Eraser:
        this.startDrawing(x, y);
        break;
    }

  }

  private handleMove(x: number, y: number) {
    if (!this.isDrawing) {
      return;
    }
    switch (this._mode) {
      case CanvasMode.Pencil:
        this.updatePencil(x, y);
        break;
      case CanvasMode.Rectangle:
        this.updateRectangle(x, y);
        break;
      case CanvasMode.Line:
        this.updateLine(x, y);
        break;
      case CanvasMode.Elipse:
        this.updateEllipse(x, y);
        break;
      case CanvasMode.Eraser:
        this.startDrawing(x, y);
        break;
    }
  }

  private handleEnd(x: number, y: number) {
    this.isDrawing = false;
    this.stopDrawing(x, y);
  }

  /* Start or stop drawing */
  private startDrawing(x: number, y: number) {
    this.currentObject = null;
    this.lastPoint = this.makePoint(x, y);
  }

  private stopDrawing(x: number, y: number) {
    this.isDrawing = false;
    this.currentObject = null;
  }

  /* Pencil mode */
  private updatePencil(x: number, y: number) {
    // Check if line is started
    if (!this.currentObject) {
      this.currentObject = this.two.makeCurve([this.makePoint(this.lastPoint.x, this.lastPoint.y), this.makePoint(x, y)], true);
      this.clearTranslation(this.currentObject);
      this.currentObject.noFill().stroke = this.lineColor;
      this.currentObject.linewidth = this.lineWidth;
    } else {
      this.currentObject.vertices.push(this.makePoint(x, y));
    }
  }

  /* Line mode */
  private updateLine(x: number, y: number) {
    // Check if object is drawn (yet)
    if (!this.currentObject) {
      this.currentObject = this.two.makePath([
        this.makePoint(x, y),
        this.makePoint(this.lastPoint.x, this.lastPoint.y)
      ], true);

      // Clean up translation
      this.clearTranslation(this.currentObject);

      // Set color etc
      this.currentObject.noFill().stroke = this.lineColor;
      this.currentObject.linewidth = this.lineWidth;

    } else {
      // Update line
      this.currentObject.vertices = [
        this.makePoint(x, y),
        this.makePoint(this.lastPoint.x, this.lastPoint.y)
      ];
    }
  }


  /* Rectangle mode */
  private updateRectangle(x: number, y: number) {

    // Check if object is drawn (yet)
    if (!this.currentObject) {
      // Draw rectangle from lastPoint (where pan was started) to current position
      this.currentObject = this.two.makePath([
        this.makePoint(x, y),
        this.makePoint(x, this.lastPoint.y),
        this.makePoint(this.lastPoint.x, this.lastPoint.y),
        this.makePoint(this.lastPoint.x, y)
      ], false);

      // Clean up translation
      this.clearTranslation(this.currentObject);

      // Set color etc
      this.currentObject.noFill().stroke = this.lineColor;
      this.currentObject.linewidth = this.lineWidth;
    } else {
      this.currentObject.vertices = [
        this.makePoint(x, y),
        this.makePoint(x, this.lastPoint.y),
        this.makePoint(this.lastPoint.x, this.lastPoint.y),
        this.makePoint(this.lastPoint.x, y)
      ];
    }
  }

  /* Ellipse mode */
  private updateEllipse(x: number, y: number) {

    // Calculate points

    const points = [
      this.makePoint(x, y),
      this.makePoint(x, this.lastPoint.y),
      this.makePoint(this.lastPoint.x, this.lastPoint.y),
      this.makePoint(this.lastPoint.x, y)
    ];

    const ox = 0.5 * Math.abs(x + this.lastPoint.x);
    const oy = 0.5 * Math.abs(y + this.lastPoint.y);
    const rx = 0.5 * Math.abs(x - this.lastPoint.x);
    const ry = 0.5 * Math.abs(y - this.lastPoint.y);

    // Check if object is drawn (yet)
    if (!this.currentObject) {
      // Draw ellispe from lastPoint (where pan was started) to current position
      this.currentObject = new two.Ellipse(ox, oy, rx, ry);
      this.two.scene.add(this.currentObject);

      // Clean up translation no required here,
      // as center is not changed and update only changes
      // width and height

      // Set color etc
      this.currentObject.noFill().stroke = this.lineColor;
      this.currentObject.linewidth = this.lineWidth;
    } else {
      this.currentObject.width = 4 * rx;
      this.currentObject.height = 4 * ry;
    }
  }



  /* Helpers */
  /* clear translation of object (= use absolute coordinates) */
  private clearTranslation(o: two.Vector) {
    o.vertices.forEach(v => {
      v.addSelf(o.translation);
    });
    o.translation.clear();
  }

  /* remove parent object offset X */
  private removeOffsetX(x: number) {
    // Limit to nativeElement
    return this.limit(x - this.canvas.nativeElement.getBoundingClientRect().left, 0,
      this.canvas.nativeElement.getBoundingClientRect().width);
  }

  /* remove parent object offset Y */
  private removeOffsetY(y: number) {
    // Limit to nativeElement
    return this.limit(y - this.canvas.nativeElement.getBoundingClientRect().top, 0,
      this.canvas.nativeElement.getBoundingClientRect().height);
  }

  /* limit a value between two boundaries */
  private limit(v, minVal, maxVal) {
    return (v >= minVal ? (v <= maxVal ? v : maxVal) : minVal);
  }

  /* create a point */
  private makePoint(x: number, y: number) {
    const v = new two.Vector(x, y);
    v.position = new two.Vector().copy(v);
    return v;
  }


  /* Init canvas after DOM loaded */
  ngAfterViewInit(): void {
    /* canvas element */
    const localCanvas = this.canvas.nativeElement;

    /* active canvas for two */
    this.two = new two({
      type: two.Types.svg,
      autostart: true,
      fullscreen: false,
      width: this.canvas.nativeElement.offsetWidth,
      height: this.canvas.nativeElement.offsetHeight
    }).appendTo(localCanvas);

    /* set lastPoint */
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
      this.canvas.nativeElement.style.backgroundSize = this.gridSize + 'px ' + this.gridSize + 'px';

    }

  }

}
