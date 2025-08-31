const tipoSelect = document.getElementById('tipo');
const ingredientesDiv = document.getElementById('ingredientes');
const checkboxesContainer = document.getElementById('ingredientes-checkboxes');
const resultadoDiv = document.getElementById('resultado');
const infoTipoDiv = document.getElementById('infoTipo');
const pizzaContainer = document.getElementById('emojiPizza');
const sliceGroups = document.querySelectorAll('.slice');
const totalContainer = document.getElementById('total-container');
const precioTotalSpan = document.getElementById('precio-total');
const toppingsContainer = document.getElementById('toppings-container');
const addSound = document.getElementById('add-sound');
const removeSound = document.getElementById('remove-sound');

// Modal Elements
const modal = document.getElementById('success-modal');
const modalMessage = document.getElementById('modal-message');
const closeModalBtn = document.getElementById('close-modal');

const ingredientes = {
  vegetariana: { base: ["Mozarela", "Tomate"], precioBase: 8, extras: { "pimiento": { nombre: "Pimiento", precio: 1 }, "tofu": { nombre: "Tofu", precio: 1.5 } } },
  noVegetariana: { base: ["Mozarela", "Tomate"], precioBase: 10, extras: { "peperoni": { nombre: "Peperoni", precio: 1.5 }, "jamon": { nombre: "Jamón", precio: 1.5 }, "salmon": { nombre: "Salmón", precio: 2.5 } } }
};

const toppingAssets = {
  peperoni: { positions: [{cx: 50, cy: 45}, {cx: 75, cy: 35}, {cx: 65, cy: 80}, {cx: 88, cy: 55}, {cx: 38, cy: 65}], svg: (pos) => `<circle cx="${pos.cx}" cy="${pos.cy}" r="5" fill="#d44b4b" stroke="#c04040" stroke-width="1" style="pointer-events: none;"/>` },
  jamon: { positions: [{x:45, y:55}, {x:70, y:65}, {x:40, y:75}, {x:75, y:45}, {x: 55, y: 70}], svg: (pos) => `<rect x="${pos.x}" y="${pos.y}" width="10" height="10" fill="#f4aabc" transform="rotate(15, ${pos.x+5}, ${pos.y+5})" style="pointer-events: none;"/>` },
  salmon: { positions: [{x:55, y:35}, {x:75, y:75}, {x:35, y:45}, {x:85, y:50}], svg: (pos) => `<path d="M${pos.x},${pos.y} Q${pos.x+10},${pos.y+5} ${pos.x+5},${pos.y+15} Z" fill="#f9a080" style="pointer-events: none;"/>` },
  pimiento: { positions: [{x:60, y:28}, {x:40, y:50}, {x:80, y:50}, {x:50, y:80}, {x:70, y:60}], svg: (pos) => `<path d="M${pos.x},${pos.y} C${pos.x-10},${pos.y+10} ${pos.x+10},${pos.y+10} ${pos.x},${pos.y} Z" fill="none" stroke="#2a9d8f" stroke-width="3" stroke-linecap="round" style="pointer-events: none;"/>` },
  tofu: { positions: [{x:35, y:35}, {x:80, y:70}, {x:55, y:60}, {x:45, y:75}, {x:70, y:45}], svg: (pos) => `<rect x="${pos.x}" y="${pos.y}" width="8" height="8" fill="#f4f1de" stroke="#e0e0e0" stroke-width="1" style="pointer-events: none;"/>` }
};

function formatCurrency(value) { return value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }); }

function updatePizzaVisual(extrasSeleccionados) {
    toppingsContainer.innerHTML = '';
    extrasSeleccionados.forEach(ing => {
        const asset = toppingAssets[ing.key];
        if (asset) { asset.positions.forEach(pos => { toppingsContainer.innerHTML += asset.svg(pos); }); }
    });
}

function calcularYMostrarPrecio() {
  const tipo = tipoSelect.value;
  if (!tipo) return;
  let total = ingredientes[tipo].precioBase;
  const extrasSeleccionados = [];
  const checkboxes = checkboxesContainer.querySelectorAll('input[type="checkbox"]:checked');
  checkboxes.forEach(cb => {
    const ingKey = cb.value;
    const ingData = ingredientes[tipo].extras[ingKey];
    if (ingData) { total += ingData.precio; extrasSeleccionados.push({key: ingKey, ...ingData}); }
  });
  precioTotalSpan.textContent = formatCurrency(total);
  updatePizzaVisual(extrasSeleccionados);
  return { total, extrasSeleccionados };
}

