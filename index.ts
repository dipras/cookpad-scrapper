import puppeteer from "puppeteer"
import fsp from "fs/promises"
import fs from "fs"

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  const title = "nasi pecel";
  await page.goto("https://cookpad.com/id/cari/" + title);
  const folderPath = `Downloads/${title}`

  if(!fs.existsSync(folderPath)) await fsp.mkdir(folderPath);
  for(let i = 0; i < 0; i++) {
    await page.mouse.wheel({
      deltaY: 2000,
    });
  
    await page.waitForNetworkIdle()
  }

  const links = await page.evaluate(() => {
    const parents = document.querySelector("#search-recipes-list");
    const hrefs: string[] = [];
    parents?.childNodes.forEach((child) => {
      const element = child as HTMLElement;
      if (element.tagName === "LI" && element.hasAttribute("id")) {
        const link = element.querySelector("a");
        if (link) {
          hrefs.push(link.getAttribute("href") || "");
        }
      }
    });
    return hrefs;
  });

  const imgLinks : Array<String | null> = [];
  for(const lin of links) {
    if(lin.includes("https://")) continue;
    await page.goto(`https://cookpad.com${lin}`);
    const link = await page.evaluate(() => {
      const imgElement = document.querySelector(".tofu_image")?.querySelector("img");
      return imgElement ? imgElement.getAttribute("src") : "";
    })
    if(link !== "") {
      imgLinks.push(link);
    }
  }

  console.log("Downloading " + imgLinks.length + " files");
  for(let i = 0; i < imgLinks.length; i++) {
    const url = imgLinks[i];
    if(!url) continue;
    const urls = url.split("/");
    const filename = urls[urls.length - 1];
    const response = await fetch(String(url));

    const arrayBuffer = await response.arrayBuffer();
    await Bun.write(`${folderPath}/${filename}`, arrayBuffer);
    console.log(`Downloaded ${i + 1} of ${imgLinks.length}`);
  }

  await browser.close();
})();