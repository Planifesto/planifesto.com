document.addEventListener("DOMContentLoaded", () => {
  // 1. Controlar "Ver más detalles" con animación
  const toggleDetailsButtons = document.querySelectorAll(".toggle-details");
  const productos = document.querySelectorAll(".producto");

  toggleDetailsButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const currentProducto = button.closest(".producto");
      const currentDetails = currentProducto.querySelector(".product-details");

      if (currentDetails.classList.contains("hidden")) {
        // Abrir detalles y ocultar otros productos
        productos.forEach((producto) => {
          if (producto !== currentProducto) {
            producto.classList.add("hidden-others");
          }
        });
        currentDetails.style.height = `${currentDetails.scrollHeight}px`;
        currentDetails.classList.remove("hidden");
        button.textContent = "Ocultar detalles";
        setTimeout(() => {
          currentDetails.style.height = "auto";
        }, 500);
      } else {
        // Cerrar detalles
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

  // 2. Scroll suave por hash (opcional)
  if (window.location.hash) {
    const productId = window.location.hash.substring(1);
    const targetProduct = document.getElementById(productId);
    if (targetProduct) {
      targetProduct.scrollIntoView({ behavior: "smooth" });
    }
  }

  // 3. Versión Neutral para cada producto
  const allProducts = document.querySelectorAll(".producto");

  allProducts.forEach((product) => {
    const neutralButton = product.querySelector(".toggle-neutral");
    if (!neutralButton) return; // Si no tiene botón neutral, salimos

    const img = product.querySelector("img");
    const details = product.querySelector(".product-details");
    const productTitle = product.querySelector(".detalle-producto h2");

    // Guardamos la info original
    const originalTitle = productTitle.textContent;
    const originalImgSrc = img.src;
    const originalImgAlt = img.alt;
    const originalDetailsHTML = details.innerHTML;

    // Guardamos el form y su acción original (si existe)
    const originalForm = details.querySelector("form");
    const originalFormAction = originalForm ? originalForm.action : null;

    // Obtenemos las rutas neutral del data attribute
    // (o usamos la original si no está definido)
    const neutralImgSrc = product.dataset.neutralImg || originalImgSrc;
    const neutralPayPalLink =
      product.dataset.neutralPaypal || originalFormAction;

    // Booleano para controlar si estamos en versión neutral
    let isNeutral = false;

    neutralButton.addEventListener("click", function () {
      if (!isNeutral) {
        // ===============================
        // (A) CAMBIAR A VERSIÓN NEUTRAL
        // ===============================
        isNeutral = true;

        // 1. Imagen
        img.src = neutralImgSrc;
        img.alt = `${originalImgAlt} (Neutral)`;

        // 2. Crear nuevo contenido de detalles:
        //    - Texto breve para la versión neutral
        //    - Solo párrafos con "IMPORTANTE"
        //    - Formulario de PayPal original
        const parser = new DOMParser();
        const doc = parser.parseFromString(originalDetailsHTML, "text/html");

        // (a) Extraemos los párrafos que contengan "IMPORTANTE"
        const paragraphs = doc.querySelectorAll("p");
        let importantPartsHTML = "";
        paragraphs.forEach((p) => {
          if (p.textContent.toUpperCase().includes("IMPORTANTE")) {
            importantPartsHTML += p.outerHTML;
          }
        });

        // (b) Extraemos el form (botón PayPal)
        const formElement = doc.querySelector("form");
        let formHTML = "";
        if (formElement) {
          formHTML = formElement.outerHTML;
        }

        // (c) Breve explicación de la versión neutral
        let neutralExplanation = `
  <p style="text-align: justify;">
    <b>Esta versión ofrece el mismo contenido y funcionalidad 
    que la plantilla original, pero con un diseño neutro y minimalista.</b>
  </p>
`;

        // (d) Armamos el HTML final
        let finalNeutralHTML =
          neutralExplanation + importantPartsHTML + formHTML;

        // (e) Asignamos el nuevo contenido
        details.innerHTML = finalNeutralHTML;

        // 3. Actualizamos el link de PayPal (si procede)
        const newForm = details.querySelector("form");
        if (newForm) {
          newForm.action = neutralPayPalLink;
        }

        // 4. Añadimos "(Neutral)" al título
        productTitle.textContent = `${originalTitle} (Neutral)`;

        // 5. Cambiamos el texto del botón
        neutralButton.textContent = "Versión Regular";
      } else {
        // ===============================
        // (B) REVERTIR A VERSIÓN ORIGINAL
        // ===============================
        isNeutral = false;

        img.src = originalImgSrc;
        img.alt = originalImgAlt;
        productTitle.textContent = originalTitle;
        details.innerHTML = originalDetailsHTML;

        // Restauramos la acción original del form
        const revertForm = details.querySelector("form");
        if (revertForm && originalFormAction) {
          revertForm.action = originalFormAction;
        }

        neutralButton.textContent = "Versión Neutral";
      }
    });
  });
});
