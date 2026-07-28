import { Pipe, PipeTransform, inject } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { NgxFormErrorService } from '../services/form-error.service';

@Pipe({
  name: 'ngxFormError',
  standalone: true,
})
export class NgxFormErrorPipe implements PipeTransform {
  private errorService = inject(NgxFormErrorService);

  transform(errors: ValidationErrors | null | undefined): string | null {
    if (!errors) return null;
    const keys = Object.keys(errors);
    if (keys.length === 0) return null;

    // Resolve the first validation error message
    const firstKey = keys[0];
    return this.errorService.resolveError(firstKey, errors[firstKey]);
  }
}
