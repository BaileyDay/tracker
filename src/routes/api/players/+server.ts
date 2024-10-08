import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { env } from '$env/dynamic/private';
import pMap from 'p-map';

const playerIds = [
	60587108, 57439638, 142971229, 148511671, 57439584, 1154584751, 110594995, 54565124, 143912978,
	81243397
];

const SCRAPER_API_KEY = env.SCRAPER_API_KEY; // Replace with your ScraperAPI key

async function getPlayerData(playerId: number, attempt: number = 1): Promise<any> {
	const url = `https://tracklock.gg/players/${playerId}`;
	const apiUrl = `https://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(url)}&render=true`;

	try {
		console.log(`Fetching player data for playerId: ${playerId}, attempt ${attempt}`);

		// Fetch the HTML using ScraperAPI
		const response = await axios.get(apiUrl);
		const html = response.data;

		// Use Cheerio to parse the HTML
		const $ = cheerio.load(html);

		// Extract the relevant data using CSS selectors
		const nekoscoreElement = $('span.font-semibold.text-lg.text-orange-400');
		const avatarElement = $('span.relative.flex.shrink-0.overflow-hidden.rounded-full img');
		const nameElement = $('h1.text-3xl.sm\\:text-4xl.font-bold.text-white');
		const rankElement = $('span.font-semibold.text-lg.text-amber-600');

		const nekoscore = nekoscoreElement.length ? parseInt(nekoscoreElement.text().trim(), 10) : null;
		const avatarUrl = avatarElement.length ? avatarElement.attr('src') : null;
		const name = nameElement.length ? nameElement.text().trim() : null;
		const rank = rankElement.length ? rankElement.text().trim() : null;

		console.log(`Successfully fetched player data for playerId: ${playerId}`);
		return { playerId, nekoscore, avatarUrl, name, rank };
	} catch (error) {
		console.error(`Error fetching data for player ${playerId} on attempt ${attempt}:`, error);

		// Retry mechanism (retry up to 3 times)
		if (attempt < 3) {
			console.log(`Retrying for player ${playerId}, attempt ${attempt + 1}`);
			await new Promise((resolve) => setTimeout(resolve, 5000)); // 5-second delay before retry
			return getPlayerData(playerId, attempt + 1);
		} else {
			console.error(`Failed to fetch data for player ${playerId} after ${attempt} attempts`);
			return null;
		}
	}
}

export const GET: RequestHandler = async () => {
	try {
		// Use pMap to fetch player data with a concurrency limit of 5
		const playersData = await pMap(
			playerIds,
			async (playerId) => {
				const data = await getPlayerData(playerId);
				if (data) {
					return data;
				} else {
					console.error(`No data returned for playerId: ${playerId}`);
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
