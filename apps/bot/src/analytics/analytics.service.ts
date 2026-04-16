import * as process from 'node:process';
import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { Advertisement, PollAnswer } from './analytics.model';

const scopes = ['https://www.googleapis.com/auth/spreadsheets'];

@Injectable()
export class AnalyticsService {
  async addData(data: Advertisement) {
    const auth = new google.auth.JWT({
      key: process.env.GOOGLE_API_KEY,
      email: process.env.GOOGLE_EMAIL,
      scopes,
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const values = [data.channel, data.userId, data.dateAndTime];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: data.sheetId,
      valueInputOption: 'RAW',
      requestBody: { values: [values] },
    });
  }

  async addPollData(data: PollAnswer) {
    const auth = new google.auth.JWT({
      key: process.env.GOOGLE_API_KEY,
      email: process.env.GOOGLE_EMAIL,
      scopes,
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const values = [
      data.question,
      data.userId,
      data.userName,
      data.options.join('\n'),
      data.dateAndTime,
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `Polls!A2`, // Assuming a "Polls" sheet exists
      valueInputOption: 'RAW',
      requestBody: { values: [values] },
    });
  }
}
