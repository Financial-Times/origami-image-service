(function() {
	'use strict';

	// Selectors used in the comparison component
	var selectors = {
		component: '[data-component=comparison]',
		roles: {
			v1Image: '[data-component-role=v1-image]',
			v1ImageFormat: '[data-component-role=v1-image-format]',
			v1ImageSize: '[data-component-role=v1-image-size]',
			v2Image: '[data-component-role=v2-image]',
			v2ImageFormat: '[data-component-role=v2-image-format]',
			v2ImageSize: '[data-component-role=v2-image-size]'
		},
		classes: {
			match: 'comparison-image-match--yes',
			noMatch: 'comparison-image-match--no',
		}
	};

	// Create comparisons
	document.addEventListener('o.DOMContentLoaded', function() {
		Array.from(document.querySelectorAll(selectors.component)).forEach(createComparison);
	});

	// Create a comparison component
	function createComparison(element) {

		// Get all the component elements
		var elements = {
			main: element
		};
		Object.keys(selectors.roles).map(function(key) {
			elements[key] = elements.main.querySelector(selectors.roles[key]);
		});

		// Data store
		var imageData = {
			v1Format: elements.v1ImageFormat.innerText,
			v1Size: parseInt(elements.v1ImageSize.innerText, 10),
			v2Format: null,
			v2Size: null
		};

		// Fetch the v2 image and fill out details
		fetch(elements.v2Image.src, {
			method: 'HEAD',
			headers: {
				Accept: (supportsWebP() ? 'image/webp,*/*' : '*/*')
			}
		}).then(function(response) {
			elements.v2ImageFormat.innerHTML = imageData.v2Format = response.headers.get('Content-Type');
			elements.v2ImageSize.innerHTML = imageData.v2Size = parseInt(response.headers.get('Content-Length'), 10);
			addComparisonColors();
		});

		function addComparisonColors() {
			if (imageData.v1Format === imageData.v2Format || imageData.v2Format === 'image/webp') {
				elements.v1ImageFormat.classList.add(selectors.classes.match);
				elements.v2ImageFormat.classList.add(selectors.classes.match);
			} else {
				elements.v1ImageFormat.classList.add(selectors.classes.noMatch);
				elements.v2ImageFormat.classList.add(selectors.classes.noMatch);
			}
			if (imageData.v1Size >= imageData.v2Size) {
				elements.v1ImageSize.classList.add(selectors.classes.noMatch);
				elements.v2ImageSize.classList.add(selectors.classes.match);
			} else {
				elements.v1ImageSize.classList.add(selectors.classes.match);
				elements.v2ImageSize.classList.add(selectors.classes.noMatch);
			}
			var percentageDifference = ((imageData.v2Size - imageData.v1Size) / imageData.v1Size) * 100;
			var percentageDifferenceAbs = Math.abs(Math.round(percentageDifference));
			var label = (percentageDifference < 0 ? 'smaller' : 'larger');
			elements.v2ImageSize.innerHTML += ' (' + percentageDifferenceAbs + '% ' +label + ')';
		}

		function supportsWebP() {
			var canvas = document.createElement('canvas');
			if (!!(canvas.getContext && canvas.getContext('2d'))) {
				return (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0);
			}
			return false;
		}

	}

}());
