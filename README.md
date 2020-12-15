# ag-virtual-scroll (Angular 11+)

Angular Component of virtual-scroll. It easy to use and works light and clean.
He also work with differents items height.

## Use example ([more examples](https://ericferreira1992.github.io/ag-virtual-scroll)).

```html
<ag-virtual-scroll #vs [items]="items" height="350px" min-row-height="50" class="box-border">
    <div class="demo-item" *ngFor="let item of vs.items">
        <div>
            <span>{{item.id}}</span>
        </div>
        <div>
            <strong>{{item.name}}</strong><br/>
            {{item.price | currency}}
        </div>
    </div>
</ag-virtual-scroll>
```
![](demo.gif)

## ⚠️Important⚠️
- Define a ``min-row-height`` to increase virtualization performance.
- Always define a ``height`` because it will be the one that will do the virtualization of the items.
- Inform your all data list in ``[items]``.
- Add ``#vs`` to use in iteration ``*ngFor``.

# Usage

## Install
`npm install ag-virtual-scroll`

## Import into Module
```typescript
import { AgVirtualScrollModule } from 'ag-virtual-scroll';

@NgModule({
  imports: [
    ...,
    AgVirtualScrollModule
  ],
  declarations: [...],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

# API

## Inputs/Outputs (Required)
Name		                | Type          | Description
----                    	| ----          | ----
`items`		                | `any[]`       | Your all data list stay here.

## Inputs/Outputs (Optional)
Name		        		| Type      	                        | Default		            | Description
----            			| ----      	                        | ----			            | ----
`min-row-height`   			| `number`  	                        | `40`		                | This determine how minimm height each item will have.
`height`     				| `string`		                        | `'auto'`  	            | Define a fixed height for container to make a virtual-scroll of items.
`onItemsRender`  			| `EventEmitter<AgVsRenderEvent<T>>`	| none		                | Define a max width to container.


