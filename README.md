# Jarvi Seeds & Nursery — Order Website

A 2-page website (Home + Order) for **Jarvi Seeds & Nursery**. Customers fill an order
form; the order is:
1. Saved to **MongoDB**
2. Appended to an **Excel file** (`backend/data/orders.xlsx`) with a unique ID `YY/MM/DD/000001`
3. Confirmed instantly with a **free WhatsApp message to the owner** and a **free SMS to the customer**

Stack used: plain **HTML/CSS/JS** frontend + **Node.js/Express + MongoDB** backend
(this is simpler to set up than full React and is just as "MERN" on the backend side —
swap the frontend folder for a React app later if you want, the API doesn't change).

---

## 1. Important note on "free" notifications

There is no SMS/WhatsApp provider that is unlimited-and-free forever. These are the
**best real free options** and are already wired into `backend/utils/notify.js`:

| Who | Channel | Provider | Free tier |
|---|---|---|---|
| Owner (you) | WhatsApp | [CallMeBot](https://www.callmebot.com/blog/free-api-whatsapp-messages/) | 100% free, forever, for **one fixed number** (perfect for the shop owner) |
| Customer | SMS | [Textbelt](https://textbelt.com) | 1 free SMS/day on the shared demo key `textbelt` — fine for testing/low volume |

For real order volume, buy a cheap Textbelt key, or switch to **Fast2SMS** / **MSG91**
(India, pay-as-you-go, ₹ per SMS) — you only need to edit the
`sendCustomerNotification` function in `backend/utils/notify.js`; nothing else changes.

---

## 2. Folder structure

```
jarvi-seeds/
├── backend/
│   ├── config/db.js
│   ├── models/Order.js
│   ├── models/Counter.js
│   ├── routes/orderRoutes.js
│   ├── utils/generateUniqueId.js
│   ├── utils/excelStore.js
│   ├── utils/notify.js
│   ├── data/                (orders.xlsx is created here automatically)
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── index.html           (Home page)
    ├── order.html           (Order form page)
    ├── css/style.css
    └── js/order.js
```

---

## 3. WSL setup — step by step

Open **Ubuntu (WSL)** and run:

### 3.1 Update system & install Node.js (v20 LTS)
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v      # should print v20.x
npm -v
```

### 3.2 Get a MongoDB database (choose ONE option)

**Option A — MongoDB Atlas (recommended, no install, free forever tier)**
1. Go to https://www.mongodb.com/cloud/atlas/register and create a free M0 cluster.
2. Create a database user (username/password).
3. Under Network Access, allow your IP (or `0.0.0.0/0` for quick testing).
4. Copy the connection string, e.g.
   `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/jarviSeeds`

**Option B — Install MongoDB locally inside WSL**
```bash
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo mkdir -p /data/db
sudo mongod --dbpath /data/db --fork --logpath /var/log/mongodb.log
```
Your connection string will be `mongodb://127.0.0.1:27017/jarviSeeds`.

### 3.3 Copy the project into WSL
If you downloaded the zip, put it in your Windows Downloads folder, then from WSL:
```bash
mkdir -p ~/projects
cp -r /mnt/c/Users/<your-windows-username>/Downloads/jarvi-seeds ~/projects/
cd ~/projects/jarvi-seeds
```

### 3.4 Install backend dependencies
```bash
cd ~/projects/jarvi-seeds/backend
npm install
```

### 3.5 Configure environment variables
```bash
cp .env.example .env
nano .env
```
Fill in:
- `MONGO_URI` — from step 3.2
- `OWNER_WHATSAPP_NUMBER` and `OWNER_CALLMEBOT_APIKEY` — see instructions inside `.env.example`
  (owner sends one WhatsApp message to CallMeBot's number to get a personal API key, free, 2 minutes)
- `TEXTBELT_KEY` — leave as `textbelt` for the free 1-SMS/day tier, or paste a paid key
- `ADMIN_KEY` — any secret string you choose, used to protect the export/list endpoints

Save with `Ctrl+O`, `Enter`, then `Ctrl+X`.

### 3.6 Run the server
```bash
npm start
```
You should see:
```
MongoDB connected: jarviSeeds
Jarvi Seeds server running on http://localhost:5000
```

### 3.7 Open the website
In your Windows browser, go to:
```
http://localhost:5000
```
Click **Order Now**, fill the form, submit — you'll see the Order ID on screen, the owner's
WhatsApp buzzes, and the customer's phone gets an SMS.

### 3.8 Check the data
- **MongoDB**: view via MongoDB Compass (connect using your `MONGO_URI`) or Atlas's web UI.
- **Excel file**: `backend/data/orders.xlsx` (updates automatically after every order).
  You can also download it any time while the server is running:
  ```
  http://localhost:5000/api/orders/export?key=YOUR_ADMIN_KEY
  ```
- **All orders as JSON**:
  ```
  http://localhost:5000/api/orders?key=YOUR_ADMIN_KEY
  ```

---

## 4. Keeping it running / going live later
- For local development, `npm start` is enough (or `npm run dev` with nodemon for auto-restart).
- To put this on the internet, deploy `backend/` to a host like Render/Railway (free tiers
  available) and point your domain at it — the `frontend/` folder is served automatically
  by the same Express server, so one deployment covers both pages.
- Swap in your real domain (e.g. `jarviseeds.com/order`) once deployed.
