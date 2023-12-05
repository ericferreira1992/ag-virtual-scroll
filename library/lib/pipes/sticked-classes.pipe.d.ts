import { PipeTransform } from '@angular/core';
import * as i0 from "@angular/core";
export declare class StickedClassesPipe implements PipeTransform {
    private exceptionClasses;
    constructor();
    transform(classes: string): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<StickedClassesPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<StickedClassesPipe, "stickedClasses", false>;
}
