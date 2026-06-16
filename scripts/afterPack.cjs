// electron-builder afterPack hook.
// Without a paid Apple Developer certificate we can't notarize, but we CAN
// give the macOS bundle a valid ad-hoc signature. That's what turns the scary
// "App is damaged and can't be opened" dead-end into the normal
// "unidentified developer → Open Anyway" flow on download.
const { execSync } = require("child_process");
const path = require("path");

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== "darwin") return;
  const appName = `${context.packager.appInfo.productFilename}.app`;
  const appPath = path.join(context.appOutDir, appName);
  console.log(`  • ad-hoc signing  ${appPath}`);
  // sign nested code first, then the outer bundle (deep handles the tree)
  execSync(`codesign --force --deep --sign - "${appPath}"`, { stdio: "inherit" });
};
