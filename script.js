// ---------- DATA ----------
// Replace names, codes, prices, categories and image paths with your own 6 mice
const products = [
  { id: 1, name: "FanTech WGC2 VENOM2", code: "LG502", price: 22.99, category: "Wired", image: "/assets/FanTech.webp" },
  { id: 2, name: "Attack Shark G3 PRO", code: "RZDA3", price: 25.99, category: "Wired", image: "/assets/G3PRO_3.webp" },
  { id: 3, name: "Attack shark R2", code: "LGPX2", price: 71.99, category: "Wireless", image: "/assets/R2_3.webp" },
  { id: 4, name: "Attack Shark V6", code: "RZVP2", price: 27.99, category: "Wireless", image: "/assets/V6_1.webp" },
  { id: 5, name: "Attack shark X5", code: "SSR3", price: 22.99, category: "Budget", image: "/assets/X5BLK1.webp" },
  { id: 6, name: "Attack shark X11", code: "GLMO", price: 25.99, category: "Budget", image: "/assets/X11_2.webp" }
];


let order = [];   // each item: { id, name, code, price, image, qty }

// ---------- ELEMENTS ----------
const productGrid = document.querySelector("#product-grid");
const orderList = document.querySelector("#order-list");
const emptyMsg = document.querySelector("#empty-msg");
const totalQtyEl = document.querySelector("#total-qty");
const pillQtyEl = document.querySelector("#pill-qty");
const subtotalEl = document.querySelector("#subtotal");
const totalEl = document.querySelector("#total");
const overlay = document.querySelector("#receipt-overlay");

// ---------- HELPERS ----------
function findOrderItem(id) {
  for (let i = 0; i < order.length; i++) {
    if (order[i].id === id) return order[i];
  }
  return null;
}

function findProduct(id) {
  for (let i = 0; i < products.length; i++) {
    if (products[i].id === id) return products[i];
  }
  return null;
}

function calculateSubtotal() {
  let sum = 0;
  for (let i = 0; i < order.length; i++) {
    sum += order[i].price * order[i].qty;
  }
  return sum;
}

function calculateTotalQty() {
  let count = 0;
  for (let i = 0; i < order.length; i++) {
    count += order[i].qty;
  }
  return count;
}

function calculateTotal() {
  const subtotal = calculateSubtotal();
  let tax        = Number(document.querySelector("#tax").value) || 0;
  let discount   = Number(document.querySelector("#discount").value) || 0;
  const shipping = Number(document.querySelector("#shipping").value) || 0;

  if (discount > 100) discount = 100;     // never more than 100%
  if (discount < 0)   discount = 0;       // no negative discounts

  const discountAmount = subtotal * discount / 100;
  const afterDiscount  = subtotal - discountAmount;
  const taxAmount      = afterDiscount * tax / 100;

  return afterDiscount + taxAmount + shipping;
}

// ---------- ORDER ACTIONS ----------
function addToOrder(id) {
  const existing = findOrderItem(id);
  if (existing) {
    existing.qty++;
  } else {
    const p = findProduct(id);
    order.push({ id: p.id, name: p.name, code: p.code, price: p.price, image: p.image, qty: 1 });
  }
  renderOrder();
}

function changeQty(id, amount) {
  const item = findOrderItem(id);
  item.qty += amount;
  if (item.qty <= 0) {
    removeItem(id);
    return;
  }
  renderOrder();
}

function removeItem(id) {
  for (let i = 0; i < order.length; i++) {
    if (order[i].id === id) {
      order.splice(i, 1);
      break;
    }
  }
  renderOrder();
}

function clearOrder() {
  order = [];
  renderOrder();
}

// ---------- RENDERING ----------
function renderProducts(list) {
  productGrid.innerHTML = "";

  if (list.length === 0) {
    productGrid.innerHTML = '<p class="text-body-secondary">No mice match your search.</p>';
    return;
  }

  for (let i = 0; i < list.length; i++) {
    const p = list[i];
    const col = document.createElement("div");
    col.className = "col-6 col-md-4";
    col.innerHTML = `
      <div class="card product-card h-100">
        <div class="product-stage d-flex align-items-center justify-content-center">
          <img src="${p.image}" alt="${p.name}" class="product-img">
        </div>
        <div class="card-body">
          <h6 class="card-title mb-1">${p.name}</h6>
          <small class="text-body-secondary">${p.code} · ${p.category}</small>
          <div class="fs-5 fw-bold text-info mt-2">$${p.price.toFixed(2)}</div>
        </div>
      </div>
    `;
    col.addEventListener("click", function () {
      addToOrder(p.id);
    });
    productGrid.appendChild(col);
  }
}

