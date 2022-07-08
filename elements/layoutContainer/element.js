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

        fragment.querySelector(".overlay").addEventListener("pointerdown",()=>{
            this.#clickListeners.forEach((elem)=>{
                elem.resolve(elem.value);
            })
            this.unLock();
        });

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
        return new Promise((resolve,reject)=>{
            if (!this.#isShown) {
                reject();
                return;
            }
            this.#isShown = false;
            if (!useAnimation) {
                this.removeAttribute("active");
                reject();
                return;
            }

            let className = opt ? "disappearing-grow": "disappearing-shrink";
            const f = (e)=>{
                if (e.animationName == className) {
                    this.removeEventListener("animationend",f);
                    this.classList.remove(className);
                    resolve();
                }
            }

            this.addEventListener("animationend",f);
            this.classList.add(className);
            this.removeAttribute("active");
        })
    }

    show(opt,useAnimation = true){
        return new Promise((resolve,reject)=>{
            if (this.#isShown) {
                reject();
                return;
            }
            this.#isShown = true;
            if (!useAnimation) {
                this.setAttribute("active","");
                resolve();
                return;
            }
    
            let className = opt ? "appearing-grow": "appearing-shrink";
            const f = (e)=>{
                if (e.animationName == className) {
                    this.removeEventListener("animationend",f);
                    this.classList.remove(className);
                    resolve();
                }
            };
    
            this.addEventListener("animationend",f)
            this.classList.add(className);
            this.setAttribute("active","");
        })
    }

    lock(){
        if (!this.#isLocked) {
            this.setAttribute("locked","")
            this.#isLocked = true;   
        }
    }
    unLock(){
        if (this.#isLocked) {
            this.removeAttribute("locked");
            this.#isLocked = false;   
        }
    }
    #isLocked = false;

    awaitClickAndLock(resolveValue){

        let data = {};
        data["promise"] = new Promise((resolve)=>{
            data["resolve"] = resolve;
        });
        data["value"] = resolveValue;
        data["promise"].then(()=>{
            this.#clickListeners.delete(data);
        })
        this.#clickListeners.add(data);

        this.lock();

        return {promise:data.promise,resolve:data.resolve};

    }
    #clickListeners = new Set();

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