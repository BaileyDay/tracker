<script lang="ts">
	import { onMount } from 'svelte';
	import PlayerTable from '../lib/PlayerTable.svelte';
	import BarGraph from '../lib/BarGraph.svelte';
	import { fade, fly } from 'svelte/transition';
	import { Card } from '$lib/components/ui/card';
	import Faq from '../lib/Faq.svelte';

	let players = [];
	let loading = true;
	let loadingMessages = [
		"Please wait, don't refresh...",
		'Fetching player data...',
		'Almost there...',
		'Just a moment longer...'
	];
	let currentMessageIndex = 0;

	onMount(async () => {
		const messageInterval = setInterval(() => {
			currentMessageIndex = (currentMessageIndex + 1) % loadingMessages.length;
		}, 3000);

		try {
			const response = await fetch('/api/players');
			players = await response.json();
		} catch (error) {
			console.error('Failed to fetch players:', error);
		} finally {
			loading = false;
			clearInterval(messageInterval);
		}
	});
</script>

<head>
	<title>Deadlock Team Player Rankings</title>
</head>

<main class="bg-[#0E1015] min-h-screen text-[#EFDEBF] p-4">
	<div class="max-w-6xl mx-auto space-y-8">
		<h1 class="text-4xl font-bold text-center mb-8 font-serif">Deadlock Team Player Rankings</h1>
		<p class="text-center text-orange-100">The Gooners and a twink</p>

		<Card class="bg-[#181A20] border-[#363636] shadow-lg">
			<div class="p-6">
				<h2 class="text-2xl font-bold mb-4 text-orange-400">Top Players</h2>
				{#if loading}
					<div class="flex flex-col justify-center items-center h-64" transition:fade>
						<div
							class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mb-4"
						></div>
						{#key currentMessageIndex}
							<p
								class="text-orange-300 text-lg"
								in:fly={{ y: 20, duration: 300 }}
								out:fade={{ duration: 300 }}
							>
								{loadingMessages[currentMessageIndex]}
							</p>
						{/key}
					</div>
				{:else}
					<PlayerTable {players} />
					<div class="mt-8">
						<h3 class="text-xl font-bold mb-4 text-orange-400">NekoScore Visualization</h3>
						<BarGraph {players} />
					</div>
				{/if}
			</div>
		</Card>
		<Faq />
	</div>
</main>

<style>
	:global(body) {
		background-color: #0e1015;
		color: #efdebf;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	}
</style>
