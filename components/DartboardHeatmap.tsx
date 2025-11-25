import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { DARTBOARD_NUMBERS, HEATMAP_COLORS } from '../constants';
import { Throw, Multiplier } from '../types';

interface DartboardHeatmapProps {
  history: Throw[];
  playerId: string;
}

export const DartboardHeatmap: React.FC<DartboardHeatmapProps> = ({ history, playerId }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 360;
    const height = 360;
    const margin = 10;
    // Radius logic
    const maxRadius = (Math.min(width, height) / 2) - margin;
    
    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // --- Dimensions based on standard proportions ---
    // Ratios relative to total board radius (including number ring)
    const rNumberRingOuter = maxRadius;
    const rNumberRingInner = maxRadius * 0.85;
    const rDoubleOuter = maxRadius * 0.85;
    const rDoubleInner = maxRadius * 0.80;
    const rTripleOuter = maxRadius * 0.50;
    const rTripleInner = maxRadius * 0.45;
    const rOuterBull = maxRadius * 0.10;
    const rInnerBull = maxRadius * 0.05;

    // Filter throws for this player
    const playerThrows = history.filter((t) => t.playerId === playerId && !t.isBust);

    // Helper to get hit count
    const getHitCount = (scoreValue: number, multiplier: Multiplier): number => {
      return playerThrows.filter(
        (t) => t.scoreValue === scoreValue && t.multiplier === multiplier
      ).length;
    };

    // Helper to get color
    const getSegmentColor = (scoreValue: number, multiplier: Multiplier, sliceIndex: number) => {
      const hits = getHitCount(scoreValue, multiplier);
      
      if (hits > 0) {
        // Clamp to max color key (6)
        const key = Math.min(hits, 6) as keyof typeof HEATMAP_COLORS;
        return HEATMAP_COLORS[key];
      }

      // GHOST BOARD LOOK (Empty State)
      // Lightened slightly (Slate 700/600) so that "Black" (6 hits) stands out as distinct
      const isDark = sliceIndex % 2 !== 0;
      
      if (multiplier === Multiplier.Double || multiplier === Multiplier.Triple) {
        // Rings usually have color
        return isDark ? '#334155' : '#475569'; // Slate 700 / Slate 600
      }
      // Singles
      return isDark ? '#1e293b' : '#334155'; // Slate 800 / Slate 700
    };

    const wireColor = '#cbd5e1'; // Slate 300 (Light Metallic) to contrast against Black
    const wireWidth = 1;

    // 1. Draw Number Ring Background
    const arcNumberRing = d3.arc<any>()
      .innerRadius(rNumberRingInner)
      .outerRadius(rNumberRingOuter)
      .startAngle(0)
      .endAngle(2 * Math.PI);

    svg.append('path')
      .attr('d', arcNumberRing)
      .attr('fill', '#020617') // Almost black for numbers background
      .attr('stroke', 'none');

    const sliceAngle = (2 * Math.PI) / 20;

    DARTBOARD_NUMBERS.forEach((num, i) => {
      const startAngle = i * sliceAngle - sliceAngle / 2;
      const endAngle = startAngle + sliceAngle;

      // --- Draw Segments ---

      // Function to draw an arc path
      const drawArc = (innerR: number, outerR: number, mult: Multiplier) => {
         const arc = d3.arc<any>()
          .innerRadius(innerR)
          .outerRadius(outerR)
          .startAngle(startAngle)
          .endAngle(endAngle);

        svg.append('path')
          .attr('d', arc)
          .attr('fill', getSegmentColor(num, mult, i))
          .attr('stroke', wireColor)
          .attr('stroke-width', wireWidth);
      };

      // Outer Single
      drawArc(rTripleOuter, rDoubleInner, Multiplier.Single);
      
      // Inner Single
      drawArc(rOuterBull, rTripleInner, Multiplier.Single);

      // Double Ring
      drawArc(rDoubleInner, rDoubleOuter, Multiplier.Double);

      // Triple Ring
      drawArc(rTripleInner, rTripleOuter, Multiplier.Triple);

      // --- Draw Numbers ---
      const labelRadius = (rNumberRingInner + rNumberRingOuter) / 2;
      const angleDeg = (i * 360) / 20;
      
      svg.append('text')
        .attr('transform', `rotate(${angleDeg}) translate(0, -${labelRadius}) rotate(${-angleDeg})`)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', '#94a3b8')
        .attr('font-family', 'sans-serif')
        .attr('font-weight', 'bold')
        .attr('font-size', '16px')
        .text(String(num));
    });

    // --- Bullseye ---

    // Outer Bull (25) - Single
    const outerBullHits = getHitCount(25, Multiplier.Single);
    // Default ghost outer bull
    let outerBullColor = '#334155';
    if (outerBullHits > 0) {
        outerBullColor = HEATMAP_COLORS[Math.min(outerBullHits, 6) as keyof typeof HEATMAP_COLORS];
    }

    svg.append('circle')
      .attr('r', rOuterBull)
      .attr('fill', outerBullColor)
      .attr('stroke', wireColor)
      .attr('stroke-width', wireWidth);

    // Inner Bull (50) - Double
    const innerBullHits = getHitCount(25, Multiplier.Double);
    // Default ghost inner bull
    let innerBullColor = '#475569'; 
    if (innerBullHits > 0) {
        innerBullColor = HEATMAP_COLORS[Math.min(innerBullHits, 6) as keyof typeof HEATMAP_COLORS];
    }

    svg.append('circle')
      .attr('r', rInnerBull)
      .attr('fill', innerBullColor)
      .attr('stroke', wireColor)
      .attr('stroke-width', wireWidth);

  }, [history, playerId]);

  return <svg ref={svgRef} className="w-full max-w-[360px] h-auto mx-auto drop-shadow-2xl" />;
};