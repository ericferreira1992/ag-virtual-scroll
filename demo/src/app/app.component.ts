import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    private items: any[] = [];

    constructor() {
        this.items = new Array(100000).fill(null)
            .map((x, i) => ({
                id: i + 1,
                name: `Teste ${i + 1}`,
                height: Math.max(Math.floor(Math.random() * 100), 35)
            }));
    }
}
