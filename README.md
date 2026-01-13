## Fire Warden Tracker for UOW
Link : https://firewardentracker-apggb8hzfkfsbjf3.francecentral-01.azurewebsites.net/dashboard

## How to use:
Home Menu:
Press one of the two buttons on the page to either log your location or view the dashboard (or at the top in the navigation menu)

Log Location:
Enter your staff number, first name, and surname
Select current working location from the dropdown
Click "Log Location" to submit the entry

Dashboard
See all fire warden locations in real time.
Use filters to search by name, staff number or location
View All Entries or Present Day Etnries

Manage Entries in Dashboard
You can ammend other entries or delete them.
If you edit an entry, you can change the Staff Number, first name, surname, and location. 
Press "Update Entry" to save edits.

## Setup
NOTE: THIS IS FOR LOCALLY SETTING UP THE WEBSITE.
### Prerequisites
- Node.js (v18 or later) (v24 is reccomended)
- Azure Cosmos DB account

### Azure Cosmos DB Setup - How to get keys and URL for the .env file

Get your connection details:
   - Go to your Cosmos DB account
   - Click "Keys" in the left sidebar
   - Copy the "URI" and "PRIMARY KEY"

### Installation

1. Clone the repository (if you install the repository because you do not have git, ignore the first command):
   ```bash
   git clone https://github.com/himiddio/firewardentracker.git
   cd fire-warden-tracker
   ```

2. Install dependencies:
   ```bash
   npm run install-all
   ```

3. Create a `.env` file in the root directory based on `.env.example`:
   ```
   COSMOS_ENDPOINT=https://your-account.documents.azure.com:443/
   COSMOS_KEY=your-primary-key-here
   COSMOS_DATABASE=FireWardenDB
   COSMOS_CONTAINER=WardenEntries
   ```

4. Run the application:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000 in your browser.

The database and container will be created automatically when the app first runs.

BY Z.K
