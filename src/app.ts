/// <reference path="./components/project-list.ts" />
/// <reference path="./components/project-input.ts" />

namespace App {    
    ProjectInput.getInstance()
    new ProjectList("active")
    new ProjectList("finished")
}