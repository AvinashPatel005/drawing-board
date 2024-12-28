import React, { useEffect, useRef, useState } from 'react';
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
  const pressure = useRef(null);
  // Function to get pointer position adjusted for transformations
  const getTransformedPointerPosition = () => {
    const pos = stageRef.current.getPointerPosition();
    return { x: pos.x, y: pos.y };
  };

  // Handle start of drawing: Start drawing based on selected tool
  const handlePointerDown = (e) => {
    const pos = getTransformedPointerPosition();
    if(e.evt.pointerType==="touch"){
      pressure.current.innerText = "Nooooo"
      return
    }
    
    if (tool === 'pen' || tool === 'line') {
      isDrawing.current = true;
      currentLine.current = { color, size, points: [pos.x, pos.y] };
      setLines([...lines, currentLine.current]);
    } else if (tool === 'rectangle') {
      isDrawing.current = true;
      setRects([...rects, { x: pos.x, y: pos.y, width: 0, height: 0, color, size }]);
    } else if (tool === 'circle') {
      isDrawing.current = true;
      setCircles([...circles, { x: pos.x, y: pos.y, radius: 0, color, size }]);
    } else if (tool === 'text') {
      isDrawing.current = true;
      setTexts([...texts, { x: pos.x, y: pos.y, text: 'Sample', color, size }]);
    }
  };

  // Handle mouse/touch move: Continue drawing based on selected tool
  const handlePointerMove = (e) => {
    // If not drawing, return
    if(e.evt.pointerType==="touch"){
      pressure.current.innerText = "Nooooo"
      return
    }
    if (!isDrawing.current) return;
    // if(e.evt.pointerType==="mouse" || e.evt.pointerType==="pen")
    //   pressure.current.innerText = e.evt.pressure +" ,"+ e.evt.tangentialPressure +" ,"+e.evt.tiltX+" ,"+e.evt.tiltX
    const pos = getTransformedPointerPosition();

    // Check if pointer is within the canvas bounds (stage width/height)
    const stageWidth = stageRef.current.width();
    const stageHeight = stageRef.current.height();

    if (pos.x < 0 || pos.x > stageWidth || pos.y < 0 || pos.y > stageHeight) {
      isDrawing.current = false; // Stop drawing if the pointer is out of bounds
      return;
    }

    if (tool === 'pen' || tool === 'line') {
      currentLine.current.points = currentLine.current.points.concat([pos.x, pos.y]);
      setLines([...lines]);
    } else if (tool === 'rectangle') {
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

  // Handle mouse/touch up: Finish drawing
  const handlePointerUp = () => {
    isDrawing.current = false;
  };

  return (
    <div>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight - 100}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        ref={stageRef}
      >
        <Layer>
          {/* Drawing Lines */}
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.color}
              strokeWidth={line.size}
              tension={0}
              lineCap="round"
              lineJoin="round"
            />
          ))}
          {/* Drawing Rectangles */}
          {rects.map((rect, i) => (
            <Rect
              key={i}
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
              key={i}
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
              key={i}
              x={text.x}
              y={text.y}
              text={text.text}
              fontSize={text.size}
              fill={text.color}
            />
          ))}
        </Layer>
      </Stage>

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
            onChange={(e) => setSize(parseInt(e.target.value, 10))}
            min="1"
            max="50"
          />
        </label>
      </div>
      <div ref={pressure}></div>
    </div>
  );
};

export default DrawingBoard;
