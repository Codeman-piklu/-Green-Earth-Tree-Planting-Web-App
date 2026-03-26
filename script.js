
let allTrees = [];
let cart = JSON.parse(localStorage.getItem("cart")) || []; 

//! load api 
// 2️⃣ Load Plants from API
// ============================
const loadTrees = async () => {
  const url = "https://openapi.programming-hero.com/api/plants";
  const res = await fetch(url);
  const data = await res.json();
  allTrees = data.plants;

  displayPlants(allTrees);
  displayCategories(allTrees);

  // show hidden elements
  document.getElementById("catagori").classList.remove("hidden");
  document.getElementById("sorting").classList.remove("hidden");
  document.getElementById("cart").classList.remove("hidden");
  document.getElementById("coupon").classList.remove("hidden");
  document.getElementById("auto_Animation").classList.add("hidden");
  document.getElementById("search_Input").classList.remove("hidden");
};


// ! Display Categories

const displayCategories = (categories) => {
  const container = document.getElementById("plant_lavel_Container");
  container.innerHTML = "";

  // All Plants button
  const allBtn = document.createElement("button");
  allBtn.className = "btn my-2 cat rounded-2xl w-full";
  allBtn.innerText = "All Plants";
  allBtn.addEventListener("click", () => {
    displayPlants(allTrees);
    controllingTitle("All Plants");
  });
  container.append(allBtn);

  // unique category buttons
  const uniqueCategories = new Set(categories.map(p => p.category));
  uniqueCategories.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "btn my-2 cat rounded-2xl w-full";
    btn.innerText = cat;
    btn.addEventListener("click", () => {
      const filtered = allTrees.filter(p => p.category === cat);
      displayPlants(filtered);
      controllingTitle(cat);
    });
    container.append(btn);
  });

  activeClass(".cat");
};


//! Display Plants

const displayPlants = (plants) => {
  const container = document.getElementById("plant_Container");
  container.innerHTML = "";

  plants.forEach(plant => {
    const div = document.createElement("div");
    div.innerHTML = `
      <div class="card bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer w-full">
        <figure class="p-4">
          <img src="${plant.image}" class="rounded-lg h-36 sm:h-40 md:h-44 w-full object-cover" />
        </figure>
        <div class="card-body pt-0 px-4 pb-4">
          <h2 class="card-title text-base sm:text-lg">${plant.name}</h2>
          <p class="text-xs sm:text-sm text-gray-500 mt-1">${plant.description.slice(0, 60)}...</p>
          <div class="flex justify-between items-center mt-2">
            <span class="bg-green-100 text-green-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">${plant.category}</span>
            <span class="font-semibold text-gray-700 text-sm sm:text-base">&#2547; ${plant.price}</span>
          </div>
          <div class="flex mt-3 gap-2">
            <button onclick="showPlantDetails(${plant.id})" class="flex-1 bg-green-700 text-white rounded-full hover:bg-green-800 py-2 text-sm">Details</button>
            <button onclick="addToCart(${plant.id})" class="flex-1 bg-green-700 text-white rounded-full hover:bg-green-800 py-2 text-sm">Add to Cart</button>
            <button onclick="toggleWishlist(${plant.id})" 
      class="flex-1 bg-yellow-400 text-green-800 rounded-full hover:bg-yellow-500 py-2 text-sm">
      ❤️ Wishlist
      </button>
          </div>
          </div>
          </div>
          `;
    container.append(div);
  });
};


// ! Add to Cart

const addToCart = (id) => {
  const exist = cart.find(item => item.id === id);
if (exist) {
  exist.qty += 1;
  showToast(`${exist.name} quantity increased!`, "success");
} else {
  const plant = allTrees.find(p => p.id === id);
  cart.push({ ...plant, qty: 1 });
  showToast(`${plant.name} added to cart!`, "success");
}
  displayCartItems();
};


