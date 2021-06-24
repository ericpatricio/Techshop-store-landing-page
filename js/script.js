
// Navbar
// Variables
const hamburger = document.querySelector('.hamburger');
const sideNavbar = document.querySelector('.side-navbar');
const header = document.querySelector('.header');
const btnClose = document.querySelector('.btn-close');

// Event listener hamburger icon on click, open navbar
hamburger.addEventListener('click', navToggle);

// Event listener close button icon on side navbar
btnClose.addEventListener('click', () => {
  sideNavbar.classList.remove('open');
});

// Function 
function navToggle() {
  sideNavbar.classList.toggle('open');
  hamburger.classList.toggle('open'); 
   
  // console.log('clicked');  
};

// close side navbar on click
document.addEventListener('click', (e) => {
  if(e.target.closest('.navbar-link')) {
    sideNavbar.classList.remove('open');
    hamburger.classList.remove('open'); 
  }
})


// On scroll add shadow at navbar
window.addEventListener('scroll', () => {
  const scrollHeight = window.pageYOffset;

  if(scrollHeight > 100) {
    header.classList.add('onScroll');
  } else {
    header.classList.remove('onScroll');
  }
})


// *********************************************
// Hero section
//  Variables
const carouselSlides = document.querySelectorAll('.carousel-slide');
const prevButton = document.querySelector('#prev');
const nextButton = document.querySelector('#next');

const intervalTime = 5000;
let slideInterval;
let autoSlider = true;

const nextSlide = () => {
  // Get current class
  const current = document.querySelector('.current');
  // Remove class
  current.classList.remove('current');
  // Check for next slide
  if(current.nextElementSibling) {
    // Add current to next sibling
    current.nextElementSibling.classList.add('current');    
  } else {
    // Add current to start
    carouselSlides[0].classList.add('current');
  }
  setTimeout(() => {
    current.classList.remove('current');
  })
};

const prevSlide = () => {
  // Get current class
  const current = document.querySelector('current')
  // Remove class
  current.classList.remove('current');
  // Check for prev slide
  if(current.previousElementSibling) {
    // Add current to previuos sibling
    current.previousElementSibling.classList.add('current');
  } else {
    // Add current to end
    carouselSlides[carouselSlides.length - 1].classList.add('current');
  }
  setTimeout(() => {
    current.classList.remove('current');
  })
};


// Buttons event listeners
nextButton.addEventListener('click', () => {
  nextSlide();  
  if(autoSlider) {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, intervalTime);
  }
});

prevButton.addEventListener('click', () => {
  prevSlide();
  if(autoSlider) {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, intervalTime);
  }
});

// Auto slider
if(autoSlider) {
  // Run next slide
  slideInterval = setInterval(nextSlide, intervalTime);
}


// ***********************************************************
// Products

// Variables
const cartBtn = document.querySelector('.cart-btn');
const clearcartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart-container')
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-container');
const overlay = document.querySelector('.overlay');
const closeCartBtn = document.querySelector('.close-cart')


// Main cart
let cart = [];
// Buttons
let buttonsDOM = [];

// Getting products
class Products {
  async getProducts() {

    try {
      let response = await fetch('./data/products.json');
      let data = await response.json();
      let products = data.items;

      products = products.map(item => {
        const {title, price} = item.fields;
        const {id} = item.sys;
        const image = item.fields.image.fields.file.url;
        return {title,price,id,image};
      })

      return products;
      
    } catch (error) {
      console.log(error);
    }
        
  }
  
};

// Display product
class UI {
  displayProducts(products) {
    let result = '';
    products.forEach(product => {
      result += 
      `
      <article class="product">
        
        <div class="img-container">
            <img src=${product.image} alt="product image">
        </div>

        <div class="product-content">

            <h3>${product.title}</h3>
            <h4>From <span class="price-tag">${product.price}</span></h4>
            
            <div class="product-buttons">
                <a href="#" class="light-btn">learn more</a>
                <a href="#" class="bag-btn" data-id=${product.id}>add to cart</a>
            </div>
            
        </div>
            
      </article>
      
      `
    });

    productsDOM.innerHTML = result;
  };

