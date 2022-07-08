import loadResources from "/src/utils/loadResources.js";

class AppContainer extends HTMLElement {
    constructor() {
        super();
        this.load();
    }
    load(){
        const fragment = AppContainer.template.cloneNode(true);

        this.#shadow = this.attachShadow({mode:'open'});
        this.#shadow.adoptedStyleSheets = [AppContainer.style];
        this.#shadow.append(fragment);
    }
    #shadow;

    connectedCallback(){
       
    }
   

}

await loadResources(AppContainer,
    "/elements/appContainer/element.html",
    "/elements/appContainer/style.css"
);

const name = "app-container";

export {AppContainer as default,name};