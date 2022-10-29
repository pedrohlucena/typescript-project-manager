interface Draggable {
    dragStartHandler(event: DragEvent): void
    dragEndHandler(event: DragEvent): void
}

interface DragTarget {
    dragOverHandler(event: DragEvent): void
    dropHandler(event: DragEvent): void
    dragLeaveHandler(event: DragEvent): void
}

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

type Listener<T> = (items: Array<T>) => void

class State<T> {
    protected listeners: Array<Listener<T>> = []

    addListener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn)
    }
}
class ProjectState extends State<Project> {

    private projects: Array<Project> = []
    private static instance: ProjectState

    private constructor() { super() }

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
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement
    hostElement: T
    element: U
    
    constructor(
        templateId: string, 
        hostElementId: string, 
        positionToAttach: InsertPosition,
        newElementId?: string
    ) {
        this.templateElement = <HTMLTemplateElement>document.getElementById(templateId)!
        this.hostElement = <T>document.getElementById(hostElementId)!

        const importedNode = document.importNode(this.templateElement.content, true)
        this.element = <U>importedNode.firstElementChild
        if(newElementId) {
            this.element.id = newElementId
        }

        this.attach(positionToAttach)
    }
    
    protected attach(positionToAttach: InsertPosition) {
        this.hostElement.insertAdjacentElement(positionToAttach, this.element)
    }

    abstract configure(): void
    abstract renderContent(): void
}

class ProjectList extends Component<HTMLDivElement, HTMLElement> 
    implements DragTarget { 
    assignedProjects: Array<Project>
    
    constructor(private type: "active" | "finished") {
        super('project-list', 'app', 'beforeend', `${type}-projects`)
        this.assignedProjects = []
        
        this.configure()
        this.renderContent()
    }
    
    @AutoBind
    dragOverHandler(_: DragEvent)  {
        const listElement = this.element.querySelector('ul')!
        listElement.classList.add('droppable')
    }

    dropHandler(_: DragEvent) {

    } 

    @AutoBind
    dragLeaveHandler(_: DragEvent) {
        const listElement = this.element.querySelector('ul')!
        listElement.classList.remove('droppable')
    }

    renderContent() {
        const listId = `${this.type}-projects-list`
        this.element.querySelector('ul')!.id = listId
        
        const projectListTitleElement = this.element.querySelector('h2')!
        this.type === "active"  
        ? projectListTitleElement.innerHTML = "Active projects"   
        : projectListTitleElement.innerHTML = "Finished projects"
    }
    
    
    private renderProjects() {
        const listElement = <HTMLUListElement>document.getElementById(`${this.type}-projects-list`)!

        listElement.innerHTML = ''

        for(const project of this.assignedProjects) {
            new ProjectItem(this.element.querySelector('ul')!.id, project)
        } 
    }

    configure() {
        this.element.addEventListener('dragover', this.dragOverHandler)
        this.element.addEventListener('dragleave', this.dragLeaveHandler)
        // this.element.addEventListener('drop', this.dropHandler)

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
    }

}

class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> 
    implements Draggable {
    private project: Project

    get persons() {
        const peopleQuantity = this.project.people
        if (this.project.people === 1) {
            return '1 person'
        }
        return `${peopleQuantity} people`
    }

    constructor(hostId: string, project: Project) {
        super('single-project', hostId, 'beforeend', project.id)
        this.project = project

        this.configure()
        this.renderContent()
    }

    @AutoBind
    dragStartHandler(event: DragEvent) {
        console.log(event)
    }
    
    dragEndHandler(_: DragEvent) {
        console.log('dragend')
    }

    configure() {
        this.element.addEventListener('dragstart', this.dragStartHandler)
        this.element.addEventListener('dragend', this.dragEndHandler)
    }

    renderContent() {
        this.element.querySelector('h2')!.textContent = this.project.title
        this.element.querySelector('h3')!.textContent = `${this.persons} assigned.`
        this.element.querySelector('p')!.textContent = this.project.description
    }
    

}
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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

    renderContent() {}

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

const prjInput = ProjectInput.getInstance()

const activePrjList = new ProjectList("active")
const finishedPrjList = new ProjectList("finished")