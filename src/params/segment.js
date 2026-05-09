/** @type {import('@sveltejs/kit').ParamMatcher} */
export function match(param) {
	return /^seg\d+\.ts$/gi.test(param);
}
