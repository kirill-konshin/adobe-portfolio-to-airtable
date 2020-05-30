import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import yargs from 'yargs';
import {portfolioRequest} from './portfolio.mjs';
import {table} from './airtable.mjs';

const {argv} = yargs.options({
    id: {
        describe: 'ID of Adobe Portfolio page',
        type: 'string',
    },
    debug: {
        describe: 'Dump Adobe Portfolio JSON responses locally',
        type: 'boolean',
    },
    saveImagesToFS: {
        describe: 'Download JPGs locally (needs debug on)',
        type: 'boolean',
    },
});

const saveImagesToFS = false;
const debug = argv.debug;
const id = argv.id;

const outPath = path.resolve(process.cwd(), 'out');
if (!fs.existsSync(outPath) && debug) fs.mkdirSync(outPath);

const delay = (ms = 3000) => new Promise(res => setTimeout(res, ms));

(async () => {
    try {
        const drafts = await portfolioRequest('/drafts');
        const images = await portfolioRequest('/images');

        for (const page of Object.values(drafts.pages).filter(({gallery_page_id}) => !!gallery_page_id)) {
            if (id && id !== page.id) {
                console.log('Skipped', page.name);
                continue;
            }
            console.log('Processing', page.name);

            const galleryPath = path.join(outPath, page.url);
            const metaPath = path.join(galleryPath, `meta.json`);
            const imagesPath = path.join(galleryPath, `images.json`);

            if (debug) {
                if (!fs.existsSync(galleryPath)) fs.mkdirSync(galleryPath);
                fs.writeFileSync(metaPath, JSON.stringify({...page, cover: images[page.covers.normal]}, null, 2));
            }

            const galleryImages = await portfolioRequest(`/pages/${page.id}`);
            if (debug) fs.writeFileSync(imagesPath, JSON.stringify(galleryImages, null, 2));

            const {data, order} = galleryImages.page.modules;
            const galleryImagesItems = data[order[0]].components;

            let index = 0;
            const Images = [];
            const FeaturedImage = [{url: images[page.covers.normal].picture.img.src}];

            for (const image of galleryImagesItems) {
                index++;
                const {
                    // sizes: {max_1920},
                    source_filename,
                    picture: {
                        img: {src},
                    },
                } = image;
                if (saveImagesToFS && debug) {
                    const res = await (await fetch(src)).buffer();
                    fs.writeFileSync(path.join(galleryPath, `${index}-${source_filename}.jpg`), res);
                }
                Images.push({url: src});
            }

            const post = (
                await table.select({maxRecords: 1, filterByFormula: `{PortfolioID} = '${page.id}'`}).all()
            )[0];

            const fields = {
                Images,
                FeaturedImage,
            };

            if (!post) {
                const [Date, Name] = page.name.split(' - ');
                await table.create([
                    {
                        fields: {
                            Name,
                            Date: Date.replace('XX', '1'),
                            PortfolioID: page.id,
                            ...fields,
                        },
                    },
                ]);
                console.log('Created');
            } else {
                await table.update([
                    {
                        id: post.id,
                        fields,
                    },
                ]);
                console.log('Updated');
            }

            await delay(1000);
        }
    } catch (e) {
        console.error(e.stack || e.message);
        process.exit(1);
    }
})();
