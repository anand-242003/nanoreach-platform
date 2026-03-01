import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export function CardStack({
  items = [],
  cardWidth = 480,
  cardHeight = 300,
  overlap = 0.5,
  spreadDeg = 44,
  autoAdvance = false,
  intervalMs = 3000,
  pauseOnHover = true,
  showDots = true,
  renderCard,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const count = items.length;

  const advance = useCallback(() => {
    setActiveIndex((i) => (i + 1) % count);
  }, [count]);

  useEffect(() => {
    if (!autoAdvance || paused || count <= 1) return;
    timerRef.current = setInterval(advance, intervalMs);
    return () => clearInterval(timerRef.current);
  }, [autoAdvance, paused, advance, intervalMs, count]);

  if (count === 0) return null;

  const halfSpread = spreadDeg / 2;
  const visibleCount = Math.min(count, 5);

  return (
    <div
      className="flex flex-col items-center gap-8 select-none"
      onMouseEnter={() => pauseOnHover && setPaused(true)}
      onMouseLeave={() => pauseOnHover && setPaused(false)}
    >
      <div
        className="relative"
        style={{ width: cardWidth, height: cardHeight + 60 }}
      >
        {items.map((item, i) => {
          const offset = (i - activeIndex + count) % count;
          if (offset >= visibleCount) return null;

          const isActive = offset === 0;
          const angle = isActive
            ? 0
            : offset <= visibleCount / 2
              ? (offset / (visibleCount - 1)) * halfSpread
              : -((count - offset) / (visibleCount - 1)) * halfSpread;

          const scale = isActive ? 1 : 1 - offset * 0.05;
          const zIndex = isActive ? 20 : visibleCount - offset;
          const yOffset = isActive ? 0 : offset * 8;

          return (
            <div
              key={item.id ?? i}
              onClick={() => !isActive && setActiveIndex(i)}
              style={{
                position: 'absolute',
                top: yOffset,
                left: 0,
                width: cardWidth,
                height: cardHeight,
                transform: `rotate(${angle}deg) scale(${scale})`,
                transformOrigin: 'bottom center',
                zIndex,
                transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), top 0.4s ease',
                cursor: isActive ? 'default' : 'pointer',
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: isActive
                  ? '0 20px 60px rgba(0,0,0,0.3)'
                  : '0 4px 20px rgba(0,0,0,0.15)',
              }}
            >
              {renderCard
                ? renderCard(item, { active: isActive, index: i })
                : <DefaultFanCard item={item} active={isActive} />}
            </div>
          );
        })}
      </div>

      {showDots && count > 1 && (
        <div className="flex items-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? 'w-6 h-2 bg-foreground'
                  : 'w-2 h-2 bg-border hover:bg-muted-foreground'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function DefaultFanCard({ item, active }) {
  const navigate = useNavigate();
  return (
    <div className="w-full h-full bg-foreground text-background flex flex-col justify-between p-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">{item.tag ?? 'Campaign'}</p>
        <h3 className="text-xl font-bold line-clamp-2">{item.title}</h3>
        {item.description && (
          <p className="text-sm text-white/60 mt-2 line-clamp-2">{item.description}</p>
        )}
      </div>
      {active && item.href && (
        <button
          onClick={() => navigate(item.href)}
          className="self-start text-xs font-semibold bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
        >
          View Details →
        </button>
      )}
    </div>
  );
}
