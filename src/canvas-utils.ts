import { NodeDisplayData, PartialButFor, PlainObject } from "sigma/types";
import { Settings } from "sigma/settings";

const TEXT_COLOR = "#000000";


export function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}


export function drawHover(context: CanvasRenderingContext2D, data: PlainObject, settings: PlainObject) {
  const size = settings.labelSize;
  const font = settings.labelFont;
  const weight = settings.labelWeight;

  const label = data.label;

  context.beginPath();
  context.fillStyle = "#fff";
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 2;
  context.shadowBlur = 8;
  context.shadowColor = "#000";

  context.font = `${weight} ${size}px ${font}`;
  const textWidth = context.measureText(label).width;

  const x = Math.round(data.x);
  const y = Math.round(data.y);
  const w = Math.round(textWidth + size / 2 + data.size + 3);
  const hLabel = Math.round(size / 2 + 4);
  
  drawRoundRect(context, x, y  - 12, w, hLabel + 12, 5);
  context.closePath();
  context.fill();

  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;
  context.shadowBlur = 0;

  context.fillStyle = TEXT_COLOR;
  context.font = `${weight} ${size}px ${font}`;
  context.fillText(label, data.x + data.size + 3, data.y + size / 3);
}

/**
 * Custom label renderer
 */
export default function drawLabel(
  context: CanvasRenderingContext2D,
  data: PartialButFor<NodeDisplayData, "x" | "y" | "size" | "label" | "color">,
  settings: Settings,
): void {
  if (!data.label) return;

  const size = settings.labelSize,
    font = settings.labelFont,
    weight = settings.labelWeight;

  context.font = `${weight} ${size}px ${font}`;
  const width = context.measureText(data.label).width + 8;

  context.fillStyle = "#ffffffcc";
  context.fillRect(data.x + data.size, data.y + size / 3 - 15, width, 20);

  context.fillStyle = "#000";
  context.fillText(data.label, data.x + data.size + 3, data.y + size / 3);
}