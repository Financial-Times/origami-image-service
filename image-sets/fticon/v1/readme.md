# FT Icon

This is the icon set for FT websites.

The icons have been designed to work best at 40px width and height. At this size they align precisely with the pixel grid and do not appear blurry on screens with a DPR of 1 (non-retina screens).

- [Usage](#usage)
- [Creating or adding icons](#creating-or-modifying-new-icons)
- [SVG icons GOTCHAs](#svg-icons-GOTCHAs)

## Usage

You can use FT Icons in the following ways:

1. You can access them directly from the Image Service, eg [https://www.ft.com/__origami/service/image/v2/images/raw/fticon-v1:podcast?source=test](https://www.ft.com/__origami/service/image/v2/images/raw/fticon-v1:podcast?source=test)
1. There is also an Origami component that wraps this icon set: [o-icons](https://github.com/Financial-Times/origami/tree/HEAD/components/o-icons/). As with all Origami components, you can use o-icons with the Build Service, or as an installable component. See the [o-icons README](https://github.com/Financial-Times/origami/tree/HEAD/components/o-icons/#readme) for more information.

## Creating or modifying new icons

Please check out our [contributing guide](./contributing.md) for design and development guidelines for adding or modifying icons.

## SVG icons GOTCHAs

### My icons are blurry

All of our icons are vectors. At small sizes, the process of converting a vector to a bitmap (rasterization) will leave you with with blurry icons. All of FT icons have been drawn to map precisely to a 40x40px grid. If you need to use these at a smaller or larger size, they may appear fuzzy as the browser tries to anti-alias them.

### I'm exporting my icons at 40px and they should work but they're still fuzzy

Sometimes sketch will export icons with rounding errors, so if you think you're exporting them on the correct grid and they're still blurry, open the source and look if the path points are values like 372.00000001. The fix for this is to either:

- not use sketch
- hand edit your SVGs to remove these errors

### When I convert my icons to PNG, they're blurry

This will happen if the source SVG is smaller than the size you're converting to. This is because the Image Service converts the format first and then resizes, resulting in blurriness.
The solution is to make sure your source SVGs have a width and height bigger than the size they're likely to be used at.

### My icon is not converting to a PNG properly

If your icon has a clipPath in it, then with v1 of the Image Service, it may not render properly. Usually it will look like the clipPath isn't there. To fix this you'll need to redraw your icon without the clipPath.
