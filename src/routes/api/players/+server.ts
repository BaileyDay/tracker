import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import puppeteerCore from 'puppeteer-core';
import puppeteer from 'puppeteer';
import chromium from '@sparticuz/chromium';

export const config = {
	maxDuration: 300
};

const playerIds = [
	60587108, 57439638, 142971229, 148511671, 57439584, 1154584751, 110594995, 54565124, 143912978,
	81243397
];

const CHROME_URL = process.env.CHROMIUM;

async function getBrowser() {
	if (process.env.VERCEL_ENV === 'production') {
		const executablePath = await chromium?.executablePath();
		const browser = await puppeteerCore.launch({
			args: chromium.args,
			defaultViewport: chromium.defaultViewport,
			executablePath,
			headless: chromium.headless
		});
		console.log('Launched browser in production');
		return browser;
	} else {
		const browser = await puppeteer.launch();
		console.log('Launched browser locally');
		return browser;
	}
}

async function getPlayerData(playerId: number, browser: puppeteer.Browser, attempt: number = 1) {
	try {
		const page = await browser.newPage();
		await page.setUserAgent(
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
		);
		console.log(`Navigating to player page for playerId: ${playerId}, Attempt: ${attempt}`);

		await page.goto(`https://tracklock.gg/players/${playerId}`, {
			waitUntil: 'networkidle2', // Wait for network to be idle
			timeout: 60000 // Page load timeout
		});

		console.log(`Waiting for player data elements on page for playerId: ${playerId}`);
		await page.waitForFunction(() => document.querySelector('.font-semibold.text-lg') !== null, {
			timeout: 30000 // 30 seconds timeout for elements to load
		});

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

		await page.close();
		console.log(`Successfully fetched data for playerId: ${playerId}`);
		return { playerId, ...data };
	} catch (error) {
		console.error(`Error fetching data for player ${playerId} on attempt ${attempt}:`, error);

		// Take screenshot on error for debugging
		try {
			await browser.pages().then(async (pages) => {
				const page = pages[0];
				if (page) {
					await page.screenshot({
						path: `error_screenshot_player_${playerId}.png`,
						fullPage: true
					});
				}
			});
		} catch (screenshotError) {
			console.error('Error taking screenshot:', screenshotError);
		}

		// Retry mechanism (retry up to 3 times)
		if (attempt < 3) {
			console.log(`Retrying for player ${playerId}, attempt ${attempt + 1}`);
			return getPlayerData(playerId, browser, attempt + 1);
		} else {
			console.error(`Failed to fetch data for player ${playerId} after ${attempt} attempts`);
			return null;
		}
	}
}

export const GET: RequestHandler = async () => {
	let browser;
	const playersData = [];

	try {
		browser = await getBrowser();

		for (const playerId of playerIds) {
			console.log(`Fetching data for playerId: ${playerId}`);
			const data = await getPlayerData(playerId, browser); // Reuse the browser instance
			if (data) {
				playersData.push(data);
			} else {
				console.error(`No data returned for playerId: ${playerId}`);
			}
		}

		playersData.sort((a, b) => (b.nekoscore || 0) - (a.nekoscore || 0));
		console.log('Player data successfully fetched and sorted.');
	} catch (error) {
		console.error('Error in browser operations:', error);
	} finally {
		if (browser) {
			console.log('Closing browser');
			await browser.close();
		}
	}

	return json(playersData);
};
