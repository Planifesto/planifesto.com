document.addEventListener("DOMContentLoaded", () => {
  const toggleDetailsButtons = document.querySelectorAll(".toggle-details");
  const productos = document.querySelectorAll(".producto");

  toggleDetailsButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const currentProducto = button.closest(".producto");
      const currentDetails = currentProducto.querySelector(".product-details");

      if (currentDetails.classList.contains("hidden")) {
        // Al abrir, ocultamos los demás productos con una clase CSS que mantiene su espacio
        productos.forEach((producto) => {
          if (producto !== currentProducto) {
            producto.classList.add("hidden-others");
          }
        });

        // Mostramos los detalles con una animación de altura
        currentDetails.style.height = `${currentDetails.scrollHeight}px`;
        currentDetails.classList.remove("hidden");
        button.textContent = "Ocultar detalles";
        setTimeout(() => {
          currentDetails.style.height = "auto";
        }, 500);
      } else {
        // Al cerrar, colapsamos los detalles y restauramos la visibilidad
        currentDetails.style.height = `${currentDetails.scrollHeight}px`;
        setTimeout(() => {
          currentDetails.style.height = "0";
          setTimeout(() => {
            currentDetails.classList.add("hidden");
            productos.forEach((producto) => {
              producto.classList.remove("hidden-others");
            });
            button.textContent = "Ver más detalles";
          }, 500);
        }, 0);
      }
    });
  });
});

// Usamos window.onload para asegurarnos de que todo esté cargado (imágenes, estilos, etc.)
window.addEventListener("load", () => {
  if (window.location.hash) {
    const productId = window.location.hash.substring(1);
    const targetProduct = document.getElementById(productId);
    if (targetProduct) {
      // Desplazar la vista suavemente al producto indicado sin abrir sus detalles
      targetProduct.scrollIntoView({ behavior: "smooth" });
    }
  }
});
