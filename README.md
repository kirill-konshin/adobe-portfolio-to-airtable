Adobe Portfolio To AirTable
===========================

Usage:

```bash
$ git clone https://github.com/kirill-konshin/adobe-portfolio-to-airtable
```

Once done create an `.env` file:

```dotenv
PORTFOLIO_TOKEN=XXX
PORTFOLIO_SITE_ID=XXX
AIRTABLE_API_KEY=XXX
AIRTABLE_API_DB=XXX
AIRTABLE_API_TABLE=XXX
```

You can look up `PORTFOLIO_TOKEN` and `PORTFOLIO_SITE_ID` in Network tab in Chrome, look in Headers section, just pick any of the XHR requests while navigating through admin part of Adobe Portfolio. I haven't found a better way to obtain credentials.

Make sure your AirTable has following fields: `Name`, `Date`, `Images`, `FeaturedImage` and `PortfolioID`. These values are hardcoded for now...

Once you've created the `.env` file you can perform sync:

```bash
$ yarn install
$ yarn start
```

You can update individual Page:

```bash
yarn start --id=XXX
```

All CLI options:

```
--help            Show help                                          [boolean]
--version         Show version number                                [boolean]
--id              ID of Adobe Portfolio page                          [string]
--debug           Dump Adobe Portfolio JSON responses locally        [boolean]
--saveImagesToFS  Download JPGs locally (needs debug on)             [boolean]
```