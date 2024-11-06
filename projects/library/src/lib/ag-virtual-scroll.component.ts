import { Component, Input, ElementRef, ViewChild, AfterViewInit, OnChanges, SimpleChanges, Renderer2, OnInit, Output, EventEmitter, QueryList, ContentChildren, AfterContentChecked, OnDestroy } from '@angular/core';
import { AgVsRenderEvent } from './classes/ag-vs-render-event.class';
import { AgVsItemComponent } from './ag-vs-item/ag-vs-item.component';
import { fromEvent, Observable, Subject, Subscription, takeUntil, tap } from 'rxjs';

@Component({
	selector: 'ag-virtual-scroll',
	templateUrl: './ag-virtual-scroll.component.html',
	styles: [`
		:host {
				display: block;
				position: relative;
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
		}

		:host::ng-deep thead {
			position: relative;
			z-index: 9;
		}

		:host::ng-deep .items-container.sticked-outside > .ag-vs-item:last-child {
				position: absolute;
				top: 0;
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
export class AgVirtualSrollComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
	@ViewChild('itemsContainer', { static: true }) private itemsContainerElRef: ElementRef<HTMLElement>;

	@ContentChildren(AgVsItemComponent) private queryVsItems: QueryList<AgVsItemComponent>;

	@Input('min-row-height') public minRowHeight: number = 40;
	@Input('height') public height: string = 'auto';
	@Input('items') public originalItems: any[] = [];

	@Output() private onItemsRender = new EventEmitter<AgVsRenderEvent<any>>();

	public prevOriginalItems: any[] = [];
	public items: any[] = [];
	private subscripAllVsItem: { comp: AgVsItemComponent, subscrip: Subscription }[] = [];

	private isInitialized = false;

	private _indexCurrentSticky: number = -1;
	private get indexCurrentSticky() { return this._indexCurrentSticky; }
	private set indexCurrentSticky(value: number) {
		this._indexCurrentSticky = value;

		let currentIsPrev = value === this.indexPrevSticky;

		if (!currentIsPrev && value >= 0) {
			this.findCurrentStickyByIndex();
		}
		else {
			if (!currentIsPrev)
				this.indexNextSticky = -1;

			if (this.currentStickyItem)
				this.currentStickyItem.comp.isSticked = false;

			this.currentStickyItem = null;
		}

		this.prepareDataItems();
	}

	private get indexPrevSticky() { return this.indexesPrevStick.length ? this.indexesPrevStick[0] : -1; }
	private set indexPrevSticky(value: number) {
		if (value < 0) {
			if (this.indexesPrevStick.length > 0)
				this.indexesPrevStick = this.indexesPrevStick.slice(1);
		}
		else if (!this.indexesPrevStick.some(index => index === value))
			this.indexesPrevStick.push(value);

		if (this.indexesPrevStick.length)
			this.indexesPrevStick = this.indexesPrevStick.sort((a, b) => b - a);
	}

	private indexNextSticky: number = -1;
	private indexesPrevStick: number[] = [];
	public currentStickyItem: StickyItem;
	public currentScroll: number = 0;
	public contentHeight: number = 0;
	public paddingTop: number = 0;
	public startIndex: number = 0;
	public endIndex: number = 0;
	private isTable: boolean = false;
	private scrollIsUp: boolean = false;
	private previousItemsHeight: number[] = [];
	private get itemsNoSticky() { return this.currentStickyItem ? this.items.filter((item) => this.originalItems[this.currentStickyItem.index] !== item) : this.items; }
	public get vsItems() { return (this.queryVsItems && this.queryVsItems.toArray()) || []; }
	public get numberItemsRendered(): number { return this.endIndex - this.startIndex; }
	public get el() { return this.elRef && this.elRef.nativeElement; }
	public get itemsContainerEl() { return this.itemsContainerElRef && this.itemsContainerElRef.nativeElement; }
	private get heightIsInPixels() { return this.height?.endsWith('px') || /^([\s\d]+)$/g.test(this.height); }
	private get heightValue() {
		if (this.heightIsInPixels) {
			const onlyNumber = (() => {
				const matched = this.height?.match(/[-]{0,1}[\d]*[,]?[\d]*[.]{0,1}[\d]+/g);
				return matched?.length > 0 ? matched[0] : '0';
			})();
			return parseFloat(onlyNumber);
		}
		return this.el?.clientHeight ?? 0;
	}

	private destroy$ = new Subject<void>();

	constructor(
		private elRef: ElementRef<HTMLElement>,
		private renderer: Renderer2
	) {
	}

	ngAfterViewInit() {
		this.queryVsItems.changes.pipe(
			takeUntil(this.destroy$),
		).subscribe(() => {
			for(const item of this.vsItems) {
				item.updateIndex();
			}
			if (this.vsItems.some((item) => item.sticky != null)) {
				this.checkStickItem(this.scrollIsUp);
			}
		});
		this.refreshData();
	}

	ngOnInit() {
		fromEvent(this.el, 'scroll').pipe(
			takeUntil(this.destroy$),
			tap(() => this.onScroll()),
		).subscribe();
		this.isInitialized = true;
		this.refreshData();
	}

	ngOnChanges(changes: SimpleChanges) {
		let heightWasChanged = false;
		const rerenderData = () => {
			this.prepareDataItems();
			this.checkIsTable();
			this.queryVsItems.notifyOnChanges();
			this.prevOriginalItems = this.originalItems;
		}

		if ('height' in changes) {
			this.setHeight();
			heightWasChanged = true;
		}

		if ('minRowHeight' in changes) {
			if (typeof this.minRowHeight === 'string') {
				if (parseFloat(this.minRowHeight))
					this.minRowHeight = parseInt(this.minRowHeight);
				else {
					console.warn('The [min-row-height] @Input is invalid, the value must be of type "number".');
					this.minRowHeight = 40;
				}
			}
		}

		if (this.isInitialized && 'originalItems' in changes) {
			if (!this.originalItems)
				this.originalItems = [];

			if (this.currentAndPrevItemsAreDiff()) {
				this.previousItemsHeight = new Array(this.originalItems.length).fill(null);

				if (this.el.scrollTop !== 0)
					this.el.scrollTop = 0;
				else {
					this.currentScroll = 0;
				}
			}
			else {
				if (this.originalItems.length > this.prevOriginalItems.length)
					this.previousItemsHeight = this.previousItemsHeight.concat(new Array(this.originalItems.length - this.prevOriginalItems.length).fill(null));
			}
		}

		if (this.isInitialized) {
			if (heightWasChanged) {
				setTimeout(() => rerenderData());
			}
			else {
				rerenderData();
			}
		}
	}

	private currentAndPrevItemsAreDiff() {
		if (this.originalItems.length >= this.prevOriginalItems.length) {
			let begin = 0;
			let end = this.prevOriginalItems.length - 1;
			for (let i = begin; i <= end; i++) {
				if (this.originalItems[i] !== this.prevOriginalItems[i])
					return true;
			}

			return false;
		}

		return true;
	}

	public onScroll() {
		this.refreshData();
	}

	public refreshData() {
		let up = this.el.scrollTop < this.currentScroll;
		this.currentScroll = this.el.scrollTop;

		this.prepareDataItems();
		this.isTable = this.checkIsTable();
		this.scrollIsUp = up;
	}

	private prepareDataItems() {
		this.registerCurrentItemsHeight();
		this.prepareDataVirtualScroll();
	}

	private setHeight() {
		this.height = this.height ?? '0';
		this.height = this.height + (/^([\s\d]+)$/g.test(this.height) ? 'px' : '');
		this.el.style.height = this.heightIsInPixels ? null : this.height;
		this.el.style.maxHeight = this.height;
	}

	private registerCurrentItemsHeight() {
		let children = this.getInsideChildrens();
		for (let i = 0; i < children.length; i++) {
			let child = children[i];
			let realIndex = this.startIndex + i;
			this.previousItemsHeight[realIndex] = child.getBoundingClientRect().height;
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
		if ((!this.el.style.maxHeight) && this.height) {
			this.setHeight();
		}
		if (!this.el.style.maxHeight) {
			console.warn(`The [height] @Input is invalid or wasn't defined. This @Input must be like this: height="500px".`);
			return;
		}
		if (!this.heightValue) {
			return;
		}
		let dimensions = this.getDimensions();
		
		const qnttyCanRender = this.numberItemsCanRender();
		this.contentHeight = dimensions.contentHeight;
		this.paddingTop = dimensions.paddingTop;
		this.startIndex = dimensions.itemsThatAreGone;
		this.endIndex = Math.min((this.startIndex + qnttyCanRender), this.originalItems.length) - 1;

		if (this.indexCurrentSticky >= 0 && (this.startIndex > this.indexCurrentSticky || this.endIndex < this.indexCurrentSticky)) {
			if (this.currentStickyItem)
				this.currentStickyItem.outside = true;
			this.items = [...this.originalItems.slice(this.startIndex, this.endIndex + 1), this.originalItems[this.indexCurrentSticky]];
		}
		else {
			if (this.currentStickyItem)
				this.currentStickyItem.outside = false;
			this.items = this.originalItems.slice(this.startIndex, this.endIndex + 1);
		}

		this.onItemsRender.emit(new AgVsRenderEvent<any>({
			items: this.itemsNoSticky,
			startIndex: this.startIndex,
			endIndex: this.endIndex,
			length: this.itemsNoSticky.length
		}));
	}

	private numberItemsCanRender() {
		const division = this.heightValue / this.minRowHeight;
		const remaining = division - Math.floor(division);
		return Math.floor(division) + (remaining > 0 ? 1 : 0) + 1;
	}

	private getInsideChildrens(): HTMLCollection {
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
		}

		return childrens;
	}

	private checkIsTable() {
		let childrens = this.itemsContainerEl.children;
		if (childrens.length > 0) {
			if (childrens[0].tagName.toUpperCase() === 'TABLE') {
				childrens = childrens[0].children;
				if (childrens.length > 0) {
					if (childrens[0].tagName.toUpperCase() === 'THEAD') {
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
			this.updateVsItems().pipe(
				takeUntil(this.destroy$),
			).subscribe(() => {
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

	private findCurrentStickyByIndex(afterPrev: boolean = false): void {
		let vsIndex = 0;
		let lastVsIndex = this.vsItems.length - 1;
		let diffMaxItemsRender = this.vsItems.length - this.numberItemsCanRender();

		if (diffMaxItemsRender > 0 && !this.vsItems.some((vsItem, vsIndex) => this.indexCurrentSticky === (this.startIndex + vsIndex))) {
			vsIndex = lastVsIndex;
			let vsItem = this.vsItems[lastVsIndex];
			let index = this.indexCurrentSticky;
			let offsetTop = this.previousItemsHeight.slice(0, index).reduce((prev, curr) => (prev + (curr ? curr : this.minRowHeight)), 0);
			vsItem.isSticked = true;
			this.currentStickyItem = new StickyItem({
				comp: vsItem,
				index: index,
				vsIndex: vsIndex,
				offsetTop: offsetTop,
				height: vsItem.el.offsetHeight,
				outside: true
			});
		}
		else {
			for (let vsItem of this.vsItems) {
				let index = this.startIndex + vsIndex;

				if (this.indexCurrentSticky === index) {
					let offsetTop = this.previousItemsHeight.slice(0, index).reduce((prev, curr) => (prev + (curr ? curr : this.minRowHeight)), 0);
					vsItem.isSticked = true;
					this.currentStickyItem = new StickyItem({
						comp: vsItem,
						index: index,
						vsIndex: vsIndex,
						offsetTop: offsetTop,
						height: vsItem.el.offsetHeight
					});
					break;
				}

				vsIndex++;
			}
		}

		if (afterPrev && this.currentStickyItem) {
			let currentHeight = this.currentStickyItem.height;
			let offsetBottom = this.paddingTop + currentHeight + Math.abs(this.el.scrollTop - this.paddingTop);
			let offsetTopNext = this.indexNextSticky >= 0 ? this.previousItemsHeight.slice(0, this.indexNextSticky).reduce((prev, curr) => (prev + (curr ? curr : this.minRowHeight)), 0) : null;

			if (offsetTopNext !== null && offsetBottom >= offsetTopNext) {
				let newDiffTop = offsetBottom - offsetTopNext;
				if (newDiffTop >= currentHeight) {
					this.currentStickyItem.diffTop = currentHeight;
				}
				else
					this.currentStickyItem.diffTop = newDiffTop;
			}
			else
				this.currentStickyItem.diffTop = 0;
		}
	}

	private setPrevAsCurrentSticky() {
		let currentSticked = this.currentStickyItem && this.currentStickyItem.comp.sticky;

		if (currentSticked)
			this.indexNextSticky = this.indexCurrentSticky;

		this.indexCurrentSticky = this.indexPrevSticky;
		this.indexPrevSticky = -1;
	}

	private getIndexCurrentSticky(up: boolean) {
		let vsIndex = 0;
		for (let vsItem of this.vsItems) {
			let index = vsIndex + this.startIndex;

			let offsetTop = this.previousItemsHeight.slice(0, index).reduce((prev, curr) => (prev + (curr ? curr : this.minRowHeight)), 0);

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
			let vsIndex = 0;

			for (let vsItem of this.vsItems.slice(0, this.numberItemsCanRender())) {
				let index = vsIndex + this.startIndex;

				if (vsItem.sticky && index > this.indexCurrentSticky)
					return index;

				vsIndex++;
			}
		}

		return -1;
	}

	private currentStickIsEnded(up: boolean) {
		let currentHeight = this.currentStickyItem.height;

		if (!up || this.currentStickyItem.diffTop > 0) {
			let offsetBottom = this.paddingTop + currentHeight + Math.abs(this.el.scrollTop - this.paddingTop);
			let offsetTopNext = this.indexNextSticky >= 0 ? this.previousItemsHeight.slice(0, this.indexNextSticky).reduce((prev, curr) => (prev + (curr ? curr : this.minRowHeight)), 0) : null;

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
				let diffMaxItemsRender = this.vsItems.length - this.numberItemsCanRender();
				let lastIndex = this.vsItems.length - 1;
				let ok = this.vsItems.every((vsItem, vsIndex) => {
					let index = this.startIndex + vsIndex;

					if (diffMaxItemsRender > 0 && vsIndex === lastIndex)
						index = this.indexCurrentSticky;

					if (!this.currentStickyItem || vsItem !== this.currentStickyItem.comp)
						vsItem.isSticked = false;

					if (!this.subscripAllVsItem.some(item => item.comp === vsItem))
						this.subscripAllVsItem.push({
							comp: vsItem,
							subscrip: vsItem.onStickyChange.subscribe((sticky) => {
								this.onStickyComponentChanged(vsItem, index);
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

	private onStickyComponentChanged(vsItem: AgVsItemComponent, index: number) {
		if (index === this.indexCurrentSticky) {
			if (!vsItem.sticky) {
				if (this.indexPrevSticky >= 0) {
					this.setPrevAsCurrentSticky();
				}
				else {
					this.indexCurrentSticky = this.getIndexCurrentSticky(false);

					if (this.indexCurrentSticky >= 0)
						this.indexNextSticky = this.getIndexNextSticky(false);
					else
						this.indexNextSticky = null;
				}
			}
		}
		else if ((this.indexCurrentSticky !== -1 && index < this.indexCurrentSticky) || index === this.indexPrevSticky) {
			if (vsItem.sticky)
				this.indexPrevSticky = index;
			else
				this.indexesPrevStick = this.indexesPrevStick.filter(indexPrev => indexPrev !== index);
		}
		else if ((this.indexCurrentSticky !== -1 && index > this.indexCurrentSticky) || index === this.indexNextSticky) {
			if (vsItem.sticky && (this.indexNextSticky === -1 || index < this.indexNextSticky))
				this.indexNextSticky = index;
			else if (!vsItem.sticky)
				this.indexNextSticky = -1;
		}
		else
			return;

		this.queryVsItems.notifyOnChanges();
	}

	ngOnDestroy() {
		this.destroy$?.next();
		this.destroy$?.complete();
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
	outside: boolean = false;

	constructor(obj?: Partial<StickyItem>) {
		if (obj) Object.assign(this, obj);
	}
}
