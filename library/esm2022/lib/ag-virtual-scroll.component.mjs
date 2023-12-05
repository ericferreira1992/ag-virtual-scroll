import { Component, Input, ViewChild, Output, EventEmitter, ContentChildren } from '@angular/core';
import { AgVsRenderEvent } from './classes/ag-vs-render-event.class';
import { AgVsItemComponent } from './ag-vs-item/ag-vs-item.component';
import { Observable } from 'rxjs';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "./ag-vs-item/ag-vs-item.component";
import * as i3 from "./pipes/sticked-classes.pipe";
export class AgVirtualSrollComponent {
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
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "16.2.12", type: AgVirtualSrollComponent, selector: "ag-virtual-scroll", inputs: { minRowHeight: ["min-row-height", "minRowHeight"], height: "height", originalItems: ["items", "originalItems"] }, outputs: { onItemsRender: "onItemsRender" }, queries: [{ propertyName: "queryVsItems", predicate: AgVsItemComponent }], viewQueries: [{ propertyName: "itemsContainerElRef", first: true, predicate: ["itemsContainer"], descendants: true, static: true }], usesOnChanges: true, ngImport: i0, template: "<div class=\"content-height\" [style.height.px]=\"contentHeight\"></div>\n<div #itemsContainer class=\"items-container\" [style.transform]=\"'translateY(' + paddingTop + 'px)'\" [ngClass]=\"{ 'sticked-outside': currentStickyItem?.outside }\">\n    <ng-content></ng-content>\n</div>\n<ag-vs-item *ngIf=\"currentStickyItem?.comp && currentStickyItem.comp.isSticked\"\n    [class]=\"currentStickyItem.comp.el.classList.value | stickedClasses\"\n    [style.top.px]=\"currentScroll - (currentStickyItem.diffTop ? currentStickyItem.diffTop : 0)\"\n    [style.height.px]=\"currentStickyItem.height\"\n    [style.minHeight.px]=\"currentStickyItem.height\"\n>\n    <ng-container [ngTemplateOutlet]=\"currentStickyItem.comp.temp\"></ng-container>\n</ag-vs-item>", styles: [":host{display:block;position:relative;width:100%;overflow-y:auto}:host .content-height{width:1px;opacity:0}:host .items-container{position:absolute;top:0;left:0;width:100%}:host::ng-deep .items-container.sticked-outside>.ag-vs-item:last-child{position:absolute;top:0;left:-100%}:host::ng-deep>.ag-vs-item{position:absolute;top:0;left:0;box-shadow:0 5px 5px #0000001a;background:#FFF}\n"], dependencies: [{ kind: "directive", type: i1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i1.NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "component", type: i2.AgVsItemComponent, selector: "ag-vs-item", inputs: ["sticky"] }, { kind: "pipe", type: i3.StickedClassesPipe, name: "stickedClasses" }] }); }
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
export class StickyItem {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctdmlydHVhbC1zY3JvbGwuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvbGlicmFyeS9zcmMvbGliL2FnLXZpcnR1YWwtc2Nyb2xsLmNvbXBvbmVudC50cyIsIi4uLy4uLy4uLy4uL3Byb2plY3RzL2xpYnJhcnkvc3JjL2xpYi9hZy12aXJ0dWFsLXNjcm9sbC5jb21wb25lbnQuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBYyxTQUFTLEVBQThELE1BQU0sRUFBRSxZQUFZLEVBQWEsZUFBZSxFQUFrQyxNQUFNLGVBQWUsQ0FBQztBQUN0TixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDckUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDdEUsT0FBTyxFQUFFLFVBQVUsRUFBZ0IsTUFBTSxNQUFNLENBQUM7Ozs7O0FBd0NoRCxNQUFNLE9BQU8sdUJBQXVCO0lBaUJoQyxJQUFZLGtCQUFrQixLQUFLLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztJQUNyRSxJQUFZLGtCQUFrQixDQUFDLEtBQWE7UUFDeEMsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEtBQUssQ0FBQztRQUVqQyxJQUFJLGFBQWEsR0FBRyxLQUFLLEtBQUssSUFBSSxDQUFDLGVBQWUsQ0FBQztRQUVuRCxJQUFJLENBQUMsYUFBYSxJQUFJLEtBQUssSUFBSSxDQUFDLEVBQUU7WUFDOUIsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7U0FDbkM7YUFDSTtZQUNELElBQUksQ0FBQyxhQUFhO2dCQUNkLElBQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFFOUIsSUFBSSxJQUFJLENBQUMsaUJBQWlCO2dCQUN0QixJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FB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QWdCLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDO2dCQUVDLFlBQVk7c0JBQXZELGVBQWU7dUJBQUMsaUJBQWlCO2dCQUVGLFlBQVk7c0JBQTNDLEtBQUs7dUJBQUMsZ0JBQWdCO2dCQUNDLE1BQU07c0JBQTdCLEtBQUs7dUJBQUMsUUFBUTtnQkFDUSxhQUFhO3NCQUFuQyxLQUFLO3VCQUFDLE9BQU87Z0JBRUksYUFBYTtzQkFBOUIsTUFBTTs7QUEyakJYLE1BQU0sT0FBTyxVQUFVO0lBVW5CLFlBQVksR0FBeUI7UUFQckMsY0FBUyxHQUFXLENBQUMsQ0FBQztRQUV0QixZQUFPLEdBQVcsQ0FBQyxDQUFDO1FBQ3BCLFNBQUksR0FBWSxLQUFLLENBQUE7UUFDckIsV0FBTSxHQUFXLENBQUMsQ0FBQztRQUNuQixZQUFPLEdBQVksS0FBSyxDQUFDO1FBR3JCLElBQUksR0FBRztZQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7Q0FDSiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5wdXQsIEVsZW1lbnRSZWYsIFZpZXdDaGlsZCwgQWZ0ZXJWaWV3SW5pdCwgT25DaGFuZ2VzLCBTaW1wbGVDaGFuZ2VzLCBSZW5kZXJlcjIsIE9uSW5pdCwgT3V0cHV0LCBFdmVudEVtaXR0ZXIsIFF1ZXJ5TGlzdCwgQ29udGVudENoaWxkcmVuLCBBZnRlckNvbnRlbnRDaGVja2VkLCBPbkRlc3Ryb3kgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEFnVnNSZW5kZXJFdmVudCB9IGZyb20gJy4vY2xhc3Nlcy9hZy12cy1yZW5kZXItZXZlbnQuY2xhc3MnO1xuaW1wb3J0IHsgQWdWc0l0ZW1Db21wb25lbnQgfSBmcm9tICcuL2FnLXZzLWl0ZW0vYWctdnMtaXRlbS5jb21wb25lbnQnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgU3Vic2NyaXB0aW9uIH0gZnJvbSAncnhqcyc7XG5cbkBDb21wb25lbnQoe1xuXHRzZWxlY3RvcjogJ2FnLXZpcnR1YWwtc2Nyb2xsJyxcblx0dGVtcGxhdGVVcmw6ICcuL2FnLXZpcnR1YWwtc2Nyb2xsLmNvbXBvbmVudC5odG1sJyxcbiAgICBzdHlsZXM6IFtgXG4gICAgICAgIDpob3N0IHtcbiAgICAgICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICAgICAgICBvdmVyZmxvdy15OiBhdXRvO1xuICAgICAgICB9XG5cbiAgICAgICAgOmhvc3QgLmNvbnRlbnQtaGVpZ2h0IHtcbiAgICAgICAgICAgIHdpZHRoOiAxcHg7XG4gICAgICAgICAgICBvcGFjaXR5OiAwO1xuICAgICAgICB9XG5cbiAgICAgICAgOmhvc3QgLml0ZW1zLWNvbnRhaW5lciB7XG4gICAgICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgICAgICB0b3A6IDA7XG4gICAgICAgICAgICBsZWZ0OiAwO1xuICAgICAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICAgIH1cblxuICAgICAgICA6aG9zdDo6bmctZGVlcCAuaXRlbXMtY29udGFpbmVyLnN0aWNrZWQtb3V0c2lkZSA+IC5hZy12cy1pdGVtOmxhc3QtY2hpbGQge1xuICAgICAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICAgICAgdG9wOiAwO1xuICAgICAgICAgICAgbGVmdDogLTEwMCU7XG4gICAgICAgIH1cblxuICAgICAgICA6aG9zdDo6bmctZGVlcCA+IC5hZy12cy1pdGVtIHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgICAgIHRvcDogMDtcbiAgICAgICAgICAgIGxlZnQ6IDA7XG4gICAgICAgICAgICBib3gtc2hhZG93OiAwIDVweCA1cHggcmdiYSgwLCAwLCAwLCAuMSk7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiAjRkZGO1xuICAgICAgICB9YFxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgQWdWaXJ0dWFsU3JvbGxDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIEFmdGVyVmlld0luaXQsIE9uQ2hhbmdlcywgT25EZXN0cm95LCBBZnRlckNvbnRlbnRDaGVja2VkIHtcbiAgICBAVmlld0NoaWxkKCdpdGVtc0NvbnRhaW5lcicsIHtzdGF0aWM6IHRydWV9KSBwcml2YXRlIGl0ZW1zQ29udGFpbmVyRWxSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+O1xuXG4gICAgQENvbnRlbnRDaGlsZHJlbihBZ1ZzSXRlbUNvbXBvbmVudCkgcHJpdmF0ZSBxdWVyeVZzSXRlbXM6IFF1ZXJ5TGlzdDxBZ1ZzSXRlbUNvbXBvbmVudD47XG5cbiAgICBASW5wdXQoJ21pbi1yb3ctaGVpZ2h0JykgcHVibGljIG1pblJvd0hlaWdodDogbnVtYmVyID0gNDA7XG4gICAgQElucHV0KCdoZWlnaHQnKSBwdWJsaWMgaGVpZ2h0OiBzdHJpbmcgPSAnYXV0byc7XG4gICAgQElucHV0KCdpdGVtcycpIHB1YmxpYyBvcmlnaW5hbEl0ZW1zOiBhbnlbXSA9IFtdO1xuXG4gICAgQE91dHB1dCgpIHByaXZhdGUgb25JdGVtc1JlbmRlciA9IG5ldyBFdmVudEVtaXR0ZXI8QWdWc1JlbmRlckV2ZW50PGFueT4+KCk7XG5cbiAgICBwdWJsaWMgcHJldk9yaWdpbmFsSXRlbXM6IGFueVtdID0gW107XG4gICAgcHVibGljIGl0ZW1zOiBhbnlbXSA9IFtdO1xuXG4gICAgcHJpdmF0ZSBzdWJzY3JpcEFsbFZzSXRlbTogeyBjb21wOiBBZ1ZzSXRlbUNvbXBvbmVudCwgc3Vic2NyaXA6IFN1YnNjcmlwdGlvbiB9W10gPSBbXTtcblxuICAgIHByaXZhdGUgX2luZGV4Q3VycmVudFN0aWNreTogbnVtYmVyID0gLTE7XG4gICAgcHJpdmF0ZSBnZXQgaW5kZXhDdXJyZW50U3RpY2t5KCkgeyByZXR1cm4gdGhpcy5faW5kZXhDdXJyZW50U3RpY2t5OyB9XG4gICAgcHJpdmF0ZSBzZXQgaW5kZXhDdXJyZW50U3RpY2t5KHZhbHVlOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5faW5kZXhDdXJyZW50U3RpY2t5ID0gdmFsdWU7XG5cbiAgICAgICAgbGV0IGN1cnJlbnRJc1ByZXYgPSB2YWx1ZSA9PT0gdGhpcy5pbmRleFByZXZTdGlja3k7XG5cbiAgICAgICAgaWYgKCFjdXJyZW50SXNQcmV2ICYmIHZhbHVlID49IDApIHtcbiAgICAgICAgICAgIHRoaXMuZmluZEN1cnJlbnRTdGlja3lCeUluZGV4KCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoIWN1cnJlbnRJc1ByZXYpXG4gICAgICAgICAgICAgICAgdGhpcy5pbmRleE5leHRTdGlja3kgPSAtMTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudFN0aWNreUl0ZW0pXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U3RpY2t5SXRlbS5jb21wLmlzU3RpY2tlZCA9IGZhbHNlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTdGlja3lJdGVtID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucHJlcGFyZURhdGFJdGVtcygpO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIGdldCBpbmRleFByZXZTdGlja3koKSB7IHJldHVybiB0aGlzLmluZGV4ZXNQcmV2U3RpY2subGVuZ3RoID8gdGhpcy5pbmRleGVzUHJldlN0aWNrWzBdIDogLTE7IH1cbiAgICBwcml2YXRlIHNldCBpbmRleFByZXZTdGlja3kodmFsdWU6IG51bWJlcikge1xuICAgICAgICBpZiAodmFsdWUgPCAwKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5pbmRleGVzUHJldlN0aWNrLmxlbmd0aCA+IDApXG4gICAgICAgICAgICAgICAgdGhpcy5pbmRleGVzUHJldlN0aWNrID0gdGhpcy5pbmRleGVzUHJldlN0aWNrLnNsaWNlKDEpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCF0aGlzLmluZGV4ZXNQcmV2U3RpY2suc29tZShpbmRleCA9PiBpbmRleCA9PT0gdmFsdWUpKVxuICAgICAgICAgICAgdGhpcy5pbmRleGVzUHJldlN0aWNrLnB1c2godmFsdWUpO1xuXG4gICAgICAgIGlmICh0aGlzLmluZGV4ZXNQcmV2U3RpY2subGVuZ3RoKVxuICAgICAgICAgICAgdGhpcy5pbmRleGVzUHJldlN0aWNrID0gdGhpcy5pbmRleGVzUHJldlN0aWNrLnNvcnQoKGEsYikgPT4gYi1hKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGluZGV4TmV4dFN0aWNreTogbnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZCA9IC0xO1xuXG4gICAgcHJpdmF0ZSBpbmRleGVzUHJldlN0aWNrOiBudW1iZXJbXSA9IFtdO1xuXG4gICAgcHVibGljIGN1cnJlbnRTdGlja3lJdGVtOiBTdGlja3lJdGVtIHwgbnVsbCB8IHVuZGVmaW5lZDtcblxuICAgIHB1YmxpYyBjdXJyZW50U2Nyb2xsOiBudW1iZXIgPSAwO1xuICAgIHB1YmxpYyBjb250ZW50SGVpZ2h0OiBudW1iZXIgPSAwO1xuICAgIHB1YmxpYyBwYWRkaW5nVG9wOiBudW1iZXIgPSAwO1xuXG4gICAgcHVibGljIHN0YXJ0SW5kZXg6IG51bWJlciA9IDA7XG4gICAgcHVibGljIGVuZEluZGV4OiBudW1iZXIgPSAwO1xuXG4gICAgcHJpdmF0ZSBpc1RhYmxlOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBwcml2YXRlIHNjcm9sbElzVXA6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICBwcml2YXRlIGxhc3RTY3JvbGxJc1VwOiBib29sZWFuID0gZmFsc2U7XG4gICAgXG4gICAgcHJpdmF0ZSBwcmV2aW91c0l0ZW1zSGVpZ2h0OiBudW1iZXJbXSA9IFtdO1xuXG4gICAgcHVibGljIGNvbnRhaW5lcldpZHRoOiBudW1iZXIgPSAwO1xuXG4gICAgcHJpdmF0ZSBnZXQgaXRlbXNOb1N0aWNreSgpIHsgcmV0dXJuIHRoaXMuY3VycmVudFN0aWNreUl0ZW0gPyB0aGlzLml0ZW1zLmZpbHRlcigoaXRlbSkgPT4gdGhpcy5vcmlnaW5hbEl0ZW1zW3RoaXMuY3VycmVudFN0aWNreUl0ZW0hLmluZGV4XSAhPT0gaXRlbSkgOiB0aGlzLml0ZW1zOyB9XG5cbiAgICBwdWJsaWMgZ2V0IHZzSXRlbXMoKSB7IHJldHVybiAodGhpcy5xdWVyeVZzSXRlbXMgJiYgdGhpcy5xdWVyeVZzSXRlbXMudG9BcnJheSgpKSB8fCBbXTsgfVxuXG4gICAgcHVibGljIGdldCBudW1iZXJJdGVtc1JlbmRyZWQoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZW5kSW5kZXggLSB0aGlzLnN0YXJ0SW5kZXg7IH1cbiAgICBcbiAgICBwdWJsaWMgZ2V0IGVsKCkgeyByZXR1cm4gdGhpcy5lbFJlZiAmJiB0aGlzLmVsUmVmLm5hdGl2ZUVsZW1lbnQ7IH1cblxuICAgIHB1YmxpYyBnZXQgaXRlbXNDb250YWluZXJFbCgpIHsgcmV0dXJuIHRoaXMuaXRlbXNDb250YWluZXJFbFJlZiAmJiB0aGlzLml0ZW1zQ29udGFpbmVyRWxSZWYubmF0aXZlRWxlbWVudDsgfVxuICAgIFxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIGVsUmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICAgICAgcHJpdmF0ZSByZW5kZXJlcjogUmVuZGVyZXIyXG5cdCkge1xuXHR9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgICAgIHRoaXMucXVlcnlWc0l0ZW1zLmNoYW5nZXMuc3Vic2NyaWJlKCgpID0+IHRoaXMuY2hlY2tTdGlja0l0ZW0odGhpcy5zY3JvbGxJc1VwKSk7XG5cdH1cblxuICAgIG5nT25Jbml0KCkge1xuICAgICAgICB0aGlzLnJlbmRlcmVyLmxpc3Rlbih0aGlzLmVsLCAnc2Nyb2xsJywgdGhpcy5vblNjcm9sbC5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5vblNjcm9sbCgpO1xuXHR9XG5cdFxuXHRuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG5cdFx0c2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAoJ2hlaWdodCcgaW4gY2hhbmdlcykge1xuICAgICAgICAgICAgICAgIHRoaXMuZWwuc3R5bGUubWF4SGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICgnbWluUm93SGVpZ2h0JyBpbiBjaGFuZ2VzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm1pblJvd0hlaWdodCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnNlSW50KHRoaXMubWluUm93SGVpZ2h0KSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWluUm93SGVpZ2h0ID0gcGFyc2VJbnQodGhpcy5taW5Sb3dIZWlnaHQpO1xuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignVGhlIFttaW4tcm93LWhlaWdodF0gQElucHV0IGlzIGludmFsaWQsIHRoZSB2YWx1ZSBtdXN0IGJlIG9mIHR5cGUgXCJudW1iZXJcIi4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5taW5Sb3dIZWlnaHQgPSA0MDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuXHRcdFx0aWYgKCdvcmlnaW5hbEl0ZW1zJyBpbiBjaGFuZ2VzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLm9yaWdpbmFsSXRlbXMpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3JpZ2luYWxJdGVtcyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudEFuZFByZXZJdGVtc0FyZURpZmYoKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByZXZpb3VzSXRlbXNIZWlnaHQgPSBuZXcgQXJyYXkodGhpcy5vcmlnaW5hbEl0ZW1zLmxlbmd0aCkuZmlsbChudWxsKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZWwuc2Nyb2xsVG9wICE9PSAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbC5zY3JvbGxUb3AgPSAwO1xuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNjcm9sbCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByZXBhcmVEYXRhSXRlbXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2hlY2tJc1RhYmxlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnF1ZXJ5VnNJdGVtcy5ub3RpZnlPbkNoYW5nZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMub3JpZ2luYWxJdGVtcy5sZW5ndGggPiB0aGlzLnByZXZPcmlnaW5hbEl0ZW1zLmxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJldmlvdXNJdGVtc0hlaWdodCA9IHRoaXMucHJldmlvdXNJdGVtc0hlaWdodC5jb25jYXQobmV3IEFycmF5KHRoaXMub3JpZ2luYWxJdGVtcy5sZW5ndGggLSB0aGlzLnByZXZPcmlnaW5hbEl0ZW1zLmxlbmd0aCkuZmlsbChudWxsKSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJlcGFyZURhdGFJdGVtcygpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoZWNrSXNUYWJsZSgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnF1ZXJ5VnNJdGVtcy5ub3RpZnlPbkNoYW5nZXMoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLnByZXZPcmlnaW5hbEl0ZW1zID0gdGhpcy5vcmlnaW5hbEl0ZW1zO1xuXHRcdFx0fVxuXHRcdH0pO1xuICAgIH1cblxuICAgIG5nQWZ0ZXJDb250ZW50Q2hlY2tlZCgpIHtcbiAgICAgICAgbGV0IGN1cnJlbnRDb250YWluZXJXaWR0aCA9IHRoaXMuaXRlbXNDb250YWluZXJFbCAmJiB0aGlzLml0ZW1zQ29udGFpbmVyRWwuY2xpZW50V2lkdGg7XG4gICAgICAgIGlmIChjdXJyZW50Q29udGFpbmVyV2lkdGggIT09IHRoaXMuY29udGFpbmVyV2lkdGgpXG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lcldpZHRoID0gY3VycmVudENvbnRhaW5lcldpZHRoO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5tYW5pcHVsZVJlbmRlcmVkSXRlbXMoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGN1cnJlbnRBbmRQcmV2SXRlbXNBcmVEaWZmKCkge1xuICAgICAgICBpZiAodGhpcy5vcmlnaW5hbEl0ZW1zLmxlbmd0aCA+PSB0aGlzLnByZXZPcmlnaW5hbEl0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgbGV0IGJlZ2luID0gMDtcbiAgICAgICAgICAgIGxldCBlbmQgPSB0aGlzLnByZXZPcmlnaW5hbEl0ZW1zLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gYmVnaW47IGkgPD0gZW5kOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcmlnaW5hbEl0ZW1zW2ldICE9PSB0aGlzLnByZXZPcmlnaW5hbEl0ZW1zW2ldKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG5cdHB1YmxpYyBvblNjcm9sbCgpIHtcbiAgICAgICAgdGhpcy5yZWZyZXNoRGF0YSgpO1xuICAgIH1cblxuXHRwdWJsaWMgcmVmcmVzaERhdGEoKSB7XG4gICAgICAgIGxldCB1cCA9IHRoaXMuZWwuc2Nyb2xsVG9wIDwgdGhpcy5jdXJyZW50U2Nyb2xsO1xuICAgICAgICB0aGlzLmN1cnJlbnRTY3JvbGwgPSB0aGlzLmVsLnNjcm9sbFRvcDtcblxuICAgICAgICB0aGlzLnByZXBhcmVEYXRhSXRlbXMoKTtcbiAgICAgICAgdGhpcy5pc1RhYmxlID0gdGhpcy5jaGVja0lzVGFibGUoKTtcbiAgICAgICAgdGhpcy5sYXN0U2Nyb2xsSXNVcCA9IHRoaXMuc2Nyb2xsSXNVcDtcbiAgICAgICAgdGhpcy5zY3JvbGxJc1VwID0gdXA7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwcmVwYXJlRGF0YUl0ZW1zKCkge1xuICAgICAgICB0aGlzLnJlZ2lzdGVyQ3VycmVudEl0ZW1zSGVpZ2h0KCk7XG4gICAgICAgIHRoaXMucHJlcGFyZURhdGFWaXJ0dWFsU2Nyb2xsKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZWdpc3RlckN1cnJlbnRJdGVtc0hlaWdodCgpIHtcbiAgICAgICAgbGV0IGNoaWxkcmVuID0gdGhpcy5nZXRJbnNpZGVDaGlsZHJlbnMoKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGV0IGNoaWxkID0gY2hpbGRyZW5baV07XG4gICAgICAgICAgICBsZXQgcmVhbEluZGV4ID0gdGhpcy5zdGFydEluZGV4ICsgaTtcbiAgICAgICAgICAgIHRoaXMucHJldmlvdXNJdGVtc0hlaWdodFtyZWFsSW5kZXhdID0gY2hpbGQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXREaW1lbnNpb25zKCkge1xuICAgICAgICBcbiAgICAgICAgbGV0IGRpbWVuc2lvbnMgPSB7XG4gICAgICAgICAgICBjb250ZW50SGVpZ2h0OiAwLFxuICAgICAgICAgICAgcGFkZGluZ1RvcDogMCxcbiAgICAgICAgICAgIGl0ZW1zVGhhdEFyZUdvbmU6IDBcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIGRpbWVuc2lvbnMuY29udGVudEhlaWdodCA9IHRoaXMub3JpZ2luYWxJdGVtcy5yZWR1Y2UoKHByZXYsIGN1cnIsIGkpID0+IHtcblx0XHRcdGxldCBoZWlnaHQgPSB0aGlzLnByZXZpb3VzSXRlbXNIZWlnaHRbaV07XG5cdFx0XHRyZXR1cm4gcHJldiArIChoZWlnaHQgPyBoZWlnaHQgOiB0aGlzLm1pblJvd0hlaWdodCk7XG4gICAgICAgIH0sIDApO1xuXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRTY3JvbGwgPj0gdGhpcy5taW5Sb3dIZWlnaHQpIHtcbiAgICAgICAgICAgIGxldCBuZXdQYWRkaW5nVG9wID0gMDtcbiAgICAgICAgICAgIGxldCBpdGVtc1RoYXRBcmVHb25lID0gMDtcbiAgICAgICAgICAgIGxldCBpbml0aWFsU2Nyb2xsID0gdGhpcy5jdXJyZW50U2Nyb2xsO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IgKGxldCBoIG9mIHRoaXMucHJldmlvdXNJdGVtc0hlaWdodCkge1xuICAgICAgICAgICAgICAgIGxldCBoZWlnaHQgPSBoID8gaCA6IHRoaXMubWluUm93SGVpZ2h0O1xuICAgICAgICAgICAgICAgIGlmIChpbml0aWFsU2Nyb2xsID49IGhlaWdodCkge1xuICAgICAgICAgICAgICAgICAgICBuZXdQYWRkaW5nVG9wICs9IGhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgaW5pdGlhbFNjcm9sbCAtPSBoZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zVGhhdEFyZUdvbmUrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZGltZW5zaW9ucy5wYWRkaW5nVG9wID0gbmV3UGFkZGluZ1RvcDtcbiAgICAgICAgICAgIGRpbWVuc2lvbnMuaXRlbXNUaGF0QXJlR29uZSA9IGl0ZW1zVGhhdEFyZUdvbmU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZGltZW5zaW9ucztcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBwcmVwYXJlRGF0YVZpcnR1YWxTY3JvbGwoKSB7XG4gICAgICAgIGxldCBkaW1lbnNpb25zID0gdGhpcy5nZXREaW1lbnNpb25zKCk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmNvbnRlbnRIZWlnaHQgPSBkaW1lbnNpb25zLmNvbnRlbnRIZWlnaHQ7XG4gICAgICAgIHRoaXMucGFkZGluZ1RvcCA9IGRpbWVuc2lvbnMucGFkZGluZ1RvcDtcbiAgICAgICAgdGhpcy5zdGFydEluZGV4ID0gZGltZW5zaW9ucy5pdGVtc1RoYXRBcmVHb25lO1xuICAgICAgICB0aGlzLmVuZEluZGV4ID0gTWF0aC5taW4oKHRoaXMuc3RhcnRJbmRleCArIHRoaXMubnVtYmVySXRlbXNDYW5SZW5kZXIoKSksICh0aGlzLm9yaWdpbmFsSXRlbXMubGVuZ3RoIC0gMSkpO1xuXG4gICAgICAgIGlmICh0aGlzLmluZGV4Q3VycmVudFN0aWNreSA+PSAwICYmICh0aGlzLnN0YXJ0SW5kZXggPiB0aGlzLmluZGV4Q3VycmVudFN0aWNreSB8fCB0aGlzLmVuZEluZGV4IDwgdGhpcy5pbmRleEN1cnJlbnRTdGlja3kpKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50U3RpY2t5SXRlbSlcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTdGlja3lJdGVtLm91dHNpZGUgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5pdGVtcyA9IFsgLi4udGhpcy5vcmlnaW5hbEl0ZW1zLnNsaWNlKHRoaXMuc3RhcnRJbmRleCwgTWF0aC5taW4odGhpcy5lbmRJbmRleCArIDEsIHRoaXMub3JpZ2luYWxJdGVtcy5sZW5ndGgpKSwgdGhpcy5vcmlnaW5hbEl0ZW1zW3RoaXMuaW5kZXhDdXJyZW50U3RpY2t5XSBdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudFN0aWNreUl0ZW0pXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U3RpY2t5SXRlbS5vdXRzaWRlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLml0ZW1zID0gdGhpcy5vcmlnaW5hbEl0ZW1zLnNsaWNlKHRoaXMuc3RhcnRJbmRleCwgTWF0aC5taW4odGhpcy5lbmRJbmRleCArIDEsIHRoaXMub3JpZ2luYWxJdGVtcy5sZW5ndGgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMub25JdGVtc1JlbmRlci5lbWl0KG5ldyBBZ1ZzUmVuZGVyRXZlbnQ8YW55Pih7XG4gICAgICAgICAgICBpdGVtczogdGhpcy5pdGVtc05vU3RpY2t5LFxuICAgICAgICAgICAgc3RhcnRJbmRleDogdGhpcy5zdGFydEluZGV4LFxuICAgICAgICAgICAgZW5kSW5kZXg6IHRoaXMuZW5kSW5kZXgsXG4gICAgICAgICAgICBsZW5ndGg6IHRoaXMuaXRlbXNOb1N0aWNreS5sZW5ndGhcbiAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICB0aGlzLm1hbmlwdWxlUmVuZGVyZWRJdGVtcygpO1xuICAgIH1cblxuICAgIHByaXZhdGUgbnVtYmVySXRlbXNDYW5SZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKHRoaXMuZWwuY2xpZW50SGVpZ2h0IC8gdGhpcy5taW5Sb3dIZWlnaHQpICsgMjtcbiAgICB9XG5cbiAgICBwcml2YXRlIG1hbmlwdWxlUmVuZGVyZWRJdGVtcygpIHtcbiAgICAgICAgbGV0IGNoaWxkcmVuID0gdGhpcy5nZXRJbnNpZGVDaGlsZHJlbnMoKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGV0IGNoaWxkID0gY2hpbGRyZW5baV0gYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgICAgICBpZiAoY2hpbGQuc3R5bGUuZGlzcGxheSAhPT0gJ25vbmUnKSB7XG4gICAgICAgICAgICAgICAgbGV0IHJlYWxJbmRleCA9IHRoaXMuc3RhcnRJbmRleCArIGk7XG4gICAgICAgICAgICAgICAgY2hpbGQuc3R5bGUubWluSGVpZ2h0ID0gYCR7dGhpcy5taW5Sb3dIZWlnaHR9cHhgO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGxldCBjbGFzc05hbWUgPSAocmVhbEluZGV4ICsgMSkgJSAyID09PSAwID8gJ2V2ZW4nIDogJ29kZCc7XG4gICAgICAgICAgICAgICAgbGV0IHVuY2xhc3NOYW1lID0gY2xhc3NOYW1lID09ICdldmVuJyA/ICdvZGQnIDogJ2V2ZW4nO1xuXG4gICAgICAgICAgICAgICAgY2hpbGQuY2xhc3NMaXN0LmFkZChgYWctdmlydHVhbC1zY3JvbGwtJHtjbGFzc05hbWV9YCk7XG4gICAgICAgICAgICAgICAgY2hpbGQuY2xhc3NMaXN0LnJlbW92ZShgYWctdmlydHVhbC1zY3JvbGwtJHt1bmNsYXNzTmFtZX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0SW5zaWRlQ2hpbGRyZW5zKCk6IEhUTUxDb2xsZWN0aW9uIHtcbiAgICAgICAgbGV0IGNoaWxkcmVucyA9IHRoaXMuaXRlbXNDb250YWluZXJFbC5jaGlsZHJlbjtcbiAgICAgICAgaWYgKGNoaWxkcmVucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBpZiAoY2hpbGRyZW5zWzBdLnRhZ05hbWUudG9VcHBlckNhc2UoKSA9PT0gJ1RBQkxFJykge1xuICAgICAgICAgICAgICAgIGNoaWxkcmVucyA9IGNoaWxkcmVuc1swXS5jaGlsZHJlbjtcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGRyZW5zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkcmVuc1swXS50YWdOYW1lLnRvVXBwZXJDYXNlKCkgPT09ICdUQk9EWScpXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbnMgPSBjaGlsZHJlbnNbMF0uY2hpbGRyZW47XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVucyA9IGNoaWxkcmVuc1sxXS5jaGlsZHJlbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY2hpbGRyZW5zO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2hlY2tJc1RhYmxlKCkge1xuICAgICAgICBsZXQgY2hpbGRyZW5zID0gdGhpcy5pdGVtc0NvbnRhaW5lckVsLmNoaWxkcmVuO1xuICAgICAgICBpZiAoY2hpbGRyZW5zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGlmIChjaGlsZHJlbnNbMF0udGFnTmFtZS50b1VwcGVyQ2FzZSgpID09PSAnVEFCTEUnKSB7XG4gICAgICAgICAgICAgICAgY2hpbGRyZW5zID0gY2hpbGRyZW5zWzBdLmNoaWxkcmVuO1xuICAgICAgICAgICAgICAgIGlmIChjaGlsZHJlbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGRyZW5zWzBdLnRhZ05hbWUudG9VcHBlckNhc2UoKSA9PT0gJ1RIRUFEJyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGhlYWQgPSBjaGlsZHJlbnNbMF0gYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVhZC5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlWSgke01hdGguYWJzKHRoaXMucGFkZGluZ1RvcCAtIHRoaXMuY3VycmVudFNjcm9sbCl9cHgpYDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjaGVja1N0aWNrSXRlbSh1cDogYm9vbGVhbikge1xuICAgICAgICBpZiAoIXRoaXMuaXNUYWJsZSAmJiB0aGlzLnZzSXRlbXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVWc0l0ZW1zKCkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pbmRleEN1cnJlbnRTdGlja3kgPj0gMCkge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5jdXJyZW50U3RpY2t5SXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5maW5kQ3VycmVudFN0aWNreUJ5SW5kZXgodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pbmRleE5leHRTdGlja3kgPT09IC0xKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRleE5leHRTdGlja3kgPSB0aGlzLmdldEluZGV4TmV4dFN0aWNreSh1cCk7XG4gICAgXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRTdGlja0lzRW5kZWQodXApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXVwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRleFByZXZTdGlja3kgPSB0aGlzLmluZGV4Q3VycmVudFN0aWNreTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluZGV4Q3VycmVudFN0aWNreSA9IHRoaXMuZ2V0SW5kZXhDdXJyZW50U3RpY2t5KHVwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluZGV4TmV4dFN0aWNreSA9IHRoaXMuZ2V0SW5kZXhOZXh0U3RpY2t5KHVwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmluZGV4UHJldlN0aWNreSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0UHJldkFzQ3VycmVudFN0aWNreSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRleEN1cnJlbnRTdGlja3kgPSB0aGlzLmdldEluZGV4Q3VycmVudFN0aWNreSh1cCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaW5kZXhDdXJyZW50U3RpY2t5ID49IDApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluZGV4TmV4dFN0aWNreSA9IHRoaXMuZ2V0SW5kZXhOZXh0U3RpY2t5KHVwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRleE5leHRTdGlja3kgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gIFxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmluZGV4Q3VycmVudFN0aWNreSA9IHRoaXMuZ2V0SW5kZXhDdXJyZW50U3RpY2t5KHVwKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRleE5leHRTdGlja3kgPSB0aGlzLmdldEluZGV4TmV4dFN0aWNreSh1cCk7XG4gICAgICAgICAgICAgICAgfSAgICAgICAgXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaW5kZXhDdXJyZW50U3RpY2t5ID0gLTE7XG4gICAgICAgICAgICB0aGlzLmluZGV4TmV4dFN0aWNreSA9IC0xO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmaW5kQ3VycmVudFN0aWNreUJ5SW5kZXgoYWZ0ZXJQcmV2OiBib29sZWFuID0gZmFsc2UpOiB2b2lkIHtcbiAgICAgICAgbGV0IHZzSW5kZXggPSAwO1xuICAgICAgICBsZXQgbGFzdFZzSW5kZXggPSB0aGlzLnZzSXRlbXMubGVuZ3RoIC0gMTtcbiAgICAgICAgbGV0IGRpZmZNYXhJdGVtc1JlbmRlciA9IHRoaXMudnNJdGVtcy5sZW5ndGggLSB0aGlzLm51bWJlckl0ZW1zQ2FuUmVuZGVyKCk7XG5cbiAgICAgICAgaWYgKGRpZmZNYXhJdGVtc1JlbmRlciA+IDAgJiYgIXRoaXMudnNJdGVtcy5zb21lKCh2c0l0ZW0sIHZzSW5kZXgpID0+IHRoaXMuaW5kZXhDdXJyZW50U3RpY2t5ID09PSAodGhpcy5zdGFydEluZGV4ICsgdnNJbmRleCkpKSB7XG4gICAgICAgICAgICB2c0luZGV4ID0gbGFzdFZzSW5kZXg7XG4gICAgICAgICAgICBsZXQgdnNJdGVtID0gdGhpcy52c0l0ZW1zW2xhc3RWc0luZGV4XTtcbiAgICAgICAgICAgIGxldCBpbmRleCA9IHRoaXMuaW5kZXhDdXJyZW50U3RpY2t5O1xuICAgICAgICAgICAgbGV0IG9mZnNldFRvcCA9IHRoaXMucHJldmlvdXNJdGVtc0hlaWdodC5zbGljZSgwLCBpbmRleCkucmVkdWNlKChwcmV2LCBjdXJyKSA9PiAocHJldiArIChjdXJyID8gY3VyciA6IHRoaXMubWluUm93SGVpZ2h0KSksIDApO1xuICAgICAgICAgICAgdnNJdGVtLmlzU3RpY2tlZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTdGlja3lJdGVtID0gbmV3IFN0aWNreUl0ZW0oe1xuICAgICAgICAgICAgICAgIGNvbXA6IHZzSXRlbSxcbiAgICAgICAgICAgICAgICBpbmRleDogaW5kZXgsXG4gICAgICAgICAgICAgICAgdnNJbmRleDogdnNJbmRleCxcbiAgICAgICAgICAgICAgICBvZmZzZXRUb3A6IG9mZnNldFRvcCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHZzSXRlbS5lbC5vZmZzZXRIZWlnaHQsXG4gICAgICAgICAgICAgICAgb3V0c2lkZTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmb3IobGV0IHZzSXRlbSBvZiB0aGlzLnZzSXRlbXMpIHtcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSB0aGlzLnN0YXJ0SW5kZXggKyB2c0luZGV4O1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaW5kZXhDdXJyZW50U3RpY2t5ID09PSBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgb2Zmc2V0VG9wID0gdGhpcy5wcmV2aW91c0l0ZW1zSGVpZ2h0LnNsaWNlKDAsIGluZGV4KS5yZWR1Y2UoKHByZXYsIGN1cnIpID0+IChwcmV2ICsgKGN1cnIgPyBjdXJyIDogdGhpcy5taW5Sb3dIZWlnaHQpKSwgMCk7XG4gICAgICAgICAgICAgICAgICAgIHZzSXRlbS5pc1N0aWNrZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTdGlja3lJdGVtID0gbmV3IFN0aWNreUl0ZW0oe1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tcDogdnNJdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXg6IGluZGV4LFxuICAgICAgICAgICAgICAgICAgICAgICAgdnNJbmRleDogdnNJbmRleCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldFRvcDogb2Zmc2V0VG9wLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiB2c0l0ZW0uZWwub2Zmc2V0SGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdnNJbmRleCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGFmdGVyUHJldiAmJiB0aGlzLmN1cnJlbnRTdGlja3lJdGVtKSB7XG4gICAgICAgICAgICBsZXQgY3VycmVudEhlaWdodCA9IHRoaXMuY3VycmVudFN0aWNreUl0ZW0uaGVpZ2h0O1xuICAgICAgICAgICAgbGV0IG9mZnNldEJvdHRvbSA9IHRoaXMucGFkZGluZ1RvcCArIGN1cnJlbnRIZWlnaHQgKyBNYXRoLmFicyh0aGlzLmVsLnNjcm9sbFRvcCAtIHRoaXMucGFkZGluZ1RvcCk7XG4gICAgICAgICAgICBsZXQgb2Zmc2V0VG9wTmV4dCA9ICh0aGlzLmluZGV4TmV4dFN0aWNreSA/PyAwKSA+PSAwID8gdGhpcy5wcmV2aW91c0l0ZW1zSGVpZ2h0LnNsaWNlKDAsIHRoaXMuaW5kZXhOZXh0U3RpY2t5ID8/IDApLnJlZHVjZSgocHJldiwgY3VycikgPT4gKHByZXYgKyAoY3VyciA/IGN1cnIgOiB0aGlzLm1pblJvd0hlaWdodCkpLCAwKSA6IG51bGw7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChvZmZzZXRUb3BOZXh0ICE9PSBudWxsICYmIG9mZnNldEJvdHRvbSA+PSBvZmZzZXRUb3BOZXh0KSB7XG4gICAgICAgICAgICAgICAgbGV0IG5ld0RpZmZUb3AgPSBvZmZzZXRCb3R0b20gLSBvZmZzZXRUb3BOZXh0O1xuICAgICAgICAgICAgICAgIGlmIChuZXdEaWZmVG9wID49IGN1cnJlbnRIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U3RpY2t5SXRlbS5kaWZmVG9wID0gY3VycmVudEhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFN0aWNreUl0ZW0uZGlmZlRvcCA9IG5ld0RpZmZUb3A7XG4gICAgICAgICAgICB9IFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFN0aWNreUl0ZW0uZGlmZlRvcCA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXRQcmV2QXNDdXJyZW50U3RpY2t5KCkge1xuICAgICAgICBsZXQgY3VycmVudFN0aWNrZWQgPSB0aGlzLmN1cnJlbnRTdGlja3lJdGVtICYmIHRoaXMuY3VycmVudFN0aWNreUl0ZW0uY29tcC5zdGlja3k7XG5cbiAgICAgICAgaWYgKGN1cnJlbnRTdGlja2VkKSBcbiAgICAgICAgICAgIHRoaXMuaW5kZXhOZXh0U3RpY2t5ID0gdGhpcy5pbmRleEN1cnJlbnRTdGlja3k7XG5cbiAgICAgICAgdGhpcy5pbmRleEN1cnJlbnRTdGlja3kgPSB0aGlzLmluZGV4UHJldlN0aWNreTtcbiAgICAgICAgdGhpcy5pbmRleFByZXZTdGlja3kgPSAtMTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldEluZGV4Q3VycmVudFN0aWNreSh1cDogYm9vbGVhbikge1xuICAgICAgICBsZXQgdnNJbmRleCA9IDA7XG4gICAgICAgIGZvciAobGV0IHZzSXRlbSBvZiB0aGlzLnZzSXRlbXMpIHtcbiAgICAgICAgICAgIGxldCBpbmRleCA9IHZzSW5kZXggKyB0aGlzLnN0YXJ0SW5kZXg7XG5cbiAgICAgICAgICAgIGxldCBvZmZzZXRUb3AgPSB0aGlzLnByZXZpb3VzSXRlbXNIZWlnaHQuc2xpY2UoMCwgaW5kZXgpLnJlZHVjZSgocHJldiwgY3VycikgPT4gKHByZXYgKyAoY3VyciA/IGN1cnIgOiB0aGlzLm1pblJvd0hlaWdodCkpLCAwKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHZzSXRlbSAmJiB2c0l0ZW0uc3RpY2t5ICYmXG4gICAgICAgICAgICAgICAgdGhpcy5lbC5zY3JvbGxUb3AgPj0gb2Zmc2V0VG9wICYmXG4gICAgICAgICAgICAgICAgKHRoaXMuaW5kZXhDdXJyZW50U3RpY2t5ID09PSAtMSB8fCBpbmRleCAhPT0gdGhpcy5pbmRleEN1cnJlbnRTdGlja3kpXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgcmV0dXJuIGluZGV4O1xuXG4gICAgICAgICAgICB2c0luZGV4Kys7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gLTE7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRJbmRleE5leHRTdGlja3kodXA6IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKHRoaXMuaW5kZXhDdXJyZW50U3RpY2t5ID49IDApIHtcbiAgICAgICAgICAgIGxldCB2c0luZGV4ID0gMDtcblxuICAgICAgICAgICAgZm9yIChsZXQgdnNJdGVtIG9mIHRoaXMudnNJdGVtcy5zbGljZSgwLCB0aGlzLm51bWJlckl0ZW1zQ2FuUmVuZGVyKCkpKSB7XG4gICAgICAgICAgICAgICAgbGV0IGluZGV4ID0gdnNJbmRleCArIHRoaXMuc3RhcnRJbmRleDtcblxuICAgICAgICAgICAgICAgIGlmICh2c0l0ZW0uc3RpY2t5ICYmIGluZGV4ID4gdGhpcy5pbmRleEN1cnJlbnRTdGlja3kpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpbmRleDtcblxuICAgICAgICAgICAgICAgIHZzSW5kZXgrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGN1cnJlbnRTdGlja0lzRW5kZWQodXA6IGJvb2xlYW4pIHtcbiAgICAgICAgbGV0IGN1cnJlbnRIZWlnaHQgPSB0aGlzLmN1cnJlbnRTdGlja3lJdGVtPy5oZWlnaHQgPz8gMDtcbiAgICAgICAgXG4gICAgICAgIGlmICghdXAgfHwgKHRoaXMuY3VycmVudFN0aWNreUl0ZW0/LmRpZmZUb3AgPz8gMCkgPiAwKSB7XG4gICAgICAgICAgICBsZXQgb2Zmc2V0Qm90dG9tID0gdGhpcy5wYWRkaW5nVG9wICsgY3VycmVudEhlaWdodCArIE1hdGguYWJzKHRoaXMuZWwuc2Nyb2xsVG9wIC0gdGhpcy5wYWRkaW5nVG9wKTtcbiAgICAgICAgICAgIGxldCBvZmZzZXRUb3BOZXh0ID0gdGhpcy5pbmRleE5leHRTdGlja3khID49IDAgPyB0aGlzLnByZXZpb3VzSXRlbXNIZWlnaHQuc2xpY2UoMCwgdGhpcy5pbmRleE5leHRTdGlja3khKS5yZWR1Y2UoKHByZXYsIGN1cnIpID0+IChwcmV2ICsgKGN1cnIgPyBjdXJyIDogdGhpcy5taW5Sb3dIZWlnaHQpKSwgMCkgOiBudWxsO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAob2Zmc2V0VG9wTmV4dCAhPT0gbnVsbCAmJiBvZmZzZXRCb3R0b20gPj0gb2Zmc2V0VG9wTmV4dCkge1xuICAgICAgICAgICAgICAgIGxldCBuZXdEaWZmVG9wID0gb2Zmc2V0Qm90dG9tIC0gb2Zmc2V0VG9wTmV4dDtcbiAgICAgICAgICAgICAgICBpZiAobmV3RGlmZlRvcCA+PSBjdXJyZW50SGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFN0aWNreUl0ZW0hLmRpZmZUb3AgPSBjdXJyZW50SGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTdGlja3lJdGVtIS5kaWZmVG9wID0gbmV3RGlmZlRvcDtcbiAgICAgICAgICAgIH0gXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U3RpY2t5SXRlbSEuZGlmZlRvcCA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsZXQgb2Zmc2V0Qm90dG9tID0gdGhpcy5wYWRkaW5nVG9wICsgTWF0aC5hYnModGhpcy5lbC5zY3JvbGxUb3AgLSB0aGlzLnBhZGRpbmdUb3ApO1xuICAgICAgICAgICAgaWYgKG9mZnNldEJvdHRvbSA8PSB0aGlzLmN1cnJlbnRTdGlja3lJdGVtIS5vZmZzZXRUb3ApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0gXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB1cGRhdGVWc0l0ZW1zKCkge1xuICAgICAgICByZXR1cm4gbmV3IE9ic2VydmFibGU8dm9pZD4oKHN1YnNjcmliZXIpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLnN1YnNjcmlwQWxsVnNJdGVtLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3Vic2NyaXBBbGxWc0l0ZW0uZm9yRWFjaCgoaXRlbSkgPT4gaXRlbS5zdWJzY3JpcC51bnN1YnNjcmliZSgpKTtcbiAgICAgICAgICAgICAgICB0aGlzLnN1YnNjcmlwQWxsVnNJdGVtID0gW107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgZGlmZk1heEl0ZW1zUmVuZGVyID0gdGhpcy52c0l0ZW1zLmxlbmd0aCAtIHRoaXMubnVtYmVySXRlbXNDYW5SZW5kZXIoKTtcbiAgICAgICAgICAgICAgICBsZXQgbGFzdEluZGV4ID0gdGhpcy52c0l0ZW1zLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgbGV0IG9rID0gdGhpcy52c0l0ZW1zLmV2ZXJ5KCh2c0l0ZW0sIHZzSW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGluZGV4ID0gdGhpcy5zdGFydEluZGV4ICsgdnNJbmRleDtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoZGlmZk1heEl0ZW1zUmVuZGVyID4gMCAmJiB2c0luZGV4ID09PSBsYXN0SW5kZXgpXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleCA9IHRoaXMuaW5kZXhDdXJyZW50U3RpY2t5O1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5jdXJyZW50U3RpY2t5SXRlbSB8fCB2c0l0ZW0gIT09IHRoaXMuY3VycmVudFN0aWNreUl0ZW0uY29tcClcbiAgICAgICAgICAgICAgICAgICAgICAgIHZzSXRlbS5pc1N0aWNrZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuc3Vic2NyaXBBbGxWc0l0ZW0uc29tZShpdGVtID0+IGl0ZW0uY29tcCA9PT0gdnNJdGVtKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3Vic2NyaXBBbGxWc0l0ZW0ucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcDogdnNJdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YnNjcmlwOiB2c0l0ZW0ub25TdGlja3lDaGFuZ2Uuc3Vic2NyaWJlKChzdGlja3kpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vblN0aWNreUNvbXBvbmVudENoYW5nZWQodnNJdGVtLCBpbmRleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7IHZzSXRlbS5mb3JjZVVwZGF0ZUlucHV0cygpOyB9XG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBpZiAob2spIHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFuaXB1bGVSZW5kZXJlZEl0ZW1zKCk7XG4gICAgICAgICAgICAgICAgICAgIHN1YnNjcmliZXIubmV4dCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uU3RpY2t5Q29tcG9uZW50Q2hhbmdlZCh2c0l0ZW06IEFnVnNJdGVtQ29tcG9uZW50LCBpbmRleDogbnVtYmVyKSB7XG4gICAgICAgIGlmIChpbmRleCA9PT0gdGhpcy5pbmRleEN1cnJlbnRTdGlja3kpIHtcbiAgICAgICAgICAgIGlmICghdnNJdGVtLnN0aWNreSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmluZGV4UHJldlN0aWNreSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0UHJldkFzQ3VycmVudFN0aWNreSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRleEN1cnJlbnRTdGlja3kgPSB0aGlzLmdldEluZGV4Q3VycmVudFN0aWNreShmYWxzZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaW5kZXhDdXJyZW50U3RpY2t5ID49IDApXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluZGV4TmV4dFN0aWNreSA9IHRoaXMuZ2V0SW5kZXhOZXh0U3RpY2t5KGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRleE5leHRTdGlja3kgPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICgodGhpcy5pbmRleEN1cnJlbnRTdGlja3kgIT09IC0xICYmIGluZGV4IDwgdGhpcy5pbmRleEN1cnJlbnRTdGlja3kpIHx8IGluZGV4ID09PSB0aGlzLmluZGV4UHJldlN0aWNreSkge1xuICAgICAgICAgICAgaWYgKHZzSXRlbS5zdGlja3kpXG4gICAgICAgICAgICAgICAgdGhpcy5pbmRleFByZXZTdGlja3kgPSBpbmRleDtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aGlzLmluZGV4ZXNQcmV2U3RpY2sgPSB0aGlzLmluZGV4ZXNQcmV2U3RpY2suZmlsdGVyKGluZGV4UHJldiA9PiBpbmRleFByZXYgIT09IGluZGV4KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICgodGhpcy5pbmRleEN1cnJlbnRTdGlja3kgIT09IC0xICYmIGluZGV4ID4gdGhpcy5pbmRleEN1cnJlbnRTdGlja3kpIHx8IGluZGV4ID09PSB0aGlzLmluZGV4TmV4dFN0aWNreSkge1xuICAgICAgICAgICAgaWYgKHZzSXRlbS5zdGlja3kgJiYgKHRoaXMuaW5kZXhOZXh0U3RpY2t5ID09PSAtMSB8fCBpbmRleCA8IHRoaXMuaW5kZXhOZXh0U3RpY2t5ISkpXG4gICAgICAgICAgICAgICAgdGhpcy5pbmRleE5leHRTdGlja3kgPSBpbmRleDtcbiAgICAgICAgICAgIGVsc2UgaWYgKCF2c0l0ZW0uc3RpY2t5KVxuICAgICAgICAgICAgICAgIHRoaXMuaW5kZXhOZXh0U3RpY2t5ID0gLTE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMucXVlcnlWc0l0ZW1zLm5vdGlmeU9uQ2hhbmdlcygpO1xuICAgIH1cblxuICAgIG5nT25EZXN0cm95KCkge1xuICAgIH1cbn1cblxuXG5leHBvcnQgY2xhc3MgU3RpY2t5SXRlbSB7XG4gICAgY29tcDogQWdWc0l0ZW1Db21wb25lbnQ7XG4gICAgaW5kZXg6IG51bWJlcjtcbiAgICBvZmZzZXRUb3A6IG51bWJlciA9IDA7XG4gICAgdnNJbmRleDogbnVtYmVyO1xuICAgIGRpZmZUb3A6IG51bWJlciA9IDA7XG4gICAgaXNVcDogYm9vbGVhbiA9IGZhbHNlXG4gICAgaGVpZ2h0OiBudW1iZXIgPSAwO1xuICAgIG91dHNpZGU6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIGNvbnN0cnVjdG9yKG9iaj86IFBhcnRpYWw8U3RpY2t5SXRlbT4pIHtcbiAgICAgICAgaWYgKG9iaikgT2JqZWN0LmFzc2lnbih0aGlzLCBvYmopO1xuICAgIH1cbn1cbiIsIjxkaXYgY2xhc3M9XCJjb250ZW50LWhlaWdodFwiIFtzdHlsZS5oZWlnaHQucHhdPVwiY29udGVudEhlaWdodFwiPjwvZGl2PlxuPGRpdiAjaXRlbXNDb250YWluZXIgY2xhc3M9XCJpdGVtcy1jb250YWluZXJcIiBbc3R5bGUudHJhbnNmb3JtXT1cIid0cmFuc2xhdGVZKCcgKyBwYWRkaW5nVG9wICsgJ3B4KSdcIiBbbmdDbGFzc109XCJ7ICdzdGlja2VkLW91dHNpZGUnOiBjdXJyZW50U3RpY2t5SXRlbT8ub3V0c2lkZSB9XCI+XG4gICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxuPC9kaXY+XG48YWctdnMtaXRlbSAqbmdJZj1cImN1cnJlbnRTdGlja3lJdGVtPy5jb21wICYmIGN1cnJlbnRTdGlja3lJdGVtLmNvbXAuaXNTdGlja2VkXCJcbiAgICBbY2xhc3NdPVwiY3VycmVudFN0aWNreUl0ZW0uY29tcC5lbC5jbGFzc0xpc3QudmFsdWUgfCBzdGlja2VkQ2xhc3Nlc1wiXG4gICAgW3N0eWxlLnRvcC5weF09XCJjdXJyZW50U2Nyb2xsIC0gKGN1cnJlbnRTdGlja3lJdGVtLmRpZmZUb3AgPyBjdXJyZW50U3RpY2t5SXRlbS5kaWZmVG9wIDogMClcIlxuICAgIFtzdHlsZS5oZWlnaHQucHhdPVwiY3VycmVudFN0aWNreUl0ZW0uaGVpZ2h0XCJcbiAgICBbc3R5bGUubWluSGVpZ2h0LnB4XT1cImN1cnJlbnRTdGlja3lJdGVtLmhlaWdodFwiXG4+XG4gICAgPG5nLWNvbnRhaW5lciBbbmdUZW1wbGF0ZU91dGxldF09XCJjdXJyZW50U3RpY2t5SXRlbS5jb21wLnRlbXBcIj48L25nLWNvbnRhaW5lcj5cbjwvYWctdnMtaXRlbT4iXX0=