<script lang="ts">
	import { onMount } from 'svelte';

	export let players: Array<{
		playerId: number;
		name: string;
		nekoscore: number;
		avatarUrl: string;
		rank: string;
	}>;

	const rankThresholds = [
		{ name: 'Bronze', color: '#CD7F32', max: 197.5 },
		{ name: 'Silver', color: '#C0C0C0', max: 252.19 },
		{ name: 'Gold', color: '#FFD700', max: 307.5 },
		{ name: 'Platinum', color: '#E5E4E2', max: 392.5 },
		{ name: 'Mystic', color: '#9370DB', max: 611.88 },
		{ name: 'Astral', color: '#87CEEB', max: 915 },
		{ name: 'Professor', color: '#4B0082', max: 1223.91 },
		{ name: 'Supernatural', color: '#FF1493', max: 1631.04 },
		{ name: 'Deadlocked', color: '#FF4500', max: Infinity }
	];

	let svgElement: SVGSVGElement;

	onMount(() => {
		renderGraph();
	});

	function renderGraph() {
		if (!svgElement) return;

		const sortedPlayers = [...players].sort((a, b) => b.nekoscore - a.nekoscore);

		// Find the highest player's score
		const highestPlayerScore = Math.max(...sortedPlayers.map((p) => p.nekoscore));

		// Find the player's current rank
		const currentRankIndex = rankThresholds.findIndex((rank) => highestPlayerScore <= rank.max);
		const currentRank = rankThresholds[currentRankIndex];

		// Determine the next rank
		const nextRankIndex =
			currentRankIndex + 1 < rankThresholds.length ? currentRankIndex + 1 : currentRankIndex;
		const nextRank = rankThresholds[nextRankIndex];

		// The next rank threshold is the max of the current rank
		const nextRankThreshold = currentRank.max;

		// Set chartMaxScore to be the nextRankThreshold plus extra space
		const chartMaxScore = nextRankThreshold + nextRankThreshold * 0.1; // Add 10% extra space

		const topPadding = 0.1; // 10% padding at the top
		const svgNS = 'http://www.w3.org/2000/svg';

		const width = 1000;
		const height = 400;
		const barWidth = 40;
		const gap = (width - sortedPlayers.length * barWidth) / (sortedPlayers.length + 1);
		const avatarSize = barWidth * 0.8;

		// Clear the SVG content before rendering
		while (svgElement.firstChild) {
			svgElement.removeChild(svgElement.firstChild);
		}

		svgElement.setAttribute('viewBox', `0 0 ${width} ${height + avatarSize + 30}`);

		// Define gradients
		const defs = document.createElementNS(svgNS, 'defs');
		svgElement.appendChild(defs);

		rankThresholds.forEach((rank, index) => {
			const gradient = document.createElementNS(svgNS, 'linearGradient');
			gradient.setAttribute('id', `gradient-${index}`);
			gradient.setAttribute('x1', '0%');
			gradient.setAttribute('y1', '0%');
			gradient.setAttribute('x2', '0%');
			gradient.setAttribute('y2', '100%');

			const stop1 = document.createElementNS(svgNS, 'stop');
			stop1.setAttribute('offset', '0%');
			stop1.setAttribute('stop-color', rank.color);
			stop1.setAttribute('stop-opacity', '0.8');

			const stop2 = document.createElementNS(svgNS, 'stop');
			stop2.setAttribute('offset', '100%');
			stop2.setAttribute('stop-color', '#000000');
			stop2.setAttribute('stop-opacity', '0.8');

			gradient.appendChild(stop1);
			gradient.appendChild(stop2);
			defs.appendChild(gradient);
		});

		// Add background lines and labels
		const numLines = 10;
		for (let i = 0; i <= numLines; i++) {
			const y = height - (i / numLines) * height * (1 - topPadding);
			const line = document.createElementNS(svgNS, 'line');
			line.setAttribute('x1', '0');
			line.setAttribute('y1', y.toString());
			line.setAttribute('x2', width.toString());
			line.setAttribute('y2', y.toString());
			line.setAttribute('stroke', '#2D3748'); // Tailwind's gray-800
			line.setAttribute('stroke-width', '1');
			svgElement.appendChild(line);

			const text = document.createElementNS(svgNS, 'text');
			text.setAttribute('x', '10');
			text.setAttribute('y', (y - 5).toString());
			text.setAttribute('fill', '#A0AEC0'); // Tailwind's gray-400
			text.setAttribute('font-size', '12');
			text.setAttribute('class', 'font-medium');
			text.textContent = ((chartMaxScore * i) / numLines).toFixed(0);
			svgElement.appendChild(text);
		}

		// Add the next rank threshold line across the entire chart
		const nextRankY = height - (nextRankThreshold / chartMaxScore) * height * (1 - topPadding);
		if (nextRankY > 0 && nextRankY < height) {
			// Draw the next rank threshold line
			const rankLine = document.createElementNS(svgNS, 'line');
			rankLine.setAttribute('x1', '0');
			rankLine.setAttribute('x2', width.toString());
			rankLine.setAttribute('y1', nextRankY.toString());
			rankLine.setAttribute('y2', nextRankY.toString());
			rankLine.setAttribute('stroke', nextRank.color);
			rankLine.setAttribute('stroke-width', '2');
			rankLine.setAttribute('stroke-dasharray', '5,5');
			svgElement.appendChild(rankLine);

			// Adjusted x position to avoid overlapping with the scale labels
			const rankTextX = 60; // Shifted right from 10 to 60

			// Add next rank name on top of the line
			const rankText = document.createElementNS(svgNS, 'text');
			rankText.setAttribute('x', rankTextX.toString());
			rankText.setAttribute('y', (nextRankY - 10).toString());
			rankText.setAttribute('fill', nextRank.color);
			rankText.setAttribute('font-size', '14');
			rankText.setAttribute('class', 'font-bold');
			rankText.textContent = nextRank.name;
			svgElement.appendChild(rankText);
		}

		sortedPlayers.forEach((player, index) => {
			// Calculate bar height based on chartMaxScore
			const barHeight = (player.nekoscore / chartMaxScore) * height * (1 - topPadding);
			const x = gap + index * (barWidth + gap);
			const y = height - barHeight;

			// Determine the player's rank index for gradient
			const playerRankIndex = rankThresholds.findIndex((rank) => player.nekoscore <= rank.max);

			// Create rank-colored sections
			let currentHeight = 0;
			rankThresholds.forEach((rank, rankIndex) => {
				const rankHeight = Math.min(rank.max, player.nekoscore) - currentHeight;
				if (rankHeight > 0) {
					const sectionHeight = (rankHeight / chartMaxScore) * height * (1 - topPadding);
					const rect = document.createElementNS(svgNS, 'rect');
					rect.setAttribute('x', x.toString());
					rect.setAttribute(
						'y',
						(
							height -
							(currentHeight / chartMaxScore) * height * (1 - topPadding) -
							sectionHeight
						).toString()
					);
					rect.setAttribute('width', barWidth.toString());
					rect.setAttribute('height', sectionHeight.toString());
					rect.setAttribute('fill', `url(#gradient-${rankIndex})`);

					// Add tooltip
					const title = document.createElementNS(svgNS, 'title');
					title.textContent = `${player.name}\nNekoScore: ${player.nekoscore}\nRank: ${player.rank}`;
					rect.appendChild(title);

					svgElement.appendChild(rect);
				}
				currentHeight = rank.max;
			});

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
			text.setAttribute('fill', '#E2E8F0'); // Tailwind's gray-300
			text.setAttribute('font-size', '10');
			text.setAttribute('class', 'font-medium');
			text.textContent = player.name;
			svgElement.appendChild(text);

			// Add rotated NekoScore on the bar
			const score = document.createElementNS(svgNS, 'text');
			score.setAttribute('x', (x + barWidth / 2).toString());
			score.setAttribute('y', (height - barHeight / 2).toString());
			score.setAttribute('text-anchor', 'middle');
			score.setAttribute('fill', '#E2E8F0'); // Tailwind's gray-300
			score.setAttribute('font-size', '12');
			score.setAttribute('class', 'font-bold');
			score.setAttribute('transform', `rotate(-90 ${x + barWidth / 2} ${height - barHeight / 2})`);
			score.textContent = player.nekoscore.toString();
			svgElement.appendChild(score);
		});
	}
</script>

<div class="w-full overflow-x-auto py-4">
	<svg bind:this={svgElement} class="w-full h-auto" preserveAspectRatio="xMidYMid meet"></svg>
</div>

<style>
	svg text {
		font-family: 'Inter', sans-serif;
	}
	/* Optional animation */
	.bar {
		animation: grow 1s ease-out forwards;
	}
	@keyframes grow {
		from {
			height: 0;
		}
		to {
			height: var(--bar-height);
		}
	}
</style>
