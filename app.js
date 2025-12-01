// Seleccionar todos los círculos
const circles = document.querySelectorAll('.circle');

// Velocidad del cambio (en milisegundos)
const interval = 500;

let index = 0;

function christmasLights() {
    // Apagar todos los círculos
    circles.forEach(circle => {
        circle.style.opacity = "0.2";
    });

    // Encender solo el círculo actual
    circles[index].style.opacity = "1";

    // Pasar al siguiente
    index++;

    // Si llega al final, vuelve al inicio
    if (index >= circles.length) {
        index = 0;
    }
}

// Ejecutar la animación cada intervalo
setInterval(christmasLights, interval);
