// Get the canvas and context
const canvas = document.getElementById('carouselCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size (matching Stage.width/height)
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Global Variables (from AS2)
let numOfItems = 0;
const radiusX = 300;
const radiusY = 75;
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
let speed = 0.05; // Base speed
const perspective = 130;
let items = []; // Array to hold all item objects

// Tooltip State (simplified for Canvas)
let tooltip = {
    text: "",
    x: 0,
    y: 0,
    visible: false
};

// --- Item Constructor (Replaces 'attachMovie("item", ...)') ---
// --- Item Constructor ---
function CarouselItem(data, index, numOfItems) {
    this.toolText = data.tooltip;
    this.imageURL = data.image;
    
    // Position/Animation properties
    this.angle = index * ((Math.PI * 2) / numOfItems); 
    this.x = 0; 
    this.y = 0; 
    this.scale = 0; 
    this.width = 64; // Example icon width
    this.height = 64; // Example icon height
    
    this.image = new Image();
    this.image.src = this.imageURL;
}

// --- XML Loading (Replaces xml.onLoad) ---
// --- XML Loading (Adjusted for <icon> tags) ---
async function loadData() {
    try {
        const response = await fetch('icons.xml');
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "application/xml");
        
        // Find the '<icon>' nodes (taps into your specific structure)
        const nodes = xmlDoc.querySelectorAll('icon'); 
        
        // Update the global count
        numOfItems = nodes.length;

        if (numOfItems === 0) {
            console.error("No <icon> items found in XML.");
            return;
        }

        // Create item objects
        nodes.forEach((node, i) => {
            // Read attributes directly from the <icon> node
            const data = {
                tooltip: node.getAttribute('tooltip'),
                image: node.getAttribute('image')
            };
            
            // Pass the number of items to the constructor for angle calculation
            items.push(new CarouselItem(data, i, numOfItems));
        });

        // Start the animation loop (assuming 'animate' is defined elsewhere)
        animate(); 

    } catch (e) {
        console.error("Error loading or parsing XML:", e);
    }
}

// --- mover() function logic ---
function updateItem(item) {
    // 1. Calculate new position (t._x, t._y)
    item.x = Math.cos(item.angle) * radiusX + centerX;
    item.y = Math.sin(item.angle) * radiusY + centerY;
    
    // 2. Calculate scaling/depth (s, t._xscale)
    // s = (this._y - perspective) / (centerY + radiusY - perspective)
    item.scale = (item.y - perspective) / (centerY + radiusY - perspective);
    
    // 3. Increment angle (t.angle += this._parent.speed)
    item.angle += speed;
    
    // Optional: Keep angle in bounds for numerical stability
    if (item.angle > Math.PI * 2) {
        item.angle -= Math.PI * 2;
    }
}

