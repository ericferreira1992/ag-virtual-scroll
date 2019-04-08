import { Component, ViewChildren, ElementRef, QueryList, AfterContentInit, AfterViewInit, ViewChild } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
    @ViewChild('container') containerEl: ElementRef<HTMLElement>;
    @ViewChild('itemsContainer') itemsContainerEl: ElementRef<HTMLElement>;

    private items: any[] = [];
    public _items: any[] = [];

    public currentScroll: number = 0;
    public contentHeight: number = 0;
    public paddingTop: number = 0;

    public currentStartIndex: number = 0;
    public currentEndIndex: number = 0;

    private minHeight: number = 35;

    private previousItemsHeight: number[] = [];

    constructor() {
        this.items = new Array(100000).fill(null).map((x, i) => ({ name: `Teste ${i + 1}`, height: Math.max(Math.floor(Math.random() * 100), 35) }));
        this.previousItemsHeight = new Array(this.items.length).fill(null);
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.defineDimensions();
            this.prepareDataVirutalScroll();
        });
    }

    onScroll() {
        this.currentScroll = this.containerEl.nativeElement.scrollTop;

        for (let i = 0; i < this.itemsContainerEl.nativeElement.children.length; i++) {
            let children = this.itemsContainerEl.nativeElement.children[i];
            let realIndex = this.currentStartIndex + i;
            if (!this.previousItemsHeight[realIndex])
                this.previousItemsHeight[realIndex] = children.getBoundingClientRect().height;
        }

        this.defineDimensions();
        this.prepareDataVirutalScroll();
    }

    defineDimensions() {
        this.contentHeight = this.items.map((x, i) => {
            let height = this.previousItemsHeight[i];
            return height ? height : this.minHeight;
        }).reduce((prev, curr) => prev + curr, 0);

        if (this.currentScroll >= this.minHeight) {
            let newPaddingTop = 0;
            let itemsThatAreGone = 0;
            let initialScroll = this.currentScroll;

            for (let h of this.previousItemsHeight) {
                let height = h ? h : this.minHeight;
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

    prepareDataVirutalScroll() {
        this.currentEndIndex = this.currentStartIndex + Math.floor(this.containerEl.nativeElement.clientHeight / this.minHeight) + 2;
        this._items = this.items.slice(this.currentStartIndex, this.currentEndIndex);
    }
}
