export interface Validatable {
    value: string | number,
    required?: boolean,
    minLength?: number,
    maxLength?: number,
    maxValue?: number,
    minValue?: number
}

export function validate(validatableInput: Validatable): boolean {
    let isValid = true
    const valueToValidate = validatableInput.value

    if (validatableInput.required) {
        isValid = isValid && valueToValidate.toString().trim().length !== 0;
    }
    if (
        validatableInput.minLength != null &&
        typeof valueToValidate === 'string'
    ) {
        isValid =
            isValid && valueToValidate.length >= validatableInput.minLength;
    }
    if (
        validatableInput.maxLength != null &&
        typeof valueToValidate === 'string'
    ) {
        isValid =
            isValid && valueToValidate.length <= validatableInput.maxLength;
    }
    if (
        validatableInput.minValue != null &&
        typeof valueToValidate === 'number'
    ) {
        isValid = isValid && valueToValidate >= validatableInput.minValue;
    }
    if (
        validatableInput.maxValue != null &&
        typeof valueToValidate === 'number'
    ) {
        isValid = isValid && valueToValidate <= validatableInput.maxValue;
    }

    return isValid;
}