class EventEmitter {
    constructor() {
        this.events = {};
    }

    subscribe(eventName, fn) {
        if( !this.events[eventName] ) {
           this.events[eventName] = [];
        }
        this.events[eventName].push(fn);
    }

    emit(eventName, data) {
        const event = this.events[eventName];
        if(event) {
            event.forEach(fn => {
                fn.call(null, data);
            });
        }
    }

    subscribe(eventName, fn) {
        if(!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(fn);
        return () => {
            this.events[eventName] = this.events[eventName].filter(eventFn => fn !== eventFn);
        }
    }
}

const eventEmitter = new EventEmitter();

export default eventEmitter;
export {
    EventEmitter
}