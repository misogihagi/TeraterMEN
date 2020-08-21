<script>
import '../node_modules/xterm/css/xterm.css';
import SocketIO from 'socket.io-client';
import URI from 'urijs';

import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

import { onMount } from 'svelte';
import key2buf from './key2buf';

const loadingfilecount = 12;

const cssfile = `/loading/load${Math.floor(Math.random() * loadingfilecount)}.css`;
const fileref = document.createElement('link');
fileref.setAttribute('rel', 'stylesheet');
fileref.setAttribute('type', 'text/css');
fileref.setAttribute('href', cssfile);
document.getElementsByTagName('head')[0].appendChild(fileref);

const socket = SocketIO();
socket.binaryType = 'arraybuffer';
const term = new Terminal();
const fitAddon = new FitAddon();
term.loadAddon(fitAddon);

const store = localStorage.getItem('store') ? JSON.parse(localStorage.getItem('store')) : {};
let session = '';

socket.on('connect', () => {
	document.getElementById('overlay').classList.add('overlay-on');
	Object.keys(store).forEach((key) => {
		if (store[key] === document.location.search) {
			session = key;
		}
	});
	if (!session) session = socket.id;
	socket.emit('join', {
		id: session,
		config: URI(document.location.search.replace(/\?q=(.+)/, '$1'))._parts,
	});
});

socket.on('join', (msg) => {
	if (msg === 'connect') {
		document.getElementById('overlay').classList.remove('overlay-on');
		store[session] = document.location.search;
		localStorage.setItem('store', JSON.stringify(store));
	} else if (msg === 'expired') {
		document.getElementById('overlay').classList.remove('overlay-on');
		delete store[session];
		session = socket.id;
		store[socket.id] = document.location.search;
		localStorage.setItem('store', JSON.stringify(store));
	}
});

socket.on('relay', (msg) => {
	term.write(new Uint8Array(msg));
});
term.onKey((e) => {
	socket.emit('relay', {
		id: session,
		buf: key2buf(e.domEvent),
	});
});
onMount(() => {
	term.open(document.getElementById('terminal'));
	fitAddon.fit();
	((overlay, xscreen) => {
		overlay.style.height = xscreen.style.height;
	})(document.getElementById('overlay'), document.querySelector('.xterm-screen'));
});
</script>
<main>
	<div id="wrapper">
		<div id="overlay" class="overlay overlay-on"><div class="load-container"><div class="load"><div class="loader">Loading...</div></div></div></div>
		<div id="terminal"></div>
	</div>
</main>
<style>
.overlay {
	display:none;
	z-index: 100;
	background: silver;
	position: absolute;
	width: 100%;
}
.overlay.overlay-on {
	opacity: 0.8;
	display:block;
}
.load-container {
    width: 100%;
    height: 100%;
	position:absolute;
}

#wrapper {
	width: 100vw;
	height: 100vh;
	overflow-y: scroll;
}
</style>