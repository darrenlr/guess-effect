import { useEffect, useRef } from "react";
import ColorThief from "colorthief";

export default function BoxArtCanvas({
	src,
	pixelSize = 8,
	width = 264,
	height = 352,
	onColorsExtracted,
	showCleanImage = false, // NEW PROP
}) {
	const canvasRef = useRef(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d", { willReadFrequently: true });

		const img = new Image();
		img.crossOrigin = "anonymous";
		img.src = src;

		img.onload = () => {
			ctx.clearRect(0, 0, width, height);
			ctx.imageSmoothingEnabled = false;

			if (showCleanImage) {
				ctx.drawImage(img, 0, 0, width, height);
			} else {
				// Continue pixelated rendering
				const scaledWidth = Math.max(1, Math.floor(width / pixelSize));
				const scaledHeight = Math.max(1, Math.floor(height / pixelSize));

				const offCanvas = document.createElement("canvas");
				offCanvas.width = scaledWidth;
				offCanvas.height = scaledHeight;
				const offCtx = offCanvas.getContext("2d");

				offCtx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

				ctx.drawImage(
					offCanvas,
					0,
					0,
					scaledWidth,
					scaledHeight,
					0,
					0,
					width,
					height
				);
			}

			// Color extraction (runs either way)
			if (onColorsExtracted) {
				try {
					const colorThief = new ColorThief();
					const tempImg = new Image();
					tempImg.crossOrigin = "anonymous";
					tempImg.src = src;
					tempImg.onload = () => {
						const palette = colorThief.getPalette(tempImg, 2);
						const formatted = palette.map(
							(color) => `rgb(${color[0]}, ${color[1]}, ${color[2]})`
						);
						onColorsExtracted(formatted);
					};
				} catch (e) {
					console.warn("Color extraction failed:", e);
				}
			}
		};
	}, [src, pixelSize, showCleanImage]);

	return <canvas ref={canvasRef} width={width} height={height} />;
}
