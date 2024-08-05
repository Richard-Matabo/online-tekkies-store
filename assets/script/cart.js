let products = {
  // PRODUCTS LIST
  list: {
    1: { name: "VANS", img: "shoe-001.a.jpg", price: 499.51 },
    2: { name: "CONVERSE", img: "shoe-002.a.jpg", price: 599.99 },
    3: { name: "ADDIDAS", img: "shoe-003.a.jpg", price: 699.99 },
    4: { name: "NIKE", img: "shoe-004.a.jpg", price: 765.99 },
  },

  // DRAW HTML PRODUCTS LIST
  draw: function () {
    let wrapper = document.getElementById("poslist");
    for (let pid in products.list) {
      let p = products.list[pid],
        pdt = document.createElement("div"),
        segment;

      pdt.className = "pwrap";
      pdt.dataset.pid = pid;
      pdt.onclick = cart.add;
      wrapper.appendChild(pdt);

      // IMAGE
      segment = document.createElement("img");
      segment.className = "pimg";
      segment.src = "/assets/images/" + p.img;
      pdt.appendChild(segment);

      // NAME
      segment = document.createElement("div");
      segment.className = "pname";
      segment.innerHTML = p.name;
      pdt.appendChild(segment);

      // PRICE
      segment = document.createElement("div");
      segment.className = "pprice";
      segment.innerHTML = "R" + p.price.toFixed(2);
      pdt.appendChild(segment);

      // Quick Add to Cart Button
      segment = document.createElement("button");
      segment.innerHTML = "Quick Add to Cart";
      segment.dataset.pid = pid;
      segment.onclick = cart.quickAdd;
      pdt.appendChild(segment);
    }
  }
};
window.addEventListener("DOMContentLoaded", products.draw);

