require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const imageDir = path.join(__dirname, '..'); // 'c:\\Users\\FARHAN\\Downloads\\ezgiff'
const bucketName = 'products';

const demoProducts = [
  {
    name: "Luminous Bloom Ring",
    description: "A beautiful ring featuring a luminous bloom design.",
    price: 199.99,
    category: "Bloom",
    stock: 10,
    material: "Silver",
    images: [] // To be filled after upload
  },
  {
    name: "Eternal Promise Necklace",
    description: "An elegant necklace symbolizing an eternal promise.",
    price: 299.99,
    category: "Eternal",
    stock: 5,
    material: "Gold",
    images: []
  },
  {
    name: "Celestial Star Earrings",
    description: "Stunning earrings inspired by the celestial stars.",
    price: 149.99,
    category: "Celestial",
    stock: 15,
    material: "Platinum",
    images: []
  }
];

const imageFilesToUpload = [
  'ezgif-frame-001.jpg',
  'ezgif-frame-002.jpg',
  'ezgif-frame-003.jpg'
];

async function run() {
  console.log('Connecting to Supabase at', supabaseUrl);

  // Create bucket if it doesn't exist
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error('Error listing buckets:', listError);
    return;
  }

  const bucketExists = buckets.some(b => b.name === bucketName);
  if (!bucketExists) {
    console.log(`Creating bucket '${bucketName}'...`);
    const { error: createBucketError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png'],
    });
    if (createBucketError) {
      console.error('Error creating bucket:', createBucketError);
      return;
    }
    console.log('Bucket created successfully.');
  } else {
    console.log(`Bucket '${bucketName}' already exists.`);
  }

  // Upload images
  const uploadedUrls = [];
  for (let i = 0; i < imageFilesToUpload.length; i++) {
    const filename = imageFilesToUpload[i];
    const filePath = path.join(imageDir, filename);
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const destinationPath = `demo/${filename}`;

    console.log(`Uploading ${filename}...`);
    const { data, error } = await supabase.storage.from(bucketName).upload(destinationPath, fileBuffer, {
      contentType: 'image/jpeg',
      upsert: true
    });

    if (error) {
      console.error(`Error uploading ${filename}:`, error);
    } else {
      console.log(`Uploaded ${filename} successfully.`);
      const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(destinationPath);
      uploadedUrls.push(publicUrlData.publicUrl);
    }
  }

  // Assign images to products
  if (uploadedUrls.length > 0) {
    demoProducts[0].images = [uploadedUrls[0]];
    if (uploadedUrls[1]) demoProducts[1].images = [uploadedUrls[1]];
    if (uploadedUrls[2]) demoProducts[2].images = [uploadedUrls[2]];
  }

  // Insert products
  console.log('Inserting demo products...');
  const { data: insertData, error: insertError } = await supabase.from('products').insert(demoProducts).select();

  if (insertError) {
    console.error('Error inserting products:', insertError);
  } else {
    console.log('Successfully inserted demo products:', insertData.length);
    console.log(insertData);
  }
}

run();
