import { TestBed } from '@angular/core/testing';

import { NgxSvgCanvasService } from './ngx-svg-canvas.service';

describe('NgxSvgCanvasService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NgxSvgCanvasService = TestBed.get(NgxSvgCanvasService);
    expect(service).toBeTruthy();
  });
});
