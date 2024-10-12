<script lang="ts">
	import { onMount } from 'svelte';

	export let players: Array<{
		playerId: number;
		name: string;
		nekoscore: number;
		avatarUrl: string;
		rank: string;
	}>;

	// Define rank thresholds
	const rankThresholds = [
		{ name: 'Bronze', color: '#CD7F32', min: 343.0, max: 1241.0 },
		{ name: 'Silver', color: '#C0C0C0', min: 1241.0, max: 1506.0 },
		{ name: 'Gold', color: '#FFD700', min: 1506.0, max: 1671.0 },
		{ name: 'Platinum', color: '#E5E4E2', min: 1671.0, max: 1850.0 },
		{ name: 'Mystic', color: '#9370DB', min: 1850.0, max: 2107.0 },
		{ name: 'Astral', color: '#87CEEB', min: 2107.0, max: 2303.0 },
		{ name: 'Professor', color: '#4B0082', min: 2303.0, max: 2413.0 },
		{ name: 'Supernatural', color: '#FF1493', min: 2413.0, max: 2492.0 },
		{ name: 'Deadlocked', color: '#FF4500', min: 2492.0, max: Infinity } // Set max to Infinity to include all higher scores
	];
	let svgElement: SVGSVGElement;

	onMount(() => {
		renderGraph();
		window.addEventListener('resize', renderGraph);

		return () => {
			window.removeEventListener('resize', renderGraph);
		};
	});

	function renderGraph() {
		if (!svgElement) return;

		const sortedPlayers = [...players].sort((a, b) => b.nekoscore - a.nekoscore);

		const highestPlayerScore = Math.max(...sortedPlayers.map((p) => p.nekoscore));
		const chartMaxScore = highestPlayerScore + highestPlayerScore * 0.1; // Add 10% extra space

		const topPadding = 0.1;
		const svgNS = 'http://www.w3.org/2000/svg';

		const leftMargin = 80;
		const rightMargin = 80; // Increased rightMargin to provide space for rank labels
		const totalBars = sortedPlayers.length;

		// Get container width
		const containerWidth = svgElement.parentElement.clientWidth;

		// Calculate total available width for bars and gaps
		const totalAvailableWidth = containerWidth - leftMargin - rightMargin;

		const gapRatio = 0.5; // Adjust as needed to increase/decrease gaps
		const minBarWidth = 60; // Minimum bar width to prevent names from overlapping

		let barWidth = minBarWidth;
		let gap = barWidth * gapRatio;

		// Calculate total width needed
		let totalWidthNeeded = leftMargin + totalBars * barWidth + (totalBars - 1) * gap + rightMargin;

		// Adjust barWidth and gap to fill the container width
		if (totalWidthNeeded < containerWidth) {
			barWidth = totalAvailableWidth / (totalBars + (totalBars - 1) * gapRatio);
			gap = barWidth * gapRatio;
			totalWidthNeeded = containerWidth; // Use available container width
		} else {
			// Update totalWidthNeeded based on minBarWidth
			totalWidthNeeded = leftMargin + totalBars * barWidth + (totalBars - 1) * gap + rightMargin;
		}

		const width = totalWidthNeeded;
		const height = 400;
		const avatarSize = 40;

		// Clear the SVG content before rendering
		while (svgElement.firstChild) {
			svgElement.removeChild(svgElement.firstChild);
		}

		// Set SVG dimensions
		svgElement.setAttribute('viewBox', `0 0 ${width} ${height + avatarSize + 30}`);
		svgElement.setAttribute('width', '100%');
		svgElement.setAttribute('height', 'auto');

		// Add background lines and labels
		const numLines = 10;
		for (let i = 0; i <= numLines; i++) {
			const y = height - (i / numLines) * height * (1 - topPadding);
			const line = document.createElementNS(svgNS, 'line');
			line.setAttribute('x1', leftMargin.toString());
			line.setAttribute('y1', y.toString());
			line.setAttribute('x2', (width - rightMargin).toString());
			line.setAttribute('y2', y.toString());
			line.setAttribute('stroke', '#2D3748'); // Tailwind's gray-800
			line.setAttribute('stroke-width', '1');
			svgElement.appendChild(line);

			const text = document.createElementNS(svgNS, 'text');
			text.setAttribute('x', (leftMargin - 10).toString()); // Position labels before leftMargin
			text.setAttribute('y', (y + 5).toString()); // Adjust y position for better alignment
			text.setAttribute('fill', '#A0AEC0'); // Tailwind's gray-400
			text.setAttribute('font-size', '12');
			text.setAttribute('class', 'font-medium');
			text.setAttribute('text-anchor', 'end'); // Right-align the text
			text.textContent = ((chartMaxScore * i) / numLines).toFixed(0);
			svgElement.appendChild(text);
		}

		// Add rank threshold lines and labels at the minimum values (excluding the first rank)
		rankThresholds.forEach((rank, index) => {
			if (index === 0) return; // Skip the first rank (Bronze)

			const rankY = height - (rank.min / chartMaxScore) * height * (1 - topPadding);
			if (rankY > 0 && rankY < height) {
				// Draw the rank threshold line
				const rankLine = document.createElementNS(svgNS, 'line');
				rankLine.setAttribute('x1', leftMargin.toString());
				rankLine.setAttribute('x2', (width - rightMargin).toString());
				rankLine.setAttribute('y1', rankY.toString());
				rankLine.setAttribute('y2', rankY.toString());
				rankLine.setAttribute('stroke', rank.color);
				rankLine.setAttribute('stroke-width', '2');
				rankLine.setAttribute('stroke-dasharray', '5,5');
				svgElement.appendChild(rankLine);

				// Add rank name label on the right side
				const rankText = document.createElementNS(svgNS, 'text');
				rankText.setAttribute('x', (width - rightMargin + 10).toString()); // Position near right margin
				rankText.setAttribute('y', (rankY + 5).toString()); // Adjust y position for alignment
				rankText.setAttribute('fill', rank.color);
				rankText.setAttribute('font-size', '14');
				rankText.setAttribute('class', 'font-bold');
				rankText.setAttribute('text-anchor', 'start'); // Left-align the text
				rankText.textContent = rank.name;
				svgElement.appendChild(rankText);
			}
		});

		sortedPlayers.forEach((player, index) => {
			const barHeight = (player.nekoscore / chartMaxScore) * height * (1 - topPadding);
			const x = leftMargin + index * (barWidth + gap);
			const y = height - barHeight;

			// Determine the player's rank
			const playerRank = rankThresholds.find(
				(rank) => player.nekoscore >= rank.min && player.nekoscore < rank.max
			);

			// Create bar
			const rect = document.createElementNS(svgNS, 'rect');
			rect.setAttribute('x', x.toString());
			rect.setAttribute('y', y.toString());
			rect.setAttribute('width', barWidth.toString());
			rect.setAttribute('height', barHeight.toString());
			rect.setAttribute('fill', playerRank ? playerRank.color : '#FFFFFF');

			// Add tooltip
			const title = document.createElementNS(svgNS, 'title');
			title.textContent = `${player.name}\nNekoScore: ${player.nekoscore}\nRank: ${player.rank}`;
			rect.appendChild(title);

			svgElement.appendChild(rect);

			// Add player avatar
			const avatar = document.createElementNS(svgNS, 'image');
			avatar.setAttribute('x', (x + (barWidth - avatarSize) / 2).toString());
			avatar.setAttribute('y', (height + 5).toString());
			avatar.setAttribute('width', avatarSize.toString());
			avatar.setAttribute('height', avatarSize.toString());
			avatar.setAttribute('href', player.avatarUrl);
			avatar.setAttribute('preserveAspectRatio', 'xMidYMid slice');
			avatar.setAttribute('class', 'rounded-full');
			svgElement.appendChild(avatar);

			// Add player name
			const text = document.createElementNS(svgNS, 'text');
			text.setAttribute('x', (x + barWidth / 2).toString());
			text.setAttribute('y', (height + avatarSize + 20).toString());
			text.setAttribute('text-anchor', 'middle');
			text.setAttribute('fill', '#E2E8F0');
			text.setAttribute('font-size', '12'); // Increased font size for better readability
			text.setAttribute('class', 'font-medium');
			text.textContent = player.name;
			svgElement.appendChild(text);

			// Add NekoScore on the bar
			const score = document.createElementNS(svgNS, 'text');
			score.setAttribute('x', (x + barWidth / 2).toString());
			score.setAttribute('y', (y + 20).toString());
			score.setAttribute('text-anchor', 'middle');
			score.setAttribute('fill', '#FFFFFF');
			score.setAttribute('font-size', '12');
			score.setAttribute('class', 'font-bold');
			score.textContent = player?.nekoscore?.toString();
			svgElement.appendChild(score);
		});
	}
</script>

<div class="w-full overflow-x-auto py-4">
	<svg bind:this={svgElement} class="h-auto"></svg>
</div>

<style>
	svg text {
		font-family: 'Inter', sans-serif;
	}

	/* Ensure avatars are displayed as circles */
	:global(image.rounded-full) {
		clip-path: circle(50%);
	}
</style>