// --- Custom Tooltip Drawing Function ---
function drawSpeechBubbleTooltip(ctx, text, x, y) {
    if (!text) return; // Don't draw if no text

    const padding = 10;
    const arrowHeight = 10;
    const arrowWidth = 20;
    const borderRadius = 8;
    const maxWidth = 200; // Max width for tooltip text

    // Set font for measuring text
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Measure text to determine bubble size
    const textMetrics = ctx.measureText(text);
    let textWidth = textMetrics.width;
    
    // If text is too wide, wrap it (basic example, actual wrapping is more complex)
    // For simplicity here, we'll just cap the width.
    if (textWidth > maxWidth) {
        textWidth = maxWidth; 
        // A real implementation would split the text into multiple lines
    }

    const textHeight = 20; // Approximation for line height

    // Calculate bubble dimensions
    const bubbleWidth = textWidth + padding * 2;
    const bubbleHeight = textHeight + padding * 2;

    // Adjust position so the arrow points to (x,y)
    // The bubble itself will be above (x,y)
    const bubbleX = x - bubbleWidth / 2;
    const bubbleY = y - bubbleHeight - arrowHeight;

    // Draw the bubble shape
    ctx.beginPath();
    // Top-left corner
    ctx.moveTo(bubbleX + borderRadius, bubbleY);
    // Top line
    ctx.lineTo(bubbleX + bubbleWidth - borderRadius, bubbleY);
    ctx.arcTo(bubbleX + bubbleWidth, bubbleY, bubbleX + bubbleWidth, bubbleY + borderRadius, borderRadius);
    // Right line
    ctx.lineTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight - borderRadius);
    ctx.arcTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight, bubbleX + bubbleWidth - borderRadius, bubbleY + bubbleHeight, borderRadius);
    // Bottom line (excluding arrow area)
    ctx.lineTo(bubbleX + bubbleWidth / 2 + arrowWidth / 2, bubbleY + bubbleHeight);
    
    // Arrow
    ctx.lineTo(x, y); // Point of the arrow
    ctx.lineTo(bubbleX + bubbleWidth / 2 - arrowWidth / 2, bubbleY + bubbleHeight);
    
    // Bottom line (left side)
    ctx.lineTo(bubbleX + borderRadius, bubbleY + bubbleHeight);
    ctx.arcTo(bubbleX, bubbleY + bubbleHeight, bubbleX, bubbleY + bubbleHeight - borderRadius, borderRadius);
    // Left line
    ctx.lineTo(bubbleX, bubbleY + borderRadius);
    ctx.arcTo(bubbleX, bubbleY, bubbleX + borderRadius, bubbleY, borderRadius);
    
    ctx.closePath();

    // Create the blue gradient (from your image)
    const gradient = ctx.createLinearGradient(bubbleX, bubbleY, bubbleX, bubbleY + bubbleHeight);
    gradient.addColorStop(0, '#5CC8FF'); // Lighter blue at top
    gradient.addColorStop(1, '#007ACC'); // Darker blue at bottom

    // Fill with gradient
    ctx.fillStyle = gradient;
    ctx.fill();

    // Add a gray border
    ctx.strokeStyle = '#666'; // Dark gray border
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw the text
    ctx.fillStyle = "white"; // White text
    ctx.fillText(text, bubbleX + bubbleWidth / 2, bubbleY + bubbleHeight / 2);
}

// --- Main Drawing Function ---
// --- Main Drawing Function (Modified for custom tooltip) ---
function draw() {
    // Clear the canvas on every frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. Sorting (Replaces swapDepths)
    items.sort((a, b) => a.scale - b.scale); 
    
    items.forEach(item => {
        if (!item.image.complete) return;

        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.scale(item.scale, item.scale);
        ctx.drawImage(
            item.image, 
            -item.width / 2, 
            -item.height / 2, 
            item.width, 
            item.height
        );
        ctx.restore();
    });

    // --- Draw the Custom Tooltip ---
    if (tooltip.visible) {
        // Pass the canvas context, text, and the target point (item's center)
        drawSpeechBubbleTooltip(ctx, tooltip.text, tooltip.x, tooltip.y);
    }
}


// --- Track current mouse position ---
let currentMouseX = 0;
let currentMouseY = 0;

// --- Hit-testing function (called every frame) ---
function updateRolloverState() {
    let hitItem = null;
    
    // Iterate over items in reverse Z-order (front to back)
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        
        // Calculate the scaled dimensions for hit-testing
        const scaledWidth = item.width * item.scale;
        const scaledHeight = item.height * item.scale;
        
        // Simple bounding box hit-test
        if (currentMouseX > item.x - scaledWidth / 2 &&
            currentMouseX < item.x + scaledWidth / 2 &&
            currentMouseY > item.y - scaledHeight / 2 &&
            currentMouseY < item.y + scaledHeight / 2) {
            
            hitItem = item;
            break; // Found the item closest to the foreground
        }
    }

    if (hitItem) {
        tooltip.text = hitItem.toolText;
        tooltip.x = hitItem.x;
        tooltip.y = hitItem.y - 40;
        tooltip.visible = true;
    } else {
        tooltip.visible = false;
    }
}

// --- Main Animation Loop (Replaces onEnterFrame) ---
function animate() {
    requestAnimationFrame(animate);
    
    items.forEach(updateItem);
    updateRolloverState(); // Check tooltip every frame
    draw();
}

// --- Mouse Handling (Replaces onMouseMove) ---
canvas.addEventListener('mousemove', (event) => {
    currentMouseX = event.clientX;
    currentMouseY = event.clientY;

    // Update speed based on mouse X position (speed = (this._xmouse-centerX)/2500)
    speed = (currentMouseX - centerX) / 2500;
});

// --- Click Handling (Replaces onRelease) ---
canvas.addEventListener('click', (event) => {
    // You would repeat the hit-testing logic from mousemove here
    // If an item is hit:
    // console.log(hitItem.toolText); // Replaces trace(this._parent.toolText);
});

// Start the process
loadData();