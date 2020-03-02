import { Component, Input, ElementRef, AfterViewInit, OnChanges, SimpleChanges, OnInit, HostBinding, ApplicationRef, ViewChild, TemplateRef, EventEmitter } from '@angular/core';
import { AgVirtualSrollComponent } from '../ag-virtual-scroll.component';
import { BehaviorSubject } from 'rxjs';

@Component({
	selector: 'ag-vs-item',
	templateUrl: './ag-vs-item.component.html',
    styles: [
        `:host {
            display: block;
        }
        
        :host > ng-template {
            display: inherit;
            width: inherit;
            height: inherit;
        }`
    ]
})
export class AgVsItemComponent implements OnInit, AfterViewInit, OnChanges {
    @HostBinding('class.ag-vs-item') public class: boolean = true;

    @ViewChild('temp', {static: false}) public temp: TemplateRef<any>;

    @Input('sticky') public sticky: boolean = false;

    public get el() { return this.elRef && this.elRef.nativeElement; }

    public viewOk: boolean = false;

    public onStickyChange = new EventEmitter<boolean>(false);

    public isSticked: boolean = false;

    constructor(
        public elRef: ElementRef<HTMLElement>,
        public appRef: ApplicationRef
	) {
    }
    
    ngOnInit() {
    }

    ngAfterViewInit() {
    }
	
	ngOnChanges(changes: SimpleChanges) {
        if ('sticky' in changes)
            this.onStickyChange.next(this.sticky);
    }

    public forceUpdateInputs() {
        this.viewOk = false;
        this.appRef.tick();
        this.viewOk = true;
    }

    public getHtml() {
       return this.el.outerHTML;
    }
}
