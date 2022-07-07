function loadResources(element,htmlPath,cssPath){
    // y, mb i should stor it directly in js, but its not fair... ¯\_(ツ)_/¯
    const tasks = [
        //load html
        new Promise((resolve)=>{
            fetch(htmlPath).then(data=>{
                return data.text();
            }).then(html=>{
                Object.defineProperty(element,"template",{
                    value: document.createRange().createContextualFragment(html),
                    enumerable: false,
                    configurable: false,
                    writable: false,
                });
                resolve();
            })
        }),
        //load css
        new Promise((resolve)=>{
            fetch(cssPath).then(data=>{
                return data.text();
            }).then(css=>{
                return (new CSSStyleSheet).replace(css);
            }).then(style=>{
                Object.defineProperty(element,"style",{
                    value: style,
                    enumerable: false,
                    configurable: false,
                    writable: false,
                });
                resolve();
            })
        })
    ];
    return Promise.all(tasks);
}

export default loadResources;