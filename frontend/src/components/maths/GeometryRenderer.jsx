import React, { useMemo } from 'react';

/**
 * GeometryRenderer
 * Renders a structured JSON geometry description into SVG.
 * 
 * Expected Props:
 * - data: {
 *    canvas: { width: 400, height: 300, viewBox: "0 0 400 300" },
 *    elements: [
 *      { type: 'circle', id: 'c1', cx: 200, cy: 150, r: 100, stroke: 'black', fill: 'none' },
 *      { type: 'point', id: 'p1', x: 200, y: 150, label: 'O' },
 *      { type: 'point_on_circle', id: 'A', circleId: 'c1', angle: 30, label: 'A' },
 *      { type: 'line', from: 'p1', to: 'A', stroke: 'black' },
 *      ...
 *    ]
 * }
 */
const GeometryRenderer = ({ data }) => {
    // 1. Transformation for Circle Spec (used by math_geo_circles)
    const processedData = useMemo(() => {
        if (!data) return null;
        if (data.elements) return data;

        // If it looks like a Circle Spec, transform it
        if (data.center && data.radius !== undefined) {
            const elements = [];
            const center = data.center || [0, 0];
            const r = data.radius || 5;

            const cx = 200;
            const cy = 150;
            const scale = 20;

            const resolvedCoords = { 'O': { x: cx + center[0] * scale, y: cy - center[1] * scale } };

            if (data.points) {
                data.points.forEach((p, idx) => {
                    let pointX, pointY;
                    if (p.angle !== undefined) {
                        const rad = p.angle * (Math.PI / 180);
                        pointX = cx + center[0] * scale + (r * scale) * Math.cos(rad);
                        pointY = cy - center[1] * scale - (r * scale) * Math.sin(rad);
                    } else if (p.pos) {
                        pointX = cx + p.pos[0] * scale;
                        pointY = cy - p.pos[1] * scale;
                    } else {
                        return;
                    }
                    const label = p.label || `p_${idx}`;
                    resolvedCoords[label] = { x: pointX, y: pointY };
                    elements.push({
                        type: 'point',
                        id: label,
                        x: pointX,
                        y: pointY,
                        label: p.label,
                        labelDx: p.offset?.[0] * scale || 10,
                        labelDy: -(p.offset?.[1] * scale) || -10
                    });
                });
            }

            elements.push({
                type: 'circle',
                id: 'main_circle',
                cx: resolvedCoords['O'].x,
                cy: resolvedCoords['O'].y,
                r: r * scale,
                stroke: 'black'
            });

            if (data.lines) {
                data.lines.forEach((l) => {
                    let x1, y1, x2, y2;
                    if (l.pts && l.pts.length >= 2) {
                        const p1 = resolvedCoords[l.pts[0]];
                        const p2 = resolvedCoords[l.pts[1]];
                        if (p1 && p2) { x1 = p1.x; y1 = p1.y; x2 = p2.x; y2 = p2.y; }
                    } else if (l.points && l.points.length >= 2) {
                        x1 = cx + l.points[0][0] * scale; y1 = cy - l.points[0][1] * scale;
                        x2 = cx + l.points[1][0] * scale; y2 = cy - l.points[1][1] * scale;
                    }
                    if (x1 !== undefined && y1 !== undefined) {
                        elements.push({
                            type: 'line',
                            x1, y1, x2, y2,
                            stroke: 'black',
                            strokeDasharray: l.style === '--' ? '5,5' : undefined
                        });
                    }
                });
            }

            if (data.angles) {
                data.angles.forEach((ang) => {
                    if (ang.pts && ang.pts.length === 3) {
                        const p1 = resolvedCoords[ang.pts[0]];
                        const v = resolvedCoords[ang.pts[1]];
                        const p2 = resolvedCoords[ang.pts[2]];
                        if (p1 && v && p2) {
                            const startAngle = Math.atan2(-(p1.y - v.y), p1.x - v.x) * (180 / Math.PI);
                            const endAngle = Math.atan2(-(p2.y - v.y), p2.x - v.x) * (180 / Math.PI);
                            elements.push({
                                type: 'arc',
                                center: v,
                                radius: (ang.radius || 1) * scale,
                                startAngle,
                                endAngle,
                                label: ang.label,
                                stroke: '#ff4d4d',
                                strokeWidth: 1.5
                            });
                        }
                    }
                });
            }

            let minX = cx - r * scale;
            let maxX = cx + r * scale;
            let minY = cy - r * scale;
            let maxY = cy + r * scale;

            Object.values(resolvedCoords).forEach(p => {
                if (p.x < minX) minX = p.x;
                if (p.x > maxX) maxX = p.x;
                if (p.y < minY) minY = p.y;
                if (p.y > maxY) maxY = p.y;
            });

            const padding = 40;
            minX -= padding;
            maxX += padding;
            minY -= padding;
            maxY += padding;

            const width = maxX - minX;
            const height = maxY - minY;

            return { elements, canvas: { width, height, viewBox: `${minX} ${minY} ${width} ${height}` } };
        }
        return data;
    }, [data]);

    // 2. Helper to resolve coordinates for ANY element type
    const resolveCoords = (idOrEl, elements) => {
        const el = typeof idOrEl === 'string' ? elements.find(e => e.id === idOrEl) : idOrEl;
        if (!el) return { x: 0, y: 0 };
        if (el.type === 'point_on_circle') {
            const circle = elements.find(e => e.id === el.circleId);
            if (circle) {
                const angleRad = (el.angle || 0) * (Math.PI / 180);
                return { x: circle.cx + circle.r * Math.cos(angleRad), y: circle.cy - circle.r * Math.sin(angleRad) };
            }
        }
        return { x: el.x || 0, y: el.y || 0 };
    };

    // 3. Render Elements - Always call hooks
    const renderedElements = useMemo(() => {
        if (!processedData || !processedData.elements) return [];
        const { elements } = processedData;

        return elements.map((el, idx) => {
            const coords = (el.type === 'point' || el.type === 'point_on_circle')
                ? resolveCoords(el, elements)
                : { x: el.x || 0, y: el.y || 0 };

            switch (el.type) {
                case 'circle':
                    return <circle key={idx} cx={el.cx} cy={el.cy} r={el.r} fill={el.fill || "none"} stroke={el.stroke || "black"} strokeWidth={el.strokeWidth || 2} />;
                case 'line': {
                    let x1, y1, x2, y2;
                    if (el.from && el.to) {
                        const p1 = resolveCoords(el.from, elements);
                        const p2 = resolveCoords(el.to, elements);
                        x1 = p1.x; y1 = p1.y; x2 = p2.x; y2 = p2.y;
                    } else {
                        x1 = el.x1; y1 = el.y1; x2 = el.x2; y2 = el.y2;
                    }
                    return <line key={idx} x1={x1} y1={y1} x2={x2} y2={y2} stroke={el.stroke || "black"} strokeWidth={el.strokeWidth || 2} strokeDasharray={el.strokeDasharray} />;
                }
                case 'polyline': {
                    if (!el.points || !Array.isArray(el.points)) return null;
                    const pointsStr = el.points.map(p => {
                        if (typeof p === 'object' && p.x !== undefined && p.y !== undefined) return `${p.x},${p.y}`;
                        const res = resolveCoords(p, elements); return `${res.x},${res.y}`;
                    }).join(' ');
                    return <polyline key={idx} points={pointsStr} fill={el.fill || "none"} stroke={el.stroke || "black"} strokeWidth={el.strokeWidth || 2} strokeDasharray={el.strokeDasharray} />;
                }
                case 'polygon': {
                    if (!el.points || !Array.isArray(el.points)) return null;
                    const pointsStr = el.points.map(pid => {
                        if (typeof pid === 'object' && pid.x !== undefined && pid.y !== undefined) return `${pid.x},${pid.y}`;
                        const p = resolveCoords(pid, elements); return `${p.x},${p.y}`;
                    }).join(' ');
                    return <polygon key={idx} points={pointsStr} fill={el.fill || "rgba(0,0,0,0.1)"} stroke={el.stroke || "black"} strokeWidth={el.strokeWidth || 2} />;
                }
                case 'axes': {
                    const viewW = processedData.canvas?.width || 400; const viewH = processedData.canvas?.height || 300;
                    const midX = viewW / 2; const midY = viewH / 2;
                    return (
                        <g key={idx}>
                            <line x1={0} y1={midY} x2={viewW} y2={midY} stroke="#666" strokeWidth={1} />
                            <line x1={midX} y1={0} x2={midX} y2={viewH} stroke="#666" strokeWidth={1} />
                            <circle cx={midX} cy={midY} r={3} fill="#666" />
                        </g>
                    );
                }
                case 'grid': {
                    const viewW = processedData.canvas?.width || 400;
                    const viewH = processedData.canvas?.height || 300;
                    const step = el.step || 20;
                    const lines = [];
                    for (let x = 0; x <= viewW; x += step)
                        lines.push(<line key={`gx-${x}`} x1={x} y1={0} x2={x} y2={viewH} stroke="#eee" strokeWidth={0.5} />);
                    for (let y = 0; y <= viewH; y += step)
                        lines.push(<line key={`gy-${y}`} x1={0} y1={y} x2={viewW} y2={y} stroke="#eee" strokeWidth={0.5} />);
                    return <g key={idx}>{lines}</g>;
                }
                case 'arc':
                case 'sector': {
                    if (el.path) return <path key={idx} d={el.path} fill={el.fill || "none"} stroke={el.stroke || "black"} strokeWidth={1} />;
                    if (el.center && el.radius && el.startAngle !== undefined && el.endAngle !== undefined) {
                        const mid = resolveCoords(el.center, elements);
                        const sRad = el.startAngle * (Math.PI / 180); const eRad = el.endAngle * (Math.PI / 180);
                        const x1 = mid.x + el.radius * Math.cos(sRad); const y1 = mid.y - el.radius * Math.sin(sRad);
                        const x2 = mid.x + el.radius * Math.cos(eRad); const y2 = mid.y - el.radius * Math.sin(eRad);
                        const largeFlag = Math.abs(el.endAngle - el.startAngle) > 180 ? 1 : 0;
                        const sweep = el.endAngle > el.startAngle ? 0 : 1;
                        const d = ["M", x1, y1, "A", el.radius, el.radius, 0, largeFlag, sweep, x2, y2].join(" ");

                        // Render Label if exists
                        let labelEl = null;
                        if (el.label) {
                            const midAngle = (el.startAngle + el.endAngle) / 2;
                            const midRad = midAngle * (Math.PI / 180);
                            // Push label further out than the arc
                            const labelDist = el.radius * 1.5;
                            const lx = mid.x + labelDist * Math.cos(midRad);
                            const ly = mid.y - labelDist * Math.sin(midRad);
                            labelEl = <text x={lx} y={ly} fontSize={12} fontWeight="bold" fill="#ff4d4d" textAnchor="middle">{el.label}</text>;
                        }

                        return (
                            <g key={idx}>
                                <path d={d} fill={el.fill || "none"} stroke={el.stroke || "black"} strokeWidth={el.strokeWidth || 1} />
                                {labelEl}
                            </g>
                        );
                    }
                    return null;
                }
                case 'text':
                case 'label':
                    return <text key={idx} x={coords.x} y={coords.y} dx={el.dx || 0} dy={el.dy || 0} textAnchor={el.textAnchor || "middle"} fontSize={el.fontSize || 16} fontWeight="bold" fill="black" style={{ fontFamily: 'Arial, sans-serif' }}>{el.text || el.label}</text>;
                case 'point':
                case 'point_on_circle':
                    return (
                        <g key={idx}>
                            <circle cx={coords.x} cy={coords.y} r={el.r || 3} fill="black" />
                            {el.label && <text x={coords.x} y={coords.y} dx={el.labelDx || 10} dy={el.labelDy || -10} textAnchor="middle" fontSize={14} fontWeight="bold" fontFamily="Arial" fill="black">{el.label}</text>}
                        </g>
                    );
                default: return null;
            }
        });
    }, [processedData]);

    return (
        <svg
            width="100%"
            height="100%"
            viewBox={processedData?.canvas?.viewBox || "0 0 400 300"}
            style={{ maxWidth: '600px', maxHeight: '400px', margin: '0 auto', display: 'block' }}
        >
            {renderedElements}
        </svg>
    );
};

export default GeometryRenderer;
