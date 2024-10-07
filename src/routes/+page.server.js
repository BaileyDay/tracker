import puppeteer from 'puppeteer';

const playerIds = [
	60587108, 57439638, 142971229, 148511671, 57439584, 1154584751, 110594995, 54565124, 143912978,
	81243397
];

async function getPlayerData(playerId) {
	let browser;
	try {
		browser = await puppeteer.launch({
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox']
		});
		const page = await browser.newPage();

		// Enable console logging from the page
		page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));

		await page.goto(`https://tracklock.gg/players/${playerId}`, {
			waitUntil: 'networkidle2',
			timeout: 30000 // Increase timeout to 30 seconds
		});

		// Wait for the content to load
		await page.waitForSelector('.font-semibold.text-lg', { timeout: 5000 });

		// Extract data from the page
		const data = await page.evaluate(() => {
			const nekoscoreElement = document.querySelector('span.font-semibold.text-lg.text-orange-400');
			const avatarElement = document.querySelector(
				'span.relative.flex.shrink-0.overflow-hidden.rounded-full img'
			);
			const nameElement = document.querySelector('h1.text-3xl.sm\\:text-4xl.font-bold.text-white');
			const rankElement = document.querySelector('span.font-semibold.text-lg.text-amber-600');

			console.log('Nekoscore Element:', nekoscoreElement);
			console.log('Avatar Element:', avatarElement);
			console.log('Name Element:', nameElement);
			console.log('Rank Element:', rankElement);

			const nekoscore = nekoscoreElement ? parseInt(nekoscoreElement.innerText.trim(), 10) : null;
			const avatarUrl = avatarElement ? avatarElement.src : null;
			const name = nameElement ? nameElement.innerText.trim() : null;
			const rank = rankElement ? rankElement.innerText.trim() : null;

			return { nekoscore, avatarUrl, name, rank };
		});

		console.log(`Data extracted for player ${playerId}:`, data);

		return { playerId, ...data };
	} catch (error) {
		console.error(`Error fetching data for player ${playerId}:`, error);
		return null;
	} finally {
		if (browser) {
			await browser.close();
		}
	}
}

export async function load() {
	const promises = playerIds.map(getPlayerData);
	const playersData = await Promise.all(promises);

	// Filter out any null results due to errors
	const validPlayers = playersData.filter(Boolean);

	// Sort players by nekoscore in descending order
	validPlayers.sort((a, b) => (b.nekoscore || 0) - (a.nekoscore || 0));

	console.log('Valid players data:', validPlayers);

	return { players: validPlayers };
}
