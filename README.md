# About
This is a script that automates using ImageMagick to add padding to a set of images to make them fit different resolutions without having to scale them (so no quality is lost). It does this by mirroring the edge pixels to make the canvas larger.

# Installation
1. Install ImageMagick (on OSX with brew, simply `brew install imagemagick`).
1. Clone the git repository, cd into it.
1. Install dependencies with `npm install`

# Usage
If you use `node image-reframe.js -h`, the following help documentation will be displayed:

```
  Usage: image-reframe [options]

  Options:

    -h, --help                      output usage information
    -V, --version                   output the version number
    -d, --directory <path>          The directory of images to convert.
            If not given, the directory will be "."
    -r, --resolution <resolutions>  A comma separated
            list of resolutions (a resolution is two numbers
            separated by x, such as 800x640). For each
            resolution, a copy of each image will be created at
            that resolution.
```

So, for example, if you wanted to resize a directory full of wallpapers to fit both 13" and 15" MacBook Pro Retinas, you could use the command:

`node image-reframe.js -d /path/to/wallpapers -r 2880x1800,2560x1600`
