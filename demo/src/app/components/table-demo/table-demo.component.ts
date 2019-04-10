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
        this.items = new Array(100000).fill(null)
            .map((x, i) => ({
                id: i + 1,
                name: `Test ${i + 1}`,
                price: Math.floor(Math.random() * (99999 - 100) + 100) / 100,
                height: Math.max(Math.floor(Math.random() * 100), 35)
            }));

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

    ngOnInit() {
    }

}
