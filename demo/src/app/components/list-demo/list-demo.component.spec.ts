import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ListDemoComponent } from './list-demo.component';

describe('ListDemoComponent', () => {
  let component: ListDemoComponent;
  let fixture: ComponentFixture<ListDemoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ListDemoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
