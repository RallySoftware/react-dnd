'use strict';

var DragDropActionCreators = require('../actions/DragDropActionCreators'),
    DragOperationStore = require('../stores/DragOperationStore')

var _currentComponent;

function addDragEvents() {
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
}

function removeDragEvents() {
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
}

function handleMouseMove(event) {
  var dragThreshold = 3;

  var deltaX = event.clientX - this.state.originX;
  var deltaY = event.clientY - this.state.originY;
  var distance = Math.abs(deltaX) + Math.abs(deltaY);
  var ghostPosition = {
    left: this.state.elementX + deltaX,
    top: this.state.elementY + deltaY
  };

  if (!this.state.dragging && distance > dragThreshold) {
    this.setState({dragging: true});

    this.props.onDragStart(this.props.childComponent, ghostPosition);
  } else if (this.state.dragging) {
    this.props.onDragMove(ghostPosition);
  }
}

function handleMouseUp(event) {
  if (!_currentComponent) {
    return;
  }

  _currentComponent.handleDragEnd(DragOperationStore.getDraggedItemType(), event);
}

function bindMouseDown(component, type) {
  return function (event) {
    var leftMouseButtonKey = 0;

    if (event.button === leftMouseButtonKey) {
      event.preventDefault();
      component.handleDragStart(type, event);
    }
  }
}

var Legacy = {
  setup() {
    if (typeof window === 'undefined') {
      return;
    }

  },

  teardown() {
    if (typeof window === 'undefined') {
      return;
    }
  },

  beginDrag(component, e, containerNode, dragPreview, dragAnchors, offsetFromContainer, effectsAllowed) {
    _currentComponent = component;

    addDragEvents();
  },

  endDrag() {
    _currentDragTarget = null;

    removeDragEvents();
  },

  dragOver(component, e, dropEffect) {

  },

  getDragSourceProps(component, type) {
    return {
      onMouseDown:  bindMouseDown(component, type)
    };
  },

  getDropTargetProps(component, types) {
    return {
      onMouseEnter: component.handleDragOver.bind(component, types),
      onMouseLeave: component.handleDragLeave.bind(component, types)
    };
  },

  getOffsetFromClient(component, e) {
    return getClientOffset(e);
  }
};

module.exports = Legacy;
