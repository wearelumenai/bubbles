import * as d3 from 'd3'

export class ContainerEvents {
  constructor (handlers, element) {
    if (handlers instanceof ContainerEvents) {
      this._copy(handlers)
    } else {
      this._init(element, handlers)
    }
    this._element = element
    this._eventHandlers = {}
    this._applyInitialHandlers()
  }

  _init (element, handlers) {
    this._initialHandlers = handlers
  }

  _copy (handlers) {
    this._initialHandlers = handlers._initialHandlers
  }

  _applyInitialHandlers () {
    if (this._initialHandlers) {
      Object.entries(this._initialHandlers).forEach(
        ([event, handler]) => {
          this.on(event, handler)
        }
      )
    }
  }

  on (event, handler) {
    if (this._eventHandlers.hasOwnProperty(event)) {
      this._eventHandlers[event].push(handler)
    } else {
      this._eventHandlers[event] = [handler]
      this._element.on(event, () => this._doEvent(event))
    }
  }

  _doEvent (event) {
    let args = []
    if (event === 'click') {
      args = this.getMousePosition()
    } else if (event === 'mousemove') {
      args = this.getMousePosition()
    }
    const handlers = this._eventHandlers[event]
    for (let i = 0; i < handlers.length; i++) {
      handlers[i](...args)
    }
  }

  getMousePosition () {
    return d3.mouse(this._element.node())
  }
}
