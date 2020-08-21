/*
schema模索中...
Enter:{
 altKey{
  true:[0x0d]
  false
 }
 ctrlKey,
 shiftKey
 ...
*/

/*
各配列のインデックスは以下の表に対応。冗長すぎるか
	 shiftKey	 altKey	 ctrlKey
0	FALSE	FALSE	FALSE
1	FALSE	FALSE	TRUE
2	FALSE	TRUE	FALSE
3	FALSE	TRUE	TRUE
4	TRUE	FALSE	FALSE
5	TRUE	FALSE	TRUE
6	TRUE	TRUE	FALSE
7	TRUE	TRUE	TRUE
*/

const terrible_table = [
	{
		Enter: [0x0d],
		Tab: [0x09],
		Backspace: [0x08],
		ArrowUp: [0x1b, 0x5b, 0x41],
		ArrowDown: [0x1b, 0x5b, 0x42],
		ArrowRight: [0x1b, 0x5b, 0x43],
		ArrowLeft: [0x1b, 0x5b, 0x44],
		Delete: [0x7f],
	},
	{
		c: [0x03],
	},
];

const key2buf = (dom) => {
	// refactoring welcome here!
	const { key } = dom;
	const bufArr = [];
	const table = terrible_table[dom.ctrlKey ? 1 : 0];

	if (key in table) {
		table[key].forEach((v) => bufArr.push(v));
	} else {
		bufArr.push(key.charCodeAt());
	}
	const bufRes = new ArrayBuffer(bufArr.length);
	const bufView = new Uint8Array(bufRes);
	for (let i = 0; i < bufArr.length; i += 1)bufView[i] = bufArr[i];

	return bufRes;
};

export default key2buf;
