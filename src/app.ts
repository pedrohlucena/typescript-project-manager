function AutoBind(_: any, _2: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    console.log(descriptor)
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        enumerable: false,
        get() {
            const boundFunction = originalMethod.bind(this)
            return boundFunction
        }
    }
    console.log(adjDescriptor)
    return adjDescriptor
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
        if(ProjectInput.instance) {
            return ProjectInput.instance
        }
        ProjectInput.instance = new ProjectInput()
        return ProjectInput.instance
    }

    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.formElement)
    }

    @AutoBind
    private submitHandler(event: Event) {
        event.preventDefault()
        console.log(this.titleInputElement.value)
    }

    private configure() {
        this.formElement.addEventListener('submit', this.submitHandler)
    }
}

const prjInput = ProjectInput.getInstance()