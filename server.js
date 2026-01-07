const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, "db.json");

// -------- DB HELPERS --------
function readDb() {
  if (!fs.existsSync(DB_PATH)) {
    return { orders: [], products: [], categories: [], brands: [], offers: [], settings: {} };
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// -------- BASIC TEST --------
app.get("/", (req, res) => {
  res.send("Hallalbd backend is running");
});

// -------- PRODUCTS --------
app.get("/products", (req, res) => {
  const db = readDb();
  res.json(db.products || []);
});

// -------- ORDERS --------
app.post("/orders", (req, res) => {
  const db = readDb();
  const order = {
    ...req.body,
    orderId: "HBD-" + Date.now(),
    status: "PLACED",
    createdAt: new Date().toISOString()
  };
  db.orders.push(order);
  writeDb(db);
  res.json(order);
});

// -------- STATIC PAGES (YOUR CODE) --------
app.get('/pages/:slug', (req, res) => {
  const db = readDb();
  const page = db.settings?.pages?.[req.params.slug];
  res.json({ content: page || "Content coming soon..." });
});

// -------- ORDER TRACKING (YOUR CODE) --------
app.get('/track/:orderId', (req, res) => {
  const db = readDb();
  const { phone } = req.query;
  const order = db.orders.find(
    o => o.orderId === req.params.orderId && o.customer?.phone === phone
  );
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

// -------- SERVER START (VERY IMPORTANT) --------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
