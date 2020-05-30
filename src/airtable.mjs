import Airtable from 'airtable';
import dotenv from 'dotenv';

dotenv.config();

export const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_API_DB);
export const table = base(process.env.AIRTABLE_API_TABLE);
