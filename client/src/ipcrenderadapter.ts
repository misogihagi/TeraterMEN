const { ipcRenderer } = window;
export let id;
ipcRenderer.invoke('connect').then((result) => {
	id = result;
	ipcRenderer.send('connect');
});
export function on(type, listener) {
	ipcRenderer.on(type, (event, arg) => {
		listener(arg);
	});
}
export function once(type, listener) {
	ipcRenderer.once(type, (event, arg) => {
		listener(arg);
	});
}
export function emit(eventName, args) {
	ipcRenderer.send(eventName, args);
}
