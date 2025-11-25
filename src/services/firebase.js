import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, getDoc, doc, query, where, updateDoc, arrayUnion, arrayRemove, serverTimestamp, orderBy } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const timeoutPromise = (promise, time, errorMessage) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(errorMessage)), time)
    ),
  ]);
};

export const registerUser = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = () => {
  return signOut(auth);
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const addProduct = async (productData, image) => {
  try {
    const user = auth.currentUser;
    console.log('addProduct: User:', user);
    if (!user) throw new Error('User not authenticated');
    if (!image) throw new Error('Image is required');

    
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET; 
    console.log('addProduct: Cloudinary Cloud Name:', cloudName);
    console.log('addProduct: Cloudinary Upload Preset:', uploadPreset);

    
    const imageBlob = image instanceof Blob ? image : new Blob([image], { type: image.type });
    console.log('addProduct: Image size:', imageBlob.size, 'Type:', imageBlob.type);

   
    if (!imageBlob.type.startsWith('image/')) {
      throw new Error('Unsupported file type. Please upload an image (e.g., JPEG, PNG).');
    }

    
    if (imageBlob.size > 5 * 1024 * 1024) {
      throw new Error('Image size exceeds 5MB limit.');
    }

    console.log('addProduct: Uploading image to Cloudinary...');
    const formData = new FormData();
    formData.append('file', imageBlob);
    formData.append('upload_preset', uploadPreset);


    const response = await timeoutPromise(
      fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      }),
      30000,
      'Image upload timed out'
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('addProduct: Cloudinary error details:', errorData);
      throw new Error(`Cloudinary upload failed: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const imageUrl = data.secure_url;
    console.log('addProduct: Image URL:', imageUrl);

    console.log('addProduct: Adding product to Firestore...');
    const productRef = await timeoutPromise(
      addDoc(collection(db, 'products'), {
        ...productData,
        imageUrl,
        userId: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp(),
      }),
      5000,
      'Firestore write timed out'
    );
    console.log('addProduct: Product added, ID:', productRef.id);

    return productRef.id;
  } catch (error) {
    console.error('addProduct: Error:', error);
    throw error;
  }
};

export const getProducts = async (categoryFilter, searchQuery) => {
  try {
    let productsQuery = collection(db, 'products');
    let querySnapshot;
    
    if (categoryFilter && searchQuery) {
      querySnapshot = await getDocs(
        query(
          productsQuery,
          where('category', '==', categoryFilter),
          orderBy('createdAt', 'desc')
        )
      );
      const filteredProducts = querySnapshot.docs.filter(doc => 
        doc.data().name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return filteredProducts.map(doc => ({ id: doc.id, ...doc.data() }));
    } else if (categoryFilter) {
      querySnapshot = await getDocs(
        query(
          productsQuery,
          where('category', '==', categoryFilter),
          orderBy('createdAt', 'desc')
        )
      );
    } else if (searchQuery) {
      querySnapshot = await getDocs(
        query(
          productsQuery,
          orderBy('name'),
          orderBy('createdAt', 'desc')
        )
      );
      const filteredProducts = querySnapshot.docs.filter(doc => 
        doc.data().name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return filteredProducts.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      querySnapshot = await getDocs(
        query(
          productsQuery,
          orderBy('createdAt', 'desc')
        )
      );
    }

    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting products: ', error);
    throw error;
  }
};

export const getProductById = async (productId) => {
  try {
    console.log('getProductById: Fetching product with ID:', productId); // Add logging for debugging
    const productDoc = await getDoc(doc(db, 'products', productId));
    
    if (productDoc.exists()) {
      return { id: productDoc.id, ...productDoc.data() }; // Fix: Use productDoc.data()
    } else {
      throw new Error('Product not found');
    }
  } catch (error) {
    console.error('Error getting product: ', error);
    throw error;
  }
};

export const addToWishlist = async (productId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const wishlistQuery = query(
      collection(db, 'wishlists'),
      where('userId', '==', user.uid)
    );
    const wishlistSnapshot = await getDocs(wishlistQuery);

    if (wishlistSnapshot.empty) {
      await addDoc(collection(db, 'wishlists'), {
        userId: user.uid,
        products: [productId],
        createdAt: serverTimestamp(),
      });
    } else {
      const wishlistDoc = wishlistSnapshot.docs[0];
      await updateDoc(doc(db, 'wishlists', wishlistDoc.id), {
        products: arrayUnion(productId),
      });
    }

    return true;
  } catch (error) {
    console.error('Error adding to wishlist: ', error);
    throw error;
  }
};

export const removeFromWishlist = async (productId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const wishlistQuery = query(
      collection(db, 'wishlists'),
      where('userId', '==', user.uid)
    );
    const wishlistSnapshot = await getDocs(wishlistQuery);

    if (!wishlistSnapshot.empty) {
      const wishlistDoc = wishlistSnapshot.docs[0];
      await updateDoc(doc(db, 'wishlists', wishlistDoc.id), {
        products: arrayRemove(productId),
      });
    }

    return true;
  } catch (error) {
    console.error('Error removing from wishlist: ', error);
    throw error;
  }
};

export const getWishlist = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const wishlistQuery = query(
      collection(db, 'wishlists'),
      where('userId', '==', user.uid)
    );
    const wishlistSnapshot = await getDocs(wishlistQuery);

    if (wishlistSnapshot.empty) {
      return [];
    }

    const wishlistDoc = wishlistSnapshot.docs[0];
    const wishlistData = wishlistDoc.data();
    
    if (!wishlistData.products || wishlistData.products.length === 0) {
      return [];
    }

    const products = [];
    for (const productId of wishlistData.products) {
      const product = await getProductById(productId);
      products.push(product);
    }

    return products;
  } catch (error) {
    console.error('Error getting wishlist: ', error);
    throw error;
  }
};

export const checkIfInWishlist = async (productId) => {
  try {
    const user = auth.currentUser;
    if (!user) return false;

    const wishlistQuery = query(
      collection(db, 'wishlists'),
      where('userId', '==', user.uid)
    );
    const wishlistSnapshot = await getDocs(wishlistQuery);

    if (wishlistSnapshot.empty) {
      return false;
    }

    const wishlistDoc = wishlistSnapshot.docs[0];
    const wishlistData = wishlistDoc.data();
    
    return wishlistData.products && wishlistData.products.includes(productId);
  } catch (error) {
    console.error('Error checking wishlist: ', error);
    return false;
  }
};

export { auth, db };