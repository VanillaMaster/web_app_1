import loadResources from "/src/utils/loadResources.js";

class layoutView extends HTMLElement {
    static showAnimationName = "appearing-grow";
    static hideAnimationName = "disappearing-shrink"
    static scrollStopFramesThreshold = 25;

    constructor() {
        super();
        this.load();
    }
    load(){
        const fragment = layoutView.template.cloneNode(true);
        this.#scrollElement = fragment.querySelector(".view");


        let unchangedFrames = 0;
        let lastY = this.#scrollElement.scrollTop;
        const f = ()=>{
            this.setAttribute("scrolling","")
            onNextFrame();
        }
        const onNextFrame = ()=>{
            if (lastY === this.#scrollElement.scrollTop) {
                unchangedFrames++;
            } else {
                unchangedFrames = 0;
            }
            lastY = this.#scrollElement.scrollTop;
            if (unchangedFrames <= layoutView.scrollStopFramesThreshold) {
                requestAnimationFrame(onNextFrame);
            } else {
                this.removeAttribute("scrolling");
                this.#scrollElement.addEventListener("scroll",f,{passive: true, once:true})
            }
        }
        this.#scrollElement.addEventListener("scroll",f,{passive: true, once:true})


        this.#shadow = this.attachShadow({mode:'open'});
        this.#shadow.adoptedStyleSheets = [layoutView.style];
        this.#shadow.append(fragment);
    }
    #shadow;
    #scrollElement;
    //TODO: refactor
    lockScroll(){
        if (!this.#isScrollLocked) {
            this.setAttribute("unscrolable","")
            this.#isScrollLocked = true;   
        }
    }
    unLockScroll(){
        if (this.#isScrollLocked) {
            this.removeAttribute("unscrolable")
            this.#isScrollLocked = false;   
        }
    }
    #isScrollLocked = false;

    get scrollElement(){
        return this.#scrollElement;
    }

    connectedCallback(){
        this.#isShown = this.hasAttribute("active");
        
        let parent = this.parentElement;
        while (parent!== null && !(parent.tagName === "LAYOUT-CONTAINER")){
            parent = parent.parentElement;
        }
        this.#container = parent;
        
        /* teoreticly this could be faster on very large dom ...
        let parentID = window.getComputedStyle(this).getPropertyValue("--data-layout-container-id");
        let elem = document.querySelector(`[data-id=${parentID}]`)
        console.log(elem);
        */
        let name = this.getAttribute("name");
        if (name !== null) {this.#container.registerView(name,this)}
    }
    #isShown = false;
    #container;

    hide(){
        return new Promise((resolve) => {
            if (!this.#isShown) {
                resolve();
            } else {
                const f = (e)=>{if (e.animationName == layoutView.hideAnimationName) {
                    this.removeEventListener("animationend",f);
                    this.classList.remove(layoutView.hideAnimationName);
                }}
                this.#isShown = false;
                this.addEventListener("animationend",f);
                this.classList.add(layoutView.hideAnimationName);
                this.removeAttribute("active");
            }
        });
    }

    show(){
        return new Promise((resolve) => {
            if (this.#isShown){
                resolve();
            } else {
                const f = (e)=>{ if (e.animationName == layoutView.showAnimationName) {
                    this.removeEventListener("animationend",f);
                    this.classList.remove(layoutView.showAnimationName);
                    resolve();
                }}
                this.#isShown = true;
                this.addEventListener("animationend",f)
                this.classList.add(layoutView.showAnimationName);
                this.setAttribute("active","");
            }
        })
    }
}

await loadResources(layoutView,
    "/elements/layoutView/element.html",
    "/elements/layoutView/style.css"
);

const name = "layout-view";

export {layoutView as default,name};