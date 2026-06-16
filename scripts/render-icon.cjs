// Renders build/icon.svg -> build/icon.png (1024x1024) for electron-builder.
// Uses a local Chromium-family browser via puppeteer-core (no native deps).
const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const svg = fs.readFileSync(path.join(ROOT, "build", "icon.svg"), "utf8");
const html = `<!doctype html><html><head><style>html,body{margin:0;background:transparent}</style></head><body>${svg}</body></html>`;

// common install locations for a Chromium-family browser
const CANDIDATES = [
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  process.env.CHROME_PATH || "",
].filter(Boolean);

(async () => {
  const executablePath = CANDIDATES.find((p) => fs.existsSync(p));
  if (!executablePath) {
    console.error("No Chromium-family browser found; set CHROME_PATH to render the icon.");
    process.exit(1);
  }
  const browser = await puppeteer.launch({
    executablePath,
    headless: "new",
    args: ["--no-sandbox", "--force-device-scale-factor=1"],
    defaultViewport: { width: 1024, height: 1024, deviceScaleFactor: 1 },
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  const el = await page.$("svg");
  await el.screenshot({ path: path.join(ROOT, "build", "icon.png"), omitBackground: true });
  await browser.close();
  console.log("wrote build/icon.png");
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
