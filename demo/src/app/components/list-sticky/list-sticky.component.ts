import { Component, OnInit, forwardRef, Inject } from '@angular/core';
import { AgVsRenderEvent } from '../../../../../src/ag-virtual-scroll/classes/ag-vs-render-event.class';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-list-sticky',
  templateUrl: './list-sticky.component.html',
  styleUrls: ['./list-sticky.component.scss']
})
export class ListStickyComponent implements OnInit {
    public items: any[] = [];

    public strCode: string;

    constructor(
        @Inject(forwardRef(() => AppComponent)) public parent: AppComponent
    ) {
        this.items = new Array(1000).fill(null).map((item, index) => ({ id: (index + 1), ...this.parent.getMock() }));

        this.strCode = `
<ag-virtual-scroll #vs [items]="items" height="350px" min-row-height="50" class="box-border">
    <ag-vs-item *ngFor="let item of vs.items; let i = index" class="demo-item" [sticky]="item.id === 3">
        <div class="demo-item-left">
            <img [src]="item.avatar"/>
        </div>
        <div class="demo-item-right">
            <strong>{{item.name}}</strong>
            <p>Phone: {{item.phone}}</p>
            <p>E-mail: {{item.email}}</p>
        </div>
    </ag-vs-item>
</ag-virtual-scroll>
        `;
    }

    add() {
        this.items = [ ...this.items, ...new Array(1000).fill(null).map(this.parent.getMock) ];
    }

    remove() {
        if (this.items.length) {
            let start = 0;
            let end = (this.items.length < 1000 ? 0 : this.items.length - 1000);
            this.items = this.items.slice(start, end);
        }
    }

    ngOnInit() {
    }
}
