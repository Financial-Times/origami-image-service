# FT Flag

An image set of world flags.

- [Usage](#usage)
  - [Getting these flags in a different format/size](#getting-these-flags-in-a-different-formatsize)
- [Adding or modifying flags](#adding-or-modifying-flags)
- [Removing an icon](#removing-an-icon)

## Usage

As with all image sets, these are available via the [Image Service](https://www.ft.com/__origami/service/image/v2).

To get a flag from the Image Service, use the following URL (replace the `product_source` with your product name and `flag_name` with the ISO ALPHA-2 country code for the place you want)

`https://www.ft.com/__origami/service/image/v2/images/raw/ftflag:{flag_name}?source={product_source}`

So to get Japan:
`https://www.ft.com/__origami/service/image/v2/images/raw/flag:jp?source=test`

### Getting these flags in a different format/size

The Image Service will convert these images on the fly if you pass in the right parameters. To find out more about this, please see the [Image Service documentation](https://www.ft.com/__origami/service/image/v2/docs/api)

## Adding or modifying flags

To keep flags consistent, please follow these guidelines:

- Flags must be SVG format
- Flags must be in a 4:3 aspect ratio
- Flags must be named according to their ISO ALPHA-2 country
- Flag names must be lower case
  - **good**: jp.svg, gb.svg
  - **bad**: japan.svg, JP.svg, jp

## Removing a flag

Please [raise an issue](http://github.com/financial-times/origami/issues) so that the Origami team can manage the deprecation process.
