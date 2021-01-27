<div id="tcpip" style="display:flex;border:1px solid" on:change={tcpipChange}>
    <div style="flex: 1;">tcpip 
      <input type="radio" bind:group={suite} value={'tcpip'}>
    </div>
    <div style="flex: 5;">
      <div id="host">host 
        <input list="hosts" id="host" name="hostname" value={hostname} on:change={hostchange}/>
        <datalist id="hosts">
	    {#each store.hosts as host}
          <option value={host}>
    	{/each}
        </datalist>
        <div>port
          <input type="number" bind:value={port} min=0 max=65535>
        </div>
        <div>ipversion
          <select name="">
            <option value="auto">auto
            </option>
            <option value="ipv4">ipv4
            </option>
            <option value="ipv6">ipv6
            </option>
          </select>
        </div>
        <div>history
          <input type="checkbox">
        </div>
        <div>service 
          <div>
            <input type="radio" bind:group={protocol} value={'ssh'}>ssh
            <div>sshversion
              <select>
                <option>ssh2
                </option>
                <option>ssh1
                </option>
              </select>
            </div>
            <div>username
              <input bind:value={username}>
            </div>
            <div>password
              <input bind:value={password}>
            </div>
            <div>privateKey
              <input type="file" name="" on:change={file2text}>
            </div>
          </div>
          <div>
            <input type="radio" bind:group={protocol} value={'telnet'}>telnet
          </div>
          <div>
            <input type="radio" bind:group={protocol} value={'sonota'}>etc
          </div>
        </div>
      </div>
    </div>
</div>
  <div id="serial" style="border:1px solid;margin:5;">serial 
    <input type="radio" bind:group={suite} value={'serial'}>
  </div>
  <div><input type="button" name="OK" value="OK" on:click={hostdealer}>
  </div>
  <script>
  import { createEventDispatcher } from 'svelte';
  import {hostURI} from './store'

const dispatch = createEventDispatcher();
export let active=false;
export let suite = '';
export let protocol = '';
export let hostname = '';
function tcpipChange(e){
  console.log(protocol,hostname,port,username,password,privateKey)
  hostURI.set(protocol +'://'+username+'@'+hostname+':'+port)
}
function hostchange(e) { // svelteのバグでバインドされないため
		hostname = e.target.value;
}
export let port = 22;
export let username = '';
export let password = '';
export let privateKey = '';

function file2text(e) {
		if (!e.target.files[0]) return;
		const file = e.target.files[0];
		const reader = new FileReader();
		reader.readAsText(file);
		reader.onload = () => {
			privateKey = reader.result;
		};
}
function hostdealer() {
		console.log(suite, protocol, host, privateKey);
		if (suite === 'serial')protocol = 'serial';
		dispatch('hostdeal', {
			protocol,
			hostname,
			port,
			username,
			password,
			privateKey,
		});
    active=false
}
const store = { hosts: ['127.0.0.1', '192.168.0.1', '172.16.0.1', '10.1.1.1'] };
//    const store=localStorage.getItem('store') ? JSON.parse(localStorage.getItem('store')) : {};
</script>