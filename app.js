const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');
const cellSize = 25;

// Function to draw the initial grid.
function drawGrid(rows, columns) {
  ctx.strokeStyle = 'rgba(173, 216, 230, 1)';
  ctx.lineWidth = 0.2;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      ctx.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize);
    }
  }

  ctx.strokeStyle = 'black';
  ctx.lineWidth = 1;
}

// Create an instance of the WeightedAlgorithm class and draw the initial grid.
const weightedAlgorithm = new WeightedAlgorithm(25, 50, '12-10', '12-40');
drawGrid(25, 50);

// Event listener for the reset button
const resetButton = document.getElementById('reset');
resetButton.addEventListener('click', () => {
  weightedAlgorithm.resetGrid();
});

// Event listener for the algorithm dropdown
const algorithmDropdownButton = document.getElementById('algorithmDropdown');
const dropdownItems = document.querySelectorAll('.dropdown-item');

// Initialize the selectedAlgorithm variable
let selectedAlgorithm = 'dijkstra';

dropdownItems.forEach(item => {
  item.addEventListener('click', function () {
    algorithmDropdownButton.textContent = this.textContent;
    // Update the selectedAlgorithm based on the clicked item
    selectedAlgorithm = this.id;
  });
});

// Event listener to visualize the selected algorithm on button click
document.getElementById('start').addEventListener('click', () => {
  if (selectedAlgorithm === 'dijkstra') {
    weightedAlgorithm.visualizeDijkstra();
  } else if (selectedAlgorithm === 'aStar') {
    weightedAlgorithm.visualizeAStar();
  }
});
