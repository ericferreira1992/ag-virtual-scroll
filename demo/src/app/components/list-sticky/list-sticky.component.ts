import { Component, OnInit, forwardRef, Inject } from '@angular/core';
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
        this.items = new Array(1000).fill(null).map((item, index) => ({ id: (index + 1), sticky: false, ...this.parent.getMock() }));

        this.items[4].sticky = true;
        this.items[12].sticky = true;

        this.strCode = `
<ag-virtual-scroll #vs [items]="items" height="400px" min-row-height="69" class="box-border">
    <ag-vs-item *ngFor="let item of vs.items" class="demo-item" [sticky]="item.sticky">
        <div class="demo-item-left">
            <img [src]="item.avatar" [style.borderColor]="item.color" [style.backgroundColor]="item.color"/>
        </div>
        <div class="demo-item-right">
            <strong>{{item.name}}</strong>
            <p>Phone: {{item.phone}}</p>
            <p>E-mail: {{item.email}}</p>
            <div class="btn-check" [class.checked]="item.sticky" (click)="item.sticky = !item.sticky">
                <mat-icon>done</mat-icon>
            </div>
        </div>
    </ag-vs-item>
</ag-virtual-scroll>
        `;
    }

    add() {
        this.items = [
            ...this.items,
            ...(new Array(1000).fill(null).map((item, index) => ({ id: (index + 1), sticky: false, ...this.parent.getMock() })))
        ];
    }

    remove() {
        if (this.items.length) {
            const start = 0;
            const end = (this.items.length < 1000 ? 0 : this.items.length - 1000);
            this.items = this.items.slice(start, end);
        }
    }

    ngOnInit() {
    }
}
