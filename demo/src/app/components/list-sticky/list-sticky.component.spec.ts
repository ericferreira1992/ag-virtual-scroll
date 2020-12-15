import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ListStickyComponent } from './list-sticky.component';

describe('ListStickyComponent', () => {
  let component: ListStickyComponent;
  let fixture: ComponentFixture<ListStickyComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ListStickyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListStickyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
