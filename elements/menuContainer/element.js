import loadResources from "/src/utils/loadResources.js";
import customEventList from "/src/utils/customEventList.js";

class MenuContainer extends HTMLElement {
    static get observedAttributes() { 
        return ["priority-order"]; 
    }
    constructor() {
        super();
        this.load();
    }
    load(){
        const fragment = MenuContainer.template.cloneNode(true)

        this.#popup = fragment.querySelector(".popup");

        this.#shadow = this.attachShadow({mode:'open'});
        this.#shadow.adoptedStyleSheets = [MenuContainer.style];
        this.#shadow.append(fragment);
    }
    #shadow;
    #popup;

    attributeChangedCallback(name, oldValue, newValue) {
        if (name in this.attributeChangedCallbacks) {
            this.attributeChangedCallbacks[name].call(this,oldValue, newValue);
        }
    }
    
    attributeChangedCallbacks = {
        "priority-order": this.setPriorityOrder
    }

    setPriorityOrder(oldValue, newValue){
        if (!MenuContainer.exp.test(newValue)) {return;}
        let prio = [];
        newValue.split(" ").forEach(element => {prio.push(parseInt(element))});
        this.#priorityOrder = [...new Set([...prio,...MenuContainer.defaultOrder])]
    }

    #priorityOrder = MenuContainer.defaultOrder;

    connectedCallback(){

        let attributes = this.getAttributeNames();
        attributes.forEach((attribute)=>{
            let eventname = attribute.startsWith("on") ? attribute.slice(2) : null;
            if (eventname !== null && customEventList.has(eventname)){
                this[attribute] = new Function(this.getAttribute(attribute));
                this.addEventListener(eventname,this[attribute]);
            }
        })
    }

    showPopUp(){
        if (this.#isShown) {return}
        if (this.#app === null) {this.#app = document.getElementById("app")}

        let p = this.#app.awaitClickAndLock(true);

        this.show();

        this.#resolve = p.resolve;
        p.promise.then((data)=>{
            if (data === true) {this.hide();}
            this.#resolve = null;
        })
    }
    #app = null;
    #resolve = null;
    hidePopUp(){
        if (!this.#isShown) {return}
        if (this.#resolve === null) {return}
        this.#resolve(false);
        this.#resolve = null;
        this.#app.unLock();
        this.hide();
    }

    togglePopUp(){
        if (this.#isShown) {this.hidePopUp();} else {this.showPopUp();}
    }

    show(){
        if (this.#isShown) {return}
        this.#isShown = true;

        this.#popup.setAttribute("hidden","");
        let elemRect = this.getBoundingClientRect();
        let popupRect = this.#popup.getBoundingClientRect();

        let fitBottom = window.innerHeight >= (popupRect.height + elemRect.y);
        let fitTop = (elemRect.y + elemRect.height - popupRect.height) >= 0;
        let filLeft = (elemRect.x + elemRect.width - popupRect.width) >= 0;
        let fitRight = window.innerWidth >= (popupRect.width + elemRect.x);

        //order:
        // 2 | 1
        // 3 | 4
        
        let availability = {
            1:(fitTop && fitRight),
            2:(fitTop && filLeft),
            3:(fitBottom && filLeft),
            4:(fitBottom && fitRight)
        };

        let fourth = null;
        for (let i = 0; i < this.#priorityOrder.length; i++) {
            if (availability[this.#priorityOrder[i]]) {fourth = this.#priorityOrder[i];break;}                            
        }

        this.#popup.style = null;
        switch (fourth) {
            case 1:
                this.#popup.style.setProperty("--bottom",`${elemRect.y + elemRect.height}px`);
                this.#popup.style.setProperty("--left",`${elemRect.x}px`);
                break;
            case 2:
                this.#popup.style.setProperty("--bottom",`${elemRect.y + elemRect.height}px`);
                this.#popup.style.setProperty("--right",`${elemRect.x + elemRect.width}px`);
                break;
            case 3:
                this.#popup.style.setProperty("--top",`${elemRect.y}px`);
                this.#popup.style.setProperty("--right",`${elemRect.x + elemRect.width}px`);
                break;
            case 4:
                this.#popup.style.setProperty("--top",`${elemRect.y}px`);
                this.#popup.style.setProperty("--left",`${elemRect.x}px`);
                break;
            default:
                alert("menu dont fit");
            break;
        }

        this.#popup.removeAttribute("hidden");
        this.#popup.setAttribute("active","");

    }

    hide(){
        if (!this.#isShown) {return}
        this.#isShown = false;

        const f = (e)=>{
            //console.log(e.animationName);
            this.#popup.removeAttribute("disappearing");
            this.#popup.removeEventListener("animationend",f);
        }

        this.#popup.addEventListener("animationend",f);

        this.#popup.setAttribute("disappearing","");
        this.#popup.removeAttribute("active");
    }

    #isShown = false;


}

Object.defineProperty(MenuContainer,"exp",{
    value: new RegExp(/^([1-4]\s){0,3}[1-4]$/),
    enumerable: false,
    configurable: false,
    writable: false,
})

Object.defineProperty(MenuContainer,"defaultOrder",{
    value: [1,2,3,4],
    enumerable: false,
    configurable: false,
    writable: false,
})

await loadResources(MenuContainer,
    "/elements/menuContainer/element.html",
    "/elements/menuContainer/style.css"
);

const name = "menu-container";

export {MenuContainer as default,name};