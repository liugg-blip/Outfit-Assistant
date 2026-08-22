# DAILEMA Outfit Assistant for Windows

DAILEMA is a local Windows desktop application for outfit color coordination, focus-item styling, body-type comparison, and two-dimensional garment visualization.

The original native iOS and App Store release plan has been discontinued. This repository now maintains the Windows desktop edition only.

> 中文用户：应用内可切换简体中文。发布目录中另有 `使用教程.txt`。

## Features

- Build coordinated palettes for tops, bottoms, socks, and shoes.
- Choose one focus item and keep the remaining garments visually supportive.
- Lock selected items while generating alternative outfit suggestions.
- Browse built-in body examples ranging from XXS to 4XL.
- Import a front-facing full-body model photo.
- Browse or import tops, bottoms, socks, and shoes.
- Preview garments as local two-dimensional overlays.
- Switch between English and Simplified Chinese.
- Open Xiaohongshu and Pinterest searches for external styling inspiration.

## Privacy

Color analysis runs locally. Imported model and garment images are stored in the application's local IndexedDB data and are not uploaded automatically.

External inspiration buttons open the system browser. The application does not embed or scrape content from Xiaohongshu or Pinterest.

## Preview Limitations

The fitting studio is intended for comparing body proportions, garment silhouettes, and colors. It does not provide exact sizing or physically accurate simulation of fabric folds, drape, stretch, fit, or body occlusion.

Always consult the garment brand's size chart and try on the actual garment before purchasing.

## Project Structure

- `app/dist/assets/app.js`: recovered frontend business bundle containing the color rules and original interface.
- `app/dist/desktop.js`: desktop preference layer for gender and focus-item settings.
- `app/dist/localization.js`: English-default interface and language settings.
- `app/dist/wardrobe.js`: model library, wardrobe library, local imports, and fitting studio.
- `app/dist/assets/atelier.css`: main fashion workspace theme.
- `app/dist/assets/wardrobe.css`: model and wardrobe studio styling.
- `design/silhouettes-v2.json`: maintainable mannequin paths and interaction regions.
- `app/electron/main.cjs`: Electron window, security boundaries, and external-link handling.
- `scripts/check.cjs`: offline structural regression checks.
- `scripts/build.cjs`: Windows folder-build script.

The original TypeScript source was not preserved. The current frontend bundle was recovered from a verified `app.asar` build. Major changes to the core color engine should gradually move that logic back into readable source modules.

## Build

Prepare the local Electron runtime once:

```powershell
node scripts/seed-runtime.cjs
```

After changing `design/silhouettes-v2.json`, apply the mannequin data:

```powershell
node scripts/apply-silhouettes.cjs
```

Run the checks and create the Windows folder build:

```powershell
node scripts/check.cjs
node scripts/build.cjs
```

The generated application folder is placed under `release/`. Keep the complete folder together; the executable cannot run correctly when copied by itself.

## Repository Scope

This public repository contains maintainable application files and build scripts only. Electron runtime files, generated releases, imported user images, logs, and local application data are excluded from Git.
