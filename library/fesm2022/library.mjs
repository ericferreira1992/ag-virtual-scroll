import * as i0 from '@angular/core';
import { EventEmitter, Component, HostBinding, ViewChild, Input, Pipe, ContentChildren, Output, NgModule } from '@angular/core';
import * as i1 from '@angular/common';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

class AgVsRenderEvent {
    constructor(obj) {
        Object.assign(this, obj);
    }
}

class AgVsItemComponent {
    get el() { return this.elRef && this.elRef.nativeElement; }
    constructor(elRef, appRef) {
        this.elRef = elRef;
        this.appRef = appRef;
        this.class = true;
        this.sticky = false;
        this.viewOk = false;
        this.onStickyChange = new EventEmitter(false);
        this.isSticked = false;
    }
    ngOnInit() {
    }
    ngAfterViewInit() {
    }
    ngOnChanges(changes) {
        if ('sticky' in changes)
            this.onStickyChange.next(this.sticky);
    }
    forceUpdateInputs() {
        this.viewOk = false;
        this.appRef.tick();
        this.viewOk = true;
    }
    getHtml() {
        return this.el.outerHTML;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: AgVsItemComponent, deps: [{ token: i0.ElementRef }, { token: i0.ApplicationRef }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "16.2.12", type: AgVsItemComponent, selector: "ag-vs-item", inputs: { sticky: "sticky" }, host: { properties: { "class.ag-vs-item": "this.class" } }, viewQueries: [{ propertyName: "temp", first: true, predicate: ["temp"], descendants: true }], usesOnChanges: true, ngImport: i0, template: "<ng-template #temp>\n    <ng-content></ng-content>\n</ng-template>\n\n<ng-container *ngIf=\"!isSticked\" [ngTemplateOutlet]=\"temp\"></ng-container>", styles: [":host{display:block}:host>ng-template{display:inherit;width:inherit;height:inherit}\n"], dependencies: [{ kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i1.NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: AgVsItemComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ag-vs-item', template: "<ng-template #temp>\n    <ng-content></ng-content>\n</ng-template>\n\n<ng-container *ngIf=\"!isSticked\" [ngTemplateOutlet]=\"temp\"></ng-container>", styles: [":host{display:block}:host>ng-template{display:inherit;width:inherit;height:inherit}\n"] }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i0.ApplicationRef }]; }, propDecorators: { class: [{
                type: HostBinding,
                args: ['class.ag-vs-item']
            }], temp: [{
                type: ViewChild,
                args: ['temp', { static: false }]
            }], sticky: [{
                type: Input,
                args: ['sticky']
            }] } });

class StickedClassesPipe {
    constructor() {
        this.exceptionClasses = [
            'ag-virtual-scroll-odd',
            'ag-virtual-scroll-even',
        ];
    }
    transform(classes) {
        if (classes) {
            let splitted = classes.includes(' ') ? classes.split(' ') : [classes];
            return splitted.filter(className => !this.exceptionClasses.some(exc => exc === className)).join(' ');
        }
        return '';
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: StickedClassesPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "16.2.12", ngImport: i0, type: StickedClassesPipe, name: "stickedClasses" }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: StickedClassesPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'stickedClasses'
                }]
        }], ctorParameters: function () { return []; } });

