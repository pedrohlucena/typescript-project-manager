export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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