import { Component } from './base-component.js'
import { UserInput } from '../types/user-input.js'
import { Validatable, validate } from '../utils/validation.js'
import { AutoBind } from '../decorators/autobind.js'
import { projectState } from '../state/project-state.js'
export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    static instance: ProjectInput

    titleInputElement: HTMLInputElement
    descriptionInputElement: HTMLInputElement
    peopleInputElement: HTMLInputElement

    private constructor() {
        super('project-input', 'app', 'afterbegin', 'user-input')

        this.titleInputElement = <HTMLInputElement>this.element.querySelector('#title')
        this.descriptionInputElement = <HTMLInputElement>this.element.querySelector('#description')
        this.peopleInputElement = <HTMLInputElement>this.element.querySelector('#people')

        this.configure()
    }

    configure() {
        this.element.addEventListener('submit', this.submitHandler)
    }

    renderContent() { }

    static getInstance() {
        if (ProjectInput.instance) {
            return ProjectInput.instance
        }
        ProjectInput.instance = new ProjectInput()
        return ProjectInput.instance
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
            projectState.addProject(title, description, people)
            this.clearInputs()
        }
    }
}