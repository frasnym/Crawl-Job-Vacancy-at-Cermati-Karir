async function getDetail(browser, url) {
	const page = await browser.newPage();
	await page.goto(url);

	const posted_by = await page.$eval(
		".details-title",
		(el) => el.textContent
	);

	const location = await page.$eval(
		"span.job-detail",
		(el) => el.textContent
	);

	const getList = async (page, selector) => {
		return await page
			.$eval(selector, (el) => {
				const nodes = el.querySelectorAll("li");

				var list = [].slice.call(nodes);
				var innertext = list
					.map(function (e) {
						return e.innerText;
					})
					.join(", ");

				return innertext;
			})
			.catch((err) => {
				return err.message;
			});
	};

	const descriptions = await getList(page, "#st-jobDescription");
	const qualifications = await getList(page, "#st-qualifications");

	await page.close();

	return { location, descriptions, qualifications, posted_by };
}

module.exports = { getDetail };
