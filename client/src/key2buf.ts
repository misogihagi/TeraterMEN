import type * as t from 'teratermen';
import { evaluateKeyboardEvent } from './evaluateKeyboardEvent';

export const key2buf = (
	ev: t.IKeyboardEvent,
	applicationCursorMode: boolean,
	isMac: boolean,
	macOptionIsMeta: boolean
	) => {
	// refactoring welcome here!
	const key = evaluateKeyboardEvent(
		ev,
		applicationCursorMode,
		isMac,
		macOptionIsMeta
	).key;
	const bufArr = [];

	Array.from(key).forEach( k => bufArr.push(k.charCodeAt(0) ));
	const bufRes = new ArrayBuffer(bufArr.length);
	const bufView = new Uint8Array(bufRes);
	for (let i = 0; i < bufArr.length; i += 1)bufView[i] = bufArr[i];

	return bufRes;
};

export default key2buf;
