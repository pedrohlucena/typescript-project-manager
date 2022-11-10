import { Project, ProjectStatus } from '../models/project'

type Listener<T> = (items: Array<T>) => void

class State<T> {
    protected listeners: Array<Listener<T>> = []

    addListener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn)
    }
}

export class ProjectState extends State<Project> {

    private projects: Array<Project> = []
    private static instance: ProjectState

    private constructor() { super() }

    static getInstance() {
        if (ProjectState.instance) {
            return ProjectState.instance
        }
        this.instance = new ProjectState()
        return this.instance
    }

    addProject(title: string, description: string, people: number) {
        const project = new Project(
            Math.random().toString(),
            title, description,
            people,
            ProjectStatus.Active
        )

        this.projects.push(project)
        this.updateListeners()
    }

    moveProjects(projectId: string, newStatus: ProjectStatus) {
        const project = this.projects.find(project => project.id === projectId)
        if (project && project.status !== newStatus) {
            project.status = newStatus
            this.updateListeners()
        }
    }

    private updateListeners() {
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice())
        }
    }
}

const projectState = ProjectState.getInstance()

export default projectState