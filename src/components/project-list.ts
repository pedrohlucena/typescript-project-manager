import Component from './base-component.js'
import AutoBind from '../decorators/autobind.js'
import projectState from '../state/project-state.js'
import ProjectItem from '../components/project-item.js'
import { Project, ProjectStatus } from '../models/project.js'
import { DragTarget } from '../models/drag-drop.js'

export default class ProjectList extends Component<HTMLDivElement, HTMLElement>
    implements DragTarget {
    assignedProjects: Array<Project>

    constructor(private type: "active" | "finished") {
        super('project-list', 'app', 'beforeend', `${type}-projects`)
        this.assignedProjects = []

        this.configure()
        this.renderContent()
    }

    @AutoBind
    dragOverHandler(event: DragEvent) {
        if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
            event.preventDefault()
            const listElement = this.element.querySelector('ul')!
            listElement.classList.add('droppable')
        }
    }

    @AutoBind
    dropHandler(event: DragEvent) {
        const projectId = event.dataTransfer!.getData('text/plain')
        projectState.moveProjects(
            projectId,
            this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished
        )
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

        for (const project of this.assignedProjects) {
            new ProjectItem(this.element.querySelector('ul')!.id, project)
        }
    }

    configure() {
        this.element.addEventListener('dragover', this.dragOverHandler)
        this.element.addEventListener('dragleave', this.dragLeaveHandler)
        this.element.addEventListener('drop', this.dropHandler)

        projectState.addListener((projects: Array<Project>) => {
            const relevantProjects = projects.filter(project => {
                if (this.type === 'active') {
                    return project.status === ProjectStatus.Active
                }
                return project.status === ProjectStatus.Finished
            })

            this.assignedProjects = relevantProjects
            this.renderProjects()
        })
    }
}