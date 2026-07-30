/**
 * Maida — la asistente de esta documentación.
 *
 * Mintlify inyecta cualquier .js del directorio de contenido en todas las
 * páginas, así que este archivo es solo el gancho. El widget en sí (botón
 * flotante, Shadow DOM y el iframe del chat) vive en el portal, y de ahí se
 * puede iterar sin volver a desplegar la doc.
 *
 * Se inyecta el <script> desde acá en vez de dejar el tag en el MDX porque es la
 * forma que documenta Mintlify para scripts de terceros:
 * https://www.mintlify.com/docs/customize/custom-scripts
 */
(function () {
  "use strict";

  var SRC = "https://business.cbpayapp.com/maida/widget.js";

  // Mintlify es una SPA y el archivo se declara global: si el script ya está
  // puesto, no hay nada que hacer.
  if (document.querySelector("script[data-maida-loader]")) return;

  var script = document.createElement("script");
  script.src = SRC;
  script.async = true;
  script.setAttribute("data-maida-loader", "true");
  document.head.appendChild(script);
})();
