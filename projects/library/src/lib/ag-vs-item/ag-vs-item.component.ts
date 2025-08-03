import { Component, Input, ElementRef, OnChanges, SimpleChanges, OnInit, ApplicationRef, ViewChild, TemplateRef, EventEmitter, AfterContentInit, forwardRef, Inject } from '@angular/core';
import { AgVirtualSrollComponent } from '../ag-virtual-scroll.component';

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
    ],
    host: {
        '[class.ag-vs-item]': 'true',
    },
    standalone: false
})
export class AgVsItemComponent implements OnInit, AfterContentInit, OnChanges {

	@ViewChild('temp', { static: false }) public temp: TemplateRef<any>;

	@Input('sticky') public sticky: boolean;

	public get el() { return this.elRef && this.elRef.nativeElement; }

	public viewOk: boolean = false;

	public onStickyChange = new EventEmitter<boolean>(false);

	public isSticked: boolean = false;

	public virtualIndex: number;
	public get index() { return this.parent.startIndex + (this.virtualIndex ?? 0); }

	constructor(
		@Inject(forwardRef(() => AgVirtualSrollComponent))
		public parent: AgVirtualSrollComponent,
		public elRef: ElementRef<HTMLElement>,
		public appRef: ApplicationRef,
	) {
	}

	ngOnInit() {
	}

	public ngAfterContentInit() {
		this.updateIndex();
	}

	public ngOnChanges(changes: SimpleChanges) {
		if ('sticky' in changes)
			this.onStickyChange.next(this.sticky);
	}
	
	public updateIndex() {
		this.virtualIndex = Array.from(this.parent.itemsContainerEl?.children).indexOf(this.el);
		this.manipuleRenderedItems();
	}

	public forceUpdateInputs() {
		this.viewOk = false;
		this.appRef.tick();
		this.viewOk = true;
	}

	public getHtml() {
		return this.el.outerHTML;
	}

	private manipuleRenderedItems() {
		if (this.el?.style.display !== 'none') {
			const realIndex = this.index;
			
			const className = (realIndex + 1) % 2 === 0 ? 'even' : 'odd';
			const unclassName = className == 'even' ? 'odd' : 'even';
			const getClassName = (classname: string) => `ag-virtual-scroll-${classname}`;			
			this.el.style.minHeight = `${this.parent.minRowHeight}px`;
			if (!this.el.classList.contains(getClassName(className))) this.el.classList.add(getClassName(className));
			if (this.el.classList.contains(getClassName(unclassName))) this.el.classList.remove(getClassName(unclassName));
		}
	}
}
