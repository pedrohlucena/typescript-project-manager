function AutoBind(_: any, _2: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        enumerable: false,
        get() {
            const boundFunction = originalMethod.bind(this)
            return boundFunction
        }
    }
    return adjDescriptor
}

type UserInput = [string, string, number]

function validate(validatableInput: Validatable): boolean {
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
interface Validatable {
    value: string | number,
    required?: boolean,
    minLength?: number,
    maxLength?: number,
    maxValue?: number,
    minValue?: number
}

class ValidatableInput {
    value: string | number
    required?: boolean
    minLength?: number
    maxLength?: number
    minValue?: number
    maxValue?: number

    constructor(value: string | number, required?: boolean, minLength?: number, maxLength?: number, minValue?: number, maxValue?: number) {
        this.value = value
        this.required = required
        this.minLength = minLength
        this.maxLength = maxLength
        this.minValue = minValue
        this.maxValue = maxValue
    }
}

class ProjectInput {
    static instance: ProjectInput

    templateElement: HTMLTemplateElement
    hostElement: HTMLDivElement

    formElement: HTMLFormElement

    titleInputElement: HTMLInputElement
    descriptionInputElement: HTMLInputElement
    peopleInputElement: HTMLInputElement

    private constructor() {
        this.templateElement = <HTMLTemplateElement>document.getElementById('project-input')!
        this.hostElement = <HTMLDivElement>document.getElementById('app')!

        const importedNode = document.importNode(this.templateElement.content, true)
        this.formElement = importedNode.firstElementChild as HTMLFormElement
        this.formElement.id = 'user-input'

        this.titleInputElement = this.formElement.querySelector('#title') as HTMLInputElement
        this.descriptionInputElement = this.formElement.querySelector('#description') as HTMLInputElement
        this.peopleInputElement = this.formElement.querySelector('#people') as HTMLInputElement

        this.configure()
        this.attach()
    }

    static getInstance() {
        if (ProjectInput.instance) {
            return ProjectInput.instance
        }
        ProjectInput.instance = new ProjectInput()
        return ProjectInput.instance
    }

    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.formElement)
    }

    private gatherUserInput(): UserInput | void {
        const enteredTitle = this.titleInputElement.value
        const enteredDescription = this.descriptionInputElement.value
        const enteredPeople = parseInt(this.peopleInputElement.value)

        const titleValidatable: Validatable = { value: enteredTitle, required: true }
        const descriptionValidatable: Validatable = { value: enteredDescription, required: true, minLength: 5 }
        const peopleValidatable: Validatable = { value: enteredPeople, required: true, minValue: 0, maxValue: 10 }

        if (
            validate(titleValidatable) &&
            validate(descriptionValidatable) &&
            validate(peopleValidatable)
        ) {
            return [enteredTitle, enteredDescription, enteredPeople]
        } else {
            alert('Invalid input, please try again')
            return
        }
    }

    private clearInputs() {
        this.titleInputElement.value = ""
        this.descriptionInputElement.value = ""
        this.peopleInputElement.value = ""
    }

    @AutoBind
    private submitHandler(event: Event) {
        event.preventDefault()
        const userInput = this.gatherUserInput()
        if (Array.isArray(userInput)) {
            const [title, description, people] = userInput
            console.log(title, description, people)
            this.clearInputs()
        }
    }

    private configure() {
        this.formElement.addEventListener('submit', this.submitHandler)
    }
}

const prjInput = ProjectInput.getInstance()