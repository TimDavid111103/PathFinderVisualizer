class GridGraph {
  constructor(rows, cols, source, destination) {
    this.vertices = [];
    this.weights = {};
    this.rows = rows;
    this.cols = cols;
    this.source = source;
    this.destination = destination;
    this.isMouseDown = false;
    this.disableWallPlacement = false;

    this.buildGrid();
    this.clearCanvas();
    this.drawStartAndEnd();
  }

  buildGrid() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const vertex = `${i}-${j}`;
        this.vertices.push(vertex);
        this.weights[vertex] = 1; // Default weight is 1
      }
    }

    this.weights[this.source] = 0;
    this.weights[this.destination] = 1;
  }

  resetGrid() {
    this.source = '12-10';
    this.destination = '12-40';

    for (let vertex of this.vertices) {
      this.weights[vertex] = 1;
    }

    this.clearWalls();
    this.clearCanvas();
  }

  clearWalls() {
    for (let vertex of this.vertices) {
      if (this.isWall(vertex)) {
        this.weights[vertex] = 1;
      }
    }
  }

  getNeighbors(vertex) {
    const [i, j] = vertex.split('-').map(Number);
    const neighbors = [];

    if (i > 0) neighbors.push(`${i - 1}-${j}`);
    if (i < this.rows - 1) neighbors.push(`${i + 1}-${j}`);
    if (j > 0) neighbors.push(`${i}-${j - 1}`);
    if (j < this.cols - 1) neighbors.push(`${i}-${j + 1}`);

    return neighbors;
  }

  vertexWithMinDistance(distances, visited) {
    let minDistance = Infinity;
    let minVertex = null;
  
    for (let vertex in distances) {
      if (distances.hasOwnProperty(vertex) && !visited.has(vertex) && distances[vertex] < minDistance) {
        minDistance = distances[vertex];
        minVertex = vertex;
      }
    }
  
    return minVertex;
  }
  
  clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(this.rows, this.cols);
    this.drawStartAndEnd();
  }

  drawStartAndEnd() {
    this.drawNode(this.source, "Arrow.jpeg");
    this.drawNode(this.destination, "end-node.jpeg");
    this.handleNodeDragging();
  }

  handleNodeDragging() {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
    let draggedNode = null;
  
    const handleMouseDown = (event) => {
      const { x, y } = this.getMousePosition(event);
      const [i, j] = [Math.floor(y / cellSize), Math.floor(x / cellSize)];
  
      if (this.isStartNode(i, j) || this.isEndNode(i, j)) {
        isDragging = true;
        draggedNode = this.isStartNode(i, j) ? 'start' : 'end';
        offsetX = x - j * cellSize;
        offsetY = y - i * cellSize;
      } else if (this.isWall(i, j)) {
        // Stop dragging if the mouse is over a wall node
        isDragging = false;
        draggedNode = null;
      } else {
        // If not the start or end node, it's a wall node
        this.updateNodePosition('wall', i, j);
      }
    };
  
    const handleMouseMove = (event) => {
      if (isDragging) {
        const { x, y } = this.getMousePosition(event);
        const newJ = Math.floor((x - offsetX) / cellSize);
        const newI = Math.floor((y - offsetY) / cellSize);
  
        if (this.isValidNodePosition(newI, newJ) && !this.isWall(newI, newJ)) {
          this.disableWallPlacement = true;
          this.updateNodePosition(draggedNode, newI, newJ);
        }
      } else if (this.isMouseDown && !this.disableWallPlacement) {
        // Only update when the mouse button is down
        const { x, y } = this.getMousePosition(event);
        const [i, j] = [Math.floor(y / cellSize), Math.floor(x / cellSize)];
  
        // Check if you are not dragging the start or end node
        if (!this.isStartNode(i, j) && !this.isEndNode(i, j) && !this.isWall(i, j)) {
          this.updateNodePosition('wall', i, j);
        }
      }
    };
  
    const handleMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        draggedNode = null;
        this.disableWallPlacement = false;
      }
    };
  
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mousedown', () => {
      this.isMouseDown = true;
    });
  
    // Add the event listener for mouse up
    canvas.addEventListener('mouseup', () => {
      this.isMouseDown = false;
    });
  }
  
  updateNodePosition(nodeType, i, j) {
    const newNode = `${i}-${j}`;
  
    if (nodeType === 'start' && this.source !== newNode) {
      // Update the source node
      this.deleteNode('start');
      this.source = newNode;
      this.drawStartAndEnd();
    } else if (nodeType === 'end' && this.destination !== newNode) {
      // Update the destination node
      this.deleteNode('end');
      this.destination = newNode;
      this.drawStartAndEnd();
    } else if (nodeType === 'wall') {
      // Update a wall node
      if (!this.isStartNode(i, j) && !this.isEndNode(i, j) && !this.isWall(i, j)) {
        this.weights[newNode] = Infinity; // Set weight to Infinity for wall nodes
        this.drawWallNode(newNode);
      }
    }
  }

  isStartNode(i, j) {
    const [startI, startJ] = this.source.split('-').map(Number);
    return i === startI && j === startJ;
  }

  isEndNode(i, j) {
    const [endI, endJ] = this.destination.split('-').map(Number);
    return i === endI && j === endJ;
  }

  isWall(i, j) {
    const vertex = `${i}-${j}`;
    return this.weights[vertex] === Infinity;
  }

  getMousePosition(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  drawNode(node, imagePath) {
    const [i, j] = node.split("-").map(Number);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, j * cellSize, i * cellSize, cellSize, cellSize);
    };
    img.src = imagePath;
  }

  deleteNode(node) {
    if (node === 'start' || node === 'end') {
      const [prevI, prevJ] = (node === 'start' ? this.source : this.destination).split('-').map(Number);
      const saved = ctx.fillStyle;
  
      ctx.clearRect(prevJ * cellSize, prevI * cellSize, cellSize, cellSize);
  
      ctx.fillStyle = saved;
      ctx.strokeStyle = 'rgba(173, 216, 230, 1)';
      ctx.lineWidth = 0.4;
      ctx.strokeRect(prevJ * cellSize, prevI * cellSize, cellSize, cellSize);
    }
  }

  isValidNodePosition(i, j) {
    return i >= 0 && i < this.rows && j >= 0 && j < this.cols;
  }

  drawWallNode(node) {
    const [i, j] = node.split("-").map(Number);
    const saved = ctx.fillStyle;
    ctx.fillStyle = 'black';
    ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
    ctx.fillStyle = saved;
    ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
    ctx.lineWidth = 0.2;
    ctx.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize);
  }

  // Method to highlight the visited nodes on the grid.
  drawVisitedNodes(visitedNodes) {
    const baseVisitedColor = [193,0,0]; 
    const fadeFactor = 0.7; // Adjust this value to control the fading
    const baselineFactor = 0.3; // Adjust this value to control the baseline

    for (let i = 0; i < visitedNodes.length; i++) {
      const vertex = visitedNodes[i];
      const [row, col] = vertex.split('-').map(Number);
      const saved = ctx.fillStyle;

      if (vertex !== this.source && vertex !== this.destination) {
        // Calculate baseline color
        const baselineColor = baseVisitedColor.map(channel => Math.round(channel * baselineFactor));

        // Calculate faded color based on the fadeFactor with a baseline
        const fadedColor = baseVisitedColor.map((channel, index) => {
          const baseline = baselineColor[index];
          const calculatedColor = Math.round(baseline + (channel - baseline) * (1 - fadeFactor * (i / visitedNodes.length)));
          return Math.min(channel, calculatedColor); // Ensure faded color does not exceed baseline
        });

        // Modify the color for visited nodes
        ctx.fillStyle = `rgb(${fadedColor[0]}, ${fadedColor[1]}, ${fadedColor[2]})`;

        // Draw the visited node
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        ctx.fillStyle = saved;

        // Draw the border
        ctx.strokeStyle = 'rgba(173, 216, 230, 1)'; // Set the border color with alpha value
        ctx.lineWidth = 0.2;
        ctx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);
        ctx.strokeStyle = 'black'; // Reset the border color to black
      }
    }
  }

  // Method to highlight the final path on the grid.
  drawFinalPath(path) { 
    this.deleteNode('start');
    this.deleteNode('end');

    for (let i = 0; i < path.length; i++) {
      const vertex = path[i];
      const [row, col] = vertex.split('-').map(Number);
      const saved = ctx.fillStyle;

      // Modify the color for the final path (golden yellow)
      ctx.fillStyle = 'rgba(0,128,255, 0.7)'; // Adjust alpha value
      ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      ctx.fillStyle = saved;

      // Draw the border
      ctx.strokeStyle = 'rgba(173, 216, 230, 1)'; // Set the border color with alpha value
      ctx.lineWidth = 0.2;
      ctx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);
      ctx.strokeStyle = 'black'; // Reset the border color to black
    }
  }
  
  findPath() {
    const path = [this.destination];
    let currentVertex = this.destination;
  
    while (this.parents[currentVertex] !== null) {
      path.unshift(this.parents[currentVertex]);
      currentVertex = this.parents[currentVertex];
    }
  
    return path;
  }

  generateRandomPerfectMaze() {
    // Clear existing walls and reset the grid
    this.clearWalls();
    this.clearCanvas();

    // Create a stack for DFS
    const stack = [];
    const visited = new Set();

    // Choose a random starting point
    const startVertex = this.getRandomVertex();
    stack.push(startVertex);
    visited.add(startVertex);

    // Helper function to get unvisited neighbors
    const getUnvisitedNeighbors = (vertex) => {
      const neighbors = this.getNeighbors(vertex);
      return neighbors.filter((neighbor) => !visited.has(neighbor));
    };

    // DFS algorithm for generating the maze
    while (stack.length > 0) {
      const currentVertex = stack.pop();
      const unvisitedNeighbors = getUnvisitedNeighbors(currentVertex);

      if (unvisitedNeighbors.length > 0) {
        stack.push(currentVertex);

        // Choose a random unvisited neighbor
        const randomNeighbor = unvisitedNeighbors[Math.floor(Math.random() * unvisitedNeighbors.length)];

        // Remove the wall between the current vertex and the chosen neighbor
        const [currentRow, currentCol] = currentVertex.split('-').map(Number);
        const [neighborRow, neighborCol] = randomNeighbor.split('-').map(Number);

        const wallRow = (currentRow + neighborRow) / 2;
        const wallCol = (currentCol + neighborCol) / 2;

        const wallVertex = `${wallRow}-${wallCol}`;
        this.weights[wallVertex] = 1; // Remove the wall

        // Move to the chosen neighbor
        stack.push(randomNeighbor);
        visited.add(randomNeighbor);
      }
    }

    // Choose random start and end points
    this.source = this.getRandomUnwalledVertex();
    this.destination = this.getRandomUnwalledVertex();

    // Redraw the grid to display the generated maze
    this.drawStartAndEnd();
  }

  getRandomUnwalledVertex() {
    let randomVertex;
    
    do {
      randomVertex = this.getRandomVertex();
    } while (this.isWall(randomVertex));

    return randomVertex;
  }

  getRandomVertex() {
    const randomRow = Math.floor(Math.random() * this.rows);
    const randomCol = Math.floor(Math.random() * this.cols);
    return `${randomRow}-${randomCol}`;
  }
}


