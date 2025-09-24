import supabase from './supabaseClient';

const centerX = 173;
const centerY = 89;
const size = 128;

let pixels = [];




const insertPixels = async () => {

  // Generate an abstract museum-style pattern
for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    // Create swirling patterns with sine and cosine
    const nx = (x - size/2) / size;
    const ny = (y - size/2) / size;
    const angle = Math.atan2(ny, nx) + Math.sin(nx * 10) + Math.cos(ny * 10);
    const radius = Math.sqrt(nx*nx + ny*ny);

    // Map angle + radius to a color palette
    const r = Math.floor(128 + 127 * Math.sin(angle * 5));
    const g = Math.floor(128 + 127 * Math.cos(radius * 5));
    const b = Math.floor(128 + 127 * Math.sin(radius * 5 + angle));

    const color = `rgb(${r},${g},${b})`;

    pixels.push({
      x: centerX + x - Math.floor(size/2),
      y: centerY + y - Math.floor(size/2),
      color,
      updated_by: "guest"
    });
  }
}

  const { data, error } = await supabase
    .from('pixels202508')
    .upsert(pixels);

  if (error) console.error("Error inserting pixels:", error);
  else console.log("Museum-quality pixel art inserted!", data);
};

export default insertPixels;
