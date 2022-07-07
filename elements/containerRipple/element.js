import loadResources from "/src/utils/loadResources.js";

//native OnePlus touch sound
const click_sound = new Audio("https://vanillamaster.github.io/ui/Effect_Tick.ogg")

class ContainerRipple extends HTMLElement {
    constructor() {
        super();
        this.load();
    }
    load(){
        const fragment = ContainerRipple.template.cloneNode(true)

        let container = fragment.querySelector(".ripple");

        this.addEventListener("pointerdown",(e)=>{
            const isDirect = (e.target === this);

            const ripple = document.createElement("div");

            ripple.classList.add("effect-ripple");

            let rect = container.getBoundingClientRect();
            // 0 <= x <= rect.width/height
            let x = (e.layerX >= 0) ? ((e.layerX <= rect.width ) ? e.layerX : rect.width ) : 0;
            let y = (e.layerY >= 0) ? ((e.layerY <= rect.height) ? e.layerY : rect.height) : 0;

            ripple.style.setProperty("--x",`${x}px`);
            ripple.style.setProperty("--y",`${y}px`);

            const f = (e)=>{container.removeChild(ripple);}
            ripple.addEventListener("transitionend",f);
            ripple.addEventListener("transitioncancel",f)

            container.append(ripple);

            const onPointerUp = (e)=>{
                this.onPointerUp(e,isDirect)
            };
            const onContextMenu = (e)=>{
                this.onContextMenu(e,isDirect);
                this.removeEventListener("pointerup",onPointerUp)
            };

            this.addEventListener("contextmenu",onContextMenu);
            this.addEventListener("pointerup",onPointerUp);
            
            this.addEventListener("pointerleave",(e)=>{
                ripple.setAttribute("disappearing","");
                this.removeEventListener("pointerup",onPointerUp);
                this.removeEventListener("contextmenu",onContextMenu);
            },{once:true});
        });

        this.addEventListener("gotpointercapture",(e)=>{
            this.releasePointerCapture(e.pointerId);
        })
        
        //fix for mouse
        this.addEventListener("mouseup",(e)=>{
            this.dispatchEvent(new Event("pointerleave"))
        })

        this.#shadow = this.attachShadow({mode:'open'});
        this.#shadow.adoptedStyleSheets = [ContainerRipple.style];
        this.#shadow.append(fragment);
    }
    #shadow;

    connectedCallback(){
    }

    onPointerUp(e,dispatchEvent = true){
        click_sound.currentTime = 0;
        click_sound.play();
        if (dispatchEvent) {
        for (const elem of this.children) {
            ContainerRipple.pointerUpEvents.forEach((event)=>{
                elem.dispatchEvent(event);
            })
        }}
    }

    onContextMenu(e,dispatchEvent = true){
        e.preventDefault();
        if (dispatchEvent) {
        for (const elem of this.children) {
            ContainerRipple.contextMenuEvents.forEach((event)=>{
                elem.dispatchEvent(event);
            })
        }}
    }
}

Object.defineProperty(ContainerRipple,"pointerUpEvents",{
    value: [new Event("click"),new Event("rippleclick",{bubbles:true})],
    enumerable: false,
    configurable: false,
    writable: false,
});

Object.defineProperty(ContainerRipple,"contextMenuEvents",{
    value: [new Event("contextmenu"),new Event("ripplehold")],
    enumerable: false,
    configurable: false,
    writable: false,
});

await loadResources(ContainerRipple,
    "/elements/containerRipple/element.html",
    "/elements/containerRipple/style.css"
);

const name = "container-ripple";

export {ContainerRipple as default,name};