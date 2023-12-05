import { NgModule, } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgVirtualSrollComponent } from './ag-virtual-scroll.component';
import { AgVsItemComponent } from './ag-vs-item/ag-vs-item.component';
import { MathAbsPipe } from './pipes/math-abs.pipe';
import { StickedClassesPipe } from './pipes/sticked-classes.pipe';

@NgModule({
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
})
export class AgVirtualScrollModule { }
