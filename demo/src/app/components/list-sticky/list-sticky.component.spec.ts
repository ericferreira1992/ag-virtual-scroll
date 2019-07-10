import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListStickyComponent } from './list-sticky.component';

describe('ListStickyComponent', () => {
  let component: ListStickyComponent;
  let fixture: ComponentFixture<ListStickyComponent>;

  beforeEach(async(() => {
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
