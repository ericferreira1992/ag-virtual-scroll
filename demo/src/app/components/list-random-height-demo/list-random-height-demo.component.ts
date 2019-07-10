import { Component, OnInit, forwardRef, Inject } from '@angular/core';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-list-random-height-demo',
  templateUrl: './list-random-height-demo.component.html',
  styleUrls: ['./list-random-height-demo.component.scss']
})
export class ListRandomHeightDemoComponent implements OnInit {
    public items: any[] = [];

    public strCode: string;

    constructor(
        @Inject(forwardRef(() => AppComponent)) public parent: AppComponent
    ) {
        this.items = new Array(1000).fill(null).map(this.parent.getMock);

        this.strCode = `
<ag-virtual-scroll #vs [items]="items" height="350px" min-row-height="50" class="box-border">
    <div class="demo-item" *ngFor="let item of vs.items">
        <div class="demo-item-left">
            <span>{{item.id}}</span>
        </div>
        <div class="demo-item-right" [style.height.px]="item.height">
            <strong>{{item.name}}</strong><br/>
            {{item.price | currency}}
        </div>
    </div>
</ag-virtual-scroll>
        `;
    }

    add() {
        this.items = [ ...this.items, ...new Array(1000).fill(null).map(this.parent.getMock) ];
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
