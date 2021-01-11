console.time("crawl");
const puppeteer = require("puppeteer");
const fs = require("fs");

const { getDetail } = require("./detail");

const url = "https://www.cermati.com/karir";

(async () => {
	const browser = await puppeteer.launch({
		// headless: false,
	});
	const page = await browser.newPage();
	await page.goto(url);

	// expand department
	const departmentButtons = await page.$$(
		"#section-vacancies .text-center p"
	);
	let departmentIndex = 0;
	let result = {};
	for (const button of departmentButtons) {
		await button.click();

		const department = await button.evaluate((el) => el.innerHTML);

		// extract job openings
		const jobs = await page.$$(`#tab${departmentIndex} .row`);
		const jobsArray = [];

		/**
	 	for (const job of jobs) {
			const jobUrls = await job
				.$eval("a", (el) => {
					const title = el.querySelector(".dept-label").textContent;
					return {
						url: el.href,
						title,
					};
				})
				.catch((err) => {
					return { err: err.message };
				});

			const detail = await getDetail(browser, jobUrls.url);

			jobsArray.push({ ...jobUrls, ...detail });
		}
		 */

		await Promise.all(
			jobs.map(async (job) => {
				try {
					const jobUrls = await job
						.$eval("a", (el) => {
							const title = el.querySelector(".dept-label")
								.textContent;
							return {
								url: el.href,
								title,
							};
						})
						.catch((err) => {
							return { err: err.message };
						});

					const detail = await getDetail(browser, jobUrls.url);

					jobsArray.push({ ...jobUrls, ...detail });
					return;
				} catch (e) {
					return;
				}
			})
		);

		departmentIndex++;

		result[department] = jobsArray;
	}

	fs.writeFile("solution.json", JSON.stringify(result), (err) => {
		if (err) throw err;
		console.log("The file has been saved!");
	});

	await browser.close();
	console.timeEnd("crawl");
})();
