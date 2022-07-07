class NavButton extends HTMLButtonElement{
    constructor() {
        super();
    }
    #layoutContainer = null;

    get layoutContainer(){
        if (this.#layoutContainer === null) {
            let containerId = window.getComputedStyle(this).getPropertyValue('--data-layout-container-id');
            this.#layoutContainer = document.querySelector(`[data-id=${containerId}]`);
        }
        return this.#layoutContainer;
    }
}

const name = 'nav-button';
const options = {extends: 'button'};

export {NavButton as default,name,options};