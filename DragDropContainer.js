import React from 'react'
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext, DropTarget, DragSource } from 'react-dnd'

let DropZone = ({ children, style, activeStyle, canDrop, isOver, connectDropTarget }) => {
  const isActive = canDrop && isOver
  return (
    <div ref={connectDropTarget} style={isActive ? (activeStyle || style) : style}>
      {children}
    </div>
  )
}

DropZone = DropTarget(
  'item',
  { drop: (props, monitor) => ({clientOffset: monitor.getClientOffset()}) },
  (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
  }),
)(DropZone)

let DragItem = ({ name, style, draggingStyle, isDragging, connectDragSource }) =>  (
  <div ref={connectDragSource} style={isDragging ? (draggingStyle || style) : style}>
    {name}
  </div>
)


DragItem = DragSource(
  'item',
  {
    beginDrag: props => props,
    endDrag(props, monitor) {
      const item = monitor.getItem()
      const dropResult = monitor.getDropResult()
      if (dropResult) {
        props.onDrop && props.onDrop({name: item.name}, dropResult)
      }
    },
  },
  (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  }),
)(DragItem)


const DragDropContainer = ({children, zoneStyle, zoneActiveStyle, itemStyles, itemStyle, itemDraggingStyle, onDrop, items = []}) => (
  <>
    <DropZone style={zoneStyle} activeStyle={zoneActiveStyle}>
      {children}
    </DropZone>
    <div style={itemStyles}>
      {items.map((item, idx) =>
        <DragItem
          key={`item_${idx}`}
          name={item.name}
          style={itemStyle}
          draggingStyle={itemDraggingStyle}
          onDrop={onDrop}
        />
      )}
    </div>
  </>
)


export default DragDropContext(HTML5Backend)(DragDropContainer)

