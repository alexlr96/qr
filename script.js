// script.js

window.addEventListener('load', () => {
  const resultDiv = document.getElementById('result');

  // Ésta función se llama al leer un QR correctamente
  function onScanSuccess(decodedText, decodedResult) {
    resultDiv.innerText = `Ticket válido: ${decodedText}`;
    // aquí podrías enviar decodedText a tu servidor o
    // marcarlo como usado en localStorage / IndexedDB…
    // y luego reiniciar el escáner para el siguiente ticket:
    html5QrcodeScanner.clear().then(() => {
      // tras limpiar, puedes volver a arrancar si quieres:
      startScanner();
    });
  }

  function onScanError(errorMessage) {
    // ignoramos errores de lectura continuos
    console.warn('Scan error:', errorMessage);
  }

  let html5QrcodeScanner;

  function startScanner() {
    html5QrcodeScanner = new Html5Qrcode("reader");
    html5QrcodeScanner
      .start(
        { facingMode: "environment" },   // cámara trasera
        { fps: 10, qrbox: 250 },         // 10 fps, área de 250×250px
        onScanSuccess,
        onScanError
      )
      .catch(err => {
        resultDiv.innerText = `Error al iniciar cámara: ${err}`;
      });
  }

  // Pedimos permiso y arrancamos
  startScanner();
});
