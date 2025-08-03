import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
    name: 'mathAbs',
    standalone: false
})
export class MathAbsPipe implements PipeTransform {

   constructor() {}

   transform(value: number) {
      if (value)
         return Math.abs(value);
      return value;
   }
}