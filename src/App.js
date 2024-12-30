import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Line, Rect, Circle, Text } from 'react-konva';

const DrawingBoard = () => {
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(5);
  const [lines, setLines] = useState([]);
  const [rects, setRects] = useState([]);
  const [circles, setCircles] = useState([]);
  const [texts, setTexts] = useState([]);
  const isDrawing = useRef(false);
  const currentLine = useRef(null);
  const stageRef = useRef(null);
  const eraserSize = 20;
  const [eraserPosition, setEraserPosition] = useState(null);

  const getTransformedPointerPosition = () => {
    const pos = stageRef.current.getPointerPosition();
    return { x: pos.x, y: pos.y };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (tool === 'eraser') {
        const pos = {
          x: e.clientX,
          y: e.clientY,
        };
        setEraserPosition(pos); // Update the eraser position with clientX and clientY
      }
    };
  

    // Add event listener to the document for mousemove
    document.addEventListener('mousemove', handleMouseMove);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [tool]); // Effect runs when 'tool' changes, specifically when it is set to 'eraser'

  const handlePointerDown = (e) => {
    const pos = getTransformedPointerPosition();
    let id = new Date().getTime().toString();
    if (tool === 'eraser') {
      eraseShape(e.target)
      isDrawing.current = true;
      
    } else if (tool === 'pen' || tool === 'line') {
      isDrawing.current = true;
      const newLine = { id, color, size, points: [pos.x, pos.y] };
      currentLine.current = newLine;
      setLines([...lines, newLine]);
    } else if (tool === 'rectangle') {
      isDrawing.current = true;
      setRects([...rects, {id, x: pos.x, y: pos.y, width: 0, height: 0, color, size }]);
    } else if (tool === 'circle') {
      isDrawing.current = true;
      setCircles([...circles, {id, x: pos.x, y: pos.y, radius: 0, color, size }]);
    } else if (tool === 'text') {
      isDrawing.current = true;
      setTexts([...texts, {id, x: pos.x, y: pos.y, text: 'Hello', color, size }]);
    }
  };
  const eraseShape = (target) => {
    const shapeId = target.attrs.id;
    if(!shapeId) return
    if (lines.some((line) => line.id === shapeId)) {
      setLines(lines.filter((line) => line.id !== shapeId));
    } else if (rects.some((rect) => rect.id === shapeId)) {
      setRects(rects.filter((rect) => rect.id !== shapeId));
    } else if (circles.some((circle) => circle.id === shapeId)) {
      setCircles(circles.filter((circle) => circle.id !== shapeId));
    } else if (texts.some((text) => text.id === shapeId)) {
      setTexts(texts.filter((text) => text.id !== shapeId));
    }
  };
  const handlePointerMove = (e) => {
    if (!isDrawing.current) return;
    const pos = getTransformedPointerPosition();

    if (tool === 'eraser') {
      eraseShape(e.target)
      return;
    }

    // Handling other drawing tools
    if (tool === 'pen') {
      currentLine.current.points = currentLine.current.points.concat([pos.x, pos.y]);
      setLines([...lines]);
    }
    else if(tool === 'line'){
      const [first,sec]=currentLine.current.points
      currentLine.current.points=[first,sec,pos.x, pos.y]
      setLines([...lines]);
    }
     else if (tool === 'rectangle') {
      const lastRect = rects[rects.length - 1];
      lastRect.width = pos.x - lastRect.x;
      lastRect.height = pos.y - lastRect.y;
      setRects([...rects]);
    } else if (tool === 'circle') {
      const lastCircle = circles[circles.length - 1];
      const dx = pos.x - lastCircle.x;
      const dy = pos.y - lastCircle.y;
      lastCircle.radius = Math.sqrt(dx * dx + dy * dy);
      setCircles([...circles]);
    }
  };

  const handlePointerUp = () => {
    isDrawing.current = false;
  };

  return (
    <div>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight - 100}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        ref={stageRef}
      >
        <Layer>
          {/* Drawing Lines */}
          {lines.map((line) => (
            <Line
              key={line.id}
              id={line.id}
              points={line.points}
              stroke={line.color}
              strokeWidth={line.size}
              tension={0}
              lineCap="round"
              lineJoin="round"
            />
          ))}
          {/* Drawing Rectangles */}
          {rects.map((rect) => (
            <Rect
              key={rect.id}
              id={rect.id}
              x={rect.x}
              y={rect.y}
              width={rect.width}
              height={rect.height}
              fill={rect.color}
              stroke={rect.color}
              strokeWidth={rect.size}
            />
          ))}
          {/* Drawing Circles */}
          {circles.map((circle, i) => (
            <Circle
            key={circle.id}
            id={circle.id}
              x={circle.x}
              y={circle.y}
              radius={circle.radius}
              fill={circle.color}
              stroke={circle.color}
              strokeWidth={circle.size}
            />
          ))}
          {/* Drawing Text */}
          {texts.map((text, i) => (
            <Text
            key={text.id}
            id={text.id}
              x={text.x}
              y={text.y}
              text={text.text}
              fontSize={text.size}
              fill={text.color}
            />
          ))}
        </Layer>
      </Stage>

      {/* Eraser as DOM element */}
      {tool === 'eraser' && eraserPosition && (
        <div
          style={{
            position: 'absolute',
            top: eraserPosition.y - eraserSize / 2,
            left: eraserPosition.x - eraserSize / 2,
            width: eraserSize,
            height: eraserSize,
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Tool and Color Selection */}
      <div style={{ padding: '10px', background: '#f0f0f0', display: 'flex', gap: '10px' }}>
        <label>
          <input
            type="radio"
            value="pen"
            checked={tool === 'pen'}
            onChange={() => setTool('pen')}
          />
          Pen
        </label>

        <label>
          <input
            type="radio"
            value="line"
            checked={tool === 'line'}
            onChange={() => setTool('line')}
          />
          Line
        </label>

        <label>
          <input
            type="radio"
            value="rectangle"
            checked={tool === 'rectangle'}
            onChange={() => setTool('rectangle')}
          />
          Rectangle
        </label>

        <label>
          <input
            type="radio"
            value="circle"
            checked={tool === 'circle'}
            onChange={() => setTool('circle')}
          />
          Circle
        </label>

        <label>
          <input
            type="radio"
            value="text"
            checked={tool === 'text'}
            onChange={() => setTool('text')}
          />
          Text
        </label>

        <label>
          <input
            type="radio"
            value="eraser"
            checked={tool === 'eraser'}
            onChange={() => setTool('eraser')}
          />
          Eraser
        </label>

        <label>
          Color:
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </label>

        <label>
          Size:
          <input
            type="number"
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value))}
            min="1"
            max="100"
          />
        </label>
      </div>
    </div>
  );
};

export default DrawingBoard;
