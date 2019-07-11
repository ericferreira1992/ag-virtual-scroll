import { Component, Input, ElementRef, ViewChild, AfterViewInit, OnChanges, SimpleChanges, Renderer, OnInit, Output, EventEmitter, QueryList, ContentChildren, AfterContentChecked, OnDestroy } from '@angular/core';
import { AgVsRenderEvent } from './classes/ag-vs-render-event.class';
import { AgVsItemComponent } from './ag-vs-item/ag-vs-item.component';
import { Observable, Subscriber, Subscription } from 'rxjs';

@Component({
	selector: 'ag-virtual-scroll',
	templateUrl: './ag-virtual-scroll.component.html',
    styles: [`
        :host {
            display: block;
            position: relative;
            height: 100%;
            width: 100%;
            overflow-y: auto;
        }

        :host .content-height {
            width: 1px;
            opacity: 0;
        }

        :host .items-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }

        :host::ng-deep .items-container.sticked > .ag-vs-item:last-child {
            /* display: none; */
            position: absolute;
            left: -100%;
        }

        :host::ng-deep > .ag-vs-item {
            position: absolute;
            top: 0;
            left: 0;
            box-shadow: 0 5px 5px rgba(0, 0, 0, .1);
            background: #FFF;
        }`
    ]
})
export class AgVirtualSrollComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy, AfterContentChecked {
    @ViewChild('itemsContainer') private itemsContainerElRef: ElementRef<HTMLElement>;

    @ContentChildren(AgVsItemComponent) private queryVsItems: QueryList<AgVsItemComponent>;

    @Input('min-row-height') private minRowHeight: number = 40;
    @Input('height') private height: string = 'auto';
    @Input('items') private originalItems: any[] = [];

    @Output() private onItemsRender = new EventEmitter<AgVsRenderEvent<any>>();

    public items: any[] = [];

    private subscripAllVsItem: { comp: AgVsItemComponent, subscrip: Subscription }[] = [];

    private subscripCurrentSticky: Subscription;
    private subscripPrevSticky: Subscription;
    private subscripNextSticky: Subscription;

    private _indexCurrentSticky: number = -1;
    private get indexCurrentSticky() { return this._indexCurrentSticky; }
    private set indexCurrentSticky(value: number) {
        this._indexCurrentSticky = value;

        let currentIsPrev = value === this.indexPrevSticky;

        if (!currentIsPrev && value >= 0) {
            this.findCurrentStickyByIndex();
        }
        else {
            this.indexNextSticky = -1;
            this.currentStickyItem = null;
        }

        this.prepareDataItems();
    }
    
    private get indexPrevSticky() { return this.indexesPrevStick.length ? this.indexesPrevStick[this.indexesPrevStick.length - 1] : -1; }
    private set indexPrevSticky(value: number) {
        if (value < 0) {
            if (this.indexesPrevStick.length > 0)
                this.indexesPrevStick = this.indexesPrevStick.slice(0, this.indexesPrevStick.length - 1);
        }
        else
            this.indexesPrevStick.push(value);
    }

    private indexNextSticky: number = -1;

    private indexesPrevStick: number[] = [];

    private currentStickyItem: StickyItem;

    public currentScroll: number = 0;
    public contentHeight: number = 0;
    public paddingTop: number = 0;

    public startIndex: number = 0;
    public endIndex: number = 0;

    private isTable: boolean = false;

    private scrollIsUp: boolean = false;
    private lastScrollIsUp: boolean = false;
    
    private previousItemsHeight: number[] = [];

    public containerWidth: number = 0;

    private get itemsNoSticky() { return this.currentStickyItem ? this.items.filter((item) => this.originalItems[this.currentStickyItem.index] !== item) : this.items; }

    public get vsItems() { return (this.queryVsItems && this.queryVsItems.toArray()) || []; }
    // private get vsItemsNoSticked() { return this.vsItems.filter(vsItem => this.currentStickyItem && this.currentStickyItem.comp === vsItem); }

    public get numberItemsRendred(): number { return this.endIndex - this.startIndex; }
    
    public get el() { return this.elRef && this.elRef.nativeElement; }

    public get itemsContainerEl() { return this.itemsContainerElRef && this.itemsContainerElRef.nativeElement; }
    
