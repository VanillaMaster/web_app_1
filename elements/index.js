const dependencies = [
    "/elements/listViewItem/element.js",
    "/elements/layoutView/element.js",
    "/elements/layoutContainer/element.js",
    "/elements/appContainer/element.js",
    "/elements/containerRipple/element.js",
    "/elements/menuContainer/element.js",
    "/elements/navButton/element.js"
]

let imports = [];

dependencies.forEach((dependency)=>{
    imports.push(import(dependency))
});

const modules = await Promise.all(imports);

modules.forEach((module_)=>{
    customElements.define(module_.name,module_.default,module_.options|| {});
})

console.log(modules);


// this should depends on initial loaction
window.router.goto(window.location.pathname)