let cart = {
  // PROPERTIES
  items: {}, // CURRENT ITEMS IN CART
  discount: 0,
  delivery: 0,
  refNumber: "", // Reference number

  // SAVE CURRENT CART INTO LOCALSTORAGE
  save: function () {
    localStorage.setItem("cart", JSON.stringify(cart.items));
  },

  // LOAD CART FROM LOCALSTORAGE
  load: function () {
    cart.items = localStorage.getItem("cart");
    if (cart.items == null) { cart.items = {}; }
    else { cart.items = JSON.parse(cart.items); }
  },

  nuke: function () {
    cart.items = {};
    localStorage.removeItem("cart");
    cart.list();
  },

  // INITIALIZE - RESTORE PREVIOUS SESSION
  init: function () {
    cart.load();
    cart.list();
  },

  // LIST CURRENT CART ITEMS (IN HTML)
  list: function () {
    let wrapper = document.getElementById("poscart"),
      item, part, pdt,
      total = 0, subtotal = 0,
      empty = true;
    wrapper.innerHTML = "";
    for (let key in cart.items) {
      if (cart.items.hasOwnProperty(key)) { empty = false; break; }
    }

    // CART IS EMPTY
    if (empty) {
      item = document.createElement("div");
      item.innerHTML = "Your Added Item here!"; // ADD TO CART
      wrapper.appendChild(item);
    }

    // CART IS NOT EMPTY - LIST ITEMS
    else {
      for (let pid in cart.items) {
        // CURRENT ITEM
        pdt = products.list[pid];
        item = document.createElement("div");
        item.className = "citem";
        wrapper.appendChild(item);

        // ITEM NAME
        part = document.createElement("span");
        part.innerHTML = pdt.name;
        part.className = "cname";
        item.appendChild(part);

        // REMOVE
        part = document.createElement("input");
        part.type = "button";
        part.value = "Delete";
        part.dataset.pid = pid;
        part.className = "cdel";
        part.addEventListener("click", cart.remove);
        item.appendChild(part);

        // QUANTITY
        part = document.createElement("input");
        part.type = "number";
        part.min = 0;
        part.value = cart.items[pid];
        part.dataset.id = pid;
        part.className = "cqty";
        part.addEventListener("change", cart.change);
        item.appendChild(part);

        // SUBTOTAL
        subtotal = cart.items[pid] * pdt.price;
        total += subtotal;

        // ITEM PRICE
        part = document.createElement("span");
        part.innerHTML = `R${pdt.price.toFixed(2)} each`;
        part.className = "cprice";
        item.appendChild(part);
      }

      // TOTAL AMOUNT WITH VAT
      total *= 1.15; // Adding 15% VAT
      item = document.createElement("div");
      item.className = "ctotal";
      item.id = "ctotal";
      item.innerHTML = "TOTAL (incl. VAT): R" + total.toFixed(2);
      wrapper.appendChild(item);

      // EMPTY BUTTON
      item = document.createElement("input");
      item.type = "button";
      item.value = "Clear";
      item.addEventListener("click", cart.nuke);
      item.id = "cempty";
      wrapper.appendChild(item);

      // CHECKOUT BUTTON
      item = document.createElement("input");
      item.type = "button";
      item.value = "Print";
      item.addEventListener("click", cart.checkout);
      item.id = "ccheckout";
      wrapper.appendChild(item);
    }
  },

  // ADD ITEM TO CART
  add: function () {
    let pid = this.dataset.pid;
    if (cart.items[pid] == undefined) { cart.items[pid] = 1; }
    else { cart.items[pid]++; }
    cart.save();
    cart.list();
    alert(`Item added to cart. Prize included VAT. Current total: R ${cart.getTotal().toFixed(2)}`);
  },

  // QUICK ADD ITEM TO CART
  quickAdd: function (e) {
    e.stopPropagation();
    let pid = this.dataset.pid;
    if (cart.items[pid] == undefined) { cart.items[pid] = 1; }
    else { cart.items[pid]++; }
    cart.save();
    cart.list();
    alert(`Item added to cart. Prize included VAT. Current total: R ${cart.getTotal().toFixed(2)}`);
  },

  // CHANGE QUANTITY
  change: function () {
    let pid = this.dataset.id;
    if (this.value <= 0) {
      delete cart.items[pid];
      cart.save();
      cart.list();
    } else {
      cart.items[pid] = this.value;
      let total = cart.getTotal();
      document.getElementById("ctotal").innerHTML = "TOTAL (incl. VAT): R " + total.toFixed(2);
      cart.save();
    }
  },

  // REMOVE ITEM FROM CART
  remove: function () {
    if (confirm("Are you sure you want to delete?")) {
      delete cart.items[this.dataset.pid];
      cart.save();
      cart.list();
    }
  },

  // CHECKOUT
  checkout: function () {
    if (confirm("Completed! Would you like to print a receipt?")) {
      cart.refNumber = cart.generateRefNumber(); // Generate reference number
      orders.print();
      orders.add();
    }
  },

  // GET TOTAL
  getTotal: function () {
    let total = 0;
    for (let id in cart.items) {
      total += cart.items[id] * products.list[id].price;
    }
    return total * 1.15; // Adding 15% VAT
  },

  // APPLY COUPON
  applyCoupon: function () {
    let coupon = document.getElementById("coupon").value;
    if (coupon === "DISCOUNT10") {
      cart.discount = 0.10;
    } else if (coupon === "DISCOUNT20") {
      cart.discount = 0.20;
    } else {
      cart.discount = 0;
      alert("Invalid coupon");
    }
    cart.list();
  },

  // UPDATE DELIVERY
  updateDelivery: function () {
    let delivery = document.getElementById("delivery").value;
    if (delivery === "standard") {
      cart.delivery = 50.00;
    } else if (delivery === "express") {
      cart.delivery = 100.00;
    } else {
      cart.delivery = 0;
    }
    cart.list();
  },

  // CONFIRM ORDER
  confirmOrder: function () {
    let total = cart.getTotal() * (1 - cart.discount) + cart.delivery;
    alert(`Order confirmed. Total: R ${total.toFixed(2)}. Reference number: ${cart.generateRefNumber()}`);
    cart.nuke();
  },

  // GENERATE REFERENCE NUMBER
  generateRefNumber: function () {
    return 'ORD' + Math.floor(Math.random() * 1000000);
  }
};
window.addEventListener("DOMContentLoaded", cart.init);

