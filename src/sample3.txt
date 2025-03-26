import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const DoublePendulum = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [initialAngle2, setInitialAngle2] = useState(Math.PI / 2);
  const [graphData, setGraphData] = useState([]);

  const l1 = 80, l2 = 80; // lengths of pendulum arms
  const m1 = 10, m2 = 10; // masses of pendulums
  const g = 9.81; // gravitational acceleration

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let angle1 = Math.PI / 2;
    let angle2 = initialAngle2;
    let angle1Velocity = 0;
    let angle2Velocity = 0;
    let time = 0;
    let blueTrail = [];
    let redTrail = [];

    // Reset graph data
    setGraphData([]);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const dt = 0.05;

      // Physics calculations
      const num1 = -g * (2 * m1 + m2) * Math.sin(angle1);
      const num2 = -m2 * g * Math.sin(angle1 - 2 * angle2);
      const num3 = -2 * Math.sin(angle1 - angle2) * m2;
      const num4 = angle2Velocity * angle2Velocity * l2 + angle1Velocity * angle1Velocity * l1 * Math.cos(angle1 - angle2);
      const den = l1 * (2 * m1 + m2 - m2 * Math.cos(2 * angle1 - 2 * angle2));
      const angle1Acceleration = (num1 + num2 + num3 * num4) / den;

      const num5 = 2 * Math.sin(angle1 - angle2);
      const num6 = angle1Velocity * angle1Velocity * l1 * (m1 + m2);
      const num7 = g * (m1 + m2) * Math.cos(angle1);
      const num8 = angle2Velocity * angle2Velocity * l2 * m2 * Math.cos(angle1 - angle2);
      const den2 = l2 * (2 * m1 + m2 - m2 * Math.cos(2 * angle1 - 2 * angle2));
      const angle2Acceleration = (num5 * (num6 + num7 + num8)) / den2;

      angle1Velocity += angle1Acceleration * dt;
      angle2Velocity += angle2Acceleration * dt;
      angle1 += angle1Velocity * dt;
      angle2 += angle2Velocity * dt;

      // Drawing
      const pivotX = canvas.width / 2;
      const pivotY = canvas.height / 3;
      const x1 = pivotX + l1 * Math.sin(angle1);
      const y1 = pivotY + l1 * Math.cos(angle1);
      const x2 = x1 + l2 * Math.sin(angle2);
      const y2 = y1 + l2 * Math.cos(angle2);

      // Draw pivot and arms
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'black';
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = 'gray';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw trails
      const drawTrail = (trail, color) => {
        ctx.beginPath();
        trail.forEach((point, index) => {
          ctx.lineTo(point.x, point.y);
          ctx.strokeStyle = `rgba(${color}, ${index / trail.length})`;
          ctx.stroke();
        });
      };

      blueTrail.push({ x: x1, y: y1 });
      redTrail.push({ x: x2, y: y2 });
      if (blueTrail.length > 200) blueTrail.shift();
      if (redTrail.length > 200) redTrail.shift();

      drawTrail(blueTrail, '0, 0, 255');
      drawTrail(redTrail, '255, 0, 0');

      // Draw pendulum masses
      ctx.beginPath();
      ctx.arc(x1, y1, 10, 0, 2 * Math.PI);
      ctx.fillStyle = 'blue';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x2, y2, 10, 0, 2 * Math.PI);
      ctx.fillStyle = 'red';
      ctx.fill();

      // Update graph data
      time += dt;
      setGraphData(prevData => [
        ...prevData,
        { time, angle1: angle1 % (2 * Math.PI), angle2: angle2 % (2 * Math.PI) }
      ]);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initialAngle2]);

  const handleAngleChange = (e) => {
    setInitialAngle2(parseFloat(e.target.value));
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg">
      <canvas ref={canvasRef} width={400} height={400} className="border border-gray-300 rounded mb-4" />
      <div className="w-full max-w-md mb-4">
        <label htmlFor="angle-slider" className="block text-sm font-medium text-gray-700 mb-1">
          Initial Angle of Second Pendulum: {initialAngle2.toFixed(2)} radians
        </label>
        <input
          id="angle-slider"
          type="range"
          min={0}
          max={Math.PI * 2}
          step={0.01}
          value={initialAngle2}
          onChange={handleAngleChange}
          className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      <div className="w-full max-w-2xl">
        <LineChart width={600} height={300} data={graphData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" label={{ value: 'Time', position: 'insideBottomRight', offset: -10 }} />
          <YAxis domain={[-Math.PI, Math.PI]} ticks={[-Math.PI, -Math.PI/2, 0, Math.PI/2, Math.PI]} 
                 tickFormatter={(value) => value.toFixed(2)}
                 label={{ value: 'Angle (radians)', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={(value) => value.toFixed(4)} />
          <Legend />
          <Line type="monotone" dataKey="angle1" stroke="blue" dot={false} />
          <Line type="monotone" dataKey="angle2" stroke="red" dot={false} />
        </LineChart>
      </div>
    </div>
  );
};

export default DoublePendulum;