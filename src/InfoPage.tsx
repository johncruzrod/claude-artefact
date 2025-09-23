import { useState, useEffect, useRef, useCallback, MouseEvent as ReactMouseEvent } from 'react'; // Re-added useCallback and ReactMouseEvent
import { HelpCircle, FileText, Settings, ArrowLeft, Shield } from 'lucide-react'; // Removed Code, CheckCircle, XCircle
import { Link } from 'react-router-dom';

// --- Bubble Background Component (New) ---
// We will define this component below

// --- Main Info Page Component ---
function InfoPage() {
  return (
    // Add position: relative to contain the absolute bubbles
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '2rem auto', position: 'relative', zIndex: 1 }}> 
      
      {/* Back Link */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link 
          to="/" 
          style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            textDecoration: 'none', 
            color: '#D97757', 
            fontWeight: 500,
            padding: '0.5rem 1rem',
            border: '1px solid transparent',
            borderRadius: '4px',
            transition: 'background-color 0.2s, color 0.2s, border-color 0.2s',
            backgroundColor: 'rgba(255, 255, 255, 0.8)', // Add slight background for readability over bubbles
            backdropFilter: 'blur(2px)' // Optional: blur background slightly
          }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#FFF7ED'; e.currentTarget.style.borderColor = '#FED7AA'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'; e.currentTarget.style.borderColor = 'transparent'; }}
        >
          <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} /> Back to Converter
        </Link>
      </div>

      {/* Main Title */}
      <h1 style={{ 
          fontSize: '2.25rem', 
          fontWeight: 700, 
          marginBottom: '2rem', 
          textAlign: 'center', 
          color: '#374151',
          backgroundColor: 'rgba(255, 255, 255, 0.8)', // Add slight background
          backdropFilter: 'blur(2px)', // Optional blur
          padding: '0.5rem',
          borderRadius: '8px',
          display: 'inline-block', // Allow background to fit content
          marginLeft: 'auto',
          marginRight: 'auto'
       }}>
        About the React to PDF Converter
      </h1>

      {/* Single Column Layout - Sections will stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}> {/* Changed to column, added gap */}
        
        {/* Info Sections */}
        <section style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(3px)', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', color: '#1f2937' }}>
            <FileText size={24} style={{ marginRight: '0.5rem', color: '#D97757' }} /> What is this tool?
          </h2>
          <p style={{ lineHeight: 1.6, color: '#4b5563' }}>
            This web application provides a simple way to take React/JSX code and turn it into a professional-looking PDF document.
            You can paste your code, see a live preview of the rendered component, adjust PDF settings, and download the result.
          </p>
          <p style={{ lineHeight: 1.6, color: '#4b5563', marginTop: '0.5rem' }}>
            It's designed for developers, designers, and anyone who wants to quickly visualise and share UI components or reports.
          </p>
        </section>

        <section style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(3px)', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', color: '#1f2937' }}>
            <Settings size={24} style={{ marginRight: '0.5rem', color: '#38B2AC' }} /> Key Features
          </h2>
          <ul style={{ listStyle: 'disc', marginLeft: '1.5rem', lineHeight: 1.6, color: '#4b5563', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
            <li>Live component preview</li>
            <li>Syntax highlighting editor</li>
            <li>PDF export (A4, Letter, etc.)</li>
            <li>Custom margins & orientation</li>
            <li>Error reporting</li>
            <li>Sample components</li>
            <li>Tailwind CSS support</li>
            <li>Lucide Icons support</li>
          </ul>
        </section>

        <section style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(3px)', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', color: '#1f2937' }}>
            <HelpCircle size={24} style={{ marginRight: '0.5rem', color: '#ED8936' }} /> Tips & Tricks
          </h2>
          <ul style={{ listStyle: 'disc', marginLeft: '1.5rem', lineHeight: 1.6, color: '#4b5563' }}>
            <li>Ensure your component is a default export or a clearly named function.</li>
            <li>Use the "Copy Tip" button in the editor for better PDF page breaks.</li>
            <li>Check the browser console (F12) if the preview doesn't render.</li>
            <li>Complex state logic might not behave identically in the preview vs. a full app.</li>
          </ul>
        </section>

        <section style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(3px)', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', color: '#1f2937' }}>
            <Shield size={24} style={{ marginRight: '0.5rem', color: '#D97757' }} /> Privacy & Security
          </h2>
          <p style={{ lineHeight: 1.6, color: '#4b5563' }}>
            We take your privacy seriously. All code processing happens locally in your browser - nothing is ever sent externally. 
            Learn more in our{' '}
            <Link 
              to="/privacy" 
              style={{
                color: '#D97757',
                textDecoration: 'underline',
                fontWeight: 500
              }}
            >
              Privacy Policy
            </Link>.
          </p>
        </section>
        {/* Removed the right column div and ReactChallengeGame component */}
      </div>

      {/* Render the Bubble Background */}
      <BubbleBackground /> 
    </div>
  );
}


// --- Bubble Background Component Definition ---
const BUBBLE_COUNT = 25;
const MIN_SIZE = 20;
const MAX_SIZE = 50;
const MIN_SPEED = 0.2;
const MAX_SPEED = 0.8;
const MOUSE_REPEL_RADIUS = 100;
const MOUSE_REPEL_STRENGTH = 0.8;
const EXPLOSION_PARTICLES = 10;

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  dx: number;
  dy: number;
  opacity: number;
  color: string;
}

