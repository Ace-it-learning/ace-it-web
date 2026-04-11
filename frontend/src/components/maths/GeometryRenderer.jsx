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
    // 1. Transformation for specific diagram types
    const processedData = useMemo(() => {
        if (!data) return null;
        
        let parsedData = data;
        if (typeof data === 'string') {
            try {
                parsedData = JSON.parse(data);
            } catch (e) {
                console.error("[GeometryRenderer] Failed to parse diagram_json string:", e);
                return null;
            }
        }

        if (parsedData.elements) return parsedData;
        const data_internal = parsedData; // Alias for transformations below

        // 1a. Transformation for Coordinate Spec (used by math_geo_coord)
        if (data_internal.type === 'coordinate') {
            const elements = [];
            const xRange = data_internal.x_range || [-5, 5];
            const yRange = data_internal.y_range || [-5, 5];

            const padding = 20;
            const scale = 30; // 30px per unit

            const width = (xRange[1] - xRange[0]) * scale + padding * 2;
            const height = (yRange[1] - yRange[0]) * scale + padding * 2;

            // Mapper from [x, y] to [svgX, svgY]
            const mapX = (x) => padding + (x - xRange[0]) * scale;
            const mapY = (y) => padding + (yRange[1] - y) * scale;

            // 1. Grid
            elements.push({ type: 'grid', step: scale });

            // 2. Axes
            const originX = mapX(0);
            const originY = mapY(0);
            elements.push({
                type: 'line',
                x1: mapX(xRange[0]), y1: originY,
                x2: mapX(xRange[1]), y2: originY,
                stroke: '#333', strokeWidth: 1.5
            });
            elements.push({
                type: 'line',
                x1: originX, y1: mapY(yRange[0]),
                x2: originX, y2: mapY(yRange[1]),
                stroke: '#333', strokeWidth: 1.5
            });

            // Axis Labels (X, Y, O)
            elements.push({ type: 'text', x: mapX(xRange[1]), y: originY, text: 'x', dx: 10, dy: 5, fontSize: 14 });
            elements.push({ type: 'text', x: originX, y: mapY(yRange[1]), text: 'y', dx: -5, dy: -10, fontSize: 14 });
            elements.push({ type: 'text', x: originX, y: originY, text: 'O', dx: -10, dy: 15, fontSize: 12 });

            // 3. Points
            const pointMap = {};
            if (data_internal.points && Array.isArray(data_internal.points)) {
                data_internal.points.forEach(p => {
                    const px = mapX(p.pos?.[0] ?? p.x ?? 0);
                    const py = mapY(p.pos?.[1] ?? p.y ?? 0);
                    if (p.label) pointMap[p.label] = { x: px, y: py };

                    elements.push({
                        type: 'point',
                        x: px, y: py,
                        label: p.label,
                        labelDx: (p.offset?.[0] || 0.3) * scale,
                        labelDy: -(p.offset?.[1] || 0.3) * scale,
                        color: p.color || 'black'
                    });
                });
            }

            // 4. Lines
            if (data_internal.lines && Array.isArray(data_internal.lines)) {
                data_internal.lines.forEach(l => {
                    let pts = [];
                    if (l.pts && l.pts.length >= 2) {
                        pts = l.pts.map(pName => pointMap[pName]).filter(p => !!p);
                    } else if (l.points && l.points.length >= 2) {
                        pts = l.points.map(p => ({ x: mapX(p?.[0] ?? p?.x ?? 0), y: mapY(p?.[1] ?? p?.y ?? 0) }));
                    }

                    if (pts.length >= 2) {
                        elements.push({
                            type: pts.length === 2 ? 'line' : 'polyline',
                            points: pts,
                            x1: pts[0].x, y1: pts[0].y,
                            x2: pts[1].x, y2: pts[1].y,
                            stroke: l.color || 'indigo',
                            strokeWidth: l.linewidth || 2,
                            strokeDasharray: l.style === '--' ? '5,5' : undefined
                        });
                    }
                });
            }

            // 5. Circles
            if (data_internal.circles && Array.isArray(data_internal.circles)) {
                data_internal.circles.forEach(c => {
                    elements.push({
                        type: 'circle',
                        cx: mapX(c.center?.[0] ?? c.cx ?? 0),
                        cy: mapY(c.center?.[1] ?? c.cy ?? 0),
                        r: (c.radius || 1) * scale,
                        stroke: c.color || '#ff4d4d',
                        strokeDasharray: c.style === '--' ? '5,5' : undefined
                    });
                });
            }

            // 6. Labels
            if (data_internal.labels && Array.isArray(data_internal.labels)) {
                data_internal.labels.forEach(lbl => {
                    elements.push({
                        type: 'text',
                        x: mapX(lbl.pos?.[0] ?? lbl.x ?? 0),
                        y: mapY(lbl.pos?.[1] ?? lbl.y ?? 0),
                        text: lbl.text,
                        color: lbl.color || '#666'
                    });
                });
            }

            // 7. Angles
            if (data_internal.angles && Array.isArray(data_internal.angles)) {
                data_internal.angles.forEach(ang => {
                    let mid, v1, v2;
                    if (ang.pts && ang.pts.length === 3) {
                        v1 = pointMap[ang.pts[0]];
                        mid = pointMap[ang.pts[1]];
                        v2 = pointMap[ang.pts[2]];
                    } else if (ang.vertex && ang.p1 && ang.p2) {
                        mid = { x: mapX(ang.vertex?.[0] ?? ang.vertex?.x ?? 0), y: mapY(ang.vertex?.[1] ?? ang.vertex?.y ?? 0) };
                        v1 = { x: mapX(ang.p1?.[0] ?? ang.p1?.x ?? 0), y: mapY(ang.p1?.[1] ?? ang.p1?.y ?? 0) };
                        v2 = { x: mapX(ang.p2?.[0] ?? ang.p2?.x ?? 0), y: mapY(ang.p2?.[1] ?? ang.p2?.y ?? 0) };
                    }

                    if (mid && v1 && v2) {
                        const startAngle = Math.atan2(-(v1.y - mid.y), v1.x - mid.x) * (180 / Math.PI);
                        const endAngle = Math.atan2(-(v2.y - mid.y), v2.x - mid.x) * (180 / Math.PI);

                        elements.push({
                            type: 'arc',
                            center: mid,
                            radius: (ang.radius || 0.8) * scale,
                            startAngle,
                            endAngle,
                            label: ang.label,
                            stroke: ang.color || '#ff4d4d',
                            strokeWidth: 1.5
                        });
                    }
                });
            }

            return { elements, canvas: { width, height, viewBox: `0 0 ${width} ${height}` } };
        }

        // 1b. Transformation for Circle Spec (used by older batches)
        if (data_internal.center && data_internal.radius !== undefined) {
            const elements = [];
            const center = data_internal.center || [0, 0];
            const r = data_internal.radius || 5;

            const cx = 200;
            const cy = 150;
            const scale = 20;

            const resolvedCoords = { 'O': { x: cx + center[0] * scale, y: cy - center[1] * scale } };

            if (data_internal.points) {
                data_internal.points.forEach((p, idx) => {
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

            if (data_internal.lines && Array.isArray(data_internal.lines)) {
                data_internal.lines.forEach((l) => {
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

            if (data_internal.angles && Array.isArray(data_internal.angles)) {
                data_internal.angles.forEach((ang) => {
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

        // 1c. Transformation for Python Engine Spec (used by circle_properties_gen.py)
        if (data_internal.points && !data_internal.elements && (data_internal.lines || data_internal.circles)) {
            const elements = [];
            const pointMap = {};

            // 1. Circles
            if (data_internal.circles && Array.isArray(data_internal.circles)) {
                data_internal.circles.forEach((c, idx) => {
                    elements.push({
                        type: 'circle',
                        id: c.id || `c_${idx}`,
                        cx: c.cx,
                        cy: c.cy,
                        r: c.r,
                        stroke: c.stroke || 'black',
                        fill: c.fill || 'none'
                    });
                });
            }

            // 2. Points
            if (data_internal.points && typeof data_internal.points === 'object') {
                Object.entries(data_internal.points).forEach(([label, pos]) => {
                    pointMap[label] = { x: pos[0], y: pos[1] };
                    elements.push({
                        type: 'point',
                        id: label,
                        x: pos[0],
                        y: pos[1],
                        label: label,
                        // Heuristic for labels based on common geometric patterns
                        labelDx: label === 'O' ? -10 : (pos[0] < 150 ? -15 : 15),
                        labelDy: pos[1] < 150 ? -15 : 15
                    });
                });
            }

            // 3. Lines
            if (data_internal.lines && Array.isArray(data_internal.lines)) {
                data_internal.lines.forEach((l, idx) => {
                    const p1 = pointMap[l[0]];
                    const p2 = pointMap[l[1]];
                    if (p1 && p2) {
                        elements.push({
                            type: 'line',
                            x1: p1.x, y1: p1.y,
                            x2: p2.x, y2: p2.y,
                            stroke: 'black',
                            strokeWidth: 2
                        });
                    }
                });
            }

            return { elements, canvas: { width: 300, height: 300, viewBox: "0 0 300 300" } };
        }

        return data_internal;
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
                    return <circle key={idx} cx={el.cx} cy={el.cy} r={el.r} fill={el.fill || "none"} stroke={el.stroke || "currentColor"} strokeWidth={el.strokeWidth || 2} />;
                case 'line': {
                    let x1, y1, x2, y2;
                    if (el.from && el.to) {
                        const p1 = resolveCoords(el.from, elements);
                        const p2 = resolveCoords(el.to, elements);
                        x1 = p1.x; y1 = p1.y; x2 = p2.x; y2 = p2.y;
                    } else {
                        x1 = el.x1; y1 = el.y1; x2 = el.x2; y2 = el.y2;
                    }
                    return (
                        <g key={idx}>
                            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={el.stroke || "currentColor"} strokeWidth={el.strokeWidth || 2} strokeDasharray={el.strokeDasharray} />
                            {el.label && (
                                <text 
                                    x={(x1 + x2) / 2} 
                                    y={(y1 + y2) / 2} 
                                    dx={el.labelDx || 0} 
                                    dy={el.labelDy || 0} 
                                    textAnchor="middle" 
                                    fontSize={el.fontSize || 14} 
                                    fontWeight="bold" 
                                    fill={el.stroke || "currentColor"}
                                >
                                    {el.label}
                                </text>
                            )}
                        </g>
                    );
                }
                case 'polyline': {
                    if (!el.points || !Array.isArray(el.points)) return null;
                    const pointsStr = el.points.map(p => {
                        if (typeof p === 'object' && p.x !== undefined && p.y !== undefined) return `${p.x},${p.y}`;
                        const res = resolveCoords(p, elements); return `${res.x},${res.y}`;
                    }).join(' ');
                    return <polyline key={idx} points={pointsStr} fill={el.fill || "none"} stroke={el.stroke || "currentColor"} strokeWidth={el.strokeWidth || 2} strokeDasharray={el.strokeDasharray} />;
                }
                case 'polygon': {
                    if (!el.points || !Array.isArray(el.points)) return null;
                    const pointsStr = el.points.map(pid => {
                        if (typeof pid === 'object' && pid.x !== undefined && pid.y !== undefined) return `${pid.x},${pid.y}`;
                        const p = resolveCoords(pid, elements); return `${p.x},${p.y}`;
                    }).join(' ');
                    return <polygon key={idx} points={pointsStr} fill={el.fill || "rgba(255,255,255,0.1)"} stroke={el.stroke || "currentColor"} strokeWidth={el.strokeWidth || 2} />;
                }
                case 'axes': {
                    const viewW = processedData.canvas?.width || 400; const viewH = processedData.canvas?.height || 300;
                    const midX = viewW / 2; const midY = viewH / 2;
                    return (
                        <g key={idx}>
                            <line x1={0} y1={midY} x2={viewW} y2={midY} stroke="currentColor" opacity={0.5} strokeWidth={1} />
                            <line x1={midX} y1={0} x2={midX} y2={viewH} stroke="currentColor" opacity={0.5} strokeWidth={1} />
                            <circle cx={midX} cy={midY} r={3} fill="currentColor" />
                        </g>
                    );
                }
                case 'grid': {
                    const viewW = processedData.canvas?.width || 400;
                    const viewH = processedData.canvas?.height || 300;
                    const step = el.step || 20;
                    const lines = [];
                    for (let x = 0; x <= viewW; x += step)
                        lines.push(<line key={`gx-${x}`} x1={x} y1={0} x2={x} y2={viewH} stroke="currentColor" opacity={0.1} strokeWidth={0.5} />);
                    for (let y = 0; y <= viewH; y += step)
                        lines.push(<line key={`gy-${y}`} x1={0} y1={y} x2={viewW} y2={y} stroke="currentColor" opacity={0.1} strokeWidth={0.5} />);
                    return <g key={idx}>{lines}</g>;
                }
                case 'arc':
                case 'sector': {
                    if (el.path) return <path key={idx} d={el.path} fill={el.fill || "none"} stroke={el.stroke || "currentColor"} strokeWidth={1} />;
                    const radius = el.radius ?? el.r;
                    if ((el.center || (el.cx !== undefined && el.cy !== undefined)) && radius && el.startAngle !== undefined && el.endAngle !== undefined) {
                        const mid = el.center ? resolveCoords(el.center, elements) : { x: el.cx, y: el.cy };
                        const sRad = el.startAngle * (Math.PI / 180); const eRad = el.endAngle * (Math.PI / 180);
                        const x1 = mid.x + radius * Math.cos(sRad); const y1 = mid.y - radius * Math.sin(sRad);
                        const x2 = mid.x + radius * Math.cos(eRad); const y2 = mid.y - radius * Math.sin(eRad);
                        const largeFlag = Math.abs(el.endAngle - el.startAngle) > 180 ? 1 : 0;
                        const sweep = el.endAngle > el.startAngle ? 0 : 1;
                        const d = ["M", x1, y1, "A", radius, radius, 0, largeFlag, sweep, x2, y2].join(" ");

                        // Render Label if exists
                        let labelEl = null;
                        if (el.label) {
                            const midAngle = (el.startAngle + el.endAngle) / 2;
                            const midRad = midAngle * (Math.PI / 180);
                            // Push label further out than the arc
                            const labelDist = radius * 1.5;
                            const lx = mid.x + labelDist * Math.cos(midRad);
                            const ly = mid.y - labelDist * Math.sin(midRad);
                            labelEl = <text x={lx} y={ly} fontSize={12} fontWeight="bold" fill="currentColor" textAnchor="middle">{el.label}</text>;
                        }

                        return (
                            <g key={idx}>
                                <path d={d} fill={el.fill || "none"} stroke={el.stroke || "currentColor"} strokeWidth={el.strokeWidth || 1} />
                                {labelEl}
                            </g>
                        );
                    }
                    return null;
                }
                case 'ellipse': {
                    const cx = el.cx || (el.center ? resolveCoords(el.center, elements).x : 200);
                    const cy = el.cy || (el.center ? resolveCoords(el.center, elements).y : 150);
                    return (
                        <ellipse 
                            key={idx} 
                            cx={cx} 
                            cy={cy} 
                            rx={el.rx || 50} 
                            ry={el.ry || 20} 
                            fill={el.fill || "none"} 
                            stroke={el.stroke || "currentColor"} 
                            strokeWidth={el.strokeWidth || 1}
                            strokeDasharray={el.strokeDasharray}
                        />
                    );
                }
                case 'text':
                case 'label':
                    return <text key={idx} x={coords.x} y={coords.y} dx={el.dx || 0} dy={el.dy || 0} textAnchor={el.textAnchor || "middle"} fontSize={el.fontSize || 16} fontWeight="bold" fill="currentColor" style={{ fontFamily: 'Arial, sans-serif' }}>{el.text || el.label}</text>;
                case 'point':
                case 'point_on_circle':
                    return (
                        <g key={idx}>
                            <circle cx={coords.x} cy={coords.y} r={el.r || 3} fill="currentColor" />
                            {el.label && <text x={coords.x} y={coords.y} dx={el.labelDx || 10} dy={el.labelDy || -10} textAnchor="middle" fontSize={14} fontWeight="bold" fontFamily="Arial" fill="currentColor">{el.label}</text>}
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
