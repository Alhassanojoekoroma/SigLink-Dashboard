# Airtable Integration Setup Guide

Follow these steps to connect your SigLink application to Airtable for real-time data synchronization.

## 1. Create an Airtable Base
1. Log in to [Airtable](https://airtable.com).
2. Create a new Base (e.g., named "SigLink Subscriptions").
3. Rename the first table to **Subscriptions**.

## 2. Configure Table Columns
Ensure your **Subscriptions** table has the following columns (Names must match exactly):

| Column Name | Field Type |
| :--- | :--- |
| **Subscription ID** | Single line text |
| **Organization** | Single line text |
| **Station Nickname** | Single line text |
| **Location** | Long text |
| **Customer Name** | Single line text |
| **Email** | Email |
| **Phone** | Phone number |
| **Status** | Single select (Active, Pending, Inactive) |
| **Package** | Single line text |
| **Start Date** | Date |
| **End Date** | Date |
| **Amount** | Number (Currency/Decimal) |

## 3. Get Your API Credentials

### A. Personal Access Token (API Key)
1. Go to your [Airtable Builder Hub](https://airtable.com/create/tokens).
2. Click **Create Token**.
3. Name it: `SigLink Sync`.
4. Add Scopes: 
   - `data.records:read`
   - `data.records:write`
5. Add Access: Select the Base you created in Step 1.
6. **Copy the Token immediately** (it only shows once).

### B. Base ID
1. Go to the [Airtable Web API documentation](https://airtable.com/api).
2. Select your new Base.
3. You will see the **Base ID** (starts with `app...`) in the introduction paragraph.

## 4. Connect to Your Application
Open your `.env.local` file in the project root and add the following:

```env
AIRTABLE_API_KEY=your_token_here
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
AIRTABLE_TABLE_NAME=Subscriptions
```

## 5. Verify the Connection
1. Restart your development server (`npm run dev`).
2. Add a new subscription using the SigLink dashboard.
3. Check your Airtable base—the record should appear within seconds.
4. Check your terminal for the log: `Synced to Airtable successfully`.

## Troubleshooting
- **Missing Columns**: If a column name is misspelled in Airtable, the sync will fail. Check the console for errors.
- **Token Permissions**: Ensure you selected both `read` and `write` scopes when creating the token.
- **Table Name**: If you renamed the table in Airtable, make sure `AIRTABLE_TABLE_NAME` in `.env.local` matches it.