    constructor(
        private elRef: ElementRef<HTMLElement>,
        private renderer: Renderer
	) {
	}

    ngAfterViewInit() {
        this.queryVsItems.changes.subscribe(() => this.checkStickItem(this.scrollIsUp));
	}

    ngOnInit() {
        this.renderer.listen(this.el, 'scroll', this.onScroll.bind(this));
	}
	
	ngOnChanges(changes: SimpleChanges) {
		setTimeout(() => {
            if ('height' in changes) {
                this.el.style.height = this.height;
            }

            if ('minRowHeight' in changes) {
                if (typeof this.minRowHeight === 'string') {
                    if (parseInt(this.minRowHeight))
                        this.minRowHeight = parseInt(this.minRowHeight);
                    else
                        this.minRowHeight = 40;
                }
            }

			if ('originalItems' in changes) {
                if (!this.originalItems) this.originalItems = [];
                this.previousItemsHeight = new Array(this.originalItems.length).fill(this.minRowHeight);
                
                if (this.el.scrollTop !== 0)
                    this.el.scrollTop = 0;
                else {
                    this.currentScroll = 0;
                    this.prepareDataItems();
                    this.checkIsTable();
                    this.queryVsItems.notifyOnChanges();
                }
			}
		});
    }

    ngAfterContentChecked() {
        let currentContainerWidth = this.itemsContainerEl && this.itemsContainerEl.clientWidth;
        if (currentContainerWidth !== this.containerWidth)
            this.containerWidth = currentContainerWidth;
    }

	private onScroll() {
        let up = this.el.scrollTop < this.currentScroll;
        this.currentScroll = this.el.scrollTop;

        this.prepareDataItems();
        this.isTable = this.checkIsTable();
        this.lastScrollIsUp = this.scrollIsUp;
        this.scrollIsUp = up;
        this.queryVsItems.notifyOnChanges();
    }

    private prepareDataItems() {
        this.registerCurrentItemsHeight();
        this.prepareDataVirtualScroll();
    }

    private registerCurrentItemsHeight() {
        let childrens = this.getInsideChildrens();
        for (let i = 0; i < childrens.length; i++) {
            let children = childrens[i];
            let realIndex = this.startIndex + i;
            this.previousItemsHeight[realIndex] = children.getBoundingClientRect().height;
        }
    }

    private getDimensions() {
        
        let dimensions = {
            contentHeight: 0,
            paddingTop: 0,
            itemsThatAreGone: 0
        };
        
        dimensions.contentHeight = this.originalItems.reduce((prev, curr, i) => {
			let height = this.previousItemsHeight[i];
			return prev + (height ? height : this.minRowHeight);
        }, 0);

        if (this.currentScroll >= this.minRowHeight) {
            let newPaddingTop = 0;
            let itemsThatAreGone = 0;
            let initialScroll = this.currentScroll;
            
            for (let h of this.previousItemsHeight) {
                let height = h ? h : this.minRowHeight;
                if (initialScroll >= height) {
                    newPaddingTop += height;
                    initialScroll -= height;
                    itemsThatAreGone++;
                }
                else
                    break;
            }
            
            dimensions.paddingTop = newPaddingTop;
            dimensions.itemsThatAreGone = itemsThatAreGone;
        }

        return dimensions;
    }
    
    private prepareDataVirtualScroll() {
        let dimensions = this.getDimensions();
        
        this.contentHeight = dimensions.contentHeight;
        this.paddingTop = dimensions.paddingTop;
        this.startIndex = dimensions.itemsThatAreGone;
        this.endIndex = Math.min((this.startIndex + Math.floor(this.el.clientHeight / this.minRowHeight) + 2), (this.originalItems.length - 1));

        if (this.indexCurrentSticky >= 0) {
            this.items = [ ...this.originalItems.slice(this.startIndex, this.endIndex), this.originalItems[this.indexCurrentSticky] ];
        }
        else
            this.items = this.originalItems.slice(this.startIndex, this.endIndex);

        this.onItemsRender.emit(new AgVsRenderEvent<any>({
            items: this.itemsNoSticky,
            startIndex: this.startIndex,
            endIndex: this.endIndex,
            length: this.itemsNoSticky.length
        }));
                
        this.manipuleRenderedItems();
    }

