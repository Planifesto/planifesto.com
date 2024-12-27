document.addEventListener("DOMContentLoaded", () => {
    const toggleDetailsButtons = document.querySelectorAll(".toggle-details");
  
    toggleDetailsButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const productDetails = button.closest(".producto").querySelector(".product-details");
        
        if (productDetails.classList.contains("hidden")) {
          productDetails.style.height = `${productDetails.scrollHeight}px`;
          productDetails.classList.remove("hidden");
          setTimeout(() => {
            productDetails.style.height = "auto";
          }, 500);
        } else {
          productDetails.style.height = `${productDetails.scrollHeight}px`;
          setTimeout(() => {
            productDetails.style.height = "0";
            productDetails.classList.add("hidden");
          }, 0);
        }
      });
    });
  });
  
  
  
  