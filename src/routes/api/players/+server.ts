import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { env } from '$env/dynamic/private';
import pMap from 'p-map';

const playerIds32 = [
	60587108, 57439638, 142971229, 148511671, 57439584, 1154584751, 110594995, 54565124, 143912978,
	81243397
];

const SCRAPER_API_KEY = env.SCRAPER_API_KEY; // Your ScraperAPI key
const STEAM_API_KEY = env.STEAM_API_KEY; // Your Steam API key

// Function to convert SteamID32 to SteamID64
function steamId32To64(steamId32: number): string {
	const steamId64 = BigInt(steamId32) + BigInt('76561197960265728');
	return steamId64.toString();
}

async function getPlayerData(steamId32: number, attempt: number = 1): Promise<any> {
	const url = `https://tracklock.gg/players/${steamId32}`;
	const apiUrl = `https://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(
		url
	)}`;

	try {
		console.log(`Fetching player data for SteamID32: ${steamId32}, attempt ${attempt}`);

		// Fetch the HTML using ScraperAPI
		const response = await axios.get(apiUrl);
		const html = response.data;

		// Use Cheerio to parse the HTML
		const $ = cheerio.load(html);

		// Extract the relevant data using CSS selectors
		const nekoscoreElement = $('span.font-semibold.text-lg.text-orange-400');
		const nameElement = $('h1.text-3xl.sm\\:text-4xl.font-bold.text-white');
		const rankElement = $('span.font-semibold.text-lg.text-amber-600');

		const nekoscore = nekoscoreElement.length ? parseInt(nekoscoreElement.text().trim(), 10) : null;
		const name = nameElement.length ? nameElement.text().trim() : null;
		const rank = rankElement.length ? rankElement.text().trim() : null;

		// Convert SteamID32 to SteamID64 for Steam API
		const steamId64 = steamId32To64(steamId32);

		// Fetch avatar URL from Steam API using SteamID64
		const steamApiUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamId64}`;
		const steamResponse = await axios.get(steamApiUrl);
		const players = steamResponse.data.response.players;

		let avatarUrl = null;
		if (players && players.length > 0) {
			avatarUrl = players[0].avatarfull;
		}

		console.log(`Successfully fetched player data for SteamID32: ${steamId32}`);
		return { steamId32, steamId64, nekoscore, avatarUrl, name, rank };
	} catch (error) {
		console.error(`Error fetching data for player ${steamId32} on attempt ${attempt}:`, error);

		// Retry mechanism (retry up to 3 times)
		if (attempt < 3) {
			console.log(`Retrying for player ${steamId32}, attempt ${attempt + 1}`);
			await new Promise((resolve) => setTimeout(resolve, 5000)); // 5-second delay before retry
			return getPlayerData(steamId32, attempt + 1);
		} else {
			console.error(`Failed to fetch data for player ${steamId32} after ${attempt} attempts`);
			return null;
		}
	}
}

export const GET: RequestHandler = async () => {
	try {
		// Use pMap to fetch player data with a concurrency limit of 5
		const playersData = await pMap(
			playerIds32,
			async (steamId32) => {
				const data = await getPlayerData(steamId32);
				if (data) {
					return data;
				} else {
					console.error(`No data returned for SteamID32: ${steamId32}`);
					return null;
				}
			},
			{ concurrency: 5 }
		);

		// Filter out any null results (in case of failed fetches)
		const validPlayers = playersData.filter(Boolean);

		// Sort players by nekoscore
		validPlayers.sort((a, b) => (b.nekoscore || 0) - (a.nekoscore || 0));

		console.log('Player data successfully fetched and sorted.');

		return json(validPlayers);
	} catch (error) {
		console.error('Error in fetching player data:', error);
		return json([]);
	}
};
