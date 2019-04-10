import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListRandomHeightDemoComponent } from './list-random-height-demo.component';

describe('ListRandomHeightDemoComponent', () => {
  let component: ListRandomHeightDemoComponent;
  let fixture: ComponentFixture<ListRandomHeightDemoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListRandomHeightDemoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListRandomHeightDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
