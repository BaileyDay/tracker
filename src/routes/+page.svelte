<script lang="ts">
	import PlayerTable from '../lib/PlayerTable.svelte';
	import { Card } from '$lib/components/ui/card';
	import Faq from '../lib/Faq.svelte';
	export let data;

	$: ({ players } = data);
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
				{#if players.length === 0}
					<p class="text-center text-gray-500">No player data available.</p>
				{:else}
					<PlayerTable {players} />
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
