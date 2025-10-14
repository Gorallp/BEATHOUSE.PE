// carrito.js
document.addEventListener("DOMContentLoaded", () => {
  const botones = document.querySelectorAll(".btn-carrito");

  botones.forEach(boton => {
    boton.addEventListener("click", () => {
      const nombre = boton.getAttribute("data-nombre");
      const precio = boton.getAttribute("data-precio");

      // Guardamos en localStorage para que otra página (carrito.html) lo lea
      let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
      carrito.push({ nombre, precio });
      localStorage.setItem("carrito", JSON.stringify(carrito));

      alert(`${nombre} se añadió al carrito 🛒`);
    });
  });
});