function renderOrder() {
  orderList.innerHTML = "";

  if (order.length === 0) {
    emptyMsg.classList.remove("d-none");
  } else {
    emptyMsg.classList.add("d-none");
  }

  for (let i = 0; i < order.length; i++) {
    const item = order[i];
    const row = document.createElement("li");
    row.className = "list-group-item d-flex align-items-center gap-3 px-0";
    row.innerHTML = `
      <img src="${item.image}" alt="" class="cart-thumb rounded bg-body-secondary">
      <div class="flex-grow-1">
        <div class="fw-semibold">${item.name}</div>
        <div class="small text-body-secondary">$${item.price.toFixed(2)} each</div>
        <div class="btn-group btn-group-sm mt-1">
          <button class="btn btn-outline-secondary" data-id="${item.id}" data-action="minus">-</button>
          <span class="btn btn-outline-secondary disabled text-body">${item.qty}</span>
          <button class="btn btn-outline-secondary" data-id="${item.id}" data-action="plus">+</button>
        </div>
      </div>
      <div class="text-end">
        <div class="fw-bold text-info">$${(item.price * item.qty).toFixed(2)}</div>
        <button class="btn btn-sm text-danger" data-id="${item.id}" data-action="remove">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
    `;
    orderList.appendChild(row);
  }

  updateTotals();
}

function updateTotals() {
  const qty = calculateTotalQty();
  totalQtyEl.textContent = qty;
  pillQtyEl.textContent = qty;
  subtotalEl.textContent = calculateSubtotal().toFixed(2);
  totalEl.textContent = calculateTotal().toFixed(2);
}

// ---------- RECEIPT ----------
function showReceipt() {
  if (order.length === 0) {
    alert("No products in the order!");
    return;
  }

  const itemsBox = document.querySelector("#receipt-items");
  itemsBox.innerHTML = "";

  for (let i = 0; i < order.length; i++) {
    const item = order[i];
    itemsBox.innerHTML += `
      <div class="d-flex justify-content-between">
        <span>${item.name} × ${item.qty}</span>
        <span>$${(item.price * item.qty).toFixed(2)}</span>
      </div>`;
  }

  document.querySelector("#receipt-total").textContent = calculateTotal().toFixed(2);
  document.querySelector("#receipt-date").textContent = new Date().toLocaleString();
  overlay.classList.remove("d-none");
}

function startNewOrder() {
  overlay.classList.add("d-none");
  clearOrder();
}

// ---------- CATEGORIES & SEARCH ----------
function getCategories() {
  const cats = ["All"];
  for (let i = 0; i < products.length; i++) {
    if (!cats.includes(products[i].category)) {
      cats.push(products[i].category);
    }
  }
  return cats;
}

function filterByCategory(category) {
  if (category === "All") return products;
  const results = [];
  for (let i = 0; i < products.length; i++) {
    if (products[i].category === category) results.push(products[i]);
  }
  return results;
}

function searchProducts(text) {
  text = text.toLowerCase();
  const results = [];
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (p.name.toLowerCase().includes(text) || p.code.toLowerCase().includes(text)) {
      results.push(p);
    }
  }
  return results;
}

function renderCategories(activeCategory) {
  const box = document.querySelector("#categories");
  box.innerHTML = "";
  const cats = getCategories();

  for (let i = 0; i < cats.length; i++) {
    const btn = document.createElement("button");
    btn.textContent = cats[i];
    if (cats[i] === activeCategory) {
      btn.className = "btn btn-sm rounded-pill btn-danger";
    } else {
      btn.className = "btn btn-sm rounded-pill btn-outline-secondary";
    }
    btn.addEventListener("click", function () {
      renderCategories(cats[i]);
      renderProducts(filterByCategory(cats[i]));
    });
    box.appendChild(btn);
  }
}

// ---------- EVENTS ----------
orderList.addEventListener("click", function (event) {
  const btn = event.target.closest("button");
  if (btn === null) return;

  const action = btn.dataset.action;
  const id = Number(btn.dataset.id);

  if (action === "plus") changeQty(id, 1);
  if (action === "minus") changeQty(id, -1);
  if (action === "remove") removeItem(id);
});

document.querySelector("#tax").addEventListener("input", updateTotals);
document.querySelector("#discount").addEventListener("input", updateTotals);
document.querySelector("#shipping").addEventListener("input", updateTotals);

document.querySelector("#search").addEventListener("input", function () {
  renderCategories("All");
  renderProducts(searchProducts(this.value));
});

document.querySelector("#clear-btn").addEventListener("click", function () {
  if (confirm("Cancel this order?")) clearOrder();
});
document.querySelector("#pay-btn").addEventListener("click", showReceipt);
document.querySelector("#new-order-btn").addEventListener("click", startNewOrder);

// ---------- START ----------
renderCategories("All");
renderProducts(products);
renderOrder();