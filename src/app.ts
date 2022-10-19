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

interface Validatable {
    value: string | number,
    required?: boolean,
    minLength?: number,
    maxLength?: number,
    maxValue?: number,
    minValue?: number
}

function validate(validatableInput: Validatable): boolean {
    let isValid = true
    const valueToValidate = validatableInput.value

    const minimalLength = validatableInput.minLength
    const maximalLength = validatableInput.maxLength

    const minValue = validatableInput.minValue
    const maxValue = validatableInput.maxValue

    if(validatableInput.required) {
            isValid = isValid && valueToValidate.toString().trim().length !== 0
    }

    if(typeof valueToValidate === 'string') {
        if(minimalLength != null || maximalLength != null) {
            if(minimalLength) {
                isValid = isValid && valueToValidate.length >= minimalLength
            }
            if(maximalLength) {
                isValid = isValid && maximalLength >= valueToValidate.length
            }
        }
    }

    if(typeof valueToValidate === 'number') {
        if(minValue != null || maxValue != null) {
            if(minValue) {
                isValid = isValid && valueToValidate >= minValue
            }
            if(maxValue) {
                isValid = isValid && maxValue >= valueToValidate
            }
        }
    }

    return isValid
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

        if (
            enteredTitle.trim().length === 0 ||
            enteredDescription.trim().length === 0 ||
            0 > enteredPeople
        ) {
            alert('Invalid input, please try again')
            return
        } else {
            return [enteredTitle, enteredDescription, enteredPeople]
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