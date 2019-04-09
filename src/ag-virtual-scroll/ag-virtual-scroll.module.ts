import { NgModule, } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgVirtualSrollComponent } from './ag-virtual-scroll.component';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        AgVirtualSrollComponent
    ],
    exports: [
        AgVirtualSrollComponent
    ],
    entryComponents: [
        AgVirtualSrollComponent
    ]
})
export class AgVirtualScrollModule { }
