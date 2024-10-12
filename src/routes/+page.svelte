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
		'Just a moment longer...',
		'Man fck winterblade..'
	];
	let currentMessageIndex = 0;

	// Quotes extracted from Reddit posts
	let quotes = [
		{ text: 'You are perfection, Haze.' },
		{ text: 'DAMN YOU BEBOPPPPPP' },
		{ text: 'The Baxter Society has your number.' },
		{ text: "Hope you don't mind the pick-up.", attribution: '— Ivy' },
		{ text: 'Impressive Bebop.' },
		{ text: "I hope you win whatever fight you're about to start." },
		{ text: 'Ah, the New York Tuxedo!' },
		{ text: 'Everyone has a plan until a crow tries to pick out your eyes.' },
		{ text: 'New York is about to get a whole lot more vegetation!' },
		{ text: 'Die, worm.', attribution: '— Lady G' },
		{ text: "Can't shoot an atom." },
		{ text: "Don't ask how it works, just be glad that it works." },
		{ text: "That's gonna help keep your blood on the inside." },
		{ text: 'Life is simpler in the cube.' },
		{ text: "I'm about to ruin your day." },
		{ text: 'I paid the price, now die!' },
		{ text: "You got somethin' on ya, mate!" },
		{ text: 'Have fun out there, Bebop!' },
		{ text: 'Mo! You beautiful mole bastard, give me a hug!' },
		{ text: 'Godspeed, you beautiful ball of goo!' },
		{ text: 'Good luck out there, Paradox!' },
		{ text: 'Now go out there and impose your will.' },
		{ text: 'A piece of the divine in your hot little hands.' }
	];

	let currentQuoteIndex = 0;

	onMount(async () => {
		const quoteInterval = setInterval(() => {
			currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
		}, 4000); // Change quote every 4 seconds

		const messageInterval = setInterval(() => {
			currentMessageIndex = (currentMessageIndex + 1) % loadingMessages.length;
		}, 3000);

		try {
			const response = await fetch('/api/players');
			players = await response.json();
			console.log('players', players);
		} catch (error) {
			console.error('Failed to fetch players:', error);
		} finally {
			loading = false;
			clearInterval(messageInterval);
			clearInterval(quoteInterval);
		}
	});
</script>

<head>
	<title>Deadlock Team Player Rankings</title>
</head>

<main class="bg-[#0E1015] min-h-screen text-[#EFDEBF] p-4">
	<div class="max-w-6xl mx-auto space-y-8">
		<h1 class="text-4xl font-bold text-center mb-2 font-serif">Deadlock Team Player Rankings</h1>

		<!-- Animated Quotes -->
		<div class="text-center text-orange-100 h-6 overflow-hidden">
			{#if quotes.length > 0}
				{#key currentQuoteIndex}
					<p class="text-lg" in:fly={{ y: 20, duration: 500 }} out:fly={{ y: -20, duration: 500 }}>
						"{quotes[currentQuoteIndex].text}"
						{#if quotes[currentQuoteIndex].attribution}
							<span class="italic"> {quotes[currentQuoteIndex].attribution}</span>
						{/if}
					</p>
				{/key}
			{/if}
		</div>

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
					<div class="mt-8"></div>
				{/if}
			</div>
		</Card>
		{#if players.length > 0}
			<Card class="bg-[#181A20] border-[#363636] shadow-lg container">
				<h3 class="text-xl font-bold text-orange-400 mt-4">NekoScore Visualization</h3>
				<BarGraph {players} />
			</Card>
		{/if}
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
