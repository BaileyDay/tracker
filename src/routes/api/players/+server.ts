import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import puppeteerCore from 'puppeteer-core';
import puppeteer from 'puppeteer';
import chromium from '@sparticuz/chromium';

const playerIds = [
	60587108, 57439638, 142971229, 148511671, 57439584, 1154584751, 110594995, 54565124, 143912978,
	81243397 /* Add more player IDs here */
];

const CHROME_URL = process.env.CHROMIUM;

async function getPlayerData(playerId: number) {
	let browser;

	async function getBrowser() {
		if (process.env.VERCEL_ENV === 'production') {
			const executablePath = await chromium?.executablePath(CHROME_URL);

			const browser = await puppeteerCore.launch({
				args: chromium.args,
				defaultViewport: chromium.defaultViewport,
				executablePath,
				headless: chromium.headless
			});
			return browser;
		} else {
			const browser = await puppeteer.launch();
			return browser;
		}
	}

	try {
		browser = await getBrowser();
		const page = await browser.newPage();

		await page.goto(`https://tracklock.gg/players/${playerId}`, {
			waitUntil: 'networkidle2',
			timeout: 30000
		});

		await page.waitForSelector('.font-semibold.text-lg', { timeout: 5000 });

		const data = await page.evaluate(() => {
			const nekoscoreElement = document.querySelector('span.font-semibold.text-lg.text-orange-400');
			const avatarElement = document.querySelector(
				'span.relative.flex.shrink-0.overflow-hidden.rounded-full img'
			);
			const nameElement = document.querySelector('h1.text-3xl.sm\\:text-4xl.font-bold.text-white');
			const rankElement = document.querySelector('span.font-semibold.text-lg.text-amber-600');

			const nekoscore = nekoscoreElement ? parseInt(nekoscoreElement.innerText.trim(), 10) : null;
			const avatarUrl = avatarElement ? avatarElement.src : null;
			const name = nameElement ? nameElement.innerText.trim() : null;
			const rank = rankElement ? rankElement.innerText.trim() : null;

			return { nekoscore, avatarUrl, name, rank };
		});

		return { playerId, ...data };
	} catch (error) {
		console.error(`Error fetching data for player ${playerId}:`, error);
		await browser?.close();
		return null;
	} finally {
		if (browser) {
			await browser.close();
		}
	}
}

export const GET: RequestHandler = async () => {
	const playersData = [];

	for (const playerId of playerIds) {
		const data = await getPlayerData(playerId); // Run one request at a time
		if (data) {
			playersData.push(data);
		}
	}

	playersData.sort((a, b) => (b.nekoscore || 0) - (a.nekoscore || 0));

	return json(playersData);
};
