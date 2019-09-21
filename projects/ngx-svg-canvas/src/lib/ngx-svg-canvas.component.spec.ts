import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxSvgCanvasComponent } from './ngx-svg-canvas.component';

describe('NgxSvgCanvasComponent', () => {
  let component: NgxSvgCanvasComponent;
  let fixture: ComponentFixture<NgxSvgCanvasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgxSvgCanvasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxSvgCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
