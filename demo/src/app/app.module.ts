import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AgVirtualScrollModule } from '../../../src/ag-virtual-scroll/ag-virtual-scroll.module';
import { TableDemoComponent } from './components/table-demo/table-demo.component';
import { ListDemoComponent } from './components/list-demo/list-demo.component';
import { ListRandomHeightDemoComponent } from './components/list-random-height-demo/list-random-height-demo.component';

import { HighlightModule } from 'ngx-highlightjs';

import xml from 'highlight.js/lib/languages/xml';
import scss from 'highlight.js/lib/languages/scss';
import typescript from 'highlight.js/lib/languages/typescript';
import { ListStickyComponent } from './components/list-sticky/list-sticky.component';

export function hljsLanguages() {
    return [
        { name: 'typescript', func: typescript },
        { name: 'scss', func: scss },
        { name: 'xml', func: xml }
    ];
}

@NgModule({
    imports: [
        BrowserModule,
        HighlightModule.forRoot({
            languages: hljsLanguages
        }),
        AgVirtualScrollModule
    ],
    declarations: [
        AppComponent,
        ListStickyComponent,
        TableDemoComponent,
        ListDemoComponent,
        ListRandomHeightDemoComponent
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
