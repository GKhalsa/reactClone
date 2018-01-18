class Component {
    constructor(props) {
        this.props = props;
    }

    setState(partialState) {
        const componentWrapperInstance = ReactInstanceMap.get(this);
        componentWrapperInstance._pendingPartialState = partialState;
        componentWrapperInstance.performUpdate();
    }
    
}

class ReactDOMComponent {
    constructor(element) {
        this._currentElement = element;
    }

    mountComponent(container) {
        const domElement = document.createElement(this._currentElement.type);
        const text = this._currentElement.props.children;
        const textNode = document.createTextNode(text);
        domElement.appendChild(textNode);
        container.appendChild(domElement);
    }

    performUpdate() {
        console.log("hey I'm 'updated'")
        
    }
}

class ComponentWrapper {
    constructor(element) {
        this._currentElement = element
    }

    mountComponent(container) {
        const ComponentType = this._currentElement.type  //  => App
        const componentInstance = new ComponentType(this._currentElement.props)  // See note 1
        this._instance = componentInstance;

        ReactInstanceMap.set(componentInstance, this)

        if (componentInstance.componentWillMount) {
            componentInstance.componentWillMount()
        }

        this._performInitialMount(componentInstance, container)

        if (componentInstance.componentDidMount) {
            componentInstance.componentDidMount()
        } 
    }

    performUpdate() {
        const inst = this._instance; 
        const nextState = Object.assign({}, inst.state, this._pendingPartialState);
        inst.state = nextState;
        this._pendingPartialState = null;
        const nextRenderedElement = inst.render();
        debugger;
        this._childComponentWrapper.performUpdate();
    }
    
    _performInitialMount(componentInstance, container) {
        const element = componentInstance.render();
        const child = instantiateReactComponent(element); 
        this._childComponentWrapper = child;
        child.mountComponent(container);
    }
}

function instantiateReactComponent(element) {
    if (typeof element.type === 'string') {
        return new ReactDOMComponent(element);
    } else if (typeof element.type === 'function') {
        return new ComponentWrapper(element);
    }
}

const ReactInstanceMap = {
    set(key, value) {
        key.__reactWrapperInstance = value;
    },
    get(key) {
        return key.__reactWrapperInstance;
    }
}

React = {
    createElement(type, props, children) {
        const element = {
            type,
            props: props || {}
        };

        if (children) {
            element.props.children = children;
        }

        return element;
    }
}

ReactDOM = {
    render(element, container) {
        const componentWrapperInstance = new ComponentWrapper(element);
        componentWrapperInstance.mountComponent(container);
    }
}

class App extends Component{

    constructor(props) {
        super(props)
        this.state = {num: 0}
    }

    componentDidMount() {
        this.setState({num: 1})
    }

    render() {
        console.log(this.state.num)
        return React.createElement('div', null, this.props.message)
    }
}


ReactDOM.render(React.createElement(App, { message: "this is the result of calling this.props.message"}), document.getElementById('root'));