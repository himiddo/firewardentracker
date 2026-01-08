## Setup
NOTE: THIS IS FOR LOCALLY SETTING UP THE WEBSITE.
### Prerequisites
- Node.js (v18 or later)
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
