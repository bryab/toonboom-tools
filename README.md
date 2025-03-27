# Toon Boom Tools

A collection of scripts for Toon Boom Harmony, mostly for compositing needs.

# Installation (for development purposes)

I will start compiling a zip of the scripts for end-users, but for now this is how I do it. Create the scripts directory if it does not exist, and then symlink the `./dist` folder into it:

## Windows Powershell

Just build directly into the folder ToonBoom loads scripts from:

```powershell
npx tsc --outDir "$env:APPDATA\Toon Boom Animation\Toon Boom Harmony Premium\2400-scripts"
```
