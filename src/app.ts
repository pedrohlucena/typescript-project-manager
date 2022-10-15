class ProjectInput {
    templateElement: HTMLTemplateElement
    hostElement: HTMLDivElement
    element: HTMLFormElement
    public static instance: ProjectInput 

    private constructor() {
        this.templateElement = <HTMLTemplateElement>document.getElementById('project-input')!
        this.hostElement = <HTMLDivElement>document.getElementById('app')! 

        const importedNode = document.importNode(this.templateElement.content, true)
        this.element = importedNode.firstElementChild as HTMLFormElement 
        this.attach()
    }

    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element)
    }

    static getInstance() {
        if(ProjectInput.instance) {
            return ProjectInput.instance
        }
        ProjectInput.instance = new ProjectInput()
        return ProjectInput.instance
    }
}

const prjInput1 = ProjectInput.getInstance() // this instance
const prjInput2 = ProjectInput.getInstance() // is the same instance as this one