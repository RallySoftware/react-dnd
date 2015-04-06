'use strict';

var DragDropActionCreators = require('../actions/DragDropActionCreators'),
    DragOperationStore = require('../stores/DragOperationStore'),
    Mouse = require('./Mouse'),
    find = require('lodash/collection/find'),
    includes = require('lodash/collection/includes'),
    merge = require('lodash/object/merge'),
    getElementRect = require('../utils/getElementRect');

var _currentComponent,
    _currentDragTarget,
    _currentDropTarget,
    _dropTargets = [];

function getDragItemTypes() {
  return [DragOperationStore.getDraggedItemType()];
}

function findDropTarget(coordinates) {
  return find(_dropTargets, (target) => {
    var rect = getElementRect(target.getDOMNode());

    if (!rect) {
      return false;
    }

    return coordinates.x >= rect.left && coordinates.x <= rect.left + rect.width && coordinates.y >= rect.top && coordinates.y <= rect.top + rect.height;
  });
}

function handleTouchMove(e) {
  var { targetTouches } = e;
  if (!targetTouches.length) {
    return;
  }

  var coordinates = getClientOffset(targetTouches[0]);

  DragDropActionCreators.drag(coordinates);

  var activeTarget = findDropTarget(coordinates);

  if (!_currentDropTarget && !activeTarget) {
    return;
  }

  var dragItemTypes = getDragItemTypes();
  if (activeTarget === _currentDropTarget) {
    _currentDropTarget.handleDragOver(dragItemTypes, e)
    return;
  }

  if (_currentDropTarget) {
    _currentDropTarget.handleDragLeave(dragItemTypes, e);
  }

  if (activeTarget) {
    activeTarget.handleDragEnter(dragItemTypes, e);
  }

  _currentDropTarget = activeTarget;
}

function handleTouchEnd(e) {
  if (_currentDropTarget) {
    _currentDropTarget.handleDrop(getDragItemTypes(), e);
  }

  var type = DragOperationStore.getDraggedItemType();
  _currentComponent.handleDragEnd(type, null);
}

function getClientOffset(e) {
  console.log('clientx:', e.clientX);
  console.log('clienty:', e.clientY);
  console.log('pagex:', e.pageX);
  console.log('pageY:', e.pageY);
  console.log('screenx:', e.screenX);
  console.log('screeny:', e.screenY);

  var ratio  = document.documentElement.clientWidth / window.innerWidth;

  if (window.devicePixelRatio) {
    ratio = window.devicePixelRatio;
  }

  return {
    x: e.clientX * ratio,
    y: e.clientY * ratio
  };
}

var Touch = {
  setup() {
  },

  teardown() {
  },

  beginDrag(component, e, containerNode, dragPreview, dragAnchors, dragStartOffset, effectsAllowed) {
    // Mouse.beginDrag(component, e, containerNode, dragPreview, dragAnchors, dragStartOffset, effectsAllowed);
    _currentComponent = component;
    _currentDragTarget = component.getDOMNode();

    _currentDragTarget.addEventListener('touchmove', handleTouchMove);
    _currentDragTarget.addEventListener('touchend', handleTouchEnd);
  },

  endDrag() {
    // Mouse.endDrag();
    _currentDragTarget.removeEventListener('touchmove', handleTouchMove);
    _currentDragTarget.removeEventListener('touchend', handleTouchEnd);

    _currentComponent = null;
    _currentDragTarget = null;
  },
  // Should this be used in the beginDrop????
  // beginDrag(component, e, containerNode, dragPreview, dragAnchors, dragStartOffset, effectsAllowed) {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   _currentComponent = component;
  //   window.addEventListener('mousemove', handleTopMouseMove);
  //   window.addEventListener('mouseup', handleTopMouseUp);
  // },
  //
  // endDrag() {
  //   _currentComponent = null;
  //   window.removeEventListener('mousemove', handleTopMouseMove);
  //   window.removeEventListener('mouseup', handleTopMouseUp);
  // },

  dragOver(e, dropEffect) {
  },

  getDragSourceProps(component, type) {
    // We need to support mouse drag and drop in the case the use has mouse support as well. Defaulting to the Mouse backend.
    // var mouseDragProps = Mouse.getDragSourceProps(component, type);
    // TODO: optimize bind when we figure this out

    // return merge(mouseDragProps, {
    //   onTouchStart: component.handleDragStart.bind(component, type)
    // });

    return {
      onTouchStart: component.handleDragStart.bind(component, type)
    };
  },

  getDropTargetProps(component, types) {
    // var mouseDropProps = Mouse.getDropTargetProps(component, types);

    if (!includes(_dropTargets, (target) => target._rootNodeID === component._rootNodeID)) {
      _dropTargets.push(component);
    }

    // return merge(mouseDropProps, {});
    return {}
  },

  getOffsetFromClient(component, e) {
    e.preventDefault();

    // if (!e.targetTouches) {
      // return Mouse.getOffsetFromClient(component, e);
    // }
    return getClientOffset(e.targetTouches[0]);
  }
};

module.exports = Touch;
