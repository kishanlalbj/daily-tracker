## Getting Started

First, run the development server:

### Run locally

```bash
npm i
```

### Environments

Create `.env` file add your postgres url

```bash
#.env

DATABASE_URL="postgres://postgres:password@localhost:5432/dev_db?schema=public"
```

### Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

### Production Server

```bash
npm run build

npm start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
