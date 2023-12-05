import { NgModule, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgVirtualSrollComponent } from './ag-virtual-scroll.component';
import { AgVsItemComponent } from './ag-vs-item/ag-vs-item.component';
import { MathAbsPipe } from './pipes/math-abs.pipe';
import { StickedClassesPipe } from './pipes/sticked-classes.pipe';
import * as i0 from "@angular/core";
export class AgVirtualScrollModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: AgVirtualScrollModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "16.2.12", ngImport: i0, type: AgVirtualScrollModule, declarations: [AgVirtualSrollComponent,
            AgVsItemComponent,
            // Pipes
            MathAbsPipe,
            StickedClassesPipe], imports: [CommonModule], exports: [AgVirtualSrollComponent,
            AgVsItemComponent] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: AgVirtualScrollModule, imports: [CommonModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: AgVirtualScrollModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        CommonModule
                    ],
                    declarations: [
                        AgVirtualSrollComponent,
                        AgVsItemComponent,
                        // Pipes
                        MathAbsPipe,
                        StickedClassesPipe
                    ],
                    exports: [
                        AgVirtualSrollComponent,
                        AgVsItemComponent
                    ],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctdmlydHVhbC1zY3JvbGwubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvbGlicmFyeS9zcmMvbGliL2FnLXZpcnR1YWwtc2Nyb2xsLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxHQUFHLE1BQU0sZUFBZSxDQUFDO0FBQzFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUUvQyxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUN4RSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUN0RSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDcEQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sOEJBQThCLENBQUM7O0FBbUJsRSxNQUFNLE9BQU8scUJBQXFCOytHQUFyQixxQkFBcUI7Z0hBQXJCLHFCQUFxQixpQkFaMUIsdUJBQXVCO1lBQ3ZCLGlCQUFpQjtZQUVqQixRQUFRO1lBQ1IsV0FBVztZQUNYLGtCQUFrQixhQVJsQixZQUFZLGFBV1osdUJBQXVCO1lBQ3ZCLGlCQUFpQjtnSEFHWixxQkFBcUIsWUFmMUIsWUFBWTs7NEZBZVAscUJBQXFCO2tCQWpCakMsUUFBUTttQkFBQztvQkFDTixPQUFPLEVBQUU7d0JBQ0wsWUFBWTtxQkFDZjtvQkFDRCxZQUFZLEVBQUU7d0JBQ1YsdUJBQXVCO3dCQUN2QixpQkFBaUI7d0JBRWpCLFFBQVE7d0JBQ1IsV0FBVzt3QkFDWCxrQkFBa0I7cUJBQ3JCO29CQUNELE9BQU8sRUFBRTt3QkFDTCx1QkFBdUI7d0JBQ3ZCLGlCQUFpQjtxQkFDcEI7aUJBQ0oiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZ01vZHVsZSwgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5cbmltcG9ydCB7IEFnVmlydHVhbFNyb2xsQ29tcG9uZW50IH0gZnJvbSAnLi9hZy12aXJ0dWFsLXNjcm9sbC5jb21wb25lbnQnO1xuaW1wb3J0IHsgQWdWc0l0ZW1Db21wb25lbnQgfSBmcm9tICcuL2FnLXZzLWl0ZW0vYWctdnMtaXRlbS5jb21wb25lbnQnO1xuaW1wb3J0IHsgTWF0aEFic1BpcGUgfSBmcm9tICcuL3BpcGVzL21hdGgtYWJzLnBpcGUnO1xuaW1wb3J0IHsgU3RpY2tlZENsYXNzZXNQaXBlIH0gZnJvbSAnLi9waXBlcy9zdGlja2VkLWNsYXNzZXMucGlwZSc7XG5cbkBOZ01vZHVsZSh7XG4gICAgaW1wb3J0czogW1xuICAgICAgICBDb21tb25Nb2R1bGVcbiAgICBdLFxuICAgIGRlY2xhcmF0aW9uczogW1xuICAgICAgICBBZ1ZpcnR1YWxTcm9sbENvbXBvbmVudCxcbiAgICAgICAgQWdWc0l0ZW1Db21wb25lbnQsXG5cbiAgICAgICAgLy8gUGlwZXNcbiAgICAgICAgTWF0aEFic1BpcGUsXG4gICAgICAgIFN0aWNrZWRDbGFzc2VzUGlwZVxuICAgIF0sXG4gICAgZXhwb3J0czogW1xuICAgICAgICBBZ1ZpcnR1YWxTcm9sbENvbXBvbmVudCxcbiAgICAgICAgQWdWc0l0ZW1Db21wb25lbnRcbiAgICBdLFxufSlcbmV4cG9ydCBjbGFzcyBBZ1ZpcnR1YWxTY3JvbGxNb2R1bGUgeyB9XG4iXX0=