"use strict";

var difference = require("lodash/array/difference"),
    intersection = require("lodash/array/intersection"),
    ReactDOM = require("react-dom"),
    DragDropActionCreators = require("../actions/DragDropActionCreators"),
    DragOperationStore = require("../stores/DragOperationStore"),
    getElementRect = require("../utils/getElementRect");

var findDOMNode = ReactDOM.findDOMNode;
var _currentComponent;
var _dropTargetComponents;
var _currentDropTargetComponents;

function reset() {
  _dropTargetComponents = [];
  _currentDropTargetComponents = [];
}
reset();

function getDragItemTypes() {
  return [DragOperationStore.getDraggedItemType()];
}

function getComponentNodeDepth(component) {
  var depth = 0;
  var el = findDOMNode(component);
  while (el) {
    depth += 1;
    el = el.parentNode;
  }

  return depth;
}

function sortComponentNodeDepth(a, b) {
  return getComponentNodeDepth(a) > getComponentNodeDepth(b) ? -1 : 1;
}

function findDropTargets(mouseTargetEl, coordinates) {
  var targetMatcher;
  var isIE = window.navigator.appVersion.indexOf("MSIE") > -1;
  if (isIE) {
    // in IE < 11 mouseTargetEl will be the drag ghost element,
    // so we have to use less-performant coordinate math.
    targetMatcher = function (dropTargetComponent) {
      var dropTargetEl = findDOMNode(dropTargetComponent);
      var rect = getElementRect(dropTargetEl);
      if (!rect) {
        return false;
      }

      return coordinates.x >= rect.left && coordinates.x <= rect.left + rect.width && coordinates.y >= rect.top && coordinates.y <= rect.top + rect.height;
    };
  } else {
    // in other browsers mouseTargetEl will be the
    // element that's being dragged over, so we can use an optimized matcher.
    targetMatcher = function (dropTargetComponent) {
      var dropTargetEl = findDOMNode(dropTargetComponent);
      return dropTargetEl === mouseTargetEl || dropTargetEl.contains(mouseTargetEl);
    };
  }

  var matchingDropTargets = _dropTargetComponents.filter(targetMatcher);

  // nested drop target support:
  // sort the drop targets from inner-most to outer-most
  return matchingDropTargets.sort(sortComponentNodeDepth);
}

function handleTopMouseMove(e) {
  var coordinates = getClientOffset(e);
  DragDropActionCreators.drag(coordinates);

  var activeTargets = findDropTargets(e.target, coordinates);

  if (!_currentDropTargetComponents.length && !activeTargets.length) {
    return;
  }

  var dragItemTypes = getDragItemTypes();
  var newTargetComponents = difference(activeTargets, _currentDropTargetComponents);
  var lostTargetComponents = difference(_currentDropTargetComponents, activeTargets);
  var remainingTargetComponents = intersection(activeTargets, _currentDropTargetComponents);

  remainingTargetComponents.forEach(function (rtc) {
    return rtc.handleDragOver(dragItemTypes, e);
  });
  lostTargetComponents.forEach(function (ltc) {
    return ltc.handleDragLeave(dragItemTypes, e);
  });
  newTargetComponents.forEach(function (ntc) {
    return ntc.handleDragEnter(dragItemTypes, e);
  });

  _currentDropTargetComponents = activeTargets;
}

function handleDragStart(component, type, e) {
  if (e.button && e.button != 0) {
    return;
  }

  component.handleDragStart(type, e);
}

function handleTopMouseUp(e) {
  _currentDropTargetComponents.some(function (cdtc) {
    return cdtc.handleDrop(getDragItemTypes(), e);
  });

  var type = DragOperationStore.getDraggedItemType();
  _currentComponent.handleDragEnd(type, null);
}

function getClientOffset(e) {
  return {
    x: e.clientX,
    y: e.clientY
  };
}

var Mouse = {
  setup: function setup() {},

  teardown: function teardown() {
    reset();
  },

  unmountDragDropComponent: function unmountDragDropComponent(component) {
    _dropTargetComponents = _dropTargetComponents.filter(function (dropTargetComponent) {
      return dropTargetComponent !== component;
    });
  },

  beginDrag: function beginDrag(component, e, containerNode, dragPreview, dragAnchors, dragStartOffset, effectsAllowed) {
    e.preventDefault();
    e.stopPropagation();

    _currentComponent = component;
    window.addEventListener("mousemove", handleTopMouseMove);
    window.addEventListener("mouseup", handleTopMouseUp);
  },

  endDrag: function endDrag() {
    _currentComponent = null;
    _currentDropTargetComponents = [];
    window.removeEventListener("mousemove", handleTopMouseMove);
    window.removeEventListener("mouseup", handleTopMouseUp);
  },

  dragOver: function dragOver(e, dropEffect) {},

  getDragSourceProps: function getDragSourceProps(component, type) {
    return {
      onMouseDown: function (evt) {
        handleDragStart(component, type, evt);
      }
    };
  },

  getDropTargetProps: function getDropTargetProps(component, types) {
    if (_dropTargetComponents.indexOf(component) < 0) {
      // side effect city!
      //
      // when this function is called
      // we know the component is a drop target
      // and we need to keep track of it so we
      // can test to see if the mouse is over it.
      _dropTargetComponents.push(component);
    }

    return {};
  },

  getOffsetFromClient: function getOffsetFromClient(component, e) {
    return getClientOffset(e);
  }
};

module.exports = Mouse;