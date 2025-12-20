import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";

/**
 * Exports an SVG element to a PNG file
 * 
 * @param svgElement - The SVG element or SVG string to export
 * @param outputPath - Path where the PNG file should be saved
 * @param width - Width of the output image (default: 800)
 * @param height - Height of the output image (default: 600)
 */
export async function exportSvgToPng(
  svgElement: SVGElement | string,
  outputPath: string,
  width: number = 800,
  height: number = 600
): Promise<void> {
  // Ensure the output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Launch a headless browser
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Get SVG content as string
    let svgContent: string;
    if (typeof svgElement === "string") {
      svgContent = svgElement;
    } else {
      svgContent = svgElement.outerHTML;
    }

    // Create an HTML page with the SVG
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              background: white;
            }
            svg {
              display: block;
            }
          </style>
        </head>
        <body>
          ${svgContent}
        </body>
      </html>
    `;

    // Set viewport size
    await page.setViewportSize({ width, height });

    // Load the HTML content
    await page.setContent(html, { waitUntil: "networkidle" });

    // Wait a bit for any animations or rendering to complete
    await page.waitForTimeout(100);

    // Take a screenshot
    await page.screenshot({
      path: outputPath,
      type: "png",
      fullPage: false,
    });
  } finally {
    await browser.close();
  }
}
