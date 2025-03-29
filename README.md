# Toon Boom Tools

A collection of scripts for Toon Boom Harmony, mostly for compositing needs.

You can download a zip here: https://github.com/bryab/toonboom-tools/releases

_If you want a more recent build, go to the 'Actions' section up above and download the latest build artifact._

## Connect to Multi-Layer-Write

Connects the selected nodes in the node graph to a root-level MLW node. If no MLW node exists, it will be created. Nodes within groups can be selected, and their output will be wired all the way down to the root level automatically. MLW layers will be named according to the name of the node.

## Stack Nodes

Just clean up the selected nodes by putting them in a vertical stack.

## Align Horizontal

Aligns the selected nodes on the X-axis in the node graph.

# Development

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
