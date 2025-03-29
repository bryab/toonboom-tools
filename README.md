# bryab's toonboom tools

A collection of scripts for Toon Boom Harmony, mostly for compositing needs.

You can download a zip here: https://github.com/bryab/toonboom-tools/releases

All scripts are prefixed with `BF_` so they're easier to find in Harmony.

_If you want a more recent build, go to the 'Actions' section up above and download the latest build artifact._

## Link to Multi-Layer-Write

![BF_LinkToMultiLayerWrite]("./icons/BF_LinkToMultiLayerWrite.png")

Connects the selected nodes in the node graph to a root-level MLW node. If no MLW node exists, it will be created. Nodes within groups can be selected, and their output will be wired all the way down to the root level automatically. MLW layers will be named according to the name of the node.

## Stack Nodes

![BF_StackNodes]("./icons/BF_StackNodes.png")

Just clean up the selected nodes by putting them in a vertical stack.

## Align Horizontal

![BF_AlignHorizontal]("./icons/BF_AlignHorizontal.png")

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
cp ".\icons\*.png" $ICONS_DIR
# Build Typescript into Javascript, directly into the expected directory
npx tsc --outDir $SCRIPTS_DIR
```

# License

All code is under MIT license.

Icons are from the Lucide project, and are subject to [their own license.](https://lucide.dev/license)
