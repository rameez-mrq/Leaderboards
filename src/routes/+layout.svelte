<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
	const siteName = 'CS7IS3 Tracker';
</script>

<svelte:head>
	<title>{siteName}</title>
	<link rel="icon" href={favicon} />
	<meta name="theme-color" content="#040611" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

{@render children()}
