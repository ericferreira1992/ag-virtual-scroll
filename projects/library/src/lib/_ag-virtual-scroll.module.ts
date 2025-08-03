import { NgModule, } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MathAbsPipe } from './pipes/math-abs.pipe';
import { StickedClassesPipe } from './pipes/sticked-classes.pipe';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        // AgVirtualSrollComponent,

        // Pipes
        MathAbsPipe,
        StickedClassesPipe
    ],
    exports: [
        MathAbsPipe,
        StickedClassesPipe
        // AgVirtualSrollComponent,
        // AgVsItemComponent
    ],
})
export class AgVirtualScrollModule { }