let orders = {
  // PROPERTY
  idb: window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB,
  posdb: null,
  db: null,

  init: function () {
    if (!orders.idb) {
      alert("INDEXED DB IS NOT SUPPORTED ON THIS BROWSER!");
      return false;
    }

    orders.posdb = orders.idb.open("JSPOS", 1);
    orders.posdb.onsuccess = function () {
      orders.db = orders.posdb.result;
    };

    orders.posdb.onupgradeneeded = function () {
      let db = orders.posdb.result,
        store = db.createObjectStore("Orders", { keyPath: "oid", autoIncrement: true }),
        index = store.createIndex("time", "time");

      // ORDER ITEMS STORE (TABLE)
      store = db.createObjectStore("Items", { keyPath: ["oid", "pid"] }),
        index = store.createIndex("qty", "qty");
    };

    orders.posdb.onerror = function (err) {
      alert("ERROR CREATING DATABASE!");
      console.log(err);
    };
  },

  // ADD NEW ORDER
  add: function () {
    // INSERT ORDERS STORE (TABLE)
    let tx = orders.db.transaction("Orders", "readwrite"),
      store = tx.objectStore("Orders"),
      req = store.put({ time: Date.now() });

    let size = 0, entry;
    for (entry in cart.items) {
      if (cart.items.hasOwnProperty(entry)) { size++; }
    }

    // INSERT ITEMS STORE (TABLE)
    entry = 0;
    req.onsuccess = function (e) {
      tx = orders.db.transaction("Items", "readwrite"),
        store = tx.objectStore("Items"),
        oid = req.result;
      for (let pid in cart.items) {
        req = store.put({ oid: oid, pid: pid, qty: cart.items[pid] });

        // EMPTY CART ONLY AFTER ALL ENTRIES SAVED
        req.onsuccess = function () {
          entry++;
          if (entry == size) { cart.nuke(); }
        };
      }
    };
  },

  // PRINT RECEIPT FOR CURRENT ORDER
  print: function () {
    // GENERATE RECEIPT
    let wrapper = document.getElementById("posreceipt");
    wrapper.innerHTML = "";
    let total = 0;
    for (let pid in cart.items) {
      let item = document.createElement("div");
      item.innerHTML = `${cart.items[pid]} x ${products.list[pid].name} @ R ${products.list[pid].price.toFixed(2)} each`;
      wrapper.appendChild(item);
      total += cart.items[pid] * products.list[pid].price;
    }
    total *= 1.15; // Adding 15% VAT

    // ADD DELIVERY CHARD 
    let deliveryCharge = document.createElement("div");
    deliveryCharge.innerHTML = `Delivery Charge: R ${cart.delivery.toFixed(2)}`;
    wrapper.appendChild(deliveryCharge);

    // UPDATE TOTAL TO INCLUDE DELIVERY CHARGE
    total += cart.delivery;

    // DISPLAY FINAL TOTAL 
    let totalDiv = document.createElement("div");
    totalDiv.innerHTML = `Total (incl. VAT and Delivery): R ${total.toFixed(2)}`;
    wrapper.appendChild(totalDiv);

    // DISPLAY REFERENCE NUMBER 
    let refDiv = document.createElement("div");
    refDiv.innerHTML = `Reference Number: ${cart.refNumber}`;
    wrapper.appendChild(refDiv);

    // PRINT
    let printwin = window.open();
    printwin.document.write(wrapper.innerHTML);
    printwin.document.close(); 
    printwin.focus();
    printwin.print();
    printwin.close();
  }
};
window.addEventListener("DOMContentLoaded", orders.init);

// WORKING ON JQUERY! 
$(document).ready(function() {
  $("#hide").click(function(){
      $(".blog").toggle();
      $(".article_1").toggle();
      $(".under-line").toggle();
      $(".about-us").toggle();
      $(".slider").toggle();
  });

 // JQUERY FUNCTION WITH A CHAINED EFFECT TO SLIDE ELLEMENTS REPEATELY 
 function repeatAnimation() {
  $('body').animate({ backgroundColor: 'grey' }, 1000)
           .animate({ backgroundColor: 'wheat' }, 1000, repeatAnimation);
  $('.container-about').slideUp(1000).slideDown(1000);
}
$('#wipeOut').click(function() {
  repeatAnimation();
});

// JQUERY FUNCTION TO STOP THE ANIMATION IN PROGESS 
    $('.stop').click(function() {
      $('body').stop(true, true).show();
      $('.container-about').stop(true, false).show();
  });


// WHEN THE BUTTON IS CLICKED
$(".rotate").click(function(){
  // Select the h1 element and apply the CSS transform
  $(".about-tittle").css({
      "transition": "transform 1s", 
      "transform": "rotate(360deg)" 
  });

  // OPTIONALY, RESET THE THE ROTATION AFETR ANIMATION COMPLETES
  setTimeout(function(){
      $(".about-tittle").css({
          "transition": "none", 
          "transform": "none" 
      });
  }, 1000); // Reset after 1 second (same duration as the animation)
});
 

// WHEN HOVERING OVER THE MAIN MENU ITEMS
    $('#menu > li').hover(
      function() {
          // Show the drop-down menu
          $(this).children('.dropdown').slideDown(200);
      },
      function() {
          // Hide the drop-down menu
          $(this).children('.dropdown').slideUp(200);
      }
  );
});
