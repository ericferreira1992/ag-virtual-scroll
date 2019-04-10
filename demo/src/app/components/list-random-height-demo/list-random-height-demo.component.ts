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
        this.items = new Array(100000).fill(null)
            .map((x, i) => ({
                id: i + 1,
                name: `Test ${i + 1}`,
                height: Math.max(Math.floor(Math.random() * 50), 0)
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
            <div class="test-custom-height" [style.height.px]="item.height"></div>
        </div>
    </div>
</ag-virtual-scroll>
        `;
    }

    ngOnInit() {
    }
}
