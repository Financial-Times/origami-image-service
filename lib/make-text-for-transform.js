

module.exports = makeTextForTransform;

function makeTextForTransform(transform) {
	let text = '';
	for (const [name, value] of Object.entries(transform)) {
		if (name === 'uri' || name === 'name' || name === 'fit') {
			continue;
		}
		if (value === undefined || value === 'auto') {
			continue;
		}
		text += `${name}=${value}\n`;
	}
	return text;
}