class AgVirtualSrollComponent {
    get indexCurrentSticky() { return this._indexCurrentSticky; }
    set indexCurrentSticky(value) {
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
    get indexPrevSticky() { return this.indexesPrevStick.length ? this.indexesPrevStick[0] : -1; }
    set indexPrevSticky(value) {
        if (value < 0) {
            if (this.indexesPrevStick.length > 0)
                this.indexesPrevStick = this.indexesPrevStick.slice(1);
        }
        else if (!this.indexesPrevStick.some(index => index === value))
            this.indexesPrevStick.push(value);
        if (this.indexesPrevStick.length)
            this.indexesPrevStick = this.indexesPrevStick.sort((a, b) => b - a);
    }
    get itemsNoSticky() { return this.currentStickyItem ? this.items.filter((item) => this.originalItems[this.currentStickyItem.index] !== item) : this.items; }
    get vsItems() { return (this.queryVsItems && this.queryVsItems.toArray()) || []; }
    get numberItemsRendred() { return this.endIndex - this.startIndex; }
    get el() { return this.elRef && this.elRef.nativeElement; }
    get itemsContainerEl() { return this.itemsContainerElRef && this.itemsContainerElRef.nativeElement; }
    constructor(elRef, renderer) {
        this.elRef = elRef;
        this.renderer = renderer;
        this.minRowHeight = 40;
        this.height = 'auto';
        this.originalItems = [];
        this.onItemsRender = new EventEmitter();
        this.prevOriginalItems = [];
        this.items = [];
        this.subscripAllVsItem = [];
        this._indexCurrentSticky = -1;
        this.indexNextSticky = -1;
        this.indexesPrevStick = [];
        this.currentScroll = 0;
        this.contentHeight = 0;
        this.paddingTop = 0;
        this.startIndex = 0;
        this.endIndex = 0;
        this.isTable = false;
        this.scrollIsUp = false;
        this.lastScrollIsUp = false;
        this.previousItemsHeight = [];
        this.containerWidth = 0;
    }
    ngAfterViewInit() {
        this.queryVsItems.changes.subscribe(() => this.checkStickItem(this.scrollIsUp));
    }
    ngOnInit() {
        this.renderer.listen(this.el, 'scroll', this.onScroll.bind(this));
        this.onScroll();
    }
    ngOnChanges(changes) {
        setTimeout(() => {
            if ('height' in changes) {
                this.el.style.maxHeight = this.height;
            }
            if ('minRowHeight' in changes) {
                if (typeof this.minRowHeight === 'string') {
                    if (parseInt(this.minRowHeight))
                        this.minRowHeight = parseInt(this.minRowHeight);
                    else {
                        console.warn('The [min-row-height] @Input is invalid, the value must be of type "number".');
                        this.minRowHeight = 40;
                    }
                }
            }
            if ('originalItems' in changes) {
                if (!this.originalItems)
                    this.originalItems = [];
                if (this.currentAndPrevItemsAreDiff()) {
                    this.previousItemsHeight = new Array(this.originalItems.length).fill(null);
                    if (this.el.scrollTop !== 0)
                        this.el.scrollTop = 0;
                    else {
                        this.currentScroll = 0;
                        this.prepareDataItems();
                        this.checkIsTable();
                        this.queryVsItems.notifyOnChanges();
                    }
                }
                else {
                    if (this.originalItems.length > this.prevOriginalItems.length)
                        this.previousItemsHeight = this.previousItemsHeight.concat(new Array(this.originalItems.length - this.prevOriginalItems.length).fill(null));
                    this.prepareDataItems();
                    this.checkIsTable();
                    this.queryVsItems.notifyOnChanges();
                }
                this.prevOriginalItems = this.originalItems;
            }
        });
    }
    ngAfterContentChecked() {
        let currentContainerWidth = this.itemsContainerEl && this.itemsContainerEl.clientWidth;
        if (currentContainerWidth !== this.containerWidth)
            this.containerWidth = currentContainerWidth;
        this.manipuleRenderedItems();
    }
    currentAndPrevItemsAreDiff() {
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
    onScroll() {
        this.refreshData();
    }
    refreshData() {
        let up = this.el.scrollTop < this.currentScroll;
        this.currentScroll = this.el.scrollTop;
        this.prepareDataItems();
        this.isTable = this.checkIsTable();
        this.lastScrollIsUp = this.scrollIsUp;
        this.scrollIsUp = up;
    }
    prepareDataItems() {
        this.registerCurrentItemsHeight();
        this.prepareDataVirtualScroll();
    }
    registerCurrentItemsHeight() {
        let children = this.getInsideChildrens();
        for (let i = 0; i < children.length; i++) {
            let child = children[i];
            let realIndex = this.startIndex + i;
            this.previousItemsHeight[realIndex] = child.getBoundingClientRect().height;
        }
    }
    getDimensions() {
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
    prepareDataVirtualScroll() {
        let dimensions = this.getDimensions();
        this.contentHeight = dimensions.contentHeight;
        this.paddingTop = dimensions.paddingTop;
        this.startIndex = dimensions.itemsThatAreGone;
        this.endIndex = Math.min((this.startIndex + this.numberItemsCanRender()), (this.originalItems.length - 1));
        if (this.indexCurrentSticky >= 0 && (this.startIndex > this.indexCurrentSticky || this.endIndex < this.indexCurrentSticky)) {
            if (this.currentStickyItem)
                this.currentStickyItem.outside = true;
            this.items = [...this.originalItems.slice(this.startIndex, Math.min(this.endIndex + 1, this.originalItems.length)), this.originalItems[this.indexCurrentSticky]];
        }
        else {
            if (this.currentStickyItem)
                this.currentStickyItem.outside = false;
            this.items = this.originalItems.slice(this.startIndex, Math.min(this.endIndex + 1, this.originalItems.length));
        }
        this.onItemsRender.emit(new AgVsRenderEvent({
            items: this.itemsNoSticky,
            startIndex: this.startIndex,
            endIndex: this.endIndex,
            length: this.itemsNoSticky.length
        }));
        this.manipuleRenderedItems();
    }
    numberItemsCanRender() {
        return Math.floor(this.el.clientHeight / this.minRowHeight) + 2;
    }
    manipuleRenderedItems() {
        let children = this.getInsideChildrens();
        for (let i = 0; i < children.length; i++) {
            let child = children[i];
            if (child.style.display !== 'none') {
                let realIndex = this.startIndex + i;
                child.style.minHeight = `${this.minRowHeight}px`;
                let className = (realIndex + 1) % 2 === 0 ? 'even' : 'odd';
                let unclassName = className == 'even' ? 'odd' : 'even';
                child.classList.add(`ag-virtual-scroll-${className}`);
                child.classList.remove(`ag-virtual-scroll-${unclassName}`);
            }
        }
    }
    getInsideChildrens() {
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
    checkIsTable() {
        let childrens = this.itemsContainerEl.children;
        if (childrens.length > 0) {
            if (childrens[0].tagName.toUpperCase() === 'TABLE') {
                childrens = childrens[0].children;
                if (childrens.length > 0) {
                    if (childrens[0].tagName.toUpperCase() === 'THEAD') {
                        let thead = childrens[0];
                        thead.style.transform = `translateY(${Math.abs(this.paddingTop - this.currentScroll)}px)`;
                    }
                }
                return true;
            }
        }
        return false;
    }
    checkStickItem(up) {
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
    findCurrentStickyByIndex(afterPrev = false) {
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
            let offsetTopNext = (this.indexNextSticky ?? 0) >= 0 ? this.previousItemsHeight.slice(0, this.indexNextSticky ?? 0).reduce((prev, curr) => (prev + (curr ? curr : this.minRowHeight)), 0) : null;
            if (offsetTopNext !== null && offsetBottom >= offsetTopNext) {
                let newDiffTop = offsetBottom - offsetTopNext;
                if (newDiffTop >= currentHeight) {
                    this.currentStickyItem.diffTop = currentHeight;
                    return;
                }
                else
                    this.currentStickyItem.diffTop = newDiffTop;
            }
            else
                this.currentStickyItem.diffTop = 0;
        }
    }
    setPrevAsCurrentSticky() {
        let currentSticked = this.currentStickyItem && this.currentStickyItem.comp.sticky;
        if (currentSticked)
            this.indexNextSticky = this.indexCurrentSticky;
        this.indexCurrentSticky = this.indexPrevSticky;
        this.indexPrevSticky = -1;
    }
    getIndexCurrentSticky(up) {
        let vsIndex = 0;
        for (let vsItem of this.vsItems) {
            let index = vsIndex + this.startIndex;
            let offsetTop = this.previousItemsHeight.slice(0, index).reduce((prev, curr) => (prev + (curr ? curr : this.minRowHeight)), 0);
            if (vsItem && vsItem.sticky &&
                this.el.scrollTop >= offsetTop &&
                (this.indexCurrentSticky === -1 || index !== this.indexCurrentSticky))
                return index;
            vsIndex++;
        }
        ;
        return -1;
    }
    getIndexNextSticky(up) {
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
    currentStickIsEnded(up) {
        let currentHeight = this.currentStickyItem?.height ?? 0;
        if (!up || (this.currentStickyItem?.diffTop ?? 0) > 0) {
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
    updateVsItems() {
        return new Observable((subscriber) => {
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
                    try {
                        vsItem.forceUpdateInputs();
                    }
                    catch {
                        return false;
                    }
                    return true;
                });
                if (ok) {
                    clearInterval(interval);
                    this.manipuleRenderedItems();
                    subscriber.next();
                }
            });
        });
    }
    onStickyComponentChanged(vsItem, index) {
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
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: AgVirtualSrollComponent, deps: [{ token: i0.ElementRef }, { token: i0.Renderer2 }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "16.2.12", type: AgVirtualSrollComponent, selector: "ag-virtual-scroll", inputs: { minRowHeight: ["min-row-height", "minRowHeight"], height: "height", originalItems: ["items", "originalItems"] }, outputs: { onItemsRender: "onItemsRender" }, queries: [{ propertyName: "queryVsItems", predicate: AgVsItemComponent }], viewQueries: [{ propertyName: "itemsContainerElRef", first: true, predicate: ["itemsContainer"], descendants: true, static: true }], usesOnChanges: true, ngImport: i0, template: "<div class=\"content-height\" [style.height.px]=\"contentHeight\"></div>\n<div #itemsContainer class=\"items-container\" [style.transform]=\"'translateY(' + paddingTop + 'px)'\" [ngClass]=\"{ 'sticked-outside': currentStickyItem?.outside }\">\n    <ng-content></ng-content>\n</div>\n<ag-vs-item *ngIf=\"currentStickyItem?.comp && currentStickyItem.comp.isSticked\"\n    [class]=\"currentStickyItem.comp.el.classList.value | stickedClasses\"\n    [style.top.px]=\"currentScroll - (currentStickyItem.diffTop ? currentStickyItem.diffTop : 0)\"\n    [style.height.px]=\"currentStickyItem.height\"\n    [style.minHeight.px]=\"currentStickyItem.height\"\n>\n    <ng-container [ngTemplateOutlet]=\"currentStickyItem.comp.temp\"></ng-container>\n</ag-vs-item>", styles: [":host{display:block;position:relative;width:100%;overflow-y:auto}:host .content-height{width:1px;opacity:0}:host .items-container{position:absolute;top:0;left:0;width:100%}:host::ng-deep .items-container.sticked-outside>.ag-vs-item:last-child{position:absolute;top:0;left:-100%}:host::ng-deep>.ag-vs-item{position:absolute;top:0;left:0;box-shadow:0 5px 5px #0000001a;background:#FFF}\n"], dependencies: [{ kind: "directive", type: i1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i1.NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "component", type: AgVsItemComponent, selector: "ag-vs-item", inputs: ["sticky"] }, { kind: "pipe", type: StickedClassesPipe, name: "stickedClasses" }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: AgVirtualSrollComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ag-virtual-scroll', template: "<div class=\"content-height\" [style.height.px]=\"contentHeight\"></div>\n<div #itemsContainer class=\"items-container\" [style.transform]=\"'translateY(' + paddingTop + 'px)'\" [ngClass]=\"{ 'sticked-outside': currentStickyItem?.outside }\">\n    <ng-content></ng-content>\n</div>\n<ag-vs-item *ngIf=\"currentStickyItem?.comp && currentStickyItem.comp.isSticked\"\n    [class]=\"currentStickyItem.comp.el.classList.value | stickedClasses\"\n    [style.top.px]=\"currentScroll - (currentStickyItem.diffTop ? currentStickyItem.diffTop : 0)\"\n    [style.height.px]=\"currentStickyItem.height\"\n    [style.minHeight.px]=\"currentStickyItem.height\"\n>\n    <ng-container [ngTemplateOutlet]=\"currentStickyItem.comp.temp\"></ng-container>\n</ag-vs-item>", styles: [":host{display:block;position:relative;width:100%;overflow-y:auto}:host .content-height{width:1px;opacity:0}:host .items-container{position:absolute;top:0;left:0;width:100%}:host::ng-deep .items-container.sticked-outside>.ag-vs-item:last-child{position:absolute;top:0;left:-100%}:host::ng-deep>.ag-vs-item{position:absolute;top:0;left:0;box-shadow:0 5px 5px #0000001a;background:#FFF}\n"] }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i0.Renderer2 }]; }, propDecorators: { itemsContainerElRef: [{
                type: ViewChild,
                args: ['itemsContainer', { static: true }]
            }], queryVsItems: [{
                type: ContentChildren,
                args: [AgVsItemComponent]
            }], minRowHeight: [{
                type: Input,
                args: ['min-row-height']
            }], height: [{
                type: Input,
                args: ['height']
            }], originalItems: [{
                type: Input,
                args: ['items']
            }], onItemsRender: [{
                type: Output
            }] } });
class StickyItem {
    constructor(obj) {
        this.offsetTop = 0;
        this.diffTop = 0;
        this.isUp = false;
        this.height = 0;
        this.outside = false;
        if (obj)
            Object.assign(this, obj);
    }
}

class MathAbsPipe {
    constructor() { }
    transform(value) {
        if (value)
            return Math.abs(value);
        return value;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: MathAbsPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "16.2.12", ngImport: i0, type: MathAbsPipe, name: "mathAbs" }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: MathAbsPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'mathAbs'
                }]
        }], ctorParameters: function () { return []; } });

class AgVirtualScrollModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: AgVirtualScrollModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "16.2.12", ngImport: i0, type: AgVirtualScrollModule, declarations: [AgVirtualSrollComponent,
            AgVsItemComponent,
            // Pipes
            MathAbsPipe,
            StickedClassesPipe], imports: [CommonModule], exports: [AgVirtualSrollComponent,
            AgVsItemComponent] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: AgVirtualScrollModule, imports: [CommonModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: AgVirtualScrollModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        CommonModule
                    ],
                    declarations: [
                        AgVirtualSrollComponent,
                        AgVsItemComponent,
                        // Pipes
                        MathAbsPipe,
                        StickedClassesPipe
                    ],
                    exports: [
                        AgVirtualSrollComponent,
                        AgVsItemComponent
                    ],
                }]
        }] });

/**
 * Generated bundle index. Do not edit.
 */

export { AgVirtualScrollModule, AgVirtualSrollComponent, AgVsItemComponent, AgVsRenderEvent, StickyItem };
//# sourceMappingURL=library.mjs.map
