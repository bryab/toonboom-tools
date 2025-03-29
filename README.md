# Toon Boom Tools

A collection of scripts for Toon Boom Harmony, mostly for compositing needs.

# Gimme the tools

You can download a zip here: https://github.com/bryab/toonboom-tools/releases
Or if you want a nightly build, go to the 'Actions' section in here and download the latest build artifact.

# Dev Build

## Windows Powershell

```powershell
# Install deps
npm install
# Set target dir
$SCRIPTS_DIR="$env:APPDATA\Toon Boom Animation\Toon Boom Harmony Premium\2400-scripts"
$ICONS_DIR="$($SCRIPTS_DIR)\script-icons"
# Copy the script icons into the expected directory
New-Item -ItemType Directory -Force -Path $ICONS_DIR
cp ".\dist\script-icons\*" $ICONS_DIR
# Build Typescript into Javascript, directly into the expected directory
npx tsc --outDir $SCRIPTS_DIR
```
