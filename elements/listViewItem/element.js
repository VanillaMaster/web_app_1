import loadResources from "/src/utils/loadResources.js";
import customEventList from "/src/utils/customEventList.js";

class ListViewItem extends HTMLElement {
    constructor() {
        super();
        this.load();
    }
    load(){
        const fragment = ListViewItem.template.cloneNode(true)

        //click on icon to toggle selection (click insted of press on body)
        let iconHolder = fragment.querySelector(".left");
        const onPointerUp = (e)=>{this.toggleSelection();}
        iconHolder.addEventListener("pointerdown",(e)=>{
            iconHolder.addEventListener("pointerup",onPointerUp,{once:true})

            iconHolder.addEventListener("pointerleave",(e)=>{
                iconHolder.removeEventListener("pointerup",onPointerUp)
            },{once:true})

            //e.stopPropagation();
        })
        iconHolder.addEventListener("gotpointercapture",(e)=>{
            iconHolder.releasePointerCapture(e.pointerId);
        })
        iconHolder.addEventListener("contextmenu",(e)=>{
            e.stopPropagation();
        });



        this.#shadow = this.attachShadow({mode:'open'});
        this.#shadow.adoptedStyleSheets = [ListViewItem.style];
        this.#shadow.append(fragment);
    }
    #shadow;

    connectedCallback(){
        this.#isSelected = this.hasAttribute("selected")

        let attributes = this.getAttributeNames();
        attributes.forEach((attribute)=>{
            let eventname = attribute.startsWith("on") ? attribute.slice(2) : null;
            if (eventname !== null && customEventList.has(eventname)){
                this[attribute] = new Function(this.getAttribute(attribute));
                this.addEventListener(eventname,this[attribute]);
            }
        })
    }
    toggleSelection(){
        if (this.#isSelected){
            this.removeAttribute("selected");
            this.#isSelected = false;
        } else {
            this.setAttribute("selected","");
            this.#isSelected = true;
        }
    }
    #isSelected = false;

}

await loadResources(ListViewItem,
    "/elements/listViewItem/element.html",
    "/elements/listViewItem/style.css"
);

const name = "list-view-item";

export {ListViewItem as default,name};