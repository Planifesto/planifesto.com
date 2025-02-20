document.addEventListener("DOMContentLoaded", () => {
  const toggleDetailsButtons = document.querySelectorAll(".toggle-details");
  const productos = document.querySelectorAll(".producto");

  toggleDetailsButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const currentProducto = button.closest(".producto");
      const currentDetails = currentProducto.querySelector(".product-details");

      if (currentDetails.classList.contains("hidden")) {
        // Ocultar todos los productos excepto el seleccionado
        productos.forEach((producto) => {
          if (producto !== currentProducto) {
            producto.style.opacity = "0";
            producto.style.visibility = "hidden";
            producto.style.position = "absolute";
          }
        });

        // Mostrar detalles del producto seleccionado
        currentDetails.style.height = `${currentDetails.scrollHeight}px`;
        currentDetails.classList.remove("hidden");
        button.textContent = "Ocultar detalles"; // Cambiar texto del botón
        setTimeout(() => {
          currentDetails.style.height = "auto";
        }, 500);
      } else {
        // Cerrar detalles del producto seleccionado y restaurar todos los productos
        currentDetails.style.height = `${currentDetails.scrollHeight}px`;
        setTimeout(() => {
          currentDetails.style.height = "0";
          currentDetails.classList.add("hidden");
          productos.forEach((producto) => {
            producto.style.opacity = "1";
            producto.style.visibility = "visible";
            producto.style.position = "relative";
          });
          button.textContent = "Ver más detalles"; // Restaurar texto del botón
        }, 0);
      }
    });
  });
});
