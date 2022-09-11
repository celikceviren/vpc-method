import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { StaticValues } from 'src/app/data/common.model';

export function GasMeasurementValidator(code: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    let minValue!: number;
    let maxValue!: number;
    switch (code) {
      case StaticValues.GAS_MEASUREMENT_O2_CODE:
        minValue = 19.5;
        maxValue = 23.5;
        break;
      case StaticValues.GAS_MEASUREMENT_CH4_CODE:
        minValue = 5;
        maxValue = 15;
        break;
      case StaticValues.GAS_MEASUREMENT_CO_CODE:
        minValue = 0;
        maxValue = 35;
        break;
      case StaticValues.GAS_MEASUREMENT_H2S_CODE:
        minValue = 0;
        maxValue = 35;
        break;
      case StaticValues.GAS_MEASUREMENT_VOC_CODE:
        minValue = 0;
        maxValue = 1;
        break;
    }

    const value = control.value;

    if (!value) {
      return null;
    }

    var pattern = new RegExp(/^\d{1,8}([\.\,]\d{1,8})?$/g);
    if (!pattern.test(value)) {
      return { invalidValue: true };
    }

    const numValue = parseFloat(value.replace(',', '.').replace(' ', ''));
    if (minValue !== undefined && numValue < minValue) {
      return { invalidValue: true };
    }

    if (maxValue !== undefined && numValue > maxValue) {
      return { invalidValue: true };
    }

    return null;
  };
}
