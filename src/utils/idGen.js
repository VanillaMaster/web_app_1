function* IdGen(prefix) {
    var index = 0;
    while(true) yield `${prefix}-${index++}`;
}

export default IdGen;