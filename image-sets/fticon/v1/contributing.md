# How to contribute an FT icon

Thank you for your interest in contributing an FT Icon! As our icons are used by a lot of different applications, we have a few constraints for new ones. If you aren't sure if your new icon meets any of these, please [raise an issue](http://github.com/financial-times/origami/issues), or ask in the [#origami-support slack channel](https://financialtimes.slack.com/messages/origami-support/).
Thank you!

## Adding or updating an icon

If you want to add or update an icon, please open a pull request, making sure the new icon meets the following criteria:

### Design:

1. Icons must be a single colour (black)
1. Icons must be square
1. Icons must meet a need that is not already met by a pre-existing icon
1. Icons should be suitable for reuse in more than 1 application
1. Icons should align to a 40x40 pixel grid, with 10px padding on each side
1. Icons should be a solid shape rather than outlines where possible
1. Icons should have a minimum line thickness of 2px (including negative space thickness)
1. Icons should have square rather than rounded corners where suitable

### Technical:

1. Icons must be SVG v1.1
1. Icons must have been run through an SVG compression service (such as [SVGOMG](https://jakearchibald.github.io/svgomg/))
1. Icons must have been tested with the [Responsive Image Service](https://www.ft.com/__origami/service/image/v2/docs/url-builder)'s SVG -> PNG conversion. [How do I do this?](#how-to-test-an-icon-with-the-image-service)
1. Icons must have been tested with the Image Service's tinting option. [How do I do this?](#how-to-test-an-icon-with-the-image-service)

### Naming conventions:

- All lower case
- Contain only letters, numbers and hyphens (no spaces)
- End with .svg
- **Good**: columnists.svg, back-arrow.svg
- **Bad**: RightArrow.svg, linked_in.svg, yahoo!.svg

## How to add a new icon

If your icon meets the design and technical criteria please follow the following steps and then open a Pull Request:

1. Clone the repository

		git clone https://github.com/Financial-Times/origami-image-service.git
		cd origami-image-service

1. Create a branch

		git checkout -b add-new-icon-[icon-name]

1. Add or edit an SVG file in the `image-sets/fticon/v1/` folder.
1. Commit your changes

		git add image-sets/fticon/v1/your-new-icon.svg
		git commit -m "Added new [icon-name] icon"
		git push origin add-new-icon

1. Go to Github and open a pull request

## Removing an icon

A lot of people use FT icons in different ways. To remove an icon completely from FT icons, please [raise an issue](http://github.com/financial-times/origami/issues) so that the Origami team can manage the deprecation process.

## How to test an icon with the Image Service

The Image Service has some quirks, so new SVG icons should be tested with it before shipping.
The following requests cover all known quirks with SVGs.

### Testing PNG conversion

- `https://origami-image-service-dev.herokuapp.com/__origami/service/image/v2/images/raw/{http://path-to-image.svg}?source=test&format=png`

### Testing PNG + resizing

- `https://origami-image-service-dev.herokuapp.com/__origami/service/image/v2/images/raw/{http://path-to-image.svg}?source=test&format=png&width=400`

### Testing tinting

- `https://origami-image-service-dev.herokuapp.com/__origami/service/image/v2/images/raw/{http://path-to-image.svg}?source=test&tint=00ff00`
