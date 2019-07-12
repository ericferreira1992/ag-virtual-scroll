import { Component, OnInit, forwardRef, Inject } from '@angular/core';
import { AgVsRenderEvent } from '../../../../../src/ag-virtual-scroll/classes/ag-vs-render-event.class';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-list-demo',
  templateUrl: './list-demo.component.html',
  styleUrls: ['./list-demo.component.scss']
})
export class ListDemoComponent implements OnInit {
    public items: any[] = [];

    public strCode: string;

    private numberItems = 1000;

    constructor(
        @Inject(forwardRef(() => AppComponent)) public parent: AppComponent
    ) {
        this.items = new Array(this.numberItems).fill(null).map(this.parent.getMock);

        console.log(this.items);

        this.strCode = `
<ag-virtual-scroll #vs [items]="items" height="350px" min-row-height="69" class="box-border">
    <div *ngFor="let item of vs.items" class="demo-item">
        <div class="demo-item-left">
            <img [src]="item.avatar"/>
        </div>
        <div class="demo-item-right">
            <strong>{{item.name}}</strong>
            <p>Phone: {{item.phone}}</p>
            <p>E-mail: {{item.email}}</p>
        </div>
    </div>
</ag-virtual-scroll>
        `;
    }

    add() {
        this.items = [ ...this.items, ...new Array(this.numberItems).fill(null).map(this.parent.getMock) ];
    }

    remove() {
        if (this.items.length) {
            let start = 0;
            let end = (this.items.length < this.numberItems ? 0 : this.items.length - this.numberItems) ;
            this.items = this.items.slice(start, end);
        }
    }

    ngOnInit() {
    }

    onItemsRender(event: AgVsRenderEvent<any>) {
    }
}