  // Get all cart bag buttons
  getBagButtons() {
    let buttons = [...document.querySelectorAll('.bag-btn')];
    buttonsDOM = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id === id);
      if(inCart) {
        button.innerText = 'IN CART'
        button.disabled = true;
      } 

      // Add event listener to buttons
      button.addEventListener('click', (e) => {
        // e.preventDefault()
        e.target.innerText = 'IN CART';
        e.target.disabled = true;
        // Get product from products section
        let cartItem = {...Storage.getProduct(id), amount:1};
        // console.log(cartItem);       
        // Add product to cart
        cart = [...cart, cartItem];
        // console.log(cart);
        // Save cart in local storage
        Storage.saveCart(cart);
        // Set cart values
        this.setCartValues(cart);
        // Add item to cart
        this.addCartItem(cartItem);
        // Show cart
        this.showCart();
      })
      
    });
  };

  setCartValues(cart) {
    let temporaryTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      temporaryTotal += item.price * item.amount;
      itemsTotal += item.amount;
    })
    cartTotal.innerText = parseFloat(temporaryTotal.toFixed(2));
    cartItems.innerText = itemsTotal;    
  };
  
  addCartItem(item) {
    // Create a div
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = 
    `
      <img src=${item.image} alt="">
      <div>
        <h4>${item.title}</h4>
        <h5>$${item.price}</h5>
        <span class="remove-item" data-id=${item.id}>Remove</span>
      </div>
      <div>
        <i class="fas fa-chevron-up" data-id=${item.id}></i>
        <p class="item-amount">${item.amount}</p>
        <i class="fas fa-chevron-down" data-id=${item.id}></i>
      </div>
    `
    cartContent.appendChild(div); 

  };
  showCart() {
    overlay.classList.add('hide-body');
    cartDOM.classList.add('showCart');
  };
  setupAPP() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener('click', this.showCart);
    closeCartBtn.addEventListener('click', this.hideCart);
  };
  populateCart(cart) {
    cart.forEach(item => this.addCartItem(item));

  };
  hideCart() {
    overlay.classList.remove('hide-body');
    cartDOM.classList.remove('showCart');
  };

  cartLogic() {
    // Clear cart button
    clearcartBtn.addEventListener('click', () => {
      this.clearCart();
    });
    // Cart functionality
    cartContent.addEventListener('click', event => {
      if(event.target.classList.contains('remove-item')) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement)
        this.removeItem(id);
      } else if(event.target.classList.contains('fa-chevron-up')) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let temporaryItem = cart.find(item => item.id === id);
        temporaryItem.amount = temporaryItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = temporaryItem.amount;
      } else if(event.target.classList.contains('fa-chevron-down')) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let temporaryItem = cart.find(item => item.id === id);
        temporaryItem.amount = temporaryItem.amount - 1;
        if(temporaryItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = temporaryItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }    
    });
  }

  clearCart() {
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id));
    while(cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0])
    }
    this.hideCart();
  } 

  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = 'add to cart';
  }

  getSingleButton(id) {
    return buttonsDOM.find(button => button.dataset.id === id);
  }
};

// Save product local
class Storage {
  static saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
  }

  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem('products'));
    return products.find(product => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
  }
};


// EVENT LISTENERS
document.addEventListener('DOMContentLoaded', () => {
  // Instiate
  const products = new Products();
  const ui = new UI();
  // Setup app
  ui.setupAPP();
  // Get all products method
  products.getProducts().then(products => {    
    ui.displayProducts(products)
    Storage.saveProducts(products)
  }).then(() => {
    ui.getBagButtons();
    ui.cartLogic();
  });  
});