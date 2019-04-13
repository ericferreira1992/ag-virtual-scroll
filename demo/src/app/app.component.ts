import { Component } from '@angular/core';
import * as faker from 'src/assets/js/faker.min.js';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {

    constructor() {
    }

    getMock() {
        return {
            name: faker.name.firstName() + ' ' + faker.name.lastName(),
            phone: faker.phone.phoneNumber(),
            color: faker.internet.color(),
            email: faker.internet.email(),
            avatar: faker.image.avatar(),
            height: Math.max(Math.floor(Math.random() * 150), 50)
        };
    }
}