    private manipuleRenderedItems() {
        setTimeout(() => {
            let childrens = this.getInsideChildrens();
            for (let i = 0; i < childrens.length; i++) {
                let children = childrens[i] as HTMLElement;
                let realIndex = this.startIndex + i;
                children.style.minHeight = `${this.minRowHeight}px`;
                children.style.height = `${this.minRowHeight}px`;
                
                let className = (realIndex + 1) % 2 === 0 ? 'even' : 'odd';
                let unclassName = className == 'even' ? 'odd' : 'even';

                children.classList.add(`ag-virtual-scroll-${className}`);
                children.classList.remove(`ag-virtual-scroll-${unclassName}`);
            }
        });
    }

    private getInsideChildrens() {
        let childrens = this.itemsContainerEl.children;
        if (childrens.length > 0) {
            if (childrens[0].tagName.toUpperCase() === 'TABLE') {
                childrens = childrens[0].children;
                if (childrens.length > 0) {
                    if (childrens[0].tagName.toUpperCase() === 'TBODY')
                        childrens = childrens[0].children;
                    else
                        childrens = childrens[1].children;
                }
            }

            let childrenJustVisible = [];
            for (let i = 0; i < childrens.length; i++) {
                let children = childrens[i] as HTMLElement;
                if (children.style.display !== 'none')
                    childrenJustVisible.push(children);
            }

            return childrenJustVisible;
        }
        return [];
    }

    private checkIsTable() {
        let childrens = this.itemsContainerEl.children;
        if (childrens.length > 0) {
            if (childrens[0].tagName.toUpperCase() === 'TABLE') {
                childrens = childrens[0].children;
                if (childrens.length > 0) {
                    if (childrens[0].tagName.toUpperCase() === 'THEAD'){
                        let thead = childrens[0] as HTMLElement;
                        thead.style.transform = `translateY(${Math.abs(this.paddingTop - this.currentScroll)}px)`;
                    }
                }
                return true;
            }
        }
        return false;
    }

    private checkStickItem(up: boolean) {
        if (!this.isTable && this.vsItems.length > 0) {
            this.updateVsItems().subscribe(() => {
                if (this.indexCurrentSticky >= 0) {

                    if (!this.currentStickyItem) {
                        this.findCurrentStickyByIndex(true);
                        return;
                    }

                    if (this.indexNextSticky === -1)
                        this.indexNextSticky = this.getIndexNextSticky(up);
    
                    if (this.currentStickIsEnded(up)) {
                        if (!up) {
                            this.indexPrevSticky = this.indexCurrentSticky;
                            this.indexCurrentSticky = this.getIndexCurrentSticky(up);
                            this.indexNextSticky = this.getIndexNextSticky(up);
                        }
                        else {
                            if (this.indexPrevSticky >= 0) {
                                this.setPrevAsCurrentSticky();
                            }
                            else {
                                this.indexCurrentSticky = this.getIndexCurrentSticky(up);

                                if (this.indexCurrentSticky >= 0)
                                    this.indexNextSticky = this.getIndexNextSticky(up);
                                else
                                    this.indexNextSticky = null;
                            }
                        }
                    }
                }  
                else {
                    this.indexCurrentSticky = this.getIndexCurrentSticky(up);
                    this.indexNextSticky = this.getIndexNextSticky(up);
                }        
            });
        }
        else {
            this.indexCurrentSticky = -1;
            this.indexNextSticky = -1;
        }
    }

    private findCurrentStickyByIndex(afterPrev: boolean = false) {
        let vsIndex = 0;
        let lastVsIndex = this.vsItems.length - 1;
        for(let vsItem of this.vsItems) {
            let index = this.startIndex + vsIndex;

            if ((!afterPrev && this.indexCurrentSticky === index) || (afterPrev && vsIndex === lastVsIndex)) {
                let offsetTop = this.previousItemsHeight.slice(0, index).reduce((prev, curr) => (prev + curr), 0);
                this.currentStickyItem = new StickyItem({ comp: vsItem, index: index, offsetTop: offsetTop, height: vsItem.el.offsetHeight });
                break;
            }
            
            vsIndex++;
        }
    }

