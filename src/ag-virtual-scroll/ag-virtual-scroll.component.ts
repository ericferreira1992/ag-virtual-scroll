import { Component, Input, ElementRef, ViewChild, AfterViewInit, OnChanges, SimpleChanges, HostListener, OnInit } from '@angular/core';

@Component({
	selector: 'ag-virtual-scroll',
	templateUrl: './ag-virtual-scroll.component.html',
	styles: [
		`
		:host {
			position: relative;
			height: 100%;
			overflow-y: auto;
		
			.content-height {
				width: 1px;
				opacity: 0;
			}

			.items-container {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
			}
		}
		`
	]
})
export class AgVirtualSrollComponent implements OnInit, AfterViewInit, OnChanges {
    @ViewChild('itemsContainer') private itemsContainerEl: ElementRef<HTMLElement>;

    @Input('min-row-height') private minRowHeight: number = 35;
    @Input('height') private height: string = 'auto';
    @Input('items') private originalItems: any[] = [];

    public items: any[] = [];

    public currentScroll: number = 0;
    public contentHeight: number = 0;
    public paddingTop: number = 0;

    public currentStartIndex: number = 0;
    public currentEndIndex: number = 0;

    private previousItemsHeight: number[] = [];

    constructor(
		private el: ElementRef<HTMLElement>
	) {
	}

    ngAfterViewInit() {
	}

    ngOnInit() {
		this.el.nativeElement.style.height = this.height;
	}
	
	ngOnChanges(changes: SimpleChanges) {
		setTimeout(() => {
			if ('originalItems' in changes) {
				this.previousItemsHeight = new Array(this.originalItems.length).fill(null);
				this.currentScroll = 0;
				this.defineDimensions();
				this.prepareDataVirtualScroll();
				this.itemsContainerEl.nativeElement.scrollTop = 0;
			}
		});
	}

	@HostListener('onscroll')
	onScroll() {
        this.currentScroll = this.el.nativeElement.scrollTop;

        for (let i = 0; i < this.itemsContainerEl.nativeElement.children.length; i++) {
            let children = this.itemsContainerEl.nativeElement.children[i];
            let realIndex = this.currentStartIndex + i;
            if (!this.previousItemsHeight[realIndex])
                this.previousItemsHeight[realIndex] = children.getBoundingClientRect().height;
        }

        this.defineDimensions();
        this.prepareDataVirtualScroll();
    }

    defineDimensions() {
        this.contentHeight = this.originalItems.reduce((prev, curr, i) => {
			let height = this.previousItemsHeight[i];
			return prev + height ? height : this.minRowHeight;
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

            this.paddingTop = newPaddingTop;
            this.currentStartIndex = itemsThatAreGone;
        }
        else {
            this.paddingTop = 0;
            this.currentStartIndex = 0;
        }
    }

    prepareDataVirtualScroll() {
        this.currentEndIndex = this.currentStartIndex + Math.floor(this.el.nativeElement.clientHeight / this.minRowHeight) + 2;
        this.items = this.items.slice(this.currentStartIndex, this.currentEndIndex);
    }
}
