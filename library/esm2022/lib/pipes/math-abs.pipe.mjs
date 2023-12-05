import { Pipe } from '@angular/core';
import * as i0 from "@angular/core";
export class MathAbsPipe {
    constructor() { }
    transform(value) {
        if (value)
            return Math.abs(value);
        return value;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: MathAbsPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "16.2.12", ngImport: i0, type: MathAbsPipe, name: "mathAbs" }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: MathAbsPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'mathAbs'
                }]
        }], ctorParameters: function () { return []; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0aC1hYnMucGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2xpYnJhcnkvc3JjL2xpYi9waXBlcy9tYXRoLWFicy5waXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQWlCLE1BQU0sZUFBZSxDQUFDOztBQUlwRCxNQUFNLE9BQU8sV0FBVztJQUVyQixnQkFBZSxDQUFDO0lBRWhCLFNBQVMsQ0FBQyxLQUFhO1FBQ3BCLElBQUksS0FBSztZQUNOLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMxQixPQUFPLEtBQUssQ0FBQztJQUNoQixDQUFDOytHQVJTLFdBQVc7NkdBQVgsV0FBVzs7NEZBQVgsV0FBVztrQkFIdkIsSUFBSTttQkFBQztvQkFDSCxJQUFJLEVBQUUsU0FBUztpQkFDakIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQaXBlLCBQaXBlVHJhbnNmb3JtIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5AUGlwZSh7XG4gICBuYW1lOiAnbWF0aEFicydcbn0pXG5leHBvcnQgY2xhc3MgTWF0aEFic1BpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcblxuICAgY29uc3RydWN0b3IoKSB7fVxuXG4gICB0cmFuc2Zvcm0odmFsdWU6IG51bWJlcikge1xuICAgICAgaWYgKHZhbHVlKVxuICAgICAgICAgcmV0dXJuIE1hdGguYWJzKHZhbHVlKTtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgIH1cbn0iXX0=