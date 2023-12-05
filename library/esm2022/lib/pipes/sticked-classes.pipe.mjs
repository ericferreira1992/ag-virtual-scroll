import { Pipe } from '@angular/core';
import * as i0 from "@angular/core";
export class StickedClassesPipe {
    constructor() {
        this.exceptionClasses = [
            'ag-virtual-scroll-odd',
            'ag-virtual-scroll-even',
        ];
    }
    transform(classes) {
        if (classes) {
            let splitted = classes.includes(' ') ? classes.split(' ') : [classes];
            return splitted.filter(className => !this.exceptionClasses.some(exc => exc === className)).join(' ');
        }
        return '';
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: StickedClassesPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "16.2.12", ngImport: i0, type: StickedClassesPipe, name: "stickedClasses" }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: StickedClassesPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'stickedClasses'
                }]
        }], ctorParameters: function () { return []; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RpY2tlZC1jbGFzc2VzLnBpcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9saWJyYXJ5L3NyYy9saWIvcGlwZXMvc3RpY2tlZC1jbGFzc2VzLnBpcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLElBQUksRUFBaUIsTUFBTSxlQUFlLENBQUM7O0FBSXBELE1BQU0sT0FBTyxrQkFBa0I7SUFPNUI7UUFMUSxxQkFBZ0IsR0FBYTtZQUNsQyx1QkFBdUI7WUFDdkIsd0JBQXdCO1NBQzFCLENBQUM7SUFFYSxDQUFDO0lBRWhCLFNBQVMsQ0FBQyxPQUFlO1FBQ3RCLElBQUksT0FBTyxFQUFFO1lBQ1YsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN0RSxPQUFPLFFBQVEsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDdkc7UUFDRCxPQUFPLEVBQUUsQ0FBQztJQUNiLENBQUM7K0dBZlMsa0JBQWtCOzZHQUFsQixrQkFBa0I7OzRGQUFsQixrQkFBa0I7a0JBSDlCLElBQUk7bUJBQUM7b0JBQ0gsSUFBSSxFQUFFLGdCQUFnQjtpQkFDeEIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQaXBlLCBQaXBlVHJhbnNmb3JtIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5AUGlwZSh7XG4gICBuYW1lOiAnc3RpY2tlZENsYXNzZXMnXG59KVxuZXhwb3J0IGNsYXNzIFN0aWNrZWRDbGFzc2VzUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuXG4gICBwcml2YXRlIGV4Y2VwdGlvbkNsYXNzZXM6IHN0cmluZ1tdID0gW1xuICAgICAgJ2FnLXZpcnR1YWwtc2Nyb2xsLW9kZCcsXG4gICAgICAnYWctdmlydHVhbC1zY3JvbGwtZXZlbicsXG4gICBdO1xuXG4gICBjb25zdHJ1Y3RvcigpIHt9XG5cbiAgIHRyYW5zZm9ybShjbGFzc2VzOiBzdHJpbmcpIHtcbiAgICAgIGlmIChjbGFzc2VzKSB7XG4gICAgICAgICBsZXQgc3BsaXR0ZWQgPSBjbGFzc2VzLmluY2x1ZGVzKCcgJykgPyBjbGFzc2VzLnNwbGl0KCcgJykgOiBbY2xhc3Nlc107XG4gICAgICAgICByZXR1cm4gc3BsaXR0ZWQuZmlsdGVyKGNsYXNzTmFtZSA9PiAhdGhpcy5leGNlcHRpb25DbGFzc2VzLnNvbWUoZXhjID0+IGV4YyA9PT0gY2xhc3NOYW1lKSkuam9pbignICcpO1xuICAgICAgfVxuICAgICAgcmV0dXJuICcnO1xuICAgfVxufSJdfQ==