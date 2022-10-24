enum ProjectStatus { Active, Finished }
class Project {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus
    ) {}
}

type Listener = (items: Array<Project>) => void
class ProjectState {
    private listeners: Array<Listener> = []
    private projects: Array<Project> = []
    private static instance: ProjectState

    private constructor() {}

    addProject(title: string, description: string, people: number) {
        const project = new Project(
            Math.random.toString(), 
            title, description, 
            people, 
            ProjectStatus.Active
        )
        
        this.projects.push(project)

        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice())
        }
    }

    addListener(listenerFn: Listener) {
        this.listeners.push(listenerFn)
    }

    static getInstance() {
        if(ProjectState.instance) {
            return ProjectState.instance
        }
        this.instance = new ProjectState()
        return this.instance
    }
}

const projectState = ProjectState.getInstance()

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
abstract class ProjectElement<T extends Element> {
    templateElement: HTMLTemplateElement
    hostElement: HTMLDivElement
    element: T
    
    constructor(templateElementId: string) {
        this.hostElement = <HTMLDivElement>document.getElementById('app')!

        this.templateElement = <HTMLTemplateElement>document.getElementById(templateElementId)!
        const importedNode = document.importNode(this.templateElement.content, true)
        this.element = <T>importedNode.firstElementChild
    }
    // templateElementId
    protected attach(where: InsertPosition) {
        this.hostElement.insertAdjacentElement(where, this.element)
    }
}

class ProjectList extends ProjectElement<HTMLElement> { 

    assignedProjects: Array<Project>

    constructor(private type: "active" | "finished") {
        super('project-list')
        this.assignedProjects = []

        this.element.id = `${this.type}-projects`

        projectState.addListener((projects: Array<Project>) => {
            const relevantProjects = projects.filter(project => {
                if(this.type === 'active') {
                    return project.status === ProjectStatus.Active
                }
                return project.status === ProjectStatus.Finished
            })

            this.assignedProjects = relevantProjects
            this.renderProjects()
        })

        this.attach('beforeend')
        this.renderListTitle()
    }

    private renderProjects() {
        const listElement = <HTMLUListElement>document.getElementById(`${this.type}-projects-list`)!

        listElement.innerHTML = ''

        let listItem: HTMLLIElement

        for(const project of this.assignedProjects) {
            listItem = document.createElement('li')
            listItem.textContent = project.title
            listElement.appendChild(listItem)
        }
    }

    private renderListTitle() {
        const listId = `${this.type}-projects-list`
        this.element.querySelector('ul')!.id = listId

        const projectListTitleElement = this.element.querySelector('h2')!
        this.type === "active"  
            ? projectListTitleElement.innerHTML = "Active projects"   
            : projectListTitleElement.innerHTML = "Finished projects"
    }
}
class ProjectInput extends ProjectElement<HTMLFormElement> {
    static instance: ProjectInput

    titleInputElement: HTMLInputElement
    descriptionInputElement: HTMLInputElement
    peopleInputElement: HTMLInputElement

    private constructor() {
        super('project-input')
        this.element.id = 'user-input'

        this.titleInputElement = <HTMLInputElement>this.element.querySelector('#title')
        this.descriptionInputElement = <HTMLInputElement>this.element.querySelector('#description')
        this.peopleInputElement = <HTMLInputElement>this.element.querySelector('#people')

        this.configure()
        this.attach('afterbegin')
    }

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

    private configure() {
        this.element.addEventListener('submit', this.submitHandler)
    }
}

const prjInput = ProjectInput.getInstance()

const activePrjList = new ProjectList("active")
const finishedPrjList = new ProjectList("finished")