function BubbleBackground() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: -9999, y: -9999 });
  const animationFrameId = useRef<number | null>(null);
  const lastBubbleId = useRef(0);

  // Initialize Bubbles
  useEffect(() => {
    const initialBubbles: Bubble[] = [];
    // Use window dimensions instead of container
    const width = window.innerWidth;
    const height = window.innerHeight;
    const colors = ['rgba(191, 219, 254, 0.8)', 'rgba(254, 202, 202, 0.8)', 'rgba(221, 214, 254, 0.8)', 'rgba(187, 247, 208, 0.8)'];

    for (let i = 0; i < BUBBLE_COUNT; i++) {
      const size = Math.random() * (MAX_SIZE - MIN_SIZE) + MIN_SIZE;
      initialBubbles.push({
        id: lastBubbleId.current++,
        x: Math.random() * width,
        y: Math.random() * height,
        size: size,
        dx: (Math.random() - 0.5) * (MAX_SPEED - MIN_SPEED) + MIN_SPEED,
        dy: (Math.random() - 0.5) * (MAX_SPEED - MIN_SPEED) - (MIN_SPEED / 2),
        opacity: Math.random() * 0.2 + 0.7,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    setBubbles(initialBubbles);

    const handleMouseMove = (event: MouseEvent) => {
      mousePos.current = { x: event.clientX, y: event.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Add resize handler
    const handleResize = () => {
      setBubbles(prevBubbles => 
        prevBubbles.map(bubble => ({
          ...bubble,
          x: Math.min(bubble.x, window.innerWidth - bubble.size/2),
          y: Math.min(bubble.y, window.innerHeight - bubble.size/2)
        }))
      );
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // Click Handler
  const handleClick = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    const clickX = event.clientX; // Use window coordinates directly
    const clickY = event.clientY;
    
    const newBubblesBatch: Bubble[] = [];
    const colors = ['rgba(191, 219, 254, 0.8)', 'rgba(254, 202, 202, 0.8)', 'rgba(221, 214, 254, 0.8)', 'rgba(187, 247, 208, 0.8)'];

    // Create more particles and make them explode outward with more force
    for (let i = 0; i < EXPLOSION_PARTICLES; i++) {
      const angle = (Math.PI * 2 * i) / EXPLOSION_PARTICLES; // Distribute particles in a circle
      const speed = Math.random() * 2 + 2; // Increased initial speed
      
      const size = Math.random() * (MAX_SIZE - MIN_SIZE) + MIN_SIZE / 2;
      newBubblesBatch.push({
        id: lastBubbleId.current++,
        x: clickX,
        y: clickY,
        size: size,
        dx: Math.cos(angle) * speed, // Use angle for direction
        dy: Math.sin(angle) * speed,
        opacity: Math.random() * 0.3 + 0.6,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    setBubbles(prevBubbles => [...prevBubbles, ...newBubblesBatch]);
  }, []);

  // Animation Loop
  useEffect(() => {
    const animate = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setBubbles(prevBubbles =>
        prevBubbles.map(bubble => {
          const { size } = bubble;
          let { x, y, dx, dy } = bubble;

          // Mouse interaction
          const mouseX = mousePos.current.x;
          const mouseY = mousePos.current.y;
          const distX = x - mouseX;
          const distY = y - mouseY;
          const distance = Math.sqrt(distX * distX + distY * distY);

          if (distance < MOUSE_REPEL_RADIUS + size / 2) {
            const angle = Math.atan2(distY, distX);
            const force = (MOUSE_REPEL_RADIUS + size / 2 - distance) / (MOUSE_REPEL_RADIUS + size / 2);
            dx += Math.cos(angle) * force * MOUSE_REPEL_STRENGTH;
            dy += Math.sin(angle) * force * MOUSE_REPEL_STRENGTH;
            dx *= 0.98;
            dy *= 0.98;
          }

          // Move bubble
          y += dy - 0.05; // Slight upward drift
          x += dx;

          // Bounce off all edges
          if (x - size/2 < 0) {
            x = size/2;
            dx = Math.abs(dx) * 0.8; // Bounce right with reduced speed
          }
          if (x + size/2 > width) {
            x = width - size/2;
            dx = -Math.abs(dx) * 0.8; // Bounce left with reduced speed
          }
          if (y - size/2 < 0) {
            y = size/2;
            dy = Math.abs(dy) * 0.8; // Bounce down with reduced speed
          }
          if (y + size/2 > height) {
            y = height - size/2;
            dy = -Math.abs(dy) * 0.8; // Bounce up with reduced speed
          }

          return { ...bubble, x, y, dx, dy };
        })
      );

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed', // Changed back to fixed
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: -1,
        pointerEvents: 'auto'
      }}
      onClick={handleClick}
    >
      {bubbles.map(bubble => (
        <div
          key={bubble.id}
          style={{
            position: 'absolute',
            left: `${bubble.x}px`,
            top: `${bubble.y}px`,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            backgroundColor: bubble.color,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: bubble.opacity,
            transition: 'opacity 0.3s ease-out',
            pointerEvents: 'none',
            cursor: 'default'
          }}
        />
      ))}
    </div>
  );
}

export default InfoPage;