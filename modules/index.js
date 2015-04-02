'use strict';

var { HTML5, Mouse, Touch } = require('./backends'),
    createDragDropMixin = require('./utils/createDragDropMixin');

module.exports = {
  DragDropMixin: createDragDropMixin(HTML5),
  MouseDragDropMixin: createDragDropMixin(Mouse),
  TouchDragDropMixin: createDragDropMixin(Touch),
  ImagePreloaderMixin: require('./mixins/ImagePreloaderMixin'),
  DragLayerMixin: require('./mixins/DragLayerMixin'),
  HorizontalDragAnchors: require('./constants/HorizontalDragAnchors'),
  VerticalDragAnchors: require('./constants/VerticalDragAnchors'),
  NativeDragItemTypes: require('./constants/NativeDragItemTypes'),
  DropEffects: require('./constants/DropEffects')
};
