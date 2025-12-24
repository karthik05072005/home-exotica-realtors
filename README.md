# Home Exotica Realtors - Real Estate CRM

A comprehensive CRM application designed specifically for Home Exotica Realtors to manage property leads, clients, follow-ups, and transactions.

## Features

- Lead Management: Track property inquiries and leads
- Customer Management: Maintain client relationships
- Follow-up Tracking: Schedule and manage follow-ups
- Document Management: Store property documents and contracts
- Invoice & Payment Tracking: Manage transactions
- Real-time Dashboard: View key metrics and insights

## Setup Instructions

1. **Clone the repository**
   ```sh
   git clone https://github.com/karthik05072005/home-exotica-realtors.git
   cd home-exotica-realtors
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Set up Supabase**
   - Sign up at [Supabase](https://supabase.com)
   - Create a new project
   - Get your Project URL and Public API keys from Project Settings > API
   - Update `.env` file with your Supabase credentials:
     ```
     VITE_SUPABASE_PROJECT_ID="your-project-id"
     VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
     VITE_SUPABASE_URL="https://your-project-id.supabase.co"
     ```

4. **Run the development server**
   ```sh
   npm run dev
   ```

## Supabase Configuration

For your new Supabase project (ID: nyplkvvgnsczwyafvfrx), you need to:

1. Go to your Supabase dashboard
2. Navigate to Project Settings > API
3. Copy the "Project URL" and "Public API Keys" > "anon" key
4. Update the `.env` file with these values

## Database Setup

The application uses the following tables:
- `customers`: Store client information
- `leads`: Track property inquiries
- `follow_ups`: Manage follow-up activities
- `invoices`: Track property transactions
- `documents`: Store property documents

## Deployment

Deploy to Vercel:
1. Push code to GitHub
2. Connect Vercel to your GitHub repository
3. Deploy with the following build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `/`

## Technologies Used

- Vite
- TypeScript
- React
- Supabase
- Tailwind CSS
- shadcn/ui
- Framer Motion

## Support

For support, please contact the Home Exotica Realtors development team.
