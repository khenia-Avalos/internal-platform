// backend/src/components/htmlRenderer.js

const FRONTEND_URL = process.env.FRONTEND_URL || "https://internal-platform.onrender.com";

const colores = {
  exito: { principal: 'green', boton: '#4CAF50' },
  error: { principal: 'red', boton: '#4CAF50' },
  advertencia: { principal: 'orange', boton: '#4CAF50' },
  info: { principal: 'blue', boton: '#4CAF50' }
};

const emojis = {
  exito: '',
  error: '',
  advertencia: '',
  info: ''
};

/**
 * Renderiza una página HTML simple
 * @param {string} titulo - Título de la página
 * @param {string} mensaje - Mensaje a mostrar
 * @param {string} tipo - Tipo: 'exito', 'error', 'advertencia', 'info'
 * @param {string} urlVolver - URL del botón (opcional)
 * @returns {string} HTML completo
 */
export const renderizarPagina = (titulo, mensaje, tipo = 'info', urlVolver = `${FRONTEND_URL}/citas`) => {
  const color = colores[tipo] || colores.info;
  const emoji = emojis[tipo] || '';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${titulo}</title>
        <style>
            body {
                font-family: 'Segoe UI', Arial, sans-serif;
                text-align: center;
                padding: 50px;
                background: #f5f5f5;
                margin: 0;
            }
            .container {
                max-width: 500px;
                margin: 0 auto;
                background: white;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .mensaje {
                color: ${color.principal};
                font-size: 24px;
                margin-bottom: 20px;
            }
            .button {
                display: inline-block;
                margin-top: 20px;
                padding: 12px 24px;
                background: ${color.boton};
                color: white;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                transition: background 0.3s;
            }
            .button:hover {
                opacity: 0.9;
            }
            @media (max-width: 480px) {
                body { padding: 20px; }
                .container { padding: 20px; }
                .mensagem { font-size: 20px; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1 class="mensaje">${emoji} ${titulo}</h1>
            <p>${mensaje}</p>
        </div>
    </body>
    </html>
  `;
};