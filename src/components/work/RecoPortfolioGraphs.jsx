import { useEffect, useRef } from 'react';
import '../../styles/reco-portfolio-graphs.css';

function useGraphReveal() {
  const sectionRef = useRef(null);
  const fieldRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const field = fieldRef.current;
    if (!section || !field) return undefined;

    const play = () => {
      section.classList.remove('is-visible');
      // Force a reflow so CSS animations restart cleanly
      void section.offsetWidth;
      section.classList.add('is-visible');
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        play();
        observer.disconnect();
      },
      {
        threshold: 0.4,
        rootMargin: '0px 0px -12% 0px',
      },
    );

    observer.observe(field);
    return () => observer.disconnect();
  }, []);

  return { sectionRef, fieldRef };
}

function GraphSection({ index, eyebrow, title, caption, children }) {
  const { sectionRef, fieldRef } = useGraphReveal();
  const titleId = title ? `reco-graph-${index}` : undefined;
  const hasHeader = Boolean(eyebrow || title || caption);

  return (
    <section
      ref={sectionRef}
      className="reco-graph"
      aria-labelledby={titleId}
    >
      {hasHeader ? (
        <header className="reco-graph__header">
          {eyebrow ? (
            <p className="reco-graph__eyebrow">
              {index} / {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h3 id={titleId} className="reco-graph__title">
              {title}
            </h3>
          ) : null}
          {caption ? <p className="reco-graph__caption">{caption}</p> : null}
        </header>
      ) : null}
      <div ref={fieldRef} className="reco-graph__canvas">
        {children}
      </div>
    </section>
  );
}

function ArrowMarker({ id }) {
  return (
    <defs>
      <marker
        id={id}
        viewBox="0 0 10 10"
        refX="8"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path d="M 1 1 L 9 5 L 1 9 Z" className="reco-graph__arrow" />
      </marker>
    </defs>
  );
}

export function RecoHowItWorksGraph() {
  const stages = [
    { label: "Capture", sub: "preserve", x: 165 },
    { label: "Structure", sub: "understand", x: 480 },
    { label: "Note", sub: "act", x: 795 },
  ];

  return (
    <GraphSection index="02">
      <svg
        className="reco-graph__svg"
        viewBox="0 0 960 520"
        role="img"
        aria-label="Capture flows through Structure into a Note and action."
      >
        <ArrowMarker id="reco-system-arrow" />

        <path
          d="M 165 260 C 270 145 375 145 480 260 C 585 375 690 375 795 260"
          pathLength="1"
          markerEnd="url(#reco-system-arrow)"
          className="reco-graph__line reco-graph__line--system"
          style={{ '--i': 0 }}
        />
        <path
          d="M 165 260 C 270 375 375 375 480 260 C 585 145 690 145 795 260"
          pathLength="1"
          className="reco-graph__guide"
        />

        {stages.map((stage, index) => (
          <g key={stage.label} style={{ '--i': index + 1 }}>
            <circle
              cx={stage.x}
              cy="260"
              r={index === 1 ? 76 : 60}
              className={index === 1 ? "reco-graph__hub" : "reco-graph__surface"}
            />

            {index === 0 && (
              <g className="reco-graph__sound-bars" aria-hidden="true">
                {[6, 12, 18, 26, 34, 40, 34, 26, 18, 12, 6].map(
                  (height, barIndex) => (
                    <rect
                      key={barIndex}
                      x={133 + barIndex * 6}
                      y={240 - height / 2}
                      width="3"
                      height={height}
                      rx="1.5"
                      className="reco-graph__sound-bar"
                      style={{ "--bar-i": barIndex }}
                    />
                  ),
                )}
              </g>
            )}

            {index === 1 && (
              <g className="reco-graph__structure-icon" aria-hidden="true">
                <path d="M 480 216 L 462 234 M 480 216 L 498 234 M 462 234 L 498 234" />
                <circle cx="480" cy="216" r="4" />
                <circle cx="462" cy="234" r="4" />
                <circle cx="498" cy="234" r="4" />
              </g>
            )}

            {index === 2 ? (
              <g className="reco-graph__note-icon" aria-label="Note">
                <path d="M 779 222 H 801 L 811 232 V 258 H 779 Z" />
                <path d="M 801 222 V 232 H 811" />
                <path d="M 786 241 H 804 M 786 248 H 804" />
              </g>
            ) : (
              <text
                x={stage.x}
                y={index === 0 ? 294 : 274}
                textAnchor="middle"
                className={
                  index === 1
                    ? "reco-graph__hub-label"
                    : "reco-graph__node-label"
                }
              >
                {stage.label}
              </text>
            )}

            {index !== 0 && (
              <text
                x={stage.x}
                y={index === 1 ? 298 : 294}
                textAnchor="middle"
                className={
                  index === 1
                    ? "reco-graph__node-sub reco-graph__node-sub--inverse"
                    : "reco-graph__node-label"
                }
              >
                {index === 1 ? "speech to meaning" : "Note"}
              </text>
            )}

            <text
              x={stage.x}
              y="360"
              textAnchor="middle"
              className="reco-graph__phase"
            >
              0{index + 1} / {stage.sub}
            </text>
          </g>
        ))}

        <g className="reco-graph__orbit-labels" style={{ '--i': 4 }}>
          <text x="322.5" y="195" textAnchor="middle">
            Transcript
          </text>
          <text x="637.5" y="195" textAnchor="middle">
            Summary
          </text>
          <text x="637.5" y="334" textAnchor="middle">
            Insights
          </text>
        </g>
      </svg>
    </GraphSection>
  );
}

export function RecoFollowUpGraph() {
  const evidence = [
    { label: "Transcript", y: 135 },
    { label: "Highlights", y: 260 },
    { label: "Insights", y: 385 },
  ];

  return (
    <GraphSection index="03">
      <svg
        className="reco-graph__svg"
        viewBox="0 0 960 520"
        role="img"
        aria-label="Transcript, highlights, insights, goal, and tone combine into an editable draft."
      >
        <ArrowMarker id="reco-followup-arrow" />

        {evidence.map((item, index) => (
          <g key={item.label} style={{ "--i": index }}>
            <circle cx="130" cy={item.y} r="6" className="reco-graph__dot" />
            <text x="155" y={item.y + 5} className="reco-graph__node-label">
              {item.label}
            </text>
            <path
              d={`M 238 ${item.y} C 330 ${item.y} 330 260 410 260`}
              pathLength="1"
              className="reco-graph__line"
            />
          </g>
        ))}

        <path
          d="M 480 86 C 480 140 480 165 480 190"
          pathLength="1"
          className="reco-graph__line"
          style={{ "--i": 3 }}
        />
        <circle
          cx="480"
          cy="86"
          r="5"
          className="reco-graph__dot"
          style={{ "--i": 3 }}
        />
        <text
          x="480"
          y="64"
          textAnchor="middle"
          className="reco-graph__node-label"
        >
          Goal
        </text>

        <path
          d="M 480 434 C 480 390 480 365 480 330"
          pathLength="1"
          className="reco-graph__line"
          style={{ "--i": 4 }}
        />
        <circle
          cx="480"
          cy="434"
          r="5"
          className="reco-graph__dot"
          style={{ "--i": 4 }}
        />
        <text
          x="480"
          y="466"
          textAnchor="middle"
          className="reco-graph__node-label"
        >
          Tone
        </text>

        <circle cx="480" cy="260" r="70" className="reco-graph__hub" />
        <text
          x="480"
          y="254"
          textAnchor="middle"
          className="reco-graph__hub-label"
        >
          Context
        </text>
        <text
          x="480"
          y="278"
          textAnchor="middle"
          className="reco-graph__hub-label"
        >
          composer
        </text>

        <path
          d="M 550 260 C 630 260 648 260 712 260"
          pathLength="1"
          markerEnd="url(#reco-followup-arrow)"
          className="reco-graph__line"
          style={{ "--i": 5 }}
        />

        <rect
          x="712"
          y="182"
          width="150"
          height="156"
          rx="24"
          className="reco-graph__surface"
        />
        <text
          x="787"
          y="247"
          textAnchor="middle"
          className="reco-graph__node-label"
        >
          Follow-up
        </text>
        <text
          x="787"
          y="275"
          textAnchor="middle"
          className="reco-graph__node-sub"
        >
          editable
        </text>

        <path
          d="M 537 219 C 566 130 683 130 712 219"
          pathLength="1"
          className="reco-graph__line reco-graph__line--loop"
          style={{ "--i": 6 }}
        />
        <text
          x="624.5"
          y="126"
          textAnchor="middle"
          className="reco-graph__phase"
        >
          refine
        </text>
      </svg>
    </GraphSection>
  );
}

export default function RecoPortfolioGraphs() {
  return (
    <div className="reco-graphs">
      <RecoHowItWorksGraph />
      <RecoFollowUpGraph />
    </div>
  );
}
