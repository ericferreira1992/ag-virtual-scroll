import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-table-demo',
  templateUrl: './table-demo.component.html',
  styleUrls: ['./table-demo.component.scss']
})
export class TableDemoComponent implements OnInit {
    public items: any[] = [];

    public strCode: string;

    constructor() {
        this.items = new Array(1000).fill(null).map(this.fill.bind(this));

        this.strCode = `
<ag-virtual-scroll #vs [items]="items" height="350px">
    <table>
        <thead>
            <th width="25%">ID</th>
            <th width="50%">NAME</th>
            <th width="25%">PRICE</th>
        </thead>
        <tbody>
            <tr class="item" *ngFor="let item of vs.items">
                <td width="25%"><strong>{{item.id}}</strong></td>
                <td width="50%">{{item.name}}</td>
                <td width="25%">{{item.price | currency}}</td>
            </tr>
        </tbody>
    </table>
</ag-virtual-scroll>
        `;
    }

    fill(x, i) {
        return { 
            id: this.items.length + i + 1,
            name: `Test ${this.items.length + i + 1}`,
            price: Math.floor(Math.random() * (99999 - 100) + 100) / 100
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
