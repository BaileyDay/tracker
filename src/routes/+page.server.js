import axios from 'axios';
import * as cheerio from 'cheerio';

const playerIds = [
	60587108, 57439638, 142971229, 148511671, 57439584, 1154584751, 110594995, 54565124, 143912978,
	81243397
];

async function getPlayerData(playerId) {
	try {
		// Fetch Tracklock data
		const tracklockResponse = await axios.get(`https://tracklock.gg/players/${playerId}`, {
			timeout: 30000
		});
		const $ = cheerio.load(tracklockResponse.data);

		const nekoscoreElement = $('span.font-semibold.text-lg.text-orange-400');
		const nameElement = $('h1.text-3xl.sm\\:text-4xl.font-bold.text-white');
		const rankElement = $('span.font-semibold.text-lg.text-amber-600');

		const nekoscore = nekoscoreElement.length ? parseInt(nekoscoreElement.text().trim(), 10) : null;
		const name = nameElement.text().trim() || `Unknown Player ${playerId}`;
		const rank = rankElement.text().trim() || 'Unranked';

		// Fetch Steam avatar from steamid.xyz
		let avatarUrl = null;
		try {
			const steamidResponse = await axios.get(`https://steamid.xyz/${playerId}`, {
				timeout: 10000
			});
			const steamid$ = cheerio.load(steamidResponse.data);
			avatarUrl = steamid$('img.avatar').attr('src');
			console.log('avatarUrl', avatarUrl);
		} catch (steamidError) {
			console.error(`Error fetching Steam avatar for player ${playerId}:`, steamidError);
		}

		const data = { playerId, nekoscore, avatarUrl, name, rank };

		return data;
	} catch (error) {
		console.error(`Error fetching data for player ${playerId}:`, error);
		return { playerId, error: true };
	}
}

// ... rest of your code

export async function load() {
	const promises = playerIds.map(getPlayerData);
	const playersData = await Promise.all(promises);

	// Filter out any null results due to errors
	const validPlayers = playersData.filter(Boolean);

	// Sort players by nekoscore in descending order
	validPlayers.sort((a, b) => (b.nekoscore || 0) - (a.nekoscore || 0));

	return { players: validPlayers };
}
