# Specialist title logos

An image set of logos used by Specialist Titles (eg Investors Chronicle, Non-executive Directors' Club)

- [Usage](#usage)
  - [Getting these images in a different colour/format/size](#getting-these-images-in-a-different-colourformatsize)
- [Adding or modifying logos](#adding-or-modifying-logos)
- [Removing an image](#removing-an-image)

## Usage

As with all image sets, these are available via the [Image Service](https://www.ft.com/__origami/service/image/v2).

To get a logo from the Image Service, use the following URL (replace the `product_source` with your product name and `title_name` with the logo you want)

`https://www.ft.com/__origami/service/image/v2/images/raw/specialisttitle-v1:{title_name}?source={product_source}`

So to get the Non-executive Directors' Club:
`https://www.ft.com/__origami/service/image/v2/images/raw/specialisttitle-v1:ned-logo?source=test`

### Getting these images in a different colour/format/size

The Image Service will convert these images on the fly if you pass in the right parameters. To find out more about this, please see the [Image Service documentation](https://www.ft.com/__origami/service/image/v2/docs/api)

## Adding or modifying logos

To keep images consistent, please follow these guidelines:

- Logos must be SVG format
- Logos must be named as the title they represent. Filenames must be all lower-case hyphenated.
  - **good**: ned-logo.png, ic-logo.svg
  - **bad**: InvestorsChronicle-logo.png, logo.svg

## Removing an image

Please [raise an issue](http://github.com/financial-times/origami/issues) so that the Origami team can manage the deprecation process.
