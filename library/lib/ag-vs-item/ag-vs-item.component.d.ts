import { ElementRef, AfterViewInit, OnChanges, SimpleChanges, OnInit, ApplicationRef, TemplateRef, EventEmitter } from '@angular/core';
import * as i0 from "@angular/core";
export declare class AgVsItemComponent implements OnInit, AfterViewInit, OnChanges {
    elRef: ElementRef<HTMLElement>;
    appRef: ApplicationRef;
    class: boolean;
    temp: TemplateRef<any>;
    sticky: boolean;
    get el(): HTMLElement;
    viewOk: boolean;
    onStickyChange: EventEmitter<boolean>;
    isSticked: boolean;
    constructor(elRef: ElementRef<HTMLElement>, appRef: ApplicationRef);
    ngOnInit(): void;
    ngAfterViewInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    forceUpdateInputs(): void;
    getHtml(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<AgVsItemComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<AgVsItemComponent, "ag-vs-item", never, { "sticky": { "alias": "sticky"; "required": false; }; }, {}, never, ["*"], false, never>;
}
