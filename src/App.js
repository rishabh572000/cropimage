import './App.css';
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { useState } from 'react';
import image from '../src/media/image.jpg'
import Cropper from './Cropper';

function App() {
  const [crop, setCrop] = useState({
      width:20,
      height: 20,
      unit: "%",
      x: 0,
      y: 0,
  });
  const [imageUrl, setImageUrl] = useState()
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setImageUrl(reader.result);
    };
  };

  const getCroppedImage = () => {
    const image = new Image();
    image.src = imageUrl;
    const canvas = document.createElement('canvas');
    const aspect = crop.aspect || 1
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;
    const cropWidth = crop.width * scaleX;
    const cropHeight = crop.height * scaleY;
    ctx.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
    
    
    return canvas.toDataURL();
  };

  const dataURLtoBlob = (dataURL) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const base_url= process.env.REACT_APP_API_BASE_URL;
  const handleUploadRequest = (file) => {

    const croppedImageData = getCroppedImage();
    const blob = dataURLtoBlob(croppedImageData);
    const formData = new FormData();
    formData.append('image', blob, 'cropped-image.png');
  
    fetch(`${base_url}/upload`, {
      method: 'POST',
      body: formData
    })
      .then(response => {
        // handle the response from the server
      })
      .catch(error => {
        // handle errors
      });





    // const formData = new FormData();
    // formData.append('image', file);

    // fetch(`${base_url}/upload`, {
    //   method: 'POST',
    //   body: formData
    // })

    //   .then(response => response.json())
    //   .then(data => {
    //     console.log('Success:', data);
    //   })
    //   .catch((error) => {
    //     console.error('Error:', error);
    //   });
  };

  return (
    <div className="App">
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {imageUrl ? (
        <ReactCrop crop={crop} onChange={(c) => setCrop({...c, height:c?.width})}>
          <img src={imageUrl} alt="Selected" />
        </ReactCrop>
      ) : null}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        {crop?.width && crop?.height ? (
          <img src={getCroppedImage()} alt="Cropped" style={{ maxWidth: '100%', maxHeight: '100%' }} />
        ) : null}
        </div>

        <button onClick={handleUploadRequest}>Upload</button>
    </div>
  );
}

export default App;
