<script>
import '../node_modules/xterm/css/xterm.css';
import URI from 'urijs';

import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

import { onMount } from 'svelte';

import * as adapter from 'moduleadapter';
import { key2buf } from './key2buf';
import { str2buf } from './str2buf';

import {hostURI} from './store'
import Ttmendlg from './ttmendlg.svelte';

const loadingfilecount = 12;

const cssfile = `loading/load${Math.floor(Math.random() * loadingfilecount)}.css`;
const fileref = document.createElement('link');
fileref.setAttribute('rel', 'stylesheet');
fileref.setAttribute('type', 'text/css');
fileref.setAttribute('href', cssfile);
document.getElementsByTagName('head')[0].appendChild(fileref);

hostURI.set(document.location.hash.slice(1))
const init={
	suite:"tcpip",
	protocol:"ssh",
	port:22,
}

let hostConfig = URI(document.location.hash.slice(1))._parts;
const term = new Terminal();
const fitAddon = new FitAddon();
term.loadAddon(fitAddon);

const join = (config) => {
	adapter.emit('join', {
		id: session,
		config,
	});
};
const store = localStorage.getItem('store') ? JSON.parse(localStorage.getItem('store')) : {};
let session = '';
let hashURI=''
adapter.once('connect', initConfigStr => {
	document.getElementById('loadOverlay').classList.remove('overlay-on');
	ttmendlgActive=true
	const initConfig=JSON.parse(initConfigStr)
	for (let prpty in initConfig){
		init[prpty]=initConfig[prpty] || ''
	}
	init.suite = initConfig.protocol==="serial" ? "serial" : "tcpip"
	Object.keys(store).forEach((key) => {
		if (store[key] === document.location.hash.slice(1)) {
			session = key;
		}
	});
	if (!session) session = adapter.id;
	if (hostConfig.hostname) join(hostConfig);
});
adapter.once('join', (msg) => {
	if (msg === 'reconnect') {
		document.getElementById('loadOverlay').classList.remove('overlay-on');
		store[session] = document.location.hash.slice(1);
		localStorage.setItem('store', JSON.stringify(store));
	} else if (msg === 'connect') {
		document.getElementById('loadOverlay').classList.remove('overlay-on');
		delete store[session];
		session = adapter.id;
		store[adapter.id] = document.location.hash.slice(1);
		localStorage.setItem('store', JSON.stringify(store));
	}
});

adapter.on('relay', (msg) => {
	term.write(new Uint8Array(msg));
});

term.onKey((e) => {
	adapter.emit('relay', {
		id: session,
		buf: key2buf(e.domEvent, term._core._coreService.decPrivateModes),
	});
});

onMount(() => {
	hostURI.subscribe(v=>{
		hashURI=v
	})
	document.getElementById('hash').addEventListener('change', (e) => {
		hostConfig = URI(e.target.value)._parts;

		if (hostConfig.hostname) {
			join(hostConfig);
			localStorage.setItem('store', JSON.stringify(store));
			document.location.hash = e.target.value;
		}
	});
	term.open(document.getElementById('terminal'));
	const doubluerightclickevent = new Event('doubluerightclick');
	term.singleRightClicked = false;
	term.element.addEventListener('contextmenu', () => {
		const timing = 500;
		if (term.singleRightClicked) {
			term.element.dispatchEvent(doubluerightclickevent);
			term.singleRightClicked = false;
			return;
		}
		term.singleRightClicked = true;
		setTimeout(() => {
			term.singleRightClicked = false;
		}, timing);
	});
	term.element.addEventListener('doubluerightclick', () => {
		navigator.clipboard.readText()
			.then((text) => {
				adapter.emit('relay', {
					id: session,
					buf: str2buf(text),
				});
			})
			.catch((err) => {
				console.error('Failed to read clipboard contents: ', err);
			});
	});
	fitAddon.fit();
	((overlays, xscreen) => {
		overlays.forEach(overlay=>overlay.style.height = xscreen.style.height);
	})(
		['ttmendlgOverlay','loadOverlay'].map(s=>document.getElementById(s)),
		document.querySelector('.xterm-screen'));
	});
function buyby(e) {
	join(e.detail);
	console.log(e.detail);
}
let ttmendlgActive=false
</script>
<main>
	<input id="hash" bind:value={hashURI}>
	<div id="wrapper">
		<div id="ttmendlgOverlay" class={ttmendlgActive ? "overlay overlay-on" : "overlay"}>
			<div class="overlay-container">
			<Ttmendlg on:hostdeal={buyby}
			bind:active={ttmendlgActive}
			bind:suite={init.suite}
			bind:protocol={init.protocol}
			bind:username={init.username}
			bind:password={init.password}
			bind:hostname={init.hostname}
			bind:port={init.port}
			></Ttmendlg>
			</div>
		</div>
		<div id="loadOverlay" class="overlay overlay-on">
			<div class="overlay-container"><div class="load"><div class="loader">Loading...</div></div></div>
		</div>
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
.overlay-container {
    width: 100%;
    height: 100%;
	position:absolute;
	overflow:scroll
}

#wrapper {
	width: 100vw;
	height: 100vh;
	overflow-y: scroll;
}
</style>