import loadResources from "/src/utils/loadResources.js";

class AppContainer extends HTMLElement {
    constructor() {
        super();
        this.load();
    }
    load(){
        const fragment = AppContainer.template.cloneNode(true);

        fragment.querySelector(".overlay").addEventListener("pointerdown",()=>{
            this.#clickListeners.forEach((elem)=>{
                elem.resolve(elem.value);
            })
            this.unLock();
        });

        this.#shadow = this.attachShadow({mode:'open'});
        this.#shadow.adoptedStyleSheets = [AppContainer.style];
        this.#shadow.append(fragment);
    }
    #shadow;
    #isLocked = false;

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
    get set(){
        return this.#clickListeners;
    }


    connectedCallback(){
       
    }
   

}

await loadResources(AppContainer,
    "/elements/appContainer/element.html",
    "/elements/appContainer/style.css"
);

const name = "app-container";

export {AppContainer as default,name};