import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ListRandomHeightDemoComponent } from './list-random-height-demo.component';

describe('ListRandomHeightDemoComponent', () => {
  let component: ListRandomHeightDemoComponent;
  let fixture: ComponentFixture<ListRandomHeightDemoComponent>;

  beforeEach(waitForAsync(() => {
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
