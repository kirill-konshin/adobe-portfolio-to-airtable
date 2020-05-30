import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

export const portfolioRequest = async (url, {method = 'GET'} = {}) => {
    let res;
    let json;
    try {
        res = await fetch(`https://portfolio.adobe.com/api/v1${url}`, {
            method,
            headers: {
                authorization: `Bearer ${process.env.PORTFOLIO_TOKEN}`,
                accept: '*/*',
                'x-site-id': process.env.PORTFOLIO_SITE_ID,
            },
        });
        if (!res.ok) throw new Error('Status not OK');
        json = res.json();
        return json;
    } catch (e) {
        if (json) throw new Error(`HTTP ${res.status} (${res.statusText}): ${json.message}`);
        if (res) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        throw e;
    }
};