//!  Display Cart Items
const displayCartItems = () => {
  const container = document.getElementById("cart_container");
  container.innerHTML = "";

  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.qty;

    const div = document.createElement("div");
    div.className = "flex justify-between border-b py-2 cursor-pointer hover:bg-gray-100 p-1 rounded";
    div.innerHTML = `
      <span>${index + 1}</span>
      <span>${item.name}</span>
      <div class="flex items-center gap-2">
        <button class="minus btn btn-xs">-</button>
        <span>${item.qty}</span>
        <button class="plus btn btn-xs">+</button>
      </div>
      <span>&#2547; ${item.price * item.qty}</span>
      <button class="remove text-red-500">❌</button>
    `;
    container.append(div);

    // !plus / minus
    div.querySelector(".plus").addEventListener("click", () => {
      item.qty += 1;
      displayCartItems();
    });

    div.querySelector(".minus").addEventListener("click", () => {
      if (item.qty > 1) item.qty -= 1;
      else cart.splice(index, 1);
      displayCartItems();
    });

    div.querySelector(".remove").addEventListener("click", e => {
      e.stopPropagation();
      cart.splice(index, 1);
      displayCartItems();
      showToast("Item removed!", "error");
    });
  });

// =========================
//! 🔥 PROGRESS BAR LOGIC
// =========================

//! progress bar value update
document.getElementById("progress_bar").value = total;

//! next target
let nextTarget = 0;

if (total < 3000) nextTarget = 3000;
else if (total < 5000) nextTarget = 5000;
else if (total < 8000) nextTarget = 8000;
else if (total < 10000) nextTarget = 10000;
else if (total < 12000) nextTarget = 12000;

//! text update
const progressText = document.getElementById("progress_text");

if (nextTarget > 0) {
  progressText.innerText =
    `Add $${nextTarget - total} more to unlock next discount 🚀`;

  progressText.classList = "text-green-700 font-bold";
} else {
  progressText.innerText = "🎉 Maximum discount unlocked!";
}


  //! 🧮 TOTAL
  document.getElementById("cart_total").innerText = total.toFixed(2);

  // !🧮 CART COUNT
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById("cart_count").innerText = totalQty;

  // =========================
  //! 🔥 DISCOUNT LOGIC
  // =========================
  let discountPercent = 0;

  if (total >= 12000) discountPercent = 40;
  else if (total >= 10000) discountPercent = 30;
  else if (total >= 8000) discountPercent = 25;
  else if (total >= 5000) discountPercent = 20;
  else if (total >= 3000) discountPercent = 10;

  const discountAmount = total * (discountPercent / 100);
  const couponAmount = total * (couponDiscount / 100);

  const finalTotal = total - discountAmount - couponAmount;

  // !🎯 UI UPDATE
  document.getElementById("Discount_quantity").innerText = discountPercent + "%";
  document.getElementById("Aftertotal").innerText = finalTotal.toFixed(2);

  //! save
  localStorage.setItem("cart", JSON.stringify(cart));
};

//! Coupon & Discounts

let couponDiscount = 0;

const applyCoupon = () => {
  const input = document.getElementById("coupon_input");
  const code = input.value;
  const btn = document.getElementById("apply");

  if (code === "SAVE10") {
    couponDiscount = 10;
    showToast("🎉 10% Coupon Applied!", "success");

    btn.disabled = true;
    btn.innerText = "Applied ✅";
    btn.classList.add("bg-green-500");

  } 
  else if (code === "SAVE20") {
    couponDiscount = 20;
    showToast("🔥 20% Coupon Applied!", "success");

    btn.disabled = true;
    btn.innerText = "Applied ✅";
    btn.classList.add("bg-green-500");

  } 
  else {
    couponDiscount = 0;
    showToast("❌ Invalid Coupon!", "error");
  }

  displayCartItems();

  // input clear
  input.value = "";
};

//! reset coupon button 
const resetCoupon = () => {
  couponDiscount = 0;

  const btn = document.getElementById("apply");
  btn.disabled = false;
  btn.innerText = "Apply";
  btn.classList.remove("bg-green-500");

  showToast("Coupon reset!", "error");

  displayCartItems();
};
//! Page Load

document.addEventListener("DOMContentLoaded", () => {
  // loadTrees();
  displayCartItems(); 
});

//! controlling title 

const controllingTitle = (title) => {
  const container = document.getElementById("tittle_container");
  container.className = "pt-5 text-2xl font-bold text-center";
  container.innerText = title;
};

