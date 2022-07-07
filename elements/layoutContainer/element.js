import loadResources from "/src/utils/loadResources.js";
import idGen from "/src/utils/idGen.js";

class LayoutContainer extends HTMLElement {
    constructor() {
        super();

        let id = LayoutContainer.idGne.next().value;
        this.style.setProperty("--data-layout-container-id",id);
        this.dataset.id = id;
        
        this.load();
    }
    load(){
        const fragment = LayoutContainer.template.cloneNode(true);
        this.#shadow = this.attachShadow({mode:'open'});
        this.#shadow.adoptedStyleSheets = [LayoutContainer.style];
        this.#shadow.append(fragment);

    }
    #shadow;

    connectedCallback(){

        const path = this.getAttribute("path")
        try {if (path) {window.router.registerLayout(this,path)}}
        catch (e) {console.error("router error (on: \"registerLayout\")")}
    }
    #isShown = false;

    registerView(name,view){
        this.#layoutViews.set(name,view);
    }
    #layoutViews = new Map();

    getViewByName(name){
        return this.#layoutViews.get(name);
    }

    showView(name){
        let targetView = this.#layoutViews.get(name);
        this.#layoutViews.forEach((view)=>{
            if (view!==targetView) {view.hide()}
        });
        targetView.show();
    }

    hide(opt,useAnimation = true){
        if (!this.#isShown) {return;}
        this.#isShown = false;
        if (!useAnimation) {this.removeAttribute("active");return;}
        let className = opt ? "disappearing-grow": "disappearing-shrink";
        const f = (e)=>{
            if (e.animationName == className) {
                this.removeEventListener("animationend",f);
                this.classList.remove(className);
            }
        }
        this.addEventListener("animationend",f);
        this.classList.add(className);
        this.removeAttribute("active");
    }

    show(opt,useAnimation = true){
        if (this.#isShown) {return;}
        this.#isShown = true;
        if (!useAnimation) {this.setAttribute("active","");return;}
        let className = opt ? "appearing-grow": "appearing-shrink";
        const f = (e)=>{
            if (e.animationName == className) {
                this.removeEventListener("animationend",f);
                this.classList.remove(className);
            }
        };
        this.addEventListener("animationend",f)
        this.classList.add(className);
        this.setAttribute("active","");
    }

}

Object.defineProperty(LayoutContainer,"idGne",{
    value: idGen("lc"),
    enumerable: false,
    configurable: false,
    writable: false,
});

await loadResources(LayoutContainer,
    "/elements/layoutContainer/element.html",
    "/elements/layoutContainer/style.css"
);

const name = "layout-container";

export {LayoutContainer as default,name};