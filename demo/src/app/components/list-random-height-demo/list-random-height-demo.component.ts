import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-list-random-height-demo',
  templateUrl: './list-random-height-demo.component.html',
  styleUrls: ['./list-random-height-demo.component.scss']
})
export class ListRandomHeightDemoComponent implements OnInit {
    public items: any[] = [];

    public strCode: string;

    constructor() {
        this.items = new Array(1000).fill(null).map(this.fill.bind(this));

        this.strCode = `
<ag-virtual-scroll #vs [items]="items" height="350px" min-row-height="50" class="box-border">
    <div class="demo-item" *ngFor="let item of vs.items">
        <div>
            <span>{{item.id}}</span>
        </div>
        <div [style.height.px]="item.height">
            <strong>{{item.name}}</strong><br/>
            {{item.price | currency}}
        </div>
    </div>
</ag-virtual-scroll>
        `;
    }

    fill(x, i) {
        return { 
            id: this.items.length + i + 1,
            name: `Test ${this.items.length + i + 1}`,
            price: Math.floor(Math.random() * (99999 - 100) + 100) / 100,
            height: Math.max(Math.floor(Math.random() * 150), 0)
        }
    }

    add() {
        this.items = [ ...this.items, ...new Array(1000).fill(null).map(this.fill.bind(this)) ];
    }

    remove() {
        if (this.items.length) {
            let start = 0;
            let end = (this.items.length < 1000 ? 0 : this.items.length - 1000) ;
            this.items = this.items.slice(start, end);
        }
    }

    ngOnInit() {
    }
}
