<script lang="ts">
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar';
	import { ArrowUpDown } from 'lucide-svelte';

	export let players: Array<{
		playerId: number;
		name: string;
		nekoscore: number | null;
		avatarUrl: string;
		rank: string;
	}>;

	let sortColumn = 'nekoscore';
	let sortOrder: 'asc' | 'desc' = 'desc';

	$: sortedPlayers = [...players].sort((a, b) => {
		const aValue = a[sortColumn];
		const bValue = b[sortColumn];
		if (aValue === null || aValue === undefined) return 1;
		if (bValue === null || bValue === undefined) return -1;
		if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
		if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
		return 0;
	});

	function sort(column: string) {
		if (column === sortColumn) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortColumn = column;
			sortOrder = 'desc';
		}
	}

	function navigateToProfile(playerId: number) {
		window.open(`https://tracklock.gg/players/${playerId}`, '_blank');
	}

	function getRankColor(rank: string): string {
		switch (rank.toLowerCase()) {
			case 'bronze':
				return '#CD7F32';
			case 'silver':
				return '#C0C0C0';
			case 'gold':
				return '#FFD700';
			case 'platinum':
				return '#E5E4E2';
			case 'diamond':
				return '#B9F2FF';
			default:
				return '#363636';
		}
	}
</script>

<div class="overflow-x-hidden">
	<Table>
		<TableHeader>
			<TableRow class="border-b border-[#363636]">
				<TableHead class="w-[10%] text-[#EFDEBF]">Rank</TableHead>
				<TableHead class="w-[40%] text-[#EFDEBF]">Player</TableHead>
				<TableHead class="w-[25%] text-[#EFDEBF]">
					<Button
						variant="ghost"
						on:click={() => sort('nekoscore')}
						class="h-8 px-2 lg:px-3 text-[#EFDEBF] hover:text-white"
					>
						Nekoscore
						<ArrowUpDown class="ml-2 h-4 w-4" />
					</Button>
				</TableHead>
				<TableHead class="w-[25%] text-[#EFDEBF]">
					<Button
						variant="ghost"
						on:click={() => sort('rank')}
						class="h-8 px-2 lg:px-3 text-[#EFDEBF] hover:text-white"
					>
						Rank
						<ArrowUpDown class="ml-2 h-4 w-4" />
					</Button>
				</TableHead>
			</TableRow>
		</TableHeader>
		<TableBody>
			{#each sortedPlayers as player, index (player.steamId64)}
				<TableRow
					class="border-b border-[#363636] hover:bg-[#1E2028] cursor-pointer transition-colors duration-150"
					on:click={() => navigateToProfile(player.playerId)}
				>
					<TableCell class="font-medium text-[#EFDEBF]">{index + 1}</TableCell>
					<TableCell class="flex items-center space-x-2">
						<Avatar>
							<AvatarImage src={player.avatarUrl} alt={player.name} />
							<AvatarFallback class="bg-[#363636] text-[#EFDEBF]">
								{player.name ? player.name.charAt(0) : '?'}
							</AvatarFallback>
						</Avatar>
						<span class="text-[#EFDEBF] truncate">{player.name || 'Unknown Player'}</span>
					</TableCell>
					<TableCell class="text-[#FF9900] font-semibold">
						{player.nekoscore !== null && player.nekoscore !== undefined ? player.nekoscore : 'N/A'}
					</TableCell>
					<TableCell>
						{#if player.rank}
							<span
								class="px-2 py-1 rounded text-xs font-semibold"
								style="background-color: {getRankColor(player.rank)};"
							>
								{player.rank}
							</span>
						{:else}
							<span class="px-2 py-1 rounded text-xs font-semibold bg-[#363636]">Unranked</span>
						{/if}
					</TableCell>
				</TableRow>
			{/each}
		</TableBody>
	</Table>
</div>

<style>
	:global(table) {
		width: 100%;
		table-layout: fixed;
	}

	:global(td),
	:global(th) {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