tipoSelect.addEventListener('change', () => {
  const tipo = tipoSelect.value;
  checkboxesContainer.innerHTML = '';
  infoTipoDiv.innerHTML = '';
  resultadoDiv.innerHTML = '';
  totalContainer.style.display = 'none';
  updatePizzaVisual([]);
  if (ingredientes[tipo]) {
    const baseIng = ingredientes[tipo].base.join(" y ");
    infoTipoDiv.innerHTML = `Las pizzas <strong>${tipo}</strong> llevan ${baseIng} y tienen un precio base de <strong>${formatCurrency(ingredientes[tipo].precioBase)}</strong>.`;
    for (let key in ingredientes[tipo].extras) {
      const ing = ingredientes[tipo].extras[key];
      const checkboxDiv = document.createElement('div');
      checkboxDiv.className = 'checkbox-container'; // Use class for styling
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox'; checkbox.value = key; checkbox.id = `ing-${key}`;
      const label = document.createElement('label');
      label.htmlFor = `ing-${key}`; label.textContent = ` ${ing.nombre} (+${formatCurrency(ing.precio)})`;
      checkboxDiv.appendChild(checkbox); checkboxDiv.appendChild(label);
      checkboxesContainer.appendChild(checkboxDiv);
    }
    ingredientesDiv.style.display = 'block';
    totalContainer.style.display = 'block';
    calcularYMostrarPrecio();
  } else {
    ingredientesDiv.style.display = 'none';
  }
});

checkboxesContainer.addEventListener('change', (event) => {
    if (event.target.type === 'checkbox') {
        try {
            if (event.target.checked) { addSound.currentTime = 0; addSound.play(); }
            else { removeSound.currentTime = 0; removeSound.play(); }
        } catch (error) { console.log("No se pudieron reproducir los sonidos. Asegúrate de que los archivos existen en la carpeta 'sounds'."); }
    }
    calcularYMostrarPrecio();
});

document.getElementById('pizzaForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const tipo = tipoSelect.value;
  if (!tipo) {
    resultadoDiv.style.display = 'block'; // Show the result div for errors
    resultadoDiv.innerHTML = 'Por favor, selecciona primero un tipo de pizza.';
    setTimeout(() => { if(resultadoDiv) resultadoDiv.style.display = 'none'; }, 3000); // Hide after 3s
    return;
  }
  const { total, extrasSeleccionados } = calcularYMostrarPrecio();
  let extrasList = extrasSeleccionados.length > 0 
    ? extrasSeleccionados.map(ing => `<li>${ing.nombre}</li>`).join('')
    : '<li>Sin ingredientes adicionales</li>';
  
  if (modal && modalMessage) {
    modalMessage.innerHTML = `
      <h3>Pedido finalizado 🍕</h3>
      <p>Has elegido una pizza <em>${tipo}</em> con:</p>
      <ul>
        <li>${ingredientes[tipo].base[0]}</li>
        <li>${ingredientes[tipo].base[1]}</li>
        ${extrasList}
      </ul>
      <p><strong>Precio final: ${formatCurrency(total)}</strong></p>
      <p>¡Gracias por tu pedido! 😋</p>
    `;
    modal.style.display = 'flex';
  }

  pizzaContainer.classList.add('pizza-girando');
  setTimeout(() => pizzaContainer.classList.remove('pizza-girando'), 1000);
  sliceGroups.forEach(g => { g.classList.add('slice-rebote'); setTimeout(() => g.classList.remove('slice-rebote'), 1000); });
});

function closeModal() {
    if (modal) modal.style.display = 'none';
}

if(closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

// Force form reset on page load to override browser cache
document.addEventListener('DOMContentLoaded', function() {
  if(tipoSelect) {
    tipoSelect.selectedIndex = 0;
  }
  // Manually trigger change to ensure UI is in default state
  if(tipoSelect) {
    const event = new Event('change');
    tipoSelect.dispatchEvent(event);
  }
});