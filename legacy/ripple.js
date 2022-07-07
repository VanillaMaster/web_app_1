
const implementRipple = (function(){

    //native OnePlus touch sound
    const click_sound = new Audio("https://vanillamaster.github.io/ui/Effect_Tick.ogg")

    //const registerFinalizer = new FinalizationRegistry(message => {console.log(message)});

    function onPointerUp(e,target=null){
        click_sound.currentTime = 0;
        click_sound.play();
        if (target !== null) {
            target.dispatchEvent(new Event("rippleclick"));
        }
    }


    return function /*implementRipple*/(body,hitbox=null,eventTarget=null,rippleEffectContainer=null){

        if (hitbox === null) {hitbox = body;}
        if (eventTarget === null) {eventTarget = body;}
        if (rippleEffectContainer === null) {rippleEffectContainer = body;}

        const pointerUp = (e)=>{onPointerUp(e,eventTarget)}

        body.addEventListener("pointerdown",(e)=>{
            const ripple = document.createElement("div");
            //registerFinalizer.register(ripple, "ripple elem deleted")

            //ripple.classList.add("effect-ripple");
            ripple.setAttribute("slot","effect-ripple")
            
            ripple.style.setProperty("--x",`${e.layerX}px`);
            ripple.style.setProperty("--y",`${e.layerY}px`);

            const f = ()=>{rippleEffectContainer.removeChild(ripple);}
            ripple.addEventListener("transitionend",f);
            ripple.addEventListener("transitioncancel",f)
            //registerFinalizer.register(f, "ripple elem deleted")

            rippleEffectContainer.append(ripple);
        
            hitbox.addEventListener("pointerup",pointerUp);
            hitbox.addEventListener("pointerleave",(e)=>{
                ripple.setAttribute("disappearing","");
                hitbox.removeEventListener("pointerup",pointerUp);
            },{once:true});
        })
        
        hitbox.addEventListener("gotpointercapture",(e)=>{
            hitbox.releasePointerCapture(e.pointerId);
        })
        
        hitbox.addEventListener("contextmenu",(e)=>{
            e.preventDefault();
            hitbox.removeEventListener("pointerup",pointerUp);
        })
        
        //fix for mouse
        hitbox.addEventListener("mouseup",(e)=>{
            hitbox.dispatchEvent(new Event("pointerleave"))
        })


    }

})();


document.addEventListener("DOMContentLoaded",()=>{

    (function(ripple_elements){
        for (const element of ripple_elements) {
            implementRipple(element,element.querySelector(".ripple-hitbox"))
        }
    })(document.querySelectorAll(".ripple"));
    
},{once:true})