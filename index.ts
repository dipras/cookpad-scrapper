import parse from "node-html-parser";
import fsp from "fs/promises"
import fs from "fs"

(async () => {

  const title = "lontong balap";
  const mainUrl = "https://cookpad.com/id/cari/" + title;
  const folderPath = `Downloads/${title}`

  if (!fs.existsSync(folderPath)) await fsp.mkdir(folderPath);
  const links: Array<String> = [];
  for (let i = 1; i <= 25; i++) {
    const data = await (await fetch(`${mainUrl}?page=${i}`)).text();
    const html = parse(data);
    html.querySelector("#search-recipes-list")?.querySelectorAll("li").forEach(child => {
      if (child.hasAttribute('id')) {
        const link = child.querySelector("a");
        if (link) {
          links.push(link.getAttribute("href") || "");
        }
      }
    })
  }

  const imgLinks: Array<String | null> = [];
  let idx = 1;
  for (const lin of links) {
    if (lin.includes("https://")) continue;
    const data = await (await fetch(`https://cookpad.com${lin}`)).text();
    const html = parse(data);
    const imgElement = html.querySelector(".tofu_image")?.querySelector("img");
    const link = imgElement ? imgElement.getAttribute("src") : "";
    if (link && link !== "") {
      imgLinks.push(link);
    }
    console.log(`scrap ${idx} of ${links.length} data`);
    idx++;
  }

  console.log("Downloading " + imgLinks.length + " files");
  for (let i = 0; i < imgLinks.length; i++) {
    const url = imgLinks[i];
    if (!url) continue;
    const urls = url.split("/");
    const filename = urls[urls.length - 1];
    const response = await fetch(String(url));

    const arrayBuffer = await response.arrayBuffer();
    await Bun.write(`${folderPath}/${filename}`, arrayBuffer);
    console.log(`Downloaded ${i + 1} of ${imgLinks.length}`);
  }
})();