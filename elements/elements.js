const ContainerRipple = (function(){

    //native OnePlus touch sound
    const click_sound = new Audio("https://vanillamaster.github.io/ui/Effect_Tick.ogg")
    
    class ContainerRipple extends HTMLElement {
        constructor() {
            super();
            this.load();
        }
        load(){
            const fragment = ContainerRipple.template.cloneNode(true)
    
            let container = fragment.querySelector(".container");
    
            this.addEventListener("pointerdown",(e)=>{
                const ripple = document.createElement("div");
    
                ripple.classList.add("effect-ripple");
    
                ripple.style.setProperty("--x",`${e.layerX}px`);
                ripple.style.setProperty("--y",`${e.layerY}px`);
    
                const f = (e)=>{container.removeChild(ripple);}
                ripple.addEventListener("transitionend",f);
                ripple.addEventListener("transitioncancel",f)
    
                container.append(ripple);
    
                this.addEventListener("contextmenu",this.onContextMenu);
                this.addEventListener("pointerup",this.onPointerUp);
                
                this.addEventListener("pointerleave",(e)=>{
                    ripple.setAttribute("disappearing","");
                    this.removeEventListener("pointerup",this.onPointerUp);
                    this.removeEventListener("contextmenu",this.onContextMenu);
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
            this.#shadow.append(fragment);
        }
        #shadow;
    
        onPointerUp(e){
            click_sound.currentTime = 0;
            click_sound.play();
            const event = new Event("click");
            for (const elem of this.children) {
                elem.dispatchEvent(event)
            }
            this.removeEventListener("contextmenu",this.onContextMenu);
        }
    
        onContextMenu(e){
            e.preventDefault();
            this.removeEventListener("pointerup",this.onPointerUp);
            const event = new Event("contextmenu");
            for (const elem of this.children) {
                elem.dispatchEvent(event)
            }
        }
    }
    
    const html = 
    `<link rel="stylesheet" href="/elements/containerRipple/style.css">
    <div class="container">
        <div class="content">
            <slot></slot>
        </div>
    </div>`
    
    Object.defineProperty(ContainerRipple,"template",{
        value: document.createRange().createContextualFragment(html),
        enumerable: false,
        configurable: false,
        writable: false,
    });
    
    return ContainerRipple;
    
})();
    
customElements.define("container-ripple",ContainerRipple)

const LayoutContainer = (function(){

    class LayoutContainer extends HTMLElement {
        constructor() {
            super();
            this.load();
        }
        load(){
            const fragment = LayoutContainer.template.cloneNode(true);
            this.#shadow = this.attachShadow({mode:'open'});
            this.#shadow.append(fragment);
        }
        #shadow;
    
        connectedCallback(){

            let id = LayoutContainer.idGne.next().value;
            this.style.setProperty("--data-layout-container-id",id);
            this.dataset.id = id;

            this.#isShown = this.hasAttribute("active");
        
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
    
        hide(opt){
            if (!this.#isShown) {return;}
            let className = opt ? "disappearing-grow": "disappearing-shrink";
            const f = (e)=>{
                if (e.animationName == className) {
                    this.removeEventListener("animationend",f);
                    this.classList.remove(className);
                }
            }
            this.#isShown = false;
            this.addEventListener("animationend",f);
            this.classList.add(className);
            this.removeAttribute("active");
        }
    
        show(opt){
            if (this.#isShown) {return;}
            let className = opt ? "appearing-grow": "appearing-shrink";
            const f = (e)=>{
                if (e.animationName == className) {
                    this.removeEventListener("animationend",f);
                    this.classList.remove(className);
                }
            };
            this.#isShown = true;
            this.addEventListener("animationend",f)
            this.classList.add(className);
            this.setAttribute("active","");
        }
    
    }
    
    Object.defineProperty(LayoutContainer,"idGne",{
        value: window.utils.idGen("lc"),
        enumerable: false,
        configurable: false,
        writable: false,
    });
    
    const html =
    `<link rel="stylesheet" href="/elements/layoutContainer/style.css">
    <div class="wrapper">
        <slot name="controll-top"></slot>
        <div class="layout-body">
            <slot></slot>
        </div>
        <slot name="controll-bottom"></slot>
    </div>`
    
    Object.defineProperty(LayoutContainer,"template",{
        value: document.createRange().createContextualFragment(html),
        enumerable: false,
        configurable: false,
        writable: false,
    });

    return LayoutContainer;

})();

customElements.define("layout-container",LayoutContainer);

const layoutView = (function(){

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
            this.#shadow.append(fragment);
        }
        #shadow;
        #scrollElement;
    
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
    
    const html = 
    `<link rel="stylesheet" href="/elements/layoutView/style.css">
    <div class="view">
        <div class="content-wrapper">
            <slot></slot>
        </div>
    </div>`
    
    Object.defineProperty(layoutView,"template",{
        value: document.createRange().createContextualFragment(html),
        enumerable: false,
        configurable: false,
        writable: false,
    });

    return layoutView;

})();

customElements.define("layout-view",layoutView);

const ListViewItem = (function(){

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
            this.#shadow.append(fragment);
        }
        #shadow;
    
        connectedCallback(){
            this.#isSelected = this.hasAttribute("selected")
            this.addEventListener("contextmenu",(e)=>{
                //console.log(e.isTrusted);
                if (e.isTrusted === false) {
                    this.toggleSelection();
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
    
    
    const html = 
    `<link rel="stylesheet" href="/elements/listViewItem/style.css">
    <div class="container">
        <div class="left">
            <slot name="icon"><img class="default-img" src="https://VanillaMaster.github.io/placeholder_image.png"></slot>
        </div>
        <div class="middle"><slot></slot></div>
        <div class="right"><slot name="controll"></slot></div>
    </div>`
    
    Object.defineProperty(ListViewItem,"template",{
        value: document.createRange().createContextualFragment(html),
        enumerable: false,
        configurable: false,
        writable: false,
    });

    return ListViewItem;
})();

customElements.define("list-view-item",ListViewItem)