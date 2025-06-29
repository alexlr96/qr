// script.js

// Elementos del DOM
const video = document.getElementById('preview');
const fileInput = document.getElementById('fileInput');

// Canvas oculto para procesar frames / imágenes
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// Inicia la cámara y arranca el escaneo
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } }
    });
    video.srcObject = stream;
    await video.play();
    requestAnimationFrame(tick);
  } catch (err) {
    handleCameraError(err);
  }
}

// Manejo de errores al acceder a la cámara
function handleCameraError(err) {
  console.error('Error al iniciar cámara:', err);
  let msg = `Error al acceder a la cámara: ${err.name}`;
  switch (err.name) {
    case 'NotAllowedError':
      msg += '\nHas denegado el permiso de cámara. Revísalo en ajustes del navegador.';
      break;
    case 'NotReadableError':
      msg += '\nLa cámara está ocupada por otra aplicación. Ciérrala e inténtalo de nuevo.';
      break;
    case 'OverconstrainedError':
      msg += '\nNo se encontró una cámara trasera. Intenta cambiar a { video: true }.';
      break;
    default:
      msg += '\n' + err.message;
  }
  alert(msg);
}

// Función que recoge un frame del video y busca un QR
function tick() {
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    // Ajustar canvas al tamaño del video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    // Dibujar frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    // Extraer datos de píxeles
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // Procesar con jsQR
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert'
    });
    if (code) {
      onDetected(code.data);
      return; // detener escaneo tras detectar
    }
  }
  requestAnimationFrame(tick);
}

// Cuando se detecta un QR válido
function onDetected(qrText) {
  // Detener cámara
  const tracks = video.srcObject.getTracks();
  tracks.forEach(t => t.stop());
  alert('QR detectado: ' + qrText);
  // Aquí podrías enviar el valor a un servidor, marcarlo como "ya usado", etc.
}

// Fallback: leer QR desde una imagen subida
fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => {
    // Dibujar en canvas
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert'
    });
    if (code) {
      onDetected(code.data);
    } else {
      alert('No se detectó un QR en la imagen.');
    }
  };
  img.src = URL.createObjectURL(file);
});

// Arranca todo
startCamera();
