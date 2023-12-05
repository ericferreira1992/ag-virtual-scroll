import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AgVirtualScrollModule } from 'projects/library/src/public-api';
import { TableDemoComponent } from './components/table-demo/table-demo.component';
import { ListDemoComponent } from './components/list-demo/list-demo.component';
import { ListRandomHeightDemoComponent } from './components/list-random-height-demo/list-random-height-demo.component';

import { HighlightModule, HighlightOptions, HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';

import { ListStickyComponent } from './components/list-sticky/list-sticky.component';

import { MatIconModule } from '@angular/material/icon';

@NgModule({
    imports: [
        BrowserModule,
        HighlightModule,
        AgVirtualScrollModule,
        MatIconModule
    ],
    declarations: [
        AppComponent,
        ListStickyComponent,
        TableDemoComponent,
        ListDemoComponent,
        ListRandomHeightDemoComponent
    ],
    providers: [
        {
            provide: HIGHLIGHT_OPTIONS,
            useValue: <HighlightOptions>{
                coreLibraryLoader: () => import('highlight.js/lib/core'),
                // lineNumbersLoader: () => import('highlightjs-line-numbers.js'),
                languages: {
                    typescript: () => import('highlight.js/lib/languages/typescript'),
                    scss: () => import('highlight.js/lib/languages/scss'),
                    xml: () => import('highlight.js/lib/languages/xml'),
                },
            }
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
