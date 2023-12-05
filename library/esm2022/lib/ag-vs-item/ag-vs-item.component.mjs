import { Component, Input, HostBinding, ViewChild, EventEmitter } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
export class AgVsItemComponent {
    get el() { return this.elRef && this.elRef.nativeElement; }
    constructor(elRef, appRef) {
        this.elRef = elRef;
        this.appRef = appRef;
        this.class = true;
        this.sticky = false;
        this.viewOk = false;
        this.onStickyChange = new EventEmitter(false);
        this.isSticked = false;
    }
    ngOnInit() {
    }
    ngAfterViewInit() {
    }
    ngOnChanges(changes) {
        if ('sticky' in changes)
            this.onStickyChange.next(this.sticky);
    }
    forceUpdateInputs() {
        this.viewOk = false;
        this.appRef.tick();
        this.viewOk = true;
    }
    getHtml() {
        return this.el.outerHTML;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: AgVsItemComponent, deps: [{ token: i0.ElementRef }, { token: i0.ApplicationRef }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "16.2.12", type: AgVsItemComponent, selector: "ag-vs-item", inputs: { sticky: "sticky" }, host: { properties: { "class.ag-vs-item": "this.class" } }, viewQueries: [{ propertyName: "temp", first: true, predicate: ["temp"], descendants: true }], usesOnChanges: true, ngImport: i0, template: "<ng-template #temp>\n    <ng-content></ng-content>\n</ng-template>\n\n<ng-container *ngIf=\"!isSticked\" [ngTemplateOutlet]=\"temp\"></ng-container>", styles: [":host{display:block}:host>ng-template{display:inherit;width:inherit;height:inherit}\n"], dependencies: [{ kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i1.NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: AgVsItemComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ag-vs-item', template: "<ng-template #temp>\n    <ng-content></ng-content>\n</ng-template>\n\n<ng-container *ngIf=\"!isSticked\" [ngTemplateOutlet]=\"temp\"></ng-container>", styles: [":host{display:block}:host>ng-template{display:inherit;width:inherit;height:inherit}\n"] }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i0.ApplicationRef }]; }, propDecorators: { class: [{
                type: HostBinding,
                args: ['class.ag-vs-item']
            }], temp: [{
                type: ViewChild,
                args: ['temp', { static: false }]
            }], sticky: [{
                type: Input,
                args: ['sticky']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctdnMtaXRlbS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9saWJyYXJ5L3NyYy9saWIvYWctdnMtaXRlbS9hZy12cy1pdGVtLmNvbXBvbmVudC50cyIsIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2xpYnJhcnkvc3JjL2xpYi9hZy12cy1pdGVtL2FnLXZzLWl0ZW0uY29tcG9uZW50Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQStELFdBQVcsRUFBa0IsU0FBUyxFQUFlLFlBQVksRUFBRSxNQUFNLGVBQWUsQ0FBQzs7O0FBaUJqTCxNQUFNLE9BQU8saUJBQWlCO0lBTzFCLElBQVcsRUFBRSxLQUFLLE9BQU8sSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7SUFRbEUsWUFDVyxLQUE4QixFQUM5QixNQUFzQjtRQUR0QixVQUFLLEdBQUwsS0FBSyxDQUF5QjtRQUM5QixXQUFNLEdBQU4sTUFBTSxDQUFnQjtRQWhCTyxVQUFLLEdBQVksSUFBSSxDQUFDO1FBSXRDLFdBQU0sR0FBWSxLQUFLLENBQUM7UUFJekMsV0FBTSxHQUFZLEtBQUssQ0FBQztRQUV4QixtQkFBYyxHQUFHLElBQUksWUFBWSxDQUFVLEtBQUssQ0FBQyxDQUFDO1FBRWxELGNBQVMsR0FBWSxLQUFLLENBQUM7SUFNbEMsQ0FBQztJQUVELFFBQVE7SUFDUixDQUFDO0lBRUQsZUFBZTtJQUNmLENBQUM7SUFFSixXQUFXLENBQUMsT0FBc0I7UUFDM0IsSUFBSSxRQUFRLElBQUksT0FBTztZQUNuQixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVNLGlCQUFpQjtRQUNwQixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUNwQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ25CLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0lBQ3ZCLENBQUM7SUFFTSxPQUFPO1FBQ1gsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQztJQUM1QixDQUFDOytHQXhDUSxpQkFBaUI7bUdBQWpCLGlCQUFpQiwrUENqQjlCLHNKQUkwRTs7NEZEYTdELGlCQUFpQjtrQkFmN0IsU0FBUzsrQkFDQyxZQUFZOzhIQWVxQixLQUFLO3NCQUE1QyxXQUFXO3VCQUFDLGtCQUFrQjtnQkFFWSxJQUFJO3NCQUE5QyxTQUFTO3VCQUFDLE1BQU0sRUFBRSxFQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUM7Z0JBRVYsTUFBTTtzQkFBN0IsS0FBSzt1QkFBQyxRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbnB1dCwgRWxlbWVudFJlZiwgQWZ0ZXJWaWV3SW5pdCwgT25DaGFuZ2VzLCBTaW1wbGVDaGFuZ2VzLCBPbkluaXQsIEhvc3RCaW5kaW5nLCBBcHBsaWNhdGlvblJlZiwgVmlld0NoaWxkLCBUZW1wbGF0ZVJlZiwgRXZlbnRFbWl0dGVyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbkBDb21wb25lbnQoe1xuXHRzZWxlY3RvcjogJ2FnLXZzLWl0ZW0nLFxuXHR0ZW1wbGF0ZVVybDogJy4vYWctdnMtaXRlbS5jb21wb25lbnQuaHRtbCcsXG4gICAgc3R5bGVzOiBbXG4gICAgICAgIGA6aG9zdCB7XG4gICAgICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgOmhvc3QgPiBuZy10ZW1wbGF0ZSB7XG4gICAgICAgICAgICBkaXNwbGF5OiBpbmhlcml0O1xuICAgICAgICAgICAgd2lkdGg6IGluaGVyaXQ7XG4gICAgICAgICAgICBoZWlnaHQ6IGluaGVyaXQ7XG4gICAgICAgIH1gXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBBZ1ZzSXRlbUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgQWZ0ZXJWaWV3SW5pdCwgT25DaGFuZ2VzIHtcbiAgICBASG9zdEJpbmRpbmcoJ2NsYXNzLmFnLXZzLWl0ZW0nKSBwdWJsaWMgY2xhc3M6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgQFZpZXdDaGlsZCgndGVtcCcsIHtzdGF0aWM6IGZhbHNlfSkgcHVibGljIHRlbXA6IFRlbXBsYXRlUmVmPGFueT47XG5cbiAgICBASW5wdXQoJ3N0aWNreScpIHB1YmxpYyBzdGlja3k6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIHB1YmxpYyBnZXQgZWwoKSB7IHJldHVybiB0aGlzLmVsUmVmICYmIHRoaXMuZWxSZWYubmF0aXZlRWxlbWVudDsgfVxuXG4gICAgcHVibGljIHZpZXdPazogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgcHVibGljIG9uU3RpY2t5Q2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxib29sZWFuPihmYWxzZSk7XG5cbiAgICBwdWJsaWMgaXNTdGlja2VkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHVibGljIGVsUmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICAgICAgcHVibGljIGFwcFJlZjogQXBwbGljYXRpb25SZWZcblx0KSB7XG4gICAgfVxuICAgIFxuICAgIG5nT25Jbml0KCkge1xuICAgIH1cblxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICB9XG5cdFxuXHRuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgICAgIGlmICgnc3RpY2t5JyBpbiBjaGFuZ2VzKVxuICAgICAgICAgICAgdGhpcy5vblN0aWNreUNoYW5nZS5uZXh0KHRoaXMuc3RpY2t5KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZm9yY2VVcGRhdGVJbnB1dHMoKSB7XG4gICAgICAgIHRoaXMudmlld09rID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYXBwUmVmLnRpY2soKTtcbiAgICAgICAgdGhpcy52aWV3T2sgPSB0cnVlO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRIdG1sKCkge1xuICAgICAgIHJldHVybiB0aGlzLmVsLm91dGVySFRNTDtcbiAgICB9XG59XG4iLCI8bmctdGVtcGxhdGUgI3RlbXA+XG4gICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxuPC9uZy10ZW1wbGF0ZT5cblxuPG5nLWNvbnRhaW5lciAqbmdJZj1cIiFpc1N0aWNrZWRcIiBbbmdUZW1wbGF0ZU91dGxldF09XCJ0ZW1wXCI+PC9uZy1jb250YWluZXI+Il19