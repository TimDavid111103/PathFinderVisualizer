class WeightedAlgorithm extends GridGraph{
  constructor(rows, cols, source, destination) {
    super(rows, cols, source, destination);
    this.distances = {};
    this.parents = {};
  }

  dijkstra() {
    this.distances = {};
    this.parents = {};
    let visited = new Set();

    for (let i = 0; i < this.vertices.length; i++) {
      this.distances[this.vertices[i]] = Infinity;
      this.parents[this.vertices[i]] = null;
    }
    this.distances[this.source] = 0;

    let currVertex = this.vertexWithMinDistance(this.distances, visited);
    while (currVertex !== null) {
      let distance = this.distances[currVertex];
      let neighbors = this.getNeighbors(currVertex);
      for (let neighbor of neighbors) {
        let newDistance = distance + this.weights[neighbor];
        if (this.distances[neighbor] > newDistance) {
          this.distances[neighbor] = newDistance;
          this.parents[neighbor] = currVertex;
        }
      }

      visited.add(currVertex);
      if (currVertex === this.destination) {
        break;
      }
      currVertex = this.vertexWithMinDistance(this.distances, visited);
    }
  }

  visualizeDijkstra() {
    this.dijkstra();
    this.animateDijkstra();
  }

  // Method to animate Dijkstra's algorithm.
  animateDijkstra() {
    let visitedNodes = [];
    let path = [];
    let animationSpeed = 5; // Adjust this value to control the animation speed
  
    const animateStep = () => {
      for (let i = 0; i < animationSpeed; i++) {
        let currentVertex = this.vertexWithMinDistance(this.distances, new Set(visitedNodes));
  
        if (currentVertex === null) {
          // Dijkstra's algorithm has finished. Draw the final path.
          this.drawFinalPath(path);
          return;
        }
  
        visitedNodes.push(currentVertex);
        this.drawVisitedNodes(visitedNodes);
  
        if (currentVertex === this.destination) {
          // If the destination is reached, reconstruct the path.
          path = this.findPath();
        }
      }
  
      requestAnimationFrame(animateStep);
    };
  
    animateStep();
  }
  
  aStar() {
    this.distances = {};
    this.parents = {};
    let visited = new Set();
  
    for (let i = 0; i < this.vertices.length; i++) {
      this.distances[this.vertices[i]] = Infinity;
      this.parents[this.vertices[i]] = null;
    }
    this.distances[this.source] = 0;
  
    let heuristic = {};
    for (let vertex of this.vertices) {
      heuristic[vertex] = this.calculateHeuristic(vertex, this.destination);
    }
  
    let currVertex = this.vertexWithMinDistanceAStar(this.distances, visited, heuristic);
    while (currVertex !== null) {
      let distance = this.distances[currVertex];
      let neighbors = this.getNeighbors(currVertex);
      for (let neighbor of neighbors) {
        let newDistance = distance + this.weights[neighbor];
        let totalCost = newDistance + heuristic[neighbor];
      
        if (totalCost < this.distances[neighbor]) {
          this.distances[neighbor] = newDistance;
          this.parents[neighbor] = currVertex;
        }
      }
  
      visited.add(currVertex);
      if (currVertex === this.destination) {
        break;
      }
      currVertex = this.vertexWithMinDistanceAStar(this.distances, visited, heuristic);
    }
  }
  
  vertexWithMinDistanceAStar(distances, visited, heuristic) {
    let minDistance = Infinity;
    let minVertex = null;
  
    for (let vertex in distances) {
      if (
        distances.hasOwnProperty(vertex) &&
        !visited.has(vertex) &&
        heuristic.hasOwnProperty(vertex) &&
        Object.prototype.hasOwnProperty.call(heuristic, vertex)
      ) {
        let totalCost = distances[vertex] + heuristic[vertex];
        if (totalCost < minDistance) {
          minDistance = totalCost;
          minVertex = vertex;
        }
      }
    }
  
    return minVertex;
  }
  
  visualizeAStar() {
    this.aStar();
    this.animateAStar(); 
  }

  animateAStar() {
    let visitedNodes = [];
    let path = [];
    let animationSpeed = 5; // Adjust this value to control the animation speed
  
    const animateStep = () => {
      for (let i = 0; i < animationSpeed; i++) {
        let currentVertex = this.vertexWithMinDistanceAStar(
          this.distances,
          new Set(visitedNodes),
          this.calculateHeuristicValues(this.vertices, this.destination)
        );
  
        if (currentVertex === null) {
          // A* algorithm has not finished. Continue the animation.
          visitedNodes.push(currentVertex);
          this.drawVisitedNodes(visitedNodes);
        } else if (currentVertex === this.destination) {
          // If the destination is reached, reconstruct the path.
          path = this.findPath();
          this.drawFinalPath(path);
          return;  // Exit the animation loop
        } else {
          visitedNodes.push(currentVertex);
          this.drawVisitedNodes(visitedNodes);
        }
      }
  
      requestAnimationFrame(animateStep);
    };
    animateStep();
  }
  
  // Add a method to calculate heuristic values for all vertices
  calculateHeuristicValues(vertices, destination) {
    const heuristicValues = {};
    for (let vertex of vertices) {
      heuristicValues[vertex] = this.calculateHeuristic(vertex, destination);
    }
    return heuristicValues;
  }
  
  // Add the heuristic calculation method (e.g., Euclidean distance)
  calculateHeuristic(vertex1, vertex2) {
    const [x1, y1] = vertex1.split('-').map(Number);
    const [x2, y2] = vertex2.split('-').map(Number);
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }
}