import { Component } from '@angular/core';
import { faker } from '@faker-js/faker';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent {

    constructor() {
    }

    getMock() {
        return {
            name: faker.name.firstName() + ' ' + faker.name.lastName(),
            phone: faker.phone.number(),
            color: faker.internet.color(),
            email: faker.internet.email(),
            avatar: faker.image.avatar(),
            height: Math.max(Math.floor(Math.random() * 150), 50)
        };
    }
}
