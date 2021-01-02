import SocketIO from 'socket.io-client';

const socket = SocketIO();
//const socket = SocketIO("http://localhost:3000");
socket.binaryType = 'arraybuffer';

export function on(type, listener) {
	socket.on(type, listener);
}
export function once(type, listener) {
	socket.once(type, listener);
}
export function emit(eventName, args, ack) {
	socket.emit(eventName, args, ack);
}
export const { id } = socket;
