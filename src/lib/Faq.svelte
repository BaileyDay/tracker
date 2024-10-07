<script lang="ts">
	import {
		Accordion,
		AccordionContent,
		AccordionItem,
		AccordionTrigger
	} from '$lib/components/ui/accordion';

	const faqItems = [
		{
			question: 'Why is my NekoScore not updating?',
			answer:
				"If your score isn't updating, it's likely because your recent games weren't picked up in the watch tab. If games weren't picked up, they won't be included in your NekoScore calculation."
		},
		{
			question: 'What is a high NekoScore?',
			answer:
				'A high NekoScore is considered to be the Professor rank or above (top 1% of players). Some regions scores are inflated so if you are in a less popular region a lower score will be considered high.'
		},
		{
			question: 'What is MMR?',
			answer:
				"MMR stands for Matchmaking Rating. It's a system used in many competitive games, including Deadlock, to assess a player's skill level and match players of similar skill levels in games. Deadlock's MMR system is hidden so NekoScore is an estimation of your MMR."
		},
		{
			question: 'Why is my NekoScore changing unexpectedly?',
			answer:
				"NekoScore is based on the average MMR of the games you're in, not on individual wins or losses. Your score can go down after winning if the game's average MMR was lower than your recent games, and vice versa for losses."
		},
		{
			question: 'Where are my game stats?',
			answer:
				'Currently, we are unable to track full game details. We only have access to the MMR scores from the watch tab in Deadlock.'
		},
		{
			question: 'Why is my game not tracked?',
			answer:
				"Not all games are tracked, only games that appear in the watch tab. There's a limit of 2000 games in the watch tab, and some high MMR games may not appear there."
		},
		{
			question: 'Why does playing with lower-skilled friends decrease my NekoScore?',
			answer:
				'When you queue with players of different skill levels, it can affect the average MMR of your lobby. If you play with lower-skilled friends, you might be placed in lobbies with a lower average MMR, which can decrease your NekoScore.'
		},
		{
			question: 'How do I report someone for cheating?',
			answer:
				"This FAQ is focused on the NekoScore system. For reporting cheaters, please refer to Deadlock's official channels and in-game reporting system."
		},
		{
			question: 'How can I improve my NekoScore?',
			answer:
				'You can improve your NekoScore by playing well in your games and winning more often. Your score is based on the average MMR of the games you play in, so winning games with higher MMRs will increase your score.'
		},
		{
			question: 'Is NekoScore accurate?',
			answer:
				"NekoScore is an estimation of your MMR based on the average MMR of the games you play in. It's not an official MMR from Deadlock, but it provides a rough idea of your skill level compared to other players in your region. It is not extremely accurate because of factors like not all games being tracked and players being put into much higher/lower lobbies depending on the time of the day. However, with a large number of games played, it is the best representation of your skill thus far."
		},
		{
			question: 'Someone told me that NekoScore sucks. Is that true?',
			answer:
				"At the highest NekoScores, a couple of problems occur. These problems don't really affect anyone but the top players, however they will be the ones complaining on streams/to YouTube audiences. At certain points of the day, there are not enough extremely high MMR players to put a lobby together. This means that while these players' internal MMRs are still extremely high, their NekoScore goes down because they get put into a lower average MMR lobby. For example, a player that was 1900 NekoScore could get placed into a 1500 lobby just because there were no other ~1900 players queueing. This can be frustrating for these players who feel like the score makes no sense and it's going down while they are winning games. However, what really matters is your hidden Valve MMR and the best thing you can do is just keep playing and winning. If you are not within the top 1% of players, it's extremely unlikely that this problem will affect you. Another common critique is top players saying they need to boost their scores by sniping the highest ranked players. This is a way to game the system, but also if you keep winning your games you should also become an extremely high MMR player and therefore not need to snipe to get into the highest games. While we understand this system isn't perfect, it is the best we can do with the data we have and we believe it is a good representation of skill (with some margin of error) for the vast majority of players."
		},
		{
			question: 'Why is it called NekoScore?',
			answer: 'Neko is the Japanese word for cat, and we like cats!'
		}
	];
</script>

<div class="bg-[#181A20] text-[#EFDEBF] p-6 rounded-lg shadow-lg">
	<h2 class="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
	<Accordion type="single" collapsible class="w-full">
		{#each faqItems as item, index}
			<AccordionItem value="item-{index}">
				<AccordionTrigger class="text-left">
					{item.question}
				</AccordionTrigger>
				<AccordionContent>
					<p class="text-[#EFDEBF] opacity-90">{item.answer}</p>
				</AccordionContent>
			</AccordionItem>
		{/each}
	</Accordion>
</div>

<style>
	:global(.accordion-trigger) {
		font-weight: 600;
		color: #efdebf;
	}

	:global(.accordion-content) {
		background-color: rgba(255, 255, 255, 0.05);
		border-radius: 0.25rem;
		padding: 1rem;
		margin-top: 0.5rem;
	}

	:global(.accordion-item) {
		border-bottom: 1px solid #363636;
		padding: 1rem 0;
	}

	:global(.accordion-item:last-child) {
		border-bottom: none;
	}
</style>
