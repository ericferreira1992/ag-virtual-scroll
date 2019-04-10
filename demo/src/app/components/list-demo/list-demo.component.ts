import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-list-demo',
  templateUrl: './list-demo.component.html',
  styleUrls: ['./list-demo.component.scss']
})
export class ListDemoComponent implements OnInit {
    public items: any[] = [];

    public strCode: string;

    constructor() {
        this.items = new Array(100000).fill(null)
            .map((x, i) => ({
                id: i + 1,
                name: `Test ${i + 1}`,
                price: Math.floor(Math.random() * (99999 - 100) + 100) / 100
            }));

        this.strCode = `
<ag-virtual-scroll #vs [items]="items" height="350px" min-row-height="50">
    <div class="item" *ngFor="let item of vs.items">
        <div>
            <strong>{{item.id}}</strong>
        </div>
        <div>
            <p>{{item.name}}</p>
            <p>{{item.price | currency}}</p>
        </div>
    </div>
</ag-virtual-scroll>
        `;
    }

    ngOnInit() {
    }
}
