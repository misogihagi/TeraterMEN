export function str2buf(str) {
	const bufArr = Array.from(str).map((e:string) => e.charCodeAt(0));
	const bufRes = new ArrayBuffer(bufArr.length);
	const bufView = new Uint8Array(bufRes);
	for (let i = 0; i < bufArr.length; i += 1) { bufView[i] = bufArr[i]; }
	return bufRes;
}