    private setPrevAsCurrentSticky() {
        this.indexCurrentSticky = this.indexPrevSticky;
        this.indexPrevSticky = -1;
    }

    private getIndexCurrentSticky(up: boolean) {
        let vsIndex = 0;
        for (let vsItem of this.vsItems) {
            let index = vsIndex + this.startIndex;

            let offsetTop = this.previousItemsHeight.slice(0, index).reduce((prev, curr) => (prev + curr), 0);
            
            if (vsItem && vsItem.sticky &&
                this.el.scrollTop >= offsetTop &&
                (this.indexCurrentSticky === -1 || index !== this.indexCurrentSticky)
            )
                return index;

            vsIndex++;
        };
        
        return -1;
    }

    private getIndexNextSticky(up: boolean) {
        if (this.indexCurrentSticky >= 0) {
            let start = up ? this.vsItems.length : 0;
            let end = up ? -1 : this.vsItems.length;
            for(let vsIndex = start; vsIndex !== end; vsIndex += up ? (-1) : 1) {
                let index = vsIndex + this.startIndex;
                let vsItem = this.vsItems[vsIndex];

                if (vsItem && vsItem.sticky &&
                    (this.indexCurrentSticky === -1 || index !== this.indexCurrentSticky) &&
                    (this.indexCurrentSticky === -1 || vsIndex !== (end - 1))
                )
                    return index;
            }
        }

        return -1;
    }

    private currentStickIsEnded(up: boolean) {
        let currentHeight = this.currentStickyItem.height;
        
        if (!up || this.currentStickyItem.diffTop > 0) {
            let offsetBottom = this.paddingTop + currentHeight + Math.abs(this.el.scrollTop - this.paddingTop);
            let offsetTopNext = this.indexNextSticky >= 0 ? this.previousItemsHeight.slice(0, this.indexNextSticky).reduce((prev, curr) => (prev + curr), 0) : null;
            
            if (offsetTopNext !== null && offsetBottom >= offsetTopNext) {
                let newDiffTop = offsetBottom - offsetTopNext;
                if (newDiffTop >= currentHeight) {
                    this.currentStickyItem.diffTop = currentHeight;
                    return true;
                }
                else
                    this.currentStickyItem.diffTop = newDiffTop;
            } 
            else
                this.currentStickyItem.diffTop = 0;
        }
        else {
            let offsetBottom = this.paddingTop + Math.abs(this.el.scrollTop - this.paddingTop);
            if (offsetBottom <= this.currentStickyItem.offsetTop) {
                return true;
            } 
        }

        return false;
    }

    private updateVsItems() {
        return new Observable<void>((subscriber) => {
            if (this.subscripAllVsItem.length) {
                this.subscripAllVsItem.forEach((item) => item.subscrip.unsubscribe());
                this.subscripAllVsItem = [];
            }

            let interval = setInterval(() => {
                let ok = this.vsItems.every((vsItem, vsIndex) => {
                    let index = this.startIndex + vsIndex;

                    if (!this.subscripAllVsItem.some(item => item.comp !== vsItem))
                        this.subscripAllVsItem.push({
                            comp: vsItem,
                            subscrip: vsItem.onStickyChange.subscribe((sticky) => {
                                console.log(vsIndex, 'CHANGED', sticky);
                                this.queryVsItems.notifyOnChanges();
                            })
                        });

                    try { vsItem.forceUpdateInputs(); }
                    catch { return false; }

                    return true;
                });

                if (ok) {
                    clearInterval(interval);
                    subscriber.next();
                }
            });
        });
    }

    ngOnDestroy() {
        if (this.subscripCurrentSticky) this.subscripCurrentSticky.unsubscribe();
        if (this.subscripPrevSticky) this.subscripPrevSticky.unsubscribe();
        if (this.subscripNextSticky) this.subscripNextSticky.unsubscribe();
    }
}


export class StickyItem {
    comp: AgVsItemComponent;
    index: number;
    offsetTop: number = 0;
    vsIndex: number;
    diffTop: number = 0;
    isUp: boolean = false
    height: number = 0;

    constructor(obj?: Partial<StickyItem>) {
        if (obj) Object.assign(this, obj);
    }
}