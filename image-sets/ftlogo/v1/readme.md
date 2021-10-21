# Logo images

Image set for all Financial Times product logos

- [Usage](#usage)
- [Adding or modifying logos](#adding-or-modifying-logos)

## Usage

As with all image sets, these are available via the [Image Service](https://www.ft.com/__origami/service/image/v2).

To get an social logo from the Image Service, use the following URL (replace the `product_source` with your product name and `logo_name` with the logo you want.

`https://www.ft.com/__origami/service/image/v2/images/raw/ftlogo-v1:{logo_name}?source={product_source}`

So to get the FT masthead:
`https://www.ft.com/__origami/service/image/v2/images/raw/ftlogo-v1:brand-ft-masthead?source=test`

### Getting these images in a different colour/format/size

The Image Service will convert these images on the fly if you pass in the right parameters. To find out more about this, please see the [Image Service documentation](https://www.ft.com/__origami/service/image/v2/docs/api).

### Adding or modifying logos

To keep logo images consistent, please follow these guidelines:

- Logos must be SVG format
- Logos must be passed through an SVG compressor like SVGOMG
- Logos must be named with lowercase, hyphen separated:
  - **good** brand-financial-times.svg
  - **bad** BrandFinancialTimes.svg brand_financial_times.svg
