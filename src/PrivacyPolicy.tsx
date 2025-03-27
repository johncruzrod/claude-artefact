import { useState, useEffect, useRef, useCallback, MouseEvent as ReactMouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Info } from 'lucide-react';

// Reuse the same bubble animation configuration from InfoPage
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

function PrivacyPolicy() {
  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '2rem auto', position: 'relative', zIndex: 1 }}>
      {/* Navigation Links */}
      <div style={{ 
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
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
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(2px)'
          }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#FFF7ED'; e.currentTarget.style.borderColor = '#FED7AA'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'; e.currentTarget.style.borderColor = 'transparent'; }}
        >
          <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} /> Back to Converter
        </Link>

        <Link 
          to="/info" 
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
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(2px)'
          }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#FFF7ED'; e.currentTarget.style.borderColor = '#FED7AA'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'; e.currentTarget.style.borderColor = 'transparent'; }}
        >
          <Info size={18} style={{ marginRight: '0.5rem' }} /> About the Tool
        </Link>
      </div>

      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(3px)',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          marginBottom: '2rem',
          color: '#D97757'
        }}>
          <Shield size={32} style={{ marginRight: '1rem' }} />
          <h1 style={{ 
            fontSize: '2rem',
            fontWeight: 700,
            margin: 0,
            color: '#374151'
          }}>Privacy Policy</h1>
        </div>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ 
            fontSize: '1.5rem',
            fontWeight: 600,
            marginBottom: '1rem',
            color: '#374151'
          }}>Overview</h2>
          <p style={{ 
            lineHeight: 1.6,
            color: '#4b5563',
            marginBottom: '1rem'
          }}>
            The Claude Artifact to PDF Converter is designed with your privacy in mind. We believe in complete transparency about how our tool works and handles your data.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ 
            fontSize: '1.5rem',
            fontWeight: 600,
            marginBottom: '1rem',
            color: '#374151'
          }}>Data Processing</h2>
          <ul style={{ 
            lineHeight: 1.6,
            color: '#4b5563',
            marginLeft: '1.5rem',
            listStyleType: 'disc'
          }}>
            <li>All code processing occurs entirely in your browser</li>
            <li>No data is ever sent to our servers</li>
            <li>No personal information is collected or stored</li>
            <li>No cookies are used for tracking purposes</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ 
            fontSize: '1.5rem',
            fontWeight: 600,
            marginBottom: '1rem',
            color: '#374151'
          }}>Analytics</h2>
          <p style={{ 
            lineHeight: 1.6,
            color: '#4b5563',
            marginBottom: '1rem'
          }}>
            We use Google Analytics solely to understand general usage patterns and improve our service. This data is anonymized and does not include any personal information or code content.
          </p>
        </section>

        <section>
          <h2 style={{ 
            fontSize: '1.5rem',
            fontWeight: 600,
            marginBottom: '1rem',
            color: '#374151'
          }}>Contact</h2>
          <p style={{ 
            lineHeight: 1.6,
            color: '#4b5563'
          }}>
            If you have any questions about our privacy practices, please feel free to contact us through our{' '}
            <Link 
              to="/info" 
              style={{
                color: '#D97757',
                textDecoration: 'underline',
                fontWeight: 500
              }}
            >
              About page
            </Link>.
          </p>
        </section>
      </div>

      <BubbleBackground />
    </div>
  );
}

// Reuse the exact same BubbleBackground component from InfoPage
function BubbleBackground() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: -9999, y: -9999 });
  const animationFrameId = useRef<number | null>(null);
  const lastBubbleId = useRef(0);

  // Initialize Bubbles
  useEffect(() => {
    const initialBubbles: Bubble[] = [];
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

  const handleClick = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    const clickX = event.clientX;
    const clickY = event.clientY;
    
    const newBubblesBatch: Bubble[] = [];
    const colors = ['rgba(191, 219, 254, 0.8)', 'rgba(254, 202, 202, 0.8)', 'rgba(221, 214, 254, 0.8)', 'rgba(187, 247, 208, 0.8)'];

    for (let i = 0; i < EXPLOSION_PARTICLES; i++) {
      const angle = (Math.PI * 2 * i) / EXPLOSION_PARTICLES;
      const speed = Math.random() * 2 + 2;
      
      const size = Math.random() * (MAX_SIZE - MIN_SIZE) + MIN_SIZE / 2;
      newBubblesBatch.push({
        id: lastBubbleId.current++,
        x: clickX,
        y: clickY,
        size: size,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        opacity: Math.random() * 0.3 + 0.6,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    setBubbles(prevBubbles => [...prevBubbles, ...newBubblesBatch]);
  }, []);

  useEffect(() => {
    const animate = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setBubbles(prevBubbles =>
        prevBubbles.map(bubble => {
          let { x, y, dx, dy, size } = bubble;

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

          y += dy - 0.05;
          x += dx;

          if (x - size/2 < 0) {
            x = size/2;
            dx = Math.abs(dx) * 0.8;
          }
          if (x + size/2 > width) {
            x = width - size/2;
            dx = -Math.abs(dx) * 0.8;
          }
          if (y - size/2 < 0) {
            y = size/2;
            dy = Math.abs(dy) * 0.8;
          }
          if (y + size/2 > height) {
            y = height - size/2;
            dy = -Math.abs(dy) * 0.8;
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
        position: 'fixed',
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

export default PrivacyPolicy;