// !Active class on button 

const activeClass = (selector) => {
  document.querySelectorAll(selector).forEach(nav => {
    nav.addEventListener("click", () => {
      document.querySelectorAll(selector).forEach(p => p.classList.remove("active"));
      nav.classList.add("active");
    });
  });
};

// !search box 
document.getElementById("search_Input").addEventListener("input", (e) => {
  const value = e.target.value.toLowerCase();

  const filtered = allTrees.filter(tree =>
    tree.name.toLowerCase().includes(value) ||
    tree.category.toLowerCase().includes(value)
  );

  displayPlants(filtered);
  controllingTitle("Search Results");
});
//!sorted result
document.getElementById("sort_select").addEventListener("change", (e) => {
  const value = e.target.value;

  let sorted = [...allTrees]; // copy array (VERY IMPORTANT)

  if (value === "low") {
    sorted.sort((a, b) => a.price - b.price);
  } 
  else if (value === "high") {
    sorted.sort((a, b) => b.price - a.price);
  } 
  else if (value === "name") {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  }

  displayPlants(sorted);
controllingTitle("Sorted Result");
});

// !Wishlist Array
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

// !Toggle Wishlist
const toggleWishlist = (id) => {
  const plant = allTrees.find(p => p.id === id);
  const exist = wishlist.find(p => p.id === id);

  if (exist) {
    wishlist = wishlist.filter(p => p.id !== id);
    showToast(`${plant.name} removed from Wishlist`);
  } else {
    wishlist.push(plant);
    showToast(`${plant.name} added to Wishlist`);
  }

  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  displayWishlistCount();
};

//! Wishlist Count (Navbar এ show করা যায়)
const displayWishlistCount = () => {
  const count = wishlist.length;
  let elem = document.getElementById("wishlist_count");
  if(!elem){
    // Navbar এ add করা
    const navbar = document.querySelector(".navbar-end");
    const span = document.createElement("span");
    span.id = "wishlist_count";
    span.className = "absolute -top-2 -right-7 bg-red-500 text-white text-xs px-2 rounded-full";
    navbar.prepend(span);
  }
  document.getElementById("wishlist_count").innerText = count;
};

//! Page Load
document.addEventListener("DOMContentLoaded", () => {
  displayWishlistCount();
});
 //! show wishlist modal
const showWishlist = () => {
  const container = document.getElementById("wishlist_container");
  container.innerHTML = "";

  if(wishlist.length === 0){
    container.innerHTML = `<p class="text-center text-gray-500">Your wishlist is empty 🌱</p>`;
  } else {
    wishlist.forEach((item, index) => {
      const div = document.createElement("div");
      div.className = "flex justify-between items-center border-b p-2 rounded hover:bg-gray-100";
      div.innerHTML = `
        <span>${item.name}</span>
        <button onclick="toggleWishlist(${item.id})" class="text-red-500">❌</button>
      `;
      container.append(div);
    });
  }

  // Show modal
  document.getElementById("wishlist_modal").showModal();
};
// !Wishlist icon click event
document.getElementById("wishlist_icon").addEventListener("click", () => {
  showWishlist();
});

//! modal showing 
const showPlantDetails = (id) => {
  const plant = allTrees.find(p => p.id === id);
  const modal = document.getElementById("modal_container");
  modal.innerHTML = `
    <img src="${plant.image}" class="w-48 mx-auto rounded-lg mb-4">
    <h2 class="text-xl font-bold text-center">${plant.name}</h2>
    <p class="text-gray-600 mt-3 text-sm text-center">${plant.description}</p>
    <p class="text-2xl font-bold mt-4 text-center text-green-700">Price:  &#2547; ${plant.price}</p>
  `;
  my_modal_4.showModal();
};

// !show toast 
const showToast = (message, type = "success") => {
  Toastify({
    text: message,
    duration: 2500,
    gravity: "top", // top or bottom
    position: "right",
    close: true,

    style: {
      background:
        type === "success"
          ? "linear-gradient(to right, #00b09b, #96c93d)"
          : "linear-gradient(to right, #ff5f6d, #ffc371)",
    },
  }).showToast();
};