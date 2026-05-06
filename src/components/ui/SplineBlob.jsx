import { useRef } from 'react';
import '../../styles/spline-blob.css';

export default function SplineBlob() {
  const viewerRef = useRef(null);

  // No wheel/touch blocking needed here — camera is locked via controls-enabled="false"
  // on the spline-viewer element. Blocking wheel here was eating the scroll events
  // that HeroStage needs to step through project cards.

  return (
    <div className="spline-blob" aria-hidden="true">
      <div className="spline-blob__fallback" />
      <spline-viewer
        ref={viewerRef}
        url="https://prod.spline.design/RddPxcSpSUNBP-EV/scene.splinecode"
        class="spline-blob__canvas"
        controls-enabled="false"
      />
    </div>
  );
